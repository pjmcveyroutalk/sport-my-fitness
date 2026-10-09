/* Home only: start before the first paint, then leave the approved page intact.
   The MP4 supplies timing; its older baked-in header/artwork are not embedded. */
(() => {
  'use strict';
  const root = document.documentElement;
  const seenKey = 'smf-home-intro-seen-v1';
  if (!window.matchMedia) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const navigation = window.performance && window.performance.getEntriesByType
    ? window.performance.getEntriesByType('navigation')[0] : null;
  if (reducedMotion.matches || document.hidden || window.scrollY > 0 ||
      (navigator.connection && navigator.connection.saveData) ||
      (navigation && navigation.type === 'back_forward') ||
      (window.location.hash && window.location.hash !== '#top')) return;
  try {
    if (window.sessionStorage.getItem(seenKey)) return;
    window.sessionStorage.setItem(seenKey, '1');
  } catch (_) {
    // Private browsing or blocked storage must never hide or disable the page.
  }

  const documentActions = ['pointerdown', 'keydown', 'focusin'];
  const windowActions = ['wheel', 'touchstart', 'scroll', 'hashchange', 'pagehide'];
  let timer;
  function finish() {
    root.classList.remove('smf-intro-playing');
    clearTimeout(timer);
    documentActions.forEach(type => document.removeEventListener(type, finish, true));
    windowActions.forEach(type => window.removeEventListener(type, finish));
    document.removeEventListener('visibilitychange', onVisibilityChange);
    if (reducedMotion.removeEventListener) reducedMotion.removeEventListener('change', onMotionChange);
    else if (reducedMotion.removeListener) reducedMotion.removeListener(onMotionChange);
  }
  function onVisibilityChange() { if (document.hidden) finish(); }
  function onMotionChange(event) { if (event.matches) finish(); }

  documentActions.forEach(type => document.addEventListener(type, finish, { capture: true, passive: true }));
  windowActions.forEach(type => window.addEventListener(type, finish, { passive: true }));
  document.addEventListener('visibilitychange', onVisibilityChange);
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', onMotionChange);
  else if (reducedMotion.addListener) reducedMotion.addListener(onMotionChange);
  root.classList.add('smf-intro-playing');
  timer = setTimeout(finish, 3800);
})();
