# Sport My Fitness — Current Project State

Updated October 18, 2026 (UTC); approved design published, platform-mark correction in review.

## Current checkpoint

October 18 correction: restore the existing official Instagram, Facebook and
YouTube SVGs beside the three About links and Media's All videos link. The four
original assets are not redrawn or recolored. Compact light clear space keeps the
black Instagram glyph legible on the dark canvas; proportional image sizing
preserves each mark. TMJ4's existing official mark stays in place. All seven pages
use the new stylesheet cache key so returning visitors receive the correction.
The browser review now checks the four marks and their readable link names,
destinations, image proportions and mobile/desktop layout. Publication and results
will be recorded after that review completes.

Post-release correction, October 17: PJ identified the Contact page's final
“Sessions & packages” link as an unwanted exit to the old website. Contact now
opens `programs.html` in the same tab. The same obsolete booking URL on Programs
is replaced with one “Ask about a session” action to `contact.html#inquiry`;
the duplicate Help me choose action is consolidated into it. Package copy points
visitors to an inquiry rather than a separate booking page. These are link/copy
changes only; the form delivery service, layout, logo, images, map and movement
remain unchanged. This explicit correction supersedes the earlier instruction
to preserve the former booking URL.

This fix is published as `8e6f9dcc5036aac4ac4cb1f30a3073c138b8458b`
(successful Production deployment `7143573780`). Both public HTML files match
the corrected source. Live browser clicks followed Contact's packages link to
`programs.html`, then the session action to `contact.html#inquiry`, in the same
tab. No former-site links remain in HTML; the other 16 checked runtime files and
the form contract are unchanged. See `verification/booking-link-fix-20261017.json`
and the saved Contact screenshot for this focused post-release check.

The current refinement adds one clean Google business map, exact-place directions,
collapsible published hours and a short accessible-parking note to Contact. The
previous mobile spacing, background and landing-page cleanup remain intact.

- Production branch: `main`; review branch retained as `review/approved-glass-20261017`.
- Released commit: `cb0786118740c8b146978a1d6aac3304ac5245b2`.
- Verified runtime: `3f39e6b9a95b4abe7427cb4686bcad4212a425ec`
- Review preview: https://sport-my-fitness-naghhevku-routalk-builder.vercel.app
- Visual authority: PJ's approved board, exact original brand and later refinement requests.
- Previous production / rollback source: `c6b209895aa01b7d419fa445d4c31d39ef90b920`.
- Public site: https://sport-my-fitness.vercel.app/

PJ explicitly requested publishing the finished preview. The production release
uses the exact reviewed checkpoint tree, with no runtime edits during release.
The existing GitHub/Vercel integration deployed it successfully as Production
deployment `7142304892`. All 18 checked public runtime files and the root page
match their approved SHA-256 hashes; all four existing redirects resolve correctly.
Live browser checks followed all seven menu destinations, confirmed the correct
logo and shared design, checked the real Google business map and keyboard hours,
and observed Home's original entrance finish. Public desktop screenshots and the
release receipt are saved under `verification/public-release-20261017*`.

## Location refinement

The live Google Maps profile confirms 4722 W Vliet St, Milwaukee, WI 53208 and
414-791-4526. Both were already correct on the site. Google also lists weekly
hours and a wheelchair-accessible parking lot. Contact now replaces the old
address-only map link with the exact business's standard Google road-map embed,
one Get directions link, native collapsed Studio hours and the parking note.
The map is lazy-loaded and its original colors, controls and attribution remain
visible. No Maps SDK, API key, account setup or extra application JavaScript was
introduced. The address, hours and directions remain available when the map fails.

The listing's website field is blank. This is a follow-up for the final public
website after publishing. No Google profile edit, suggestion, review or message
was submitted. Restroom and rating information were checked but not repeated in
the website UI. Observed facts are saved in
`verification/google-business-listing-20261017.json`.

## Current design

All seven heroes retain the shared responsive type, title origin, buttons and
photo treatment. Mobile inner heroes now end with their actual content instead
of inheriting Home's minimum height. There is 32px of breathing room after the
copy; browser geometry reads 33px including the hero border. Programs previously
left about 237px after its supporting line at 390px. The next section now follows
naturally on all six inner pages. Desktop hero geometry remains unchanged.

The dark canvas now uses lighter layered charcoal, directional turquoise light,
broad angled background planes and the existing subtle grain. Content sections
and the footer share the finish. Angled planes stay behind the hero photography.
No new images, icons or animation were added.

The entire Home “Find your training” section and its three service links are
removed at PJ's request. The menu and useful hero actions remain. Service details
and rates remain on Training and Programs; repeated page-end panels and footer
navigation remain removed.

The original logo, every source photograph and texture, menu code, motion code,
Blender curves and form code are unchanged. For the location refinement, the six
other pages change only their CSS cache key; Contact additionally replaces its old
map link. Existing hero content, form fields, credits, prices and booking contract
remain intact.

## Current evidence

[Browser run 39047504190](https://github.com/pjmcveyroutalk/sport-my-fitness/actions/runs/39047504190)
passed: 70 layouts, 210 image checks, 28 navigation journeys, 14 original-motion
runs, four native Google map checks and 22 safeguards, with zero failures in
Chromium 151.0.7922.34 and WebKit 26.5. Map checks cover the exact place identity,
real native rendering, one directions action, keyboard-operated hours and lazy
loading. A blocked-map case confirms usable text, hours and directions.

Native map-component renders were inspected on mobile and desktop in both
engines, plus the full Contact desktop layout. The pin and street remain clear
in the compact map. Full-page captures can show a blank offscreen lazy Google
frame after scrolling to the hero; the native component captures record its
actual visible rendering. PJ subsequently authorized applying the finished preview
to the public site; the release checks above confirm its published source.

- `verification/studio-map-browser-results-20261017.json`: full current results.
- `verification/studio-map-verification-20261017.json`: exact source hashes,
  preview, artifact, source preservation, visual review and limits.
- `verification/google-business-listing-20261017.json`: primary listing observations.
- CI artifact `12105534538`: screenshots and motion recordings.
- `verification/public-release-20261017.json`: production identity, exact public
  source comparisons, live browser checks, screenshots and rollback baseline.

The first map test expected the painted business label as DOM text. Inspection of
Google's own live embed identified that test error; the corrected check retains
the exact place identity and waits for native attribution controls. No website
runtime code changed for that correction. The final complete run above is green.

The preceding charcoal-depth, uniform-hero-texture and reference-match reports
remain design history. The comparison in `docs/design/background-comparison-20261017.md`
still explains the background direction. The original rejected approved-design
reports are historical, not current acceptance.

## Next step

The finished preview is live. Continue from `main` and this release receipt for
future requests. No domain, environment, protection setting or Google profile was
changed. The blank Google listing website field remains a separate owner follow-up.

Keep the existing static HTML/CSS/JavaScript architecture. Historical handoffs and
studies cannot override PJ's board or later removal and refinement requests.
Repository CI is the working browser environment. Do not repeat successful
verification without a new change or finding.
