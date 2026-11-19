import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

const $ = <T extends Element = HTMLElement>(sel: string) => document.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string) => Array.from(document.querySelectorAll<T>(sel));

export function initMotion() {
  const ready = document.fonts?.ready ?? Promise.resolve();
  ready.then(init);
}

function init() {
  ScrollTrigger.config({ ignoreMobileResize: true, limitCallbacks: true });
  const mm = gsap.matchMedia();
  mm.add(
    {
      desk: '(min-width: 960px) and (prefers-reduced-motion: no-preference)',
      mob: '(max-width: 959px) and (prefers-reduced-motion: no-preference)',
      hover: '(hover: hover) and (prefers-reduced-motion: no-preference)',
    },
    (ctx) => {
      const cond = (ctx.conditions ?? {}) as Record<string, boolean>;
      const desk = !!cond.desk;
      const mob = !!cond.mob;
      if (!desk && !mob) return;
      const cleanups: Array<() => void> = [];

      // Smooth scroll: buttery inertia on desktop, light smoothing on touch; data-speed parallax on desktop only
      ScrollSmoother.create({
        wrapper: '#smooth-wrapper',
        content: '#smooth-content',
        smooth: 0.8,
        smoothTouch: 0.12,
        ease: 'expo.out',
        effects: desk,
        normalizeScroll: true,
      });

      // Page progress line
      gsap.to('.progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.5 } });

      // ---------- 1 · Hero boot intro ----------
      if (desk) gsap.set('.deck', { rotationX: 14, rotationY: -20, rotationZ: 2 });
      const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
      intro
        .from('.hero-bg .glow-wrap, .hero-bg .grid-bg, .hero-bg .beam', { autoAlpha: 0, scale: 0.85, duration: 2.6, ease: 'power2.out' }, 0)
        .from('.hero .mask > span', { yPercent: 110, duration: 1.3, stagger: 0.1 })
        .from('.hero .fade', { y: 24, autoAlpha: 0, duration: 1, stagger: 0.08 }, 0.3)
        .from('.deck', { rotationX: desk ? 40 : 0, rotationY: desk ? -40 : 0, rotationZ: desk ? 6 : 0, y: 80, autoAlpha: 0, duration: 1.8 }, 0.15)
        .from('.term-line', { x: -12, autoAlpha: 0, duration: 0.5, stagger: 0.32, ease: 'power3.out' }, 0.6)
        .from('.fly', { y: 140, z: -260, rotationX: 55, autoAlpha: 0, duration: 1.2, stagger: 0.18 }, 1.9)
        .from('.scroll-hint', { autoAlpha: 0, y: 10, duration: 0.8 }, 2.4);

      // ---------- 1b · Zoom through the terminal (desktop pin) ----------
      if (desk) {
        const term = $('.term')!;
        const zoom = gsap.timeline({
          scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=70%', pin: true, scrub: 1.2, anticipatePin: 1, invalidateOnRefresh: true },
        });
        zoom
          .to('.hero-copy', { y: -160, autoAlpha: 0, ease: 'power2.in', duration: 0.35 }, 0)
          .to('.scroll-hint', { autoAlpha: 0, duration: 0.1 }, 0)
          .to('.fly', { y: 160, autoAlpha: 0, stagger: 0.04, duration: 0.3, ease: 'power2.in' }, 0.05)
          .to(
            '.deck',
            {
              rotationX: 0,
              rotationY: 0,
              rotationZ: 0,
              x: () => {
                const r = term.getBoundingClientRect();
                return window.innerWidth / 2 - (r.left + r.width / 2);
              },
              duration: 0.4,
              ease: 'power2.inOut',
            },
            0.1,
          )
          .to('.deck', { scale: 9, transformOrigin: '50% 16%', duration: 0.5, ease: 'power3.in' }, 0.45)
          .to('.glow-wrap', { scale: 1.8, duration: 0.5, ease: 'power2.in' }, 0.45)
          .to('.satin', { scale: 1.35, duration: 0.6, ease: 'power2.in' }, 0.3)
          .to('.grid-bg, .beam', { autoAlpha: 0, duration: 0.3 }, 0.3)
          .to('.veil', { opacity: 1, duration: 0.12 }, 0.86);
      }

      // ---------- 2 · About: scrubbed word reveal ----------
      const split = SplitText.create('.about-text', { type: 'words' });
      gsap.fromTo(
        split.words,
        { opacity: 0.16 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: 'none',
          scrollTrigger: desk
            ? { trigger: '.about', start: 'top top', end: '+=110%', pin: true, scrub: 0.8 }
            : { trigger: '.about-text', start: 'top 80%', end: 'bottom 45%', scrub: 0.8 },
        },
      );
      gsap.from('.portrait', { y: 80, rotation: -3, autoAlpha: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.portrait', start: 'top 85%' } });

      // ---------- 3 · Experience ----------
      gsap.fromTo('.tl-fill', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.exp-list', start: 'top 70%', end: 'bottom 60%', scrub: 0.8 } });
      gsap.from('#exp-h', { yPercent: 40, autoAlpha: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '#exp-h', start: 'top 85%' } });
      gsap.set('.exp-item', { y: 70, autoAlpha: 0 });
      ScrollTrigger.batch('.exp-item', {
        start: 'top 85%',
        once: true,
        onEnter: (els) => {
          gsap.to(els, { y: 0, autoAlpha: 1, stagger: 0.15, duration: 1.1, ease: 'expo.out' });
        },
      });

      // ---------- 3b · Impact: cards rise in, numbers count up, bars fill ----------
      gsap.fromTo('.impact-rule', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.impact', start: 'top 75%', end: 'top 25%', scrub: 0.8 } });
      // Reveal with IntersectionObserver: it sees the real on-screen position (smoother transforms included),
      // so cards can never stay hidden because of stale trigger positions.
      const reveal = (sel: string, from: gsap.TweenVars, to: gsap.TweenVars) => {
        const els = gsap.utils.toArray<HTMLElement>(sel);
        if (!els.length || !('IntersectionObserver' in window)) return;
        gsap.set(els, from);
        const io = new IntersectionObserver(
          (entries) => {
            const hits = entries.filter((e) => e.isIntersecting).map((e) => e.target);
            if (!hits.length) return;
            hits.forEach((el) => io.unobserve(el));
            gsap.to(hits, Object.assign({ y: 0, autoAlpha: 1, overwrite: 'auto' }, to));
          },
          { rootMargin: '0px 0px -6% 0px', threshold: 0.05 },
        );
        els.forEach((el) => io.observe(el));
        cleanups.push(() => {
          io.disconnect();
          gsap.set(els, { clearProps: 'transform,opacity,visibility' });
        });
      };
      reveal('.icard', { y: 60, autoAlpha: 0 }, { stagger: 0.1, duration: 1, ease: 'expo.out' });
      reveal('.hl', { y: 60, autoAlpha: 0 }, { stagger: 0.12, duration: 1, ease: 'expo.out' });
      gsap.utils.toArray<HTMLElement>('.icard .bar').forEach((b) => {
        gsap.from(b, { scaleX: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: b, start: 'top 95%', once: true } });
      });
      gsap.utils.toArray<HTMLElement>('.count').forEach((el) => {
        const to = parseFloat(el.getAttribute('data-to') ?? '');
        if (isNaN(to)) return;
        const o = { v: 0 };
        let done = false;
        const run = () => {
          if (done) return;
          done = true;
          gsap.to(o, {
            v: to,
            duration: 1.8,
            ease: 'power3.out',
            onUpdate: () => {
              el.textContent = Math.round(o.v).toLocaleString('en-US');
            },
          });
        };
        if ('IntersectionObserver' in window) {
          el.textContent = '0';
          const cio = new IntersectionObserver((en) => {
            if (en[0].isIntersecting) {
              cio.disconnect();
              run();
            }
          });
          cio.observe(el);
          cleanups.push(() => {
            cio.disconnect();
            el.textContent = to.toLocaleString('en-US');
          });
        }
      });
      gsap.from('.otw > *', { y: 24, autoAlpha: 0, stagger: 0.1, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: '.otw', start: 'top 92%' } });

      // ---------- 4 · Work: pinned horizontal reel ----------
      const track = $('.work-track')!;
      if (desk) {
        const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
        const curEl = $('.reel-count .cur')!;
        const barEl = $('.reel-count .bar i')!;
        const steps = $$<HTMLButtonElement>('.reel-steps button');
        const reel = gsap.to(track, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            trigger: '.work',
            start: 'top top',
            end: () => '+=' + dist(),
            pin: true,
            scrub: 1.2,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const n = Math.min(5, Math.max(1, Math.ceil(self.progress * 5.2)));
              curEl.textContent = '0' + n;
              gsap.set(barEl, { scaleX: self.progress });
              steps.forEach((b, i) => {
                if (i === n - 1) b.setAttribute('aria-current', 'true');
                else b.removeAttribute('aria-current');
              });
            },
          },
        });
        // Step buttons: jump straight to a project instead of scrubbing the pinned reel
        steps.forEach((b) => {
          b.addEventListener('click', () => {
            const p = document.querySelectorAll('.panel')[+(b.getAttribute('data-step') ?? 0)];
            const st = reel.scrollTrigger!;
            const pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
            const x = Math.min(dist(), Math.max(0, p.getBoundingClientRect().left - track.getBoundingClientRect().left - pad));
            const y = st.start + (dist() ? x / dist() : 0) * (st.end - st.start);
            const smoother = ScrollSmoother.get();
            if (smoother) smoother.scrollTo(y, true);
            else window.scrollTo({ top: y, behavior: 'smooth' });
          });
        });
        gsap.utils.toArray<HTMLElement>('.panel').forEach((p) => {
          gsap.from(p.querySelector('.viz > *'), {
            scale: 0.7,
            rotation: -6,
            autoAlpha: 0.2,
            ease: 'none',
            scrollTrigger: { trigger: p, containerAnimation: reel, start: 'left right', end: 'center center', scrub: true },
          });
          gsap.from(p.querySelectorAll('.panel-copy > *'), {
            x: 120,
            autoAlpha: 0,
            stagger: 0.06,
            ease: 'none',
            scrollTrigger: { trigger: p, containerAnimation: reel, start: 'left 90%', end: 'left 35%', scrub: true },
          });
        });
        gsap.from('.intro-panel > *', { y: 60, autoAlpha: 0, stagger: 0.1, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.work', start: 'top 70%' } });
      } else {
        gsap.set('.panel', { y: 80, autoAlpha: 0 });
        ScrollTrigger.batch('.panel', {
          start: 'top 88%',
          once: true,
          onEnter: (els) => {
            gsap.to(els, { y: 0, autoAlpha: 1, stagger: 0.12, duration: 1, ease: 'expo.out' });
          },
        });
      }

      // ---------- 4b · Freelance map ----------
      const rev = $('.fl-rev')!;
      const cty = $('.fl-cty')!;
      const money = { v: 0 };
      const nC = { v: 1 };
      const fl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: desk
          ? { trigger: '.freelance', start: 'top top', end: '+=160%', pin: true, scrub: 1.2 }
          : { trigger: '.freelance', start: 'top 70%', toggleActions: 'play none none none' },
      });
      fl.from('.fl-copy > *', { y: 50, autoAlpha: 0, stagger: 0.08, duration: 0.5 }, 0)
        .from('.land', { autoAlpha: 0, scale: 0.94, transformOrigin: '50% 50%', duration: 0.6 }, 0)
        .from('.pin.hub', { scale: 0, transformOrigin: '50% 50%', duration: 0.3, ease: 'back.out(2)' }, 0.4)
        .from('.ml-in', { autoAlpha: 0, y: 10, duration: 0.3 }, 0.5)
        .fromTo('.arc-in', { strokeDashoffset: 1, strokeDasharray: 1 }, { strokeDashoffset: 0, duration: 0.35, stagger: 0.06 }, 0.55)
        .from('.pin-in', { scale: 0, transformOrigin: '50% 50%', duration: 0.2, stagger: 0.06 }, 0.75)
        .to(
          money,
          {
            v: 300000,
            duration: 1.6,
            ease: 'none',
            onUpdate: () => {
              rev.textContent = '₹' + (Math.round(money.v / 1000) * 1000).toLocaleString('en-IN');
            },
          },
          0.5,
        );
      ['uk', 'ru', 'au'].forEach((k, i) => {
        const t = 0.9 + i * 0.45;
        fl.fromTo('.arc-' + k, { strokeDashoffset: 1, strokeDasharray: 1 }, { strokeDashoffset: 0, duration: 0.45, ease: 'power1.inOut' }, t)
          .from('.pin-' + k, { scale: 0, transformOrigin: '50% 50%', duration: 0.25, ease: 'back.out(2.5)' }, t + 0.4)
          .from('.ml-' + k, { autoAlpha: 0, y: 12, duration: 0.25 }, t + 0.42)
          .to(
            nC,
            {
              v: i + 2,
              duration: 0.2,
              onUpdate: () => {
                cty.textContent = String(Math.round(nC.v));
              },
            },
            t + 0.4,
          );
      });
      fl.from('.comets', { autoAlpha: 0, duration: 0.3 }, 2.3);
      cty.textContent = '1';
      gsap.set('.group', { y: 60, autoAlpha: 0 });
      ScrollTrigger.batch('.group', {
        start: 'top 90%',
        once: true,
        onEnter: (els) => {
          gsap.to(els, { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.9, ease: 'expo.out' });
        },
      });

      // ---------- 6 · Education ----------
      gsap.from('.edu-row, .focus', { y: 50, autoAlpha: 0, stagger: 0.12, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.edu', start: 'top 80%' } });
      gsap.from('.focus-tile', { y: 24, autoAlpha: 0, stagger: 0.07, duration: 0.8, ease: 'expo.out', scrollTrigger: { trigger: '.focus', start: 'top 85%' } });
      gsap.from('.cpanel', { y: 60, autoAlpha: 0, stagger: 0.12, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.cgrid', start: 'top 88%' } });

      // ---------- 7 · Contact ----------
      gsap.fromTo('.contact h2', { scale: 0.72, autoAlpha: 0.25 }, { scale: 1, autoAlpha: 1, ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top 90%', end: 'top 20%', scrub: 0.8 } });
      gsap.fromTo('.giant div', { xPercent: 8 }, { xPercent: -24, ease: 'none', scrollTrigger: { trigger: '.giant', start: 'top bottom', end: 'bottom top', scrub: 0.8 } });

      // ---------- Magnetic buttons (mouse only) ----------
      if (cond.hover) {
        gsap.utils.toArray<HTMLElement>('.magnetic').forEach((el) => {
          const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
          const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
          const move = (e: MouseEvent) => {
            const r = el.getBoundingClientRect();
            xTo((e.clientX - r.left - r.width / 2) * 0.25);
            yTo((e.clientY - r.top - r.height / 2) * 0.35);
          };
          const leave = () => {
            xTo(0);
            yTo(0);
          };
          el.addEventListener('mousemove', move);
          el.addEventListener('mouseleave', leave);
          cleanups.push(() => {
            el.removeEventListener('mousemove', move);
            el.removeEventListener('mouseleave', leave);
          });
        });
      }

      // Cursor-following glow in the hero (desktop mouse only)
      if (desk && cond.hover) {
        const hero = $('.hero')!;
        const g3 = $('.g3')!;
        const gx = gsap.quickTo(g3, 'x', { duration: 0.8, ease: 'power3.out' });
        const gy = gsap.quickTo(g3, 'y', { duration: 0.8, ease: 'power3.out' });
        const hm = (e: MouseEvent) => {
          const r = hero.getBoundingClientRect();
          gx(e.clientX - r.left);
          gy(e.clientY - r.top);
          gsap.to(g3, { autoAlpha: 1, duration: 0.6, overwrite: 'auto' });
        };
        const hl = () => {
          gsap.to(g3, { autoAlpha: 0, duration: 0.8, overwrite: 'auto' });
        };
        hero.addEventListener('mousemove', hm);
        hero.addEventListener('mouseleave', hl);
        cleanups.push(() => {
          hero.removeEventListener('mousemove', hm);
          hero.removeEventListener('mouseleave', hl);
        });
      }

      // n8n-style workflow execution loop (plays only while visible)
      const wf = $<SVGSVGElement>('.n8n');
      if (wf) {
        const q = gsap.utils.selector(wf);
        gsap.set(q('.run'), { strokeDasharray: 1, strokeDashoffset: 1 });
        gsap.set(q('.item'), { autoAlpha: 0 });
        const wtl = gsap.timeline({ repeat: -1, repeatDelay: 0.6, paused: true });
        const runNode = (c: string, t: number, dur: number) => {
          wtl
            .to(q('.nd-' + c + ' .spin'), { autoAlpha: 1, duration: 0.15 }, t)
            .to(q('.nd-' + c + ' .ring'), { autoAlpha: 0.45, duration: 0.15 }, t)
            .to(q('.nd-' + c + ' .spin'), { autoAlpha: 0, duration: 0.15 }, t + dur)
            .to(q('.nd-' + c + ' .ring'), { autoAlpha: 1, duration: 0.15 }, t + dur)
            .fromTo(q('.nd-' + c + ' .ok'), { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, transformOrigin: '50% 50%', duration: 0.3, ease: 'back.out(3)' }, t + dur);
        };
        const edge = (c: string, t: number, d = 0.45) => {
          wtl.to(q('.run-' + c), { strokeDashoffset: 0, duration: d, ease: 'power1.inOut' }, t);
          if (q('.item-' + c).length) wtl.to(q('.item-' + c), { autoAlpha: 1, duration: 0.2 }, t + d);
        };
        wtl.to(q('.exec'), { scale: 0.94, transformOrigin: '50% 50%', yoyo: true, repeat: 1, duration: 0.12 }, 0);
        runNode('trig', 0.3, 0.5);
        edge('e1', 0.85);
        runNode('agent', 1.35, 1.95);
        edge('s1', 1.5, 0.35);
        runNode('s1', 1.85, 0.3);
        edge('s2', 2.0, 0.35);
        runNode('s2', 2.35, 0.3);
        edge('s3', 2.5, 0.35);
        runNode('s3', 2.85, 0.3);
        edge('e2', 3.4);
        runNode('if', 3.9, 0.4);
        wtl.to(q('.nd-mail'), { opacity: 0.35, duration: 0.3 }, 4.3);
        edge('e3', 4.35);
        runNode('crm', 4.85, 0.5);
        wtl
          .to(q('.exec'), { autoAlpha: 0, duration: 0.2 }, 5.4)
          .fromTo(q('.toast'), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.35 }, 5.45)
          .to(q('.ring, .ok, .item, .toast'), { autoAlpha: 0, duration: 0.4 }, 7.6)
          .to(q('.nd-mail'), { opacity: 1, duration: 0.4 }, 7.6)
          .set(q('.run'), { strokeDashoffset: 1 }, 8.0)
          .to(q('.exec'), { autoAlpha: 1, duration: 0.3 }, 8.0);
        if ('IntersectionObserver' in window) {
          const wio = new IntersectionObserver(
            (en) => {
              if (en[0].isIntersecting) wtl.play();
              else wtl.pause();
            },
            { threshold: 0.25 },
          );
          wio.observe(wf);
          cleanups.push(() => wio.disconnect());
        } else {
          wtl.play();
        }
      }

      // In-page links work with the smoother
      const onAnchor = (e: MouseEvent) => {
        const a = (e.target as Element).closest('a[href^="#"]');
        if (!a) return;
        const id = a.getAttribute('href') ?? '';
        const target = id.length > 1 ? document.querySelector(id) : null;
        const sm = ScrollSmoother.get();
        if (target && sm) {
          e.preventDefault();
          sm.scrollTo(target, true, 'top 60px');
        }
      };
      document.addEventListener('click', onAnchor);
      cleanups.push(() => document.removeEventListener('click', onAnchor));

      return () => {
        cleanups.forEach((fn) => fn());
      };
    },
  );

  window.addEventListener('load', () => ScrollTrigger.refresh());
}
