import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EMAIL } from '../data/site';

/* The page cannot send mail itself, so it prepares the message for the visitor's email app or clipboard. */
export function initContactForm() {
  const f = document.getElementById('cform');
  if (!f) return;
  const out = document.getElementById('cform-out')!;
  const mail = document.getElementById('cf-mail') as HTMLAnchorElement;
  const copyBtn = document.getElementById('cf-copy')!;
  const val = (id: string) => (document.getElementById(id) as HTMLInputElement).value;
  let body = '';

  const setErr = (id: string, msg: string) => {
    const el = document.getElementById(id)!.parentElement!.querySelector('.err')!;
    el.textContent = msg;
  };

  f.addEventListener('submit', (e) => {
    e.preventDefault();
    const n = val('cf-name').trim();
    const em = val('cf-email').trim();
    const m = val('cf-msg').trim();
    const tp = val('cf-topic');
    let ok = true;
    setErr('cf-name', n ? '' : 'Please add your name.');
    if (!n) ok = false;
    const good = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
    setErr('cf-email', good ? '' : 'Please add a valid email.');
    if (!good) ok = false;
    setErr('cf-msg', m ? '' : 'Please write a short message.');
    if (!m) ok = false;
    if (!ok) return;
    body = m + '\n\n— ' + n + ' (' + em + ')';
    mail.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(tp + ' · from ' + n) + '&body=' + encodeURIComponent(body);
    out.classList.add('show');
    copyBtn.textContent = 'Copy message';
    ScrollTrigger.refresh();
  });

  copyBtn.addEventListener('click', () => {
    const txt = 'To: ' + EMAIL + '\nSubject: ' + val('cf-topic') + ' · from ' + val('cf-name').trim() + '\n\n' + body;
    const done = () => {
      copyBtn.textContent = 'Copied ✓';
    };
    const fail = () => {
      copyBtn.textContent = 'Copy failed: select the text manually';
    };
    try {
      navigator.clipboard.writeText(txt).then(done, fail);
    } catch {
      fail();
    }
  });
}
