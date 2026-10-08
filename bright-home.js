(() => {
  'use strict';
  const menuToggle = document.querySelector('.menu-toggle');
  const menuLabel = document.querySelector('.menu-label');
  const navigation = document.getElementById('primary-nav');
  const desktop = window.matchMedia('(min-width: 901px)');
  function closeMenu() {
    navigation.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuLabel.textContent = 'Menu';
  }
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    navigation.classList.toggle('open', !isOpen);
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuLabel.textContent = isOpen ? 'Menu' : 'Close';
  });
  navigation.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuToggle.focus();
    }
  });
  desktop.addEventListener('change', event => {
    const returnFocus = !event.matches && navigation.contains(document.activeElement);
    const focusVisibleLink = event.matches && document.activeElement === menuToggle;
    closeMenu();
    if (returnFocus) menuToggle.focus();
    else if (focusVisibleLink) (navigation.querySelector('a[aria-current]') || navigation.querySelector('a')).focus();
  });
  document.addEventListener('focusin', event => {
    if (menuToggle.getAttribute('aria-expanded') === 'true' && !event.target.closest('.site-header')) closeMenu();
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) closeMenu();
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
