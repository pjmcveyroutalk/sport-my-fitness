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
 * Page-specific content remains inside each HTML page.
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
  ======================================== */

  const footerMarkup = `

    <footer class="site-footer">


      <div class="footer-watermark-area">


        <div class="footer-information">


          <!-- EXPLORE -->

          <section class="footer-group">


            <h3 class="footer-group-title">


              <svg
                class="footer-group-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >

                <path
                  d="M10 13a5 5 0 0 0 7.07 0l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15"
                ></path>

                <path
                  d="M14 11a5 5 0 0 0-7.07 0l-2 2A5 5 0 0 0 12 20.07l1.15-1.15"
                ></path>

              </svg>


              Explore

            </h3>


            <div class="footer-inline-links">


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
                Media Gallery
              </a>


              <a href="book.html">
                Book a Session
              </a>


            </div>


          </section>


          <!-- ABOUT -->

          <section class="footer-group">


            <h3 class="footer-group-title">


              <svg
                class="footer-group-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >

                <circle
                  cx="12"
                  cy="8"
                  r="4"
                ></circle>

                <path
                  d="M4 21a8 8 0 0 1 16 0"
                ></path>

              </svg>


              About

            </h3>


            <div class="footer-inline-links">


              <a href="${missionHref}">
                Our Mission
              </a>


              <a href="${yoshiHref}">
                Meet Yoshi
              </a>


              <a href="${contactHref}">
                Message Yoshi
              </a>


            </div>


          </section>


          <!-- CONTACT -->

          <section
            class="
              footer-group
              footer-contact-group
            "
          >


            <h3 class="footer-group-title">


              <svg
                class="footer-group-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >

                <path
                  d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z"
                ></path>

              </svg>


              Contact

            </h3>


            <div class="footer-contact-lines">


              <div class="footer-contact-item">


                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  aria-hidden="true"
                >

                  <path
                    d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z"
                  ></path>

                </svg>


                <a href="tel:+14147914526">
                  414-791-4526
                </a>


              </div>


              <div class="footer-contact-item">


                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  aria-hidden="true"
                >

                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                  ></rect>

                  <path
                    d="m3 7 9 6 9-6"
                  ></path>

                </svg>


                <a
                  href="
                    mailto:Yoshi_barnes@outlook.com
                  "
                >
                  Yoshi_barnes@outlook.com
                </a>


              </div>


              <div class="footer-contact-item">


                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  aria-hidden="true"
                >

                  <path
                    d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z"
                  ></path>

                  <circle
                    cx="12"
                    cy="10"
                    r="2.5"
                  ></circle>

                </svg>


                <span>
                  4722 W Vliet St,
                  Milwaukee, WI 53208
                </span>


              </div>


            </div>


          </section>


        </div>


      </div>


      <!-- ====================================
           SOCIAL LINKS
      ===================================== -->


      <div class="footer-social">


        <div
          class="footer-social-divider"
        ></div>


        <p class="footer-social-title">
          Follow Sport My Fitness
        </p>


        <div class="footer-social-links">


          <!-- FACEBOOK -->

          <a
            class="footer-social-link"
            href="
              https://www.facebook.com/share/1BisC7LXXg/
            "
            target="_blank"
            rel="noopener noreferrer"
            aria-label="
              Sport My Fitness on Facebook
            "
          >

            <span
              class="
                footer-social-icon
                facebook-icon
              "
            >

              <svg
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

            </span>


          </a>


          <!-- INSTAGRAM -->

          <a
            class="footer-social-link"
            href="
              https://www.instagram.com/sportmyfitness.mke
            "
            target="_blank"
            rel="noopener noreferrer"
            aria-label="
              Sport My Fitness on Instagram
            "
          >

            <span
              class="
                footer-social-icon
                instagram-icon
              "
            >

              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
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

            </span>


          </a>


          <!-- TIKTOK -->

          <a
            class="footer-social-link"
            href="
              https://www.tiktok.com/@yoshibarnes
            "
            target="_blank"
            rel="noopener noreferrer"
            aria-label="
              Yoshi Barnes on TikTok
            "
          >

            <span
              class="
                footer-social-icon
                tiktok-icon
              "
            >

              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                fill="currentColor"
              >

                <path
                  d="M14 3h3.2c.25 1.7 1.2 3.15 2.8 4.05V10c-1.1-.08-2.1-.4-3-.93V15a6 6 0 1 1-5-5.92v3.08A3 3 0 1 0 14 15V3z"
                ></path>

              </svg>

            </span>


          </a>


          <!-- LINKEDIN -->

          <a
            class="footer-social-link"
            href="
              https://www.linkedin.com/in/yoshi-%E2%80%9Cmyosha%E2%80%9D-barnes-64851776
            "
            target="_blank"
            rel="noopener noreferrer"
            aria-label="
              Yoshi Barnes on LinkedIn
            "
          >

            <span
              class="
                footer-social-icon
                linkedin-icon
              "
            >

              <svg
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

            </span>


          </a>


          <!-- GOOGLE -->

          <a
            class="footer-social-link"
            href="
              https://www.google.com/maps/search/?api=1&query=Sport+My+Fitness+4722+W+Vliet+St+Milwaukee+WI+53208
            "
            target="_blank"
            rel="noopener noreferrer"
            aria-label="
              Sport My Fitness on Google
            "
          >

            <span
              class="
                footer-social-icon
                google-icon
              "
            >

              <svg
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

            </span>


          </a>


        </div>


      </div>


      <!-- ====================================
           COPYRIGHT / LEGAL
      ===================================== -->


      <div
        class="
          container
          footer-bottom
        "
      >


        <p>

          ©

          <span id="year"></span>

          Sport My Fitness.
          All rights reserved.

        </p>


        <div class="footer-legal">


          <span>
            Terms of Use
          </span>


          <span aria-hidden="true">
            |
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

    headerTarget.innerHTML =
      headerMarkup;

  }


  if (footerTarget) {

    footerTarget.innerHTML =
      footerMarkup;

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
