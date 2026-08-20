/*
 * SPORT MY FITNESS — SHARED SITE SHELL
 */

(() => {

  const headerTarget =
    document.querySelector('[data-site-header]');

  const footerTarget =
    document.querySelector('[data-site-footer]');


  const currentPath =
    window.location.pathname
      .split('/')
      .pop() || 'index.html';


  const onHome =
    currentPath === '' ||
    currentPath === 'index.html';


  const homeHref = 'index.html';

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
     HEADER
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
     FOOTER
  ======================================== */

  const footerMarkup = `

    <footer class="site-footer">


      <div class="footer-human-wrap">


        <div class="footer-watermark"></div>


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


        <!-- SIMPLE NAV -->

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


        <!-- SOCIALS -->

        <div
          class="footer-social-text"
          aria-label="Sport My Fitness social media"
        >


          <!-- FACEBOOK -->

          <a
            href="https://www.facebook.com/share/1BisC7LXXg/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Sport My Fitness on Facebook"
          >

            <svg
              class="footer-social-logo facebook-logo"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="11"
                fill="currentColor"
              ></circle>

              <path
                d="M13.45 20v-7h2.35l.35-2.73h-2.7V8.53c0-.79.22-1.33 1.36-1.33h1.45V4.76c-.25-.03-1.11-.11-2.11-.11-2.09 0-3.52 1.27-3.52 3.62v2h-2.36V13h2.36v7h2.82z"
                fill="#fff"
              ></path>
            </svg>

            <span>
              Facebook
            </span>

          </a>


          <!-- INSTAGRAM -->

          <a
            href="https://www.instagram.com/sportmyfitness.mke"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Sport My Fitness on Instagram"
          >

            <svg
              class="footer-social-logo instagram-logo"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >

              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="5"
              ></rect>

              <circle
                cx="12"
                cy="12"
                r="4"
              ></circle>

              <circle
                cx="17.4"
                cy="6.6"
                r="1"
                fill="currentColor"
                stroke="none"
              ></circle>

            </svg>

            <span>
              Instagram
            </span>

          </a>


          <!-- TIKTOK -->

          <a
            href="https://www.tiktok.com/@yoshibarnes"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Yoshi Barnes on TikTok"
          >

            <svg
              class="footer-social-logo tiktok-logo"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >

              <path
                d="M14 3h3.2c.25 1.7 1.2 3.15 2.8 4.05V10c-1.1-.08-2.1-.4-3-.93V15a6 6 0 1 1-5-5.92v3.08A3 3 0 1 0 14 15V3z"
              ></path>

            </svg>

            <span>
              TikTok
            </span>

          </a>


          <!-- LINKEDIN -->

          <a
            href="https://www.linkedin.com/in/yoshi-%E2%80%9Cmyosha%E2%80%9D-barnes-64851776"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Yoshi Barnes on LinkedIn"
          >

            <svg
              class="footer-social-logo linkedin-logo"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >

              <rect
                x="2"
                y="2"
                width="20"
                height="20"
                rx="3"
                fill="currentColor"
              ></rect>

              <circle
                cx="7"
                cy="8"
                r="1.5"
                fill="#fff"
              ></circle>

              <rect
                x="5.6"
                y="10"
                width="2.8"
                height="8"
                fill="#fff"
              ></rect>

              <path
                d="M10.5 10h2.7v1.1c.7-.9 1.7-1.5 3.2-1.5 2.4 0 3.6 1.5 3.6 4.4v4h-2.9v-3.6c0-1.5-.5-2.4-1.7-2.4-1.4 0-2 1-2 2.7V18h-2.9v-8z"
                fill="#fff"
              ></path>

            </svg>

            <span>
              LinkedIn
            </span>

          </a>


          <!-- GOOGLE -->

          <a
            href="https://www.google.com/maps/search/?api=1&query=Sport+My+Fitness+4722+W+Vliet+St+Milwaukee+WI+53208"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Sport My Fitness on Google"
          >

            <svg
              class="footer-social-logo google-logo"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >

              <circle
                cx="12"
                cy="12"
                r="10"
                fill="#fff"
              ></circle>

              <path
                d="M18.8 12.2c0-.5-.05-.96-.13-1.4H12v2.66h3.82a3.27 3.27 0 0 1-1.42 2.15v1.78h2.3c1.35-1.24 2.1-3.08 2.1-5.19z"
                fill="#4285F4"
              ></path>

              <path
                d="M12 19c1.93 0 3.55-.64 4.73-1.74l-2.3-1.78c-.64.43-1.46.68-2.43.68-1.86 0-3.44-1.26-4-2.95H5.62v1.84A7.15 7.15 0 0 0 12 19z"
                fill="#34A853"
              ></path>

              <path
                d="M8 13.21A4.35 4.35 0 0 1 7.77 12c0-.42.08-.83.22-1.21V8.95H5.62A7 7 0 0 0 5 12c0 1.1.26 2.14.62 3.05L8 13.21z"
                fill="#FBBC05"
              ></path>

              <path
                d="M12 7.84c1.05 0 1.99.36 2.73 1.07l2.05-2.05C15.54 5.7 13.93 5 12 5a7.15 7.15 0 0 0-6.38 3.95L8 10.79c.56-1.69 2.14-2.95 4-2.95z"
                fill="#EA4335"
              ></path>

            </svg>

            <span>
              Google
            </span>

          </a>


        </div>


      </div>


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
     INSERT SHELL
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
     MOBILE MENU
  ======================================== */

  const toggle =
    document.querySelector('.menu-toggle');

  const nav =
    document.querySelector('#site-nav');


  function closeMenu() {

    if (!toggle || !nav) {
      return;
    }

    nav.classList.remove('open');

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
          nav.classList.toggle('open');

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
          closeMenu
        );

      });

  }


  window.addEventListener(
    'resize',
    () => {

      if (window.innerWidth > 980) {
        closeMenu();
      }

    }
  );


  const year =
    document.querySelector('#year');


  if (year) {

    year.textContent =
      new Date().getFullYear();

  }

})();
