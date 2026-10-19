/* Appearance only: retain the existing dark default and page choreography. */
(() => {
  'use strict';
  const root = document.documentElement;
  const storageKey = 'smf-color-theme';
  let theme = 'dark';

  try {
    if (localStorage.getItem(storageKey) === 'light') theme = 'light';
  } catch (_) { /* The switch still works when browser storage is unavailable. */ }

  function render() {
    root.dataset.theme = theme;
    const browserColor = document.querySelector('meta[name="theme-color"]');
    if (browserColor) browserColor.content = theme === 'light' ? '#f2f5f5' : '#101313';
    for (const button of document.querySelectorAll('[data-theme-toggle]')) {
      button.setAttribute('aria-checked', String(theme === 'light'));
      button.title = theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
    }
  }

  // This script runs in the head, before the page stylesheet can paint.
  render();

  function connect() {
    for (const button of document.querySelectorAll('[data-theme-toggle]')) {
      button.addEventListener('click', () => {
        theme = theme === 'light' ? 'dark' : 'light';
        render();
        try { localStorage.setItem(storageKey, theme); } catch (_) {}
      });
      button.hidden = false;
    }
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', connect, {once: true});
  } else connect();

  addEventListener('storage', event => {
    if (event.key !== storageKey && event.key !== null) return;
    theme = event.newValue === 'light' ? 'light' : 'dark';
    render();
  });
})();
