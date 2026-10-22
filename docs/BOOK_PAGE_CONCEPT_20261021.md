# Yoshi’s Book — page concept for PJ’s review

This is a **review concept**, based on main `7ff0d0c`, not an approved production
release. It gives the Book destination a dedicated introduction and cover area,
followed by a short About the book section. It uses the existing textured canvas,
lettering, exact logo, header, eight-link navigation, phone and appearance control.
The cover is explicitly a placeholder. No actual title, cover, description,
reading sample, format, price, release date, endorsement or sales claim is supplied.

The only working page action is **About the book**, which stays on this page.
**Digital edition · Coming soon** is a status, not a checkout. Return home remains
available. A later approved book title/description, cover and optional reading
sample replace the placeholders; payment and protected delivery stay in the
separate payment workstream. No manuscript is exposed here.

Only `yoshis-book.html` and new, page-scoped `yoshis-book.css` change the page.
Home, home buttons, all other pages, shared design/appearance/menu/motion,
curves, photographs, exact brand bytes, redirects, and Psalm 23 are untouched.
The Book placeholder did not run entrance motion; this concept also remains
static pending the actual book artwork and PJ’s direction.

`verification/book-page-concept.cjs` renders the concept and checks responsive
fit, placeholder honesty, themes, keyboard navigation, native menu fallback and
links. The review branch temporarily scopes the existing review workflow to this
page only. **Do not merge that temporary workflow change into production.**

PJ’s handoff requests a focused mockup and design decision before applying a
materially new book-page composition. Keep this concept on its review branch
until PJ has reviewed it. Main and production continue to serve the temporary
Book destination during review.
