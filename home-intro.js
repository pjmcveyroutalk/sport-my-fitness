/* Home only: play when the page is visible and its live artwork is ready.
   The supplied MP4 provides timing; approved text, images and layout stay intact. */
(() => {
  'use strict';
  const root = document.documentElement;
  if (!window.matchMedia) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const navigation = window.performance && window.performance.getEntriesByType
    ? window.performance.getEntriesByType('navigation')[0] : null;
  if (reducedMotion.matches || window.scrollY > 0 ||
      (navigation && navigation.type === 'back_forward') ||
      (window.location.hash && window.location.hash !== '#top')) return;

  const documentActions = ['pointerdown', 'keydown'];
  const windowActions = ['wheel', 'touchstart', 'hashchange', 'pagehide'];
  let finished = false;
  let prepared = false;
  let ready = false;
  let queued = false;
  let playing = false;
  let waitTimer;
  let introTimer;
  let frame;
  let cleanPhoto = () => {};

  function finish() {
    if (finished) return;
    finished = true;
    root.classList.remove('smf-intro-pending', 'smf-intro-playing');
    clearTimeout(waitTimer);
    clearTimeout(introTimer);
    cancelAnimationFrame(frame);
    cleanPhoto();
    documentActions.forEach(type => document.removeEventListener(type, finish, true));
    windowActions.forEach(type => window.removeEventListener(type, finish));
    window.removeEventListener('scroll', onScroll);
    document.removeEventListener('DOMContentLoaded', prepare);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    if (reducedMotion.removeEventListener) reducedMotion.removeEventListener('change', onMotionChange);
    else if (reducedMotion.removeListener) reducedMotion.removeListener(onMotionChange);
  }

  function begin() {
    queued = false;
    if (finished || document.hidden) return;
    if (reducedMotion.matches || window.scrollY > 0 ||
        (window.location.hash && window.location.hash !== '#top')) {
      finish();
      return;
    }
    playing = true;
    root.classList.remove('smf-intro-pending');
    root.classList.add('smf-intro-playing');
    introTimer = setTimeout(finish, 3800);
  }

  function queueStart() {
    if (finished || playing || queued || !ready || document.hidden) return;
    queued = true;
    // Keep the loading state through one paint so cached assets animate too.
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(begin);
    });
  }

  function markReady() {
    if (finished) return;
    ready = true;
    clearTimeout(waitTimer);
    waitTimer = undefined;
    queueStart();
  }

  function armWaitLimit() {
    if (!finished && prepared && !ready && !document.hidden && !waitTimer) {
      // A failed or slow asset must never keep usable page content hidden.
      waitTimer = setTimeout(markReady, 2000);
    }
  }

  function photoReady() {
    const photo = document.querySelector('.smf-home-page .yoshi-hero');
    if (!photo) return Promise.resolve();
    const decode = () => typeof photo.decode === 'function'
      ? Promise.resolve().then(() => photo.decode()).catch(() => {}) : Promise.resolve();
    if (photo.complete) return decode();
    return new Promise(resolve => {
      const loaded = () => { cleanPhoto(); decode().then(resolve); };
      const failed = () => { cleanPhoto(); resolve(); };
      cleanPhoto = () => {
        photo.removeEventListener('load', loaded);
        photo.removeEventListener('error', failed);
      };
      photo.addEventListener('load', loaded, { once: true });
      photo.addEventListener('error', failed, { once: true });
    });
  }

  function prepare() {
    if (finished || prepared) return;
    prepared = true;
    document.removeEventListener('DOMContentLoaded', prepare);
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.allSettled([photoReady(), fontsReady]).then(markReady);
    armWaitLimit();
  }

  function onScroll() { if (window.scrollY > 0) finish(); }
  function onMotionChange(event) { if (event.matches) finish(); }
  function onVisibilityChange() {
    if (document.hidden) {
      if (playing) finish();
      else {
        clearTimeout(waitTimer);
        waitTimer = undefined;
        cancelAnimationFrame(frame);
        queued = false;
      }
    } else {
      armWaitLimit();
      queueStart();
    }
  }

  documentActions.forEach(type => document.addEventListener(type, finish, { capture: true, passive: true }));
  windowActions.forEach(type => window.addEventListener(type, finish, { passive: true }));
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('visibilitychange', onVisibilityChange);
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', onMotionChange);
  else if (reducedMotion.addListener) reducedMotion.addListener(onMotionChange);
  root.classList.add('smf-intro-pending');
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', prepare, { once: true });
  else prepare();
})();
