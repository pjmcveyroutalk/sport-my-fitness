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

  const form = document.getElementById('inquiry-form');
  if (!form) return;
  const name = document.getElementById('inquiry-name');
  const email = document.getElementById('inquiry-email');
  const interest = document.getElementById('inquiry-interest');
  const goals = document.getElementById('inquiry-goals');
  const interests = new Set(Array.from(interest.options, option => option.value));

  // The browser posts the validated form directly. Only the delivery service
  // displays its receipt; this page never assumes that an email was delivered.
  form.addEventListener('submit', event => {
    name.setCustomValidity(!name.value.trim() ? 'Please enter your name.' : name.value.length > 100 ? 'Please use no more than 100 characters.' : '');
    email.setCustomValidity(email.value.length > 254 ? 'Please use no more than 254 characters.' : '');
    goals.setCustomValidity(!goals.value.trim() ? 'Please add your goals or a question.' : goals.value.length > 1500 ? 'Please use no more than 1500 characters.' : '');
    interest.setCustomValidity(interests.has(interest.value) ? '' : 'Please choose one of the listed options.');
    if (!form.reportValidity()) {
      event.preventDefault();
      return;
    }
    name.value = name.value.trim();
    email.value = email.value.trim();
    goals.value = goals.value.trim();
  });
  for (const field of [name, email, goals]) {
    field.addEventListener('input', () => field.setCustomValidity(''));
  }
  interest.addEventListener('change', () => interest.setCustomValidity(''));
})();
