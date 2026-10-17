(() => {
  'use strict';
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
