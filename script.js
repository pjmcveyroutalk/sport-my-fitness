const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');

function closeMenu() {
  if (!nav || !toggle) return;

  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}

if (toggle && nav) {

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');

    toggle.setAttribute(
      'aria-expanded',
      String(isOpen)
    );
  });


  nav.querySelectorAll('a').forEach(link => {

    link.addEventListener('click', event => {

      const href = link.getAttribute('href');

      if (!href) return;


      /*
       * Same-page anchor links
       */

      if (href.startsWith('#')) {

        event.preventDefault();

        closeMenu();

        const target = document.querySelector(href);

        if (target) {

          window.setTimeout(() => {

            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });

            history.replaceState(
              null,
              '',
              href
            );

          }, 50);

        }

        return;
      }


      /*
       * Actual page navigation
       *
       * Explicit navigation avoids mobile browsers
       * losing the link action when the menu closes.
       */

      event.preventDefault();

      closeMenu();

      window.setTimeout(() => {
        window.location.href = href;
      }, 50);

    });

  });

}


/*
 * Automatically close menu if screen changes
 * from mobile/tablet to desktop.
 */

window.addEventListener('resize', () => {

  if (
    window.innerWidth > 980 &&
    nav &&
    toggle
  ) {

    closeMenu();

  }

});


/*
 * Copyright year.
 *
 * Only update it when the element actually exists.
 */

const year = document.querySelector('#year');

if (year) {
  year.textContent = new Date().getFullYear();
    }
