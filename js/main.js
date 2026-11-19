(function () {
  if (!window.gsap || !window.ScrollTrigger) return; // content is already fully visible without GSAP
  gsap.registerPlugin(ScrollTrigger);
  if (window.ScrollSmoother) gsap.registerPlugin(ScrollSmoother);
  if (window.SplitText) gsap.registerPlugin(SplitText);

  var ready = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  ready.then(init);

  function init() {
    ScrollTrigger.config({ ignoreMobileResize: true, limitCallbacks: true });
    var mm = gsap.matchMedia();
    mm.add({
      desk: '(min-width: 960px) and (prefers-reduced-motion: no-preference)',
      mob: '(max-width: 959px) and (prefers-reduced-motion: no-preference)',
      hover: '(hover: hover) and (prefers-reduced-motion: no-preference)'
    }, function (ctx) {
      var desk = ctx.conditions.desk, mob = ctx.conditions.mob;
      if (!desk && !mob) return;
      var cleanups = [];

      // Smooth scroll: buttery inertia on desktop, light smoothing on touch; data-speed parallax on desktop only
      if (window.ScrollSmoother) {
        ScrollSmoother.create({
          wrapper: '#smooth-wrapper', content: '#smooth-content',
          smooth: 0.8, smoothTouch: 0.12, ease: 'expo.out',
          effects: desk, normalizeScroll: true
        });
      }

      // Page progress line
      gsap.to('.progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.5 } });

      // ---------- 1 · Hero boot intro ----------
      if (desk) gsap.set('.deck', { rotationX: 14, rotationY: -20, rotationZ: 2 });
      var intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
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
        var term = document.querySelector('.term');
        var zoom = gsap.timeline({
          scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=70%', pin: true, scrub: 1.2, anticipatePin: 1, invalidateOnRefresh: true }
        });
        zoom
          .to('.hero-copy', { y: -160, autoAlpha: 0, ease: 'power2.in', duration: 0.35 }, 0)
          .to('.scroll-hint', { autoAlpha: 0, duration: 0.1 }, 0)
          .to('.fly', { y: 160, autoAlpha: 0, stagger: 0.04, duration: 0.3, ease: 'power2.in' }, 0.05)
          .to('.deck', {
            rotationX: 0, rotationY: 0, rotationZ: 0,
            x: function () { var r = term.getBoundingClientRect(); return window.innerWidth / 2 - (r.left + r.width / 2); },
            duration: 0.4, ease: 'power2.inOut'
          }, 0.1)
          .to('.deck', { scale: 9, transformOrigin: '50% 16%', duration: 0.5, ease: 'power3.in' }, 0.45)
          .to('.glow-wrap', { scale: 1.8, duration: 0.5, ease: 'power2.in' }, 0.45)
          .to('.satin', { scale: 1.35, duration: 0.6, ease: 'power2.in' }, 0.3)
          .to('.grid-bg, .beam', { autoAlpha: 0, duration: 0.3 }, 0.3)
          .to('.veil', { opacity: 1, duration: 0.12 }, 0.86);
      }

      // ---------- 2 · About: scrubbed word reveal ----------
      if (window.SplitText) {
        var split = SplitText.create('.about-text', { type: 'words' });
        gsap.fromTo(split.words, { opacity: 0.16 }, {
          opacity: 1, stagger: 0.1, ease: 'none',
          scrollTrigger: desk
            ? { trigger: '.about', start: 'top top', end: '+=110%', pin: true, scrub: 0.8 }
            : { trigger: '.about-text', start: 'top 80%', end: 'bottom 45%', scrub: 0.8 }
        });
      }
      gsap.from('.portrait', { y: 80, rotation: -3, autoAlpha: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.portrait', start: 'top 85%' } });

      // ---------- 3 · Experience ----------
      gsap.fromTo('.tl-fill', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.exp-list', start: 'top 70%', end: 'bottom 60%', scrub: 0.8 } });
      gsap.from('#exp-h', { yPercent: 40, autoAlpha: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '#exp-h', start: 'top 85%' } });
      gsap.set('.exp-item', { y: 70, autoAlpha: 0 });
      ScrollTrigger.batch('.exp-item', {
        start: 'top 85%', once: true,
        onEnter: function (els) { gsap.to(els, { y: 0, autoAlpha: 1, stagger: 0.15, duration: 1.1, ease: 'expo.out' }); }
      });

      // ---------- 3b · Impact: cards rise in, numbers count up, bars fill ----------
      gsap.fromTo('.impact-rule', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.impact', start: 'top 75%', end: 'top 25%', scrub: 0.8 } });
      // Reveal with IntersectionObserver: it sees the real on-screen position (smoother transforms included),
      // so cards can never stay hidden because of stale trigger positions.
      var reveal = function (sel, from, to) {
        var els = gsap.utils.toArray(sel); if (!els.length) return;
        if (!('IntersectionObserver' in window)) return;
        gsap.set(els, from);
        var io = new IntersectionObserver(function (entries) {
          var hits = entries.filter(function (e) { return e.isIntersecting; }).map(function (e) { return e.target; });
          if (!hits.length) return;
          hits.forEach(function (el) { io.unobserve(el); });
          gsap.to(hits, Object.assign({ y: 0, autoAlpha: 1, overwrite: 'auto' }, to));
        }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
        els.forEach(function (el) { io.observe(el); });
        cleanups.push(function () { io.disconnect(); gsap.set(els, { clearProps: 'transform,opacity,visibility' }); });
      };
      reveal('.icard', { y: 60, autoAlpha: 0 }, { stagger: 0.1, duration: 1, ease: 'expo.out' });
      reveal('.hl', { y: 60, autoAlpha: 0 }, { stagger: 0.12, duration: 1, ease: 'expo.out' });
      gsap.utils.toArray('.icard .bar').forEach(function (b) {
        gsap.from(b, { scaleX: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: b, start: 'top 95%', once: true } });
      });
      gsap.utils.toArray('.count').forEach(function (el) {
        var to = parseFloat(el.getAttribute('data-to'));
        if (isNaN(to)) return;
        var o = { v: 0 }, done = false;
        var run = function () { if (done) return; done = true;
          gsap.to(o, { v: to, duration: 1.8, ease: 'power3.out', onUpdate: function () { el.textContent = Math.round(o.v).toLocaleString('en-US'); } }); };
        if ('IntersectionObserver' in window) {
          el.textContent = '0';
          var cio = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { cio.disconnect(); run(); } });
          cio.observe(el);
          cleanups.push(function () { cio.disconnect(); el.textContent = to.toLocaleString('en-US'); });
        }
      });
      gsap.from('.otw > *', { y: 24, autoAlpha: 0, stagger: 0.1, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: '.otw', start: 'top 92%' } });

      // ---------- 4 · Work: pinned horizontal reel ----------
      var track = document.querySelector('.work-track');
      if (desk) {
        var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
        var curEl = document.querySelector('.reel-count .cur');
        var barEl = document.querySelector('.reel-count .bar i');
        var steps = Array.prototype.slice.call(document.querySelectorAll('.reel-steps button'));
        var reel = gsap.to(track, {
          x: function () { return -dist(); }, ease: 'none',
          scrollTrigger: {
            trigger: '.work', start: 'top top', end: function () { return '+=' + dist(); },
            pin: true, scrub: 1.2, invalidateOnRefresh: true,
            onUpdate: function (self) {
              var n = Math.min(5, Math.max(1, Math.ceil(self.progress * 5.2)));
              curEl.textContent = '0' + n;
              gsap.set(barEl, { scaleX: self.progress });
              steps.forEach(function (b, i) { if (i === n - 1) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
            }
          }
        });
        // Step buttons: jump straight to a project instead of scrubbing the pinned reel
        steps.forEach(function (b) {
          b.addEventListener('click', function () {
            var p = document.querySelectorAll('.panel')[+b.getAttribute('data-step')], st = reel.scrollTrigger;
            var pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
            var x = Math.min(dist(), Math.max(0, p.getBoundingClientRect().left - track.getBoundingClientRect().left - pad));
            var y = st.start + (dist() ? x / dist() : 0) * (st.end - st.start);
            var smoother = window.ScrollSmoother && ScrollSmoother.get();
            if (smoother) smoother.scrollTo(y, true); else window.scrollTo({ top: y, behavior: 'smooth' });
          });
        });
        gsap.utils.toArray('.panel').forEach(function (p) {
          gsap.from(p.querySelector('.viz > *'), { scale: 0.7, rotation: -6, autoAlpha: 0.2, ease: 'none',
            scrollTrigger: { trigger: p, containerAnimation: reel, start: 'left right', end: 'center center', scrub: true } });
          gsap.from(p.querySelectorAll('.panel-copy > *'), { x: 120, autoAlpha: 0, stagger: 0.06, ease: 'none',
            scrollTrigger: { trigger: p, containerAnimation: reel, start: 'left 90%', end: 'left 35%', scrub: true } });
        });
        gsap.from('.intro-panel > *', { y: 60, autoAlpha: 0, stagger: 0.1, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.work', start: 'top 70%' } });
      } else {
        gsap.set('.panel', { y: 80, autoAlpha: 0 });
        ScrollTrigger.batch('.panel', {
          start: 'top 88%', once: true,
          onEnter: function (els) { gsap.to(els, { y: 0, autoAlpha: 1, stagger: 0.12, duration: 1, ease: 'expo.out' }); }
        });
      }

      // ---------- 4b · Freelance map ----------
      var rev = document.querySelector('.fl-rev'), cty = document.querySelector('.fl-cty');
      var money = { v: 0 }, nC = { v: 1 };
      var fl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: desk
          ? { trigger: '.freelance', start: 'top top', end: '+=160%', pin: true, scrub: 1.2 }
          : { trigger: '.freelance', start: 'top 70%', toggleActions: 'play none none none' }
      });
      fl.from('.fl-copy > *', { y: 50, autoAlpha: 0, stagger: 0.08, duration: 0.5 }, 0)
        .from('.land', { autoAlpha: 0, scale: 0.94, transformOrigin: '50% 50%', duration: 0.6 }, 0)
        .from('.pin.hub', { scale: 0, transformOrigin: '50% 50%', duration: 0.3, ease: 'back.out(2)' }, 0.4)
        .from('.ml-in', { autoAlpha: 0, y: 10, duration: 0.3 }, 0.5)
        .fromTo('.arc-in', { strokeDashoffset: 1, strokeDasharray: 1 }, { strokeDashoffset: 0, duration: 0.35, stagger: 0.06 }, 0.55)
        .from('.pin-in', { scale: 0, transformOrigin: '50% 50%', duration: 0.2, stagger: 0.06 }, 0.75)
        .to(money, { v: 300000, duration: 1.6, ease: 'none', onUpdate: function () { rev.textContent = '₹' + (Math.round(money.v / 1000) * 1000).toLocaleString('en-IN'); } }, 0.5);
      ['uk', 'ru', 'au'].forEach(function (k, i) {
        var t = 0.9 + i * 0.45;
        fl.fromTo('.arc-' + k, { strokeDashoffset: 1, strokeDasharray: 1 }, { strokeDashoffset: 0, duration: 0.45, ease: 'power1.inOut' }, t)
          .from('.pin-' + k, { scale: 0, transformOrigin: '50% 50%', duration: 0.25, ease: 'back.out(2.5)' }, t + 0.4)
          .from('.ml-' + k, { autoAlpha: 0, y: 12, duration: 0.25 }, t + 0.42)
          .to(nC, { v: i + 2, duration: 0.2, onUpdate: function () { cty.textContent = Math.round(nC.v); } }, t + 0.4);
      });
      fl.from('.comets', { autoAlpha: 0, duration: 0.3 }, 2.3);
      cty.textContent = '1';
      gsap.set('.group', { y: 60, autoAlpha: 0 });
      ScrollTrigger.batch('.group', {
        start: 'top 90%', once: true,
        onEnter: function (els) { gsap.to(els, { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.9, ease: 'expo.out' }); }
      });

      // ---------- 6 · Education ----------
      gsap.from('.edu-row, .focus', { y: 50, autoAlpha: 0, stagger: 0.12, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.edu', start: 'top 80%' } });
      gsap.from('.focus-tile', { y: 24, autoAlpha: 0, stagger: 0.07, duration: 0.8, ease: 'expo.out', scrollTrigger: { trigger: '.focus', start: 'top 85%' } });
      gsap.from('.cpanel', { y: 60, autoAlpha: 0, stagger: 0.12, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.cgrid', start: 'top 88%' } });

      // ---------- 7 · Contact ----------
      gsap.fromTo('.contact h2', { scale: 0.72, autoAlpha: 0.25 }, { scale: 1, autoAlpha: 1, ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top 90%', end: 'top 20%', scrub: 0.8 } });
      gsap.fromTo('.giant div', { xPercent: 8 }, { xPercent: -24, ease: 'none', scrollTrigger: { trigger: '.giant', start: 'top bottom', end: 'bottom top', scrub: 0.8 } });

      // ---------- Magnetic buttons (mouse only) ----------
      if (ctx.conditions.hover) {
        gsap.utils.toArray('.magnetic').forEach(function (el) {
          var xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
          var yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
          var move = function (e) { var r = el.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.25); yTo((e.clientY - r.top - r.height / 2) * 0.35); };
          var leave = function () { xTo(0); yTo(0); };
          el.addEventListener('mousemove', move); el.addEventListener('mouseleave', leave);
          cleanups.push(function () { el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', leave); });
        });
      }

      // Cursor-following glow in the hero (desktop mouse only)
      if (desk && ctx.conditions.hover) {
        var hero = document.querySelector('.hero'), g3 = document.querySelector('.g3');
        var gx = gsap.quickTo(g3, 'x', { duration: 0.8, ease: 'power3.out' });
        var gy = gsap.quickTo(g3, 'y', { duration: 0.8, ease: 'power3.out' });
        var hm = function (e) { var r = hero.getBoundingClientRect(); gx(e.clientX - r.left); gy(e.clientY - r.top); gsap.to(g3, { autoAlpha: 1, duration: 0.6, overwrite: 'auto' }); };
        var hl = function () { gsap.to(g3, { autoAlpha: 0, duration: 0.8, overwrite: 'auto' }); };
        hero.addEventListener('mousemove', hm); hero.addEventListener('mouseleave', hl);
        cleanups.push(function () { hero.removeEventListener('mousemove', hm); hero.removeEventListener('mouseleave', hl); });
      }

      // n8n-style workflow execution loop (plays only while visible)
      var wf = document.querySelector('.n8n');
      if (wf) {
        var q = gsap.utils.selector(wf);
        gsap.set(q('.run'), { strokeDasharray: 1, strokeDashoffset: 1 });
        gsap.set(q('.item'), { autoAlpha: 0 });
        var wtl = gsap.timeline({ repeat: -1, repeatDelay: 0.6, paused: true });
        var runNode = function (c, t, dur) {
          wtl.to(q('.nd-' + c + ' .spin'), { autoAlpha: 1, duration: 0.15 }, t)
             .to(q('.nd-' + c + ' .ring'), { autoAlpha: 0.45, duration: 0.15 }, t)
             .to(q('.nd-' + c + ' .spin'), { autoAlpha: 0, duration: 0.15 }, t + dur)
             .to(q('.nd-' + c + ' .ring'), { autoAlpha: 1, duration: 0.15 }, t + dur)
             .fromTo(q('.nd-' + c + ' .ok'), { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, transformOrigin: '50% 50%', duration: 0.3, ease: 'back.out(3)' }, t + dur);
        };
        var edge = function (c, t, d) {
          d = d || 0.45;
          wtl.to(q('.run-' + c), { strokeDashoffset: 0, duration: d, ease: 'power1.inOut' }, t);
          if (q('.item-' + c).length) wtl.to(q('.item-' + c), { autoAlpha: 1, duration: 0.2 }, t + d);
        };
        wtl.to(q('.exec'), { scale: 0.94, transformOrigin: '50% 50%', yoyo: true, repeat: 1, duration: 0.12 }, 0);
        runNode('trig', 0.3, 0.5); edge('e1', 0.85);
        runNode('agent', 1.35, 1.95);
        edge('s1', 1.5, 0.35); runNode('s1', 1.85, 0.3);
        edge('s2', 2.0, 0.35); runNode('s2', 2.35, 0.3);
        edge('s3', 2.5, 0.35); runNode('s3', 2.85, 0.3);
        edge('e2', 3.4); runNode('if', 3.9, 0.4);
        wtl.to(q('.nd-mail'), { opacity: 0.35, duration: 0.3 }, 4.3);
        edge('e3', 4.35); runNode('crm', 4.85, 0.5);
        wtl.to(q('.exec'), { autoAlpha: 0, duration: 0.2 }, 5.4)
           .fromTo(q('.toast'), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.35 }, 5.45)
           .to(q('.ring, .ok, .item, .toast'), { autoAlpha: 0, duration: 0.4 }, 7.6)
           .to(q('.nd-mail'), { opacity: 1, duration: 0.4 }, 7.6)
           .set(q('.run'), { strokeDashoffset: 1 }, 8.0)
           .to(q('.exec'), { autoAlpha: 1, duration: 0.3 }, 8.0);
        if ('IntersectionObserver' in window) {
          var wio = new IntersectionObserver(function (en) { en[0].isIntersecting ? wtl.play() : wtl.pause(); }, { threshold: 0.25 });
          wio.observe(wf);
          cleanups.push(function () { wio.disconnect(); });
        } else { wtl.play(); }
      }

      // In-page links work with the smoother
      var onAnchor = function (e) {
        var a = e.target.closest('a[href^="#"]');
        if (!a) return;
        var id = a.getAttribute('href');
        var target = id.length > 1 && document.querySelector(id);
        var sm = window.ScrollSmoother && ScrollSmoother.get();
        if (target && sm) { e.preventDefault(); sm.scrollTo(target, true, 'top 60px'); }
      };
      document.addEventListener('click', onAnchor);
      cleanups.push(function () { document.removeEventListener('click', onAnchor); });

      return function () { cleanups.forEach(function (fn) { fn(); }); };
    });

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
})();

/* Silver satin background: a custom WebGL fabric shader (folds, sheen, pointer swell, click ripples). */
(function () {
  var canvas = document.querySelector('.satin');
  var hero = document.querySelector('.hero');
  if (!canvas || !hero) return;
  var gl = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false });
  if (!gl) return; // CSS silver glow stays as the fallback
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer: coarse)').matches;

  var vs = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  var fs = [
    'precision highp float;',
    'uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;uniform float uSwell;uniform vec4 uRip[6];',
    'uniform vec3 uBody;uniform vec3 uSheen;uniform vec3 uBg;',
    'float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
    'float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);',
    ' return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}',
    'float H(vec2 p){',
    ' float a=0.42;vec2 q=mat2(cos(a),-sin(a),sin(a),cos(a))*p;float t=uTime;',
    ' q.x+=0.38*sin(q.y*1.25+t*0.22)+0.30*(noise(q*0.7+vec2(t*0.05,-t*0.04))-0.5);',
    ' float h=sin(q.x*9.5+t*0.45+1.6*sin(q.y*1.4-t*0.18))*0.5;',
    ' h+=sin(q.x*16.0-q.y*1.2+t*0.32+1.2*sin(q.y*2.1+t*0.12))*0.16;',
    ' h+=(noise(q*2.2+vec2(t*0.08,0.))-0.5)*0.22;',
    ' vec2 d=p-uMouse;h+=uSwell*0.75*exp(-dot(d,d)*7.0);',
    ' for(int i=0;i<6;i++){vec4 r=uRip[i];if(r.w>0.5){float age=uTime-r.z;float dist=length(p-r.xy);',
    '  h+=0.22*sin(dist*20.-age*7.)*exp(-age*1.3)*exp(-abs(dist-age*0.42)*7.);}}',
    ' return h;}',
    'void main(){',
    ' vec2 p=(gl_FragCoord.xy-0.5*uRes)/uRes.y;float e=1.6/uRes.y;',
    ' float h=H(p);float hx=H(p+vec2(e,0.));float hy=H(p+vec2(0.,e));',
    ' vec3 n=normalize(vec3(-(hx-h)/e*0.16,-(hy-h)/e*0.16,1.));',
    ' vec3 L=normalize(vec3(-0.55,0.65,0.75));',
    ' float diff=clamp(dot(n,L),0.,1.);',
    ' float spec=pow(clamp(dot(reflect(-L,n),vec3(0.,0.,1.)),0.,1.),14.);vec3 L2=normalize(vec3(0.7,-0.3,0.6));float spec2=pow(clamp(dot(reflect(-L2,n),vec3(0.,0.,1.)),0.,1.),30.);',
    ' float fres=pow(1.-n.z,1.6);',
    ' float fold=smoothstep(-0.75,0.7,h);',
    ' vec3 col=mix(uBg,uBody,(0.15+0.85*fold)*pow(diff,2.2)*1.1);',
    ' col+=uSheen*(spec*2.0+spec2*0.8)*(0.4+0.6*fold)+uSheen*fres*0.15;',
    ' float v=smoothstep(1.25,0.25,length(p*vec2(0.8,1.)));col=mix(uBg,col,0.35+0.65*v);',
    ' gl_FragColor=vec4(col,1.);}'
  ].join('\n');

  function sh(type, src) { var o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; }
  var v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs);
  if (!v || !f) return;
  var prog = gl.createProgram(); gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);
  var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  var U = {}; ['uRes', 'uTime', 'uMouse', 'uSwell', 'uRip', 'uBody', 'uSheen', 'uBg'].forEach(function (k) { U[k] = gl.getUniformLocation(prog, k); });
  gl.uniform3f(U.uBody, 0.58, 0.60, 0.65);   // satin body: graphite silver
  gl.uniform3f(U.uSheen, 0.95, 0.96, 1.0);  // sheen: bright silver
  gl.uniform3f(U.uBg, 0.024, 0.026, 0.031);  // deep creases

  var dprCap = coarse ? 1 : 1.5;
  function resize() {
    var r = canvas.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, dprCap);
    canvas.width = Math.max(1, Math.round(r.width * d)); canvas.height = Math.max(1, Math.round(r.height * d));
    gl.viewport(0, 0, canvas.width, canvas.height); gl.uniform2f(U.uRes, canvas.width, canvas.height);
  }
  resize(); window.addEventListener('resize', resize);

  var mouse = { x: 0.35, y: 0, tx: 0.35, ty: 0 }, swell = 0, swellT = 0;
  var rips = new Float32Array(24), ripI = 0, time = 0, last = performance.now();
  function toP(e) { var r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left - r.width / 2) / r.height, y: -(e.clientY - r.top - r.height / 2) / r.height }; }
  if (!reduce && !coarse) {
    hero.addEventListener('mousemove', function (e) { var q = toP(e); mouse.tx = q.x; mouse.ty = q.y; swellT = 1; });
    hero.addEventListener('mouseleave', function () { swellT = 0; });
  }
  if (!reduce) {
    hero.addEventListener('pointerdown', function (e) {
      if (e.target.closest('a,button')) return;
      var q = toP(e); rips.set([q.x, q.y, time, 1], ripI * 4); ripI = (ripI + 1) % 6;
    });
  }

  var visible = true;
  if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { rootMargin: '100px' }).observe(hero);

  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (visible && !document.hidden) {
      time += dt;
      mouse.x += (mouse.tx - mouse.x) * 0.06; mouse.y += (mouse.ty - mouse.y) * 0.06;
      swell += (swellT - swell) * 0.04;
      gl.uniform1f(U.uTime, time); gl.uniform2f(U.uMouse, mouse.x, mouse.y); gl.uniform1f(U.uSwell, swell);
      gl.uniform4fv(U.uRip, rips);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    if (!reduce) requestAnimationFrame(frame);
  }
  if (reduce) { time = 12; frame(performance.now()); } else requestAnimationFrame(frame);
  canvas.parentNode.classList.add('has-satin');
})();

