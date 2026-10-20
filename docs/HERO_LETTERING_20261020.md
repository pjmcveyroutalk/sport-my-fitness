# Shared hero lettering — October 20, 2026

## Approved outcome

PJ approved applying the refined hero-lettering mockup across the full website.
Large titles retain the existing condensed italic letterforms, words, sizes,
line breaks and white/turquoise or petrol/teal palette. A clean outline, tiny
highlight, shallow sidewall and tight shadow give restrained depth. A feathered
local contrast layer sits behind the opaque text.

The eight pages are Home, Apparel, Apparel Collection, Train with Yoshi,
Programs & Rates, Media, Community and Contact. Body headings and small copy
keep their existing treatment. The public Coming soon package is separate.

## Implementation and invariants

One stylesheet, `hero-lettering.css?v=20261020`, is loaded after the existing
page styles. Its selectors are restricted to hero H1 elements. The lettering
remains live, selectable semantic text, including when JavaScript is disabled.
Light canvases use a pale edge around the existing dark title faces. Apparel
keeps its approved lighter campaign in either theme. Forced-colors mode removes
the decorative effects so system text colors remain usable.

Titles stay inside their own scrolling hero, above photography, texture and
decorative layers. The existing header/menu/call/theme controls remain above
page content. Source credits and apparel placeholder notices keep their layers.
No font-size, line-height, margin, photo-size, transform, animation or timing
change is introduced. A background pseudo-element has no layout footprint and
cannot intercept pointer events.

All eight original HTML documents are byte-identical to the prior release after
removing the one added stylesheet link. Existing shared styles, JavaScript,
logo/photo assets, movement curves, page copy, form and navigation are unchanged.
The earlier Home face draft remains unapplied. Hosting, Google, DNS and account
setup remain in their separate workstream.

## Verification and release

Candidate: `d240c0836754cc748e29fd4fd26f93c89d944080`.
Base: `38c0b49c2c67bf1a9bfe2573e3d21990f90352a0`.
Browser run: `39502775703` — passed in Chromium 151.0.7922.34 and WebKit 26.5.
The 140 lettering cases, 60 main layouts, 56 apparel layouts, 24 navigation
journeys, 24 appearance journeys and 12 original-motion runs have zero failures.
All 60 main hero geometry/photo-dimension cases match the preceding release.
All eight pages were visually inspected at mobile/desktop sizes in both themes;
WebKit spot checks include an enlarged before/after lettering comparison.

The shared browser assertion checks all existing layout/appearance cases for
foreground hit testing even when decorative layers accept pointer events,
outline contrast of at least 3:1, edge clearance, visible header controls,
non-sticky placement and preservation of body headings. Dedicated hero renders
at 390px and 1334px support visual review. Existing layout, navigation, image,
light/dark persistence, motion, form fallback and apparel checks remain in place.

The six local contract tests and JavaScript syntax/diff checks pass. The exact
tested runtime is published on main; its new GitHub Vercel check reports a
completed deployment at 2026-10-20T21:56:20Z:
https://vercel.com/routalk-builder/sport-my-fitness/4kETgJ1ku1SCRS1bpkdvhTK8DPnS.
Seventeen authenticated live files match the release, including all eight HTML
pages, the queried new stylesheet, existing styles/motion and both logo masters.
The legacy About redirect and five public/privacy checks pass. Coming soon,
login and signed-out exclusion are preserved. The full evidence is in
`verification/hero-lettering-20261020.json`.

The Vercel connector could not read project/list metadata (404/403), and no
Vercel CLI is installed. Deployment confirmation therefore uses the fresh
GitHub Vercel status and authenticated live delivery; no protection or account
setting was changed. Browser evidence is from CI; live delivery checks are HTTP
byte comparisons rather than a claim of live-browser or physical-device tests.

Review entry: https://sportmyfitness.com/admin. Enter the existing password and
navigate within that tab. Standalone private-page links shared from chat can
return 404 because of the existing strict session cookie; do not change access
controls to work around it.
