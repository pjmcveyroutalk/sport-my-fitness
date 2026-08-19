const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');


function closeMenu() {
  if (!toggle || !nav) return;

  nav.classList.remove('open');

  toggle.setAttribute(
    'aria-expanded',
    'false'
  );
}


if (toggle && nav) {

  toggle.addEventListener('click', () => {

    const isOpen = nav.classList.toggle('open');

    toggle.setAttribute(
      'aria-expanded',
      String(isOpen)
    );

  });


  /*
   * Let every <a href=""> navigate normally.
   *
   * Do NOT use preventDefault().
   * Do NOT manually set window.location.
   *
   * We only close the hamburger menu when
   * a navigation item is tapped.
   */

  nav.querySelectorAll('a').forEach(link => {

    link.addEventListener('click', () => {
      closeMenu();
    });

  });

}


/*
 * Close the mobile menu if the viewport
 * changes back to desktop size.
 */

window.addEventListener('resize', () => {

  if (window.innerWidth > 980) {
    closeMenu();
  }

});


/*
 * Update copyright year only on pages
 * that actually contain #year.
 */

const year = document.querySelector('#year');

if (year) {
  year.textContent = new Date().getFullYear();
}
