/* Mobile menu: disclosure button; closes on link tap, Escape, or leaving the phone layout */
export function initMenu() {
  const btn = document.querySelector<HTMLButtonElement>('.menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;
  const set = (open: boolean) => {
    menu.hidden = !open;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.textContent = open ? 'Close' : 'Menu';
  };
  btn.addEventListener('click', () => set(!!menu.hidden));
  menu.addEventListener('click', (e) => {
    if ((e.target as Element).closest('a')) set(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) {
      // menu is open
      set(false);
      btn.focus();
    }
  });
  window.matchMedia('(min-width: 721px)').addEventListener('change', (m) => {
    if (m.matches) set(false);
  });
}
