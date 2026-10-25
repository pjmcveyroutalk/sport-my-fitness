(() => {
  'use strict';
  const form = document.getElementById('inquiry-form');
  if (!form) return;
  const name = document.getElementById('inquiry-name');
  const email = document.getElementById('inquiry-email');
  const interest = document.getElementById('inquiry-interest');
  const goals = document.getElementById('inquiry-goals');
  const interests = new Set(Array.from(interest.options, option => option.value));
  const honey = form.elements.namedItem('_honey');
  const button = form.querySelector('button[type="submit"]');
  const status = document.getElementById('inquiry-status');
  let busy = false;
  function notice(message) { status.textContent = message; status.hidden = false; }
  if (!window.smfContactProtectionReady) {
    notice('The form could not load. Please reload this page, or call or email Yoshi.');
    return;
  }
  button.disabled = false;

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;
    name.setCustomValidity(!name.value.trim() ? 'Please enter your name.' : name.value.length > 100 ? 'Please use no more than 100 characters.' : '');
    email.setCustomValidity(email.value.length > 254 ? 'Please use no more than 254 characters.' : '');
    goals.setCustomValidity(!goals.value.trim() ? 'Please add your goals or a question.' : goals.value.length > 1500 ? 'Please use no more than 1500 characters.' : '');
    interest.setCustomValidity(interests.has(interest.value) ? '' : 'Please choose one of the listed options.');
    if (!form.reportValidity()) {
      return;
    }
    name.value = name.value.trim();
    email.value = email.value.trim();
    goals.value = goals.value.trim();
    busy = true; button.disabled = true; form.setAttribute('aria-busy', 'true');
    notice('Sending your message…');
    const controller = new AbortController();
    let timer;
    try {
      const request = fetch('/api/contact/', {method:'POST', credentials:'same-origin',
        headers:{'Content-Type':'application/json', Accept:'application/json'},
        signal:controller.signal,
        body:JSON.stringify({name:name.value, email:email.value, interest:interest.value,
          goals:goals.value, _honey:honey.value})});
      const response = await Promise.race([request, new Promise((_, reject) => {
        timer = setTimeout(() => {controller.abort(); reject(new Error('timeout'));}, 20000);
      })]);
      const receipt = await response.json();
      if (response.ok && receipt.ok === true && receipt.code === 'accepted') {
        form.reset();
        notice('Your message has been accepted for delivery to Yoshi.');
      } else if (response.status === 429) {
        notice('Too many attempts. Please wait ten minutes before trying again.');
      } else if (response.status === 400 || response.status === 413) {
        notice('Please check your name, email, selected interest and message, then try again.');
      } else {
        notice('We could not confirm your message was accepted. Please call or email Yoshi before trying again.');
      }
    } catch {
      notice('We could not confirm your message was accepted. Please call or email Yoshi before trying again.');
    } finally {
      clearTimeout(timer); busy = false; button.disabled = false; form.removeAttribute('aria-busy');
    }
  });
  for (const field of [name, email, goals]) {
    field.addEventListener('input', () => field.setCustomValidity(''));
  }
  interest.addEventListener('change', () => interest.setCustomValidity(''));
})();
