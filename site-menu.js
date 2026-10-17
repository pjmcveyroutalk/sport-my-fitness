/* One menu controller for all seven pages. Native modal supplies inert content,
   keyboard focus containment and Escape; closing always restores the trigger. */
(() => {
  'use strict';
  const toggle = document.querySelector('.menu-toggle');
  const panel = document.querySelector('.menu-panel');
  const close = panel?.querySelector('.menu-close');
  const fallback = document.querySelector('.menu-fallback');
  const navigation = document.getElementById('primary-nav');
  const mobile = matchMedia('(max-width: 900px)');
  const year = document.getElementById('year');
  let scrollOverflow = '';
  if (year) year.textContent = new Date().getFullYear();
  if (!toggle || !panel || !close || !fallback || !navigation || typeof panel.showModal !== 'function') return;

  // The server-rendered native details menu is usable before JS, with JS blocked,
  // and in a browser without dialog support. Move, never duplicate, its links.
  panel.append(navigation);
  fallback.hidden = true;

  function closeMenu() { if (panel.open) panel.close(); }
  function restore() {
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = scrollOverflow;
  }
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    if (panel.open) return closeMenu();
    scrollOverflow = document.body.style.overflow;
    panel.showModal();
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    close.focus({preventScroll: true});
  });
  close.addEventListener('click', closeMenu);
  panel.addEventListener('close', restore);
  panel.addEventListener('keydown', event => {
    if (event.key !== 'Tab' || !panel.open) return;
    const controls = [...panel.querySelectorAll('a[href],button:not(:disabled),[tabindex]:not([tabindex="-1"])')].filter(el => el.getClientRects().length);
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  });
  panel.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
    if (event.target === panel) {
      const box = panel.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closeMenu();
    }
  });
  mobile.addEventListener('change', closeMenu);
  addEventListener('pagehide', () => { closeMenu(); restore(); });
})();