/* Contact form: the page cannot send mail itself, so it prepares the message for the visitor's email app or clipboard. */
(function () {
  var f = document.getElementById('cform'); if (!f) return;
  var out = document.getElementById('cform-out'), mail = document.getElementById('cf-mail'), copyBtn = document.getElementById('cf-copy');
  var TO = 'veilukanthamoorthysan10@gmail.com', body = '';
  function setErr(id, msg) { var el = document.getElementById(id).parentNode.querySelector('.err'); el.textContent = msg || ''; }
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var n = document.getElementById('cf-name').value.trim(), em = document.getElementById('cf-email').value.trim(), m = document.getElementById('cf-msg').value.trim(), tp = document.getElementById('cf-topic').value, ok = true;
    setErr('cf-name', n ? '' : 'Please add your name.'); if (!n) ok = false;
    var good = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em); setErr('cf-email', good ? '' : 'Please add a valid email.'); if (!good) ok = false;
    setErr('cf-msg', m ? '' : 'Please write a short message.'); if (!m) ok = false;
    if (!ok) return;
    body = m + '\n\n— ' + n + ' (' + em + ')';
    mail.href = 'mailto:' + TO + '?subject=' + encodeURIComponent(tp + ' · from ' + n) + '&body=' + encodeURIComponent(body);
    out.classList.add('show'); copyBtn.textContent = 'Copy message';
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });
  copyBtn.addEventListener('click', function () {
    var txt = 'To: ' + TO + '\nSubject: ' + document.getElementById('cf-topic').value + ' · from ' + document.getElementById('cf-name').value.trim() + '\n\n' + body;
    var done = function () { copyBtn.textContent = 'Copied ✓'; };
    try { navigator.clipboard.writeText(txt).then(done, function () { copyBtn.textContent = 'Copy failed: select the text manually'; }); }
    catch (err) { copyBtn.textContent = 'Copy failed: select the text manually'; }
  });
})();

// Mobile menu: disclosure button; closes on link tap, Escape, or leaving the phone layout
(function () {
  var btn = document.querySelector('.menu-btn'), menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;
  function set(open) { menu.hidden = !open; btn.setAttribute('aria-expanded', open ? 'true' : 'false'); btn.textContent = open ? 'Close' : 'Menu'; }
  btn.addEventListener('click', function () { set(menu.hidden); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { set(false); btn.focus(); } });
  window.matchMedia('(min-width: 721px)').addEventListener('change', function (m) { if (m.matches) set(false); });
})();
