# Yoshi’s Book — revised page concept for PJ’s review

This is a **review concept**, based on main `7ff0d0c`, not a production release.
PJ accepted the overall layout and requested a cleaner, more proportionate cover
placeholder plus removal of the entire lower About section. The current concept
has a single introduction/cover section and the existing site footer.

The cover is upright with a 3:4 ratio, a fine solid edge, subtle spine and shadow,
and quiet placeholder labels. The previous dashed edge, tilt and oversized
Coming soon lettering are removed. The cover is brought inward toward the text and enlarged: 328px maximum on
large screens and 240px on phones, where it stays centered. The removed About section leaves no gap or dead anchor;
Return home is available beneath the digital-edition status in the introduction.

The existing textured canvas, semantic heading/lettering, exact logo, header,
eight-link navigation, phone, appearance control and footer are retained.
Actual book title, cover, description, reading sample, format, price, release
date and endorsements remain pending. The page contains no sales claim,
checkout, payment handling, public manuscript or digital fulfillment.

Only `yoshis-book.html` and page-scoped `yoshis-book.css` change the page.
Home, home buttons, all other pages, shared design/appearance/menu/motion,
curves, photographs, exact brand bytes, redirects, and Psalm 23 are untouched.
The Book placeholder did not run entrance motion; this concept remains static.

`verification/book-page-concept.cjs` renders the concept and checks responsive
fit, the cover ratio, absent lower section/dead anchor, themes, keyboard return,
menu and native fallback. The review branch temporarily scopes the existing
review workflow to this page. **Restore the unchanged main workflow before
production integration.** Keep setup, branding and payments in their separate
workstreams. This revision is for PJ’s requested new mockup, not publication.

## Current enlarged and centered mockup

At PJ’s request, the cover is enlarged and brought inward toward the text. The
current render is `d2eaed8`. Run `39706952267` passes all 24 layouts, four journeys
and four native fallbacks. Measured comparison confirms a larger cover in every
layout, movement inward on larger screens, and unchanged phone centering. At
1366px the book is 328px wide and its center moves from x=1066 to x=1000. Desktop
and phone dark renders were inspected. See
`verification/book-page-concept-centered-20261021.json` and artifact `12395448153`.
This remains a review mockup; main and production are unchanged.

## Earlier simplified mockup evidence

Run `39706280580` succeeds on `f4103d6`: 24 layouts, four focused journeys and
four native fallbacks, zero failures in Chromium/WebKit at six widths and both
themes. The cover ratio and absence of the lower section/dead action are checked.
Desktop and phone dark renders were inspected. Evidence artifact: `12394643159`;
receipt: `verification/book-page-concept-clean-20261021.json`. The revised mockup
has not been applied to production.

## Earlier first-concept evidence

Run `39704221233` succeeds on concept commit `a1ccc0e`: 24 layouts at six widths
(320–1920px), dark/light, Chromium 151 and WebKit 26.5; four focused navigation
journeys and four native fallbacks; zero failures. Six existing contract tests
and the workflow syntax checks also pass. Desktop dark/light and phone dark
images were inspected. No physical-device test or broad motion rerun is claimed.

See `verification/book-page-concept-20261021.json`. The reviewed render files
are in artifact `12394401307` under run `39704221233` (30-day retention); the
concept is reproducible from this branch after artifact expiration. Main remains
`7ff0d0c`; no new composition is applied to production.
