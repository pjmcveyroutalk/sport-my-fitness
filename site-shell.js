/*
 * SPORT MY FITNESS — SHARED SITE SHELL
 *
 * MASTER SOURCE FOR:
 * - Header
 * - Navigation
 * - Hamburger behavior
 * - Footer
 * - Contact information
 * - Social links
 * - Footer legal links
 *
 * Page-specific content remains
 * inside each HTML page.
 */

(() => {

  /* ========================================
     PAGE CONTEXT
  ======================================== */

  const headerTarget =
    document.querySelector(
      '[data-site-header]'
    );

  const footerTarget =
    document.querySelector(
      '[data-site-footer]'
    );


  const currentPath =
    window.location.pathname
      .split('/')
      .pop() || 'index.html';


  const onHome =
    currentPath === '' ||
    currentPath === 'index.html';


  const homeHref =
    'index.html';


  const missionHref =
    onHome
      ? '#mission'
      : 'index.html#mission';


  const yoshiHref =
    onHome
      ? '#yoshi'
      : 'index.html#yoshi';


  const contactHref =
    onHome
      ? '#contact'
      : 'index.html#contact';


  /* ========================================
     MASTER HEADER
  ======================================== */

  const headerMarkup = `

    <a
      class="skip-link"
      href="#main"
    >
      Skip to content
    </a>


    <header
      class="site-header"
      id="top"
    >

      <div class="header-inner">


        <a
          class="brand"
          href="${homeHref}"
          aria-label="Sport My Fitness home"
        >

          <img
            src="brand/sportmyfitness-logo-header.png"
            alt="Sport My Fitness"
          >

        </a>


        <button
          class="menu-toggle"
          type="button"
          aria-expanded="false"
          aria-controls="site-nav"
        >

          <span></span>

          <span></span>

          <span></span>

          <span class="sr-only">
            Open menu
          </span>

        </button>


        <nav
          class="site-nav"
          id="site-nav"
          aria-label="Primary"
        >

          <a href="programs.html">
            Programs
          </a>


          <a href="${yoshiHref}">
            About Yoshi
          </a>


          <a href="media.html">
            Media
          </a>


          <a href="training-options.html">
            Training Options
          </a>


          <a href="${contactHref}">
            Contact Yoshi
          </a>

        </nav>


      </div>

    </header>

  `;


  /* ========================================
     MASTER FOOTER
     HUMAN / LOCAL BRAND DIRECTION
  ======================================== */

  const footerMarkup = `

    <footer class="site-footer">


      <div class="footer-human-wrap">


        <div class="footer-watermark"></div>


        <!-- ==================================
             BUSINESS / CONTACT
        =================================== -->

        <div class="footer-brand-block">


          <p class="footer-brand-name">
            Sport My Fitness
          </p>


          <p class="footer-brand-location">
            Milwaukee, Wisconsin
          </p>


          <p class="footer-brand-line">
            Real training. Real support. Built around you.
          </p>


          <div class="footer-contact-row">


            <a href="tel:+14147914526">
              414-791-4526
            </a>


            <span aria-hidden="true">
              ·
            </span>


            <a href="mailto:Yoshi_barnes@outlook.com">
              Yoshi_barnes@outlook.com
            </a>


          </div>


          <p class="footer-address">
            4722 W Vliet St, Milwaukee, WI 53208
          </p>


        </div>


        <!-- ==================================
             SIMPLE SITE NAVIGATION
        =================================== -->

        <nav
          class="footer-simple-nav"
          aria-label="Footer"
        >

          <a href="index.html">
            Home
          </a>


          <a href="programs.html">
            Programs
          </a>


          <a href="training-options.html">
            Training Options
          </a>


          <a href="media.html">
            Media
          </a>


          <a href="book.html">
            Book
          </a>


          <a href="${yoshiHref}">
            Yoshi
          </a>


          <a href="${contactHref}">
            Contact
          </a>

        </nav>


        <!-- ==================================
             SOCIAL
        =================================== -->

        <div class="footer-social-text">


          <a
            href="https://www.facebook.com/share/1BisC7LXXg/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Facebook
          </a>


          <a
            href="https://www.instagram.com/sportmyfitness.mke"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>


          <a
            href="https://www.tiktok.com/@yoshibarnes"
            target="_blank"
            rel="noopener noreferrer"
          >
            TikTok
          </a>


          <a
            href="https://www.linkedin.com/in/yoshi-%E2%80%9Cmyosha%E2%80%9D-barnes-64851776"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>


          <a
            href="https://www.google.com/maps/search/?api=1&query=Sport+My+Fitness+4722+W+Vliet+St+Milwaukee+WI+53208"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google
          </a>


        </div>


      </div>


      <!-- ==================================
           BOTTOM STRIP
      =================================== -->

      <div class="footer-bottom-simple">


        <p>
          © <span id="year"></span>
          Sport My Fitness
        </p>


        <div class="footer-legal-simple">


          <span>
            Terms of Use
          </span>


          <span aria-hidden="true">
            ·
          </span>


          <span>
            Privacy Policy
          </span>


        </div>


      </div>


    </footer>

  `;


  /* ========================================
     INSERT MASTER COMPONENTS
  ======================================== */

  if (headerTarget) {

    headerTarget.insertAdjacentHTML(
      'beforebegin',
      headerMarkup
    );

    headerTarget.remove();

  }


  if (footerTarget) {

    footerTarget.insertAdjacentHTML(
      'beforebegin',
      footerMarkup
    );

    footerTarget.remove();

  }


  /* ========================================
     MASTER MOBILE NAV BEHAVIOR
  ======================================== */

  const toggle =
    document.querySelector(
      '.menu-toggle'
    );


  const nav =
    document.querySelector(
      '#site-nav'
    );


  function closeMenu() {

    if (!toggle || !nav) {
      return;
    }


    nav.classList.remove(
      'open'
    );


    toggle.setAttribute(
      'aria-expanded',
      'false'
    );

  }


  if (toggle && nav) {


    toggle.addEventListener(
      'click',
      () => {

        const isOpen =
          nav.classList.toggle(
            'open'
          );


        toggle.setAttribute(
          'aria-expanded',
          String(isOpen)
        );

      }
    );


    nav
      .querySelectorAll('a')
      .forEach(link => {

        link.addEventListener(
          'click',
          () => {

            closeMenu();

          }
        );

      });


  }


  /* ========================================
     DESKTOP RESET
  ======================================== */

  window.addEventListener(
    'resize',
    () => {

      if (
        window.innerWidth > 980
      ) {

        closeMenu();

      }

    }
  );


  /* ========================================
     COPYRIGHT YEAR
  ======================================== */

  const year =
    document.querySelector(
      '#year'
    );


  if (year) {

    year.textContent =
      new Date().getFullYear();

  }


})();
