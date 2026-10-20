# Sport My Fitness — Current Project State

Updated October 20, 2026 (UTC); apparel integrated and verified through the existing private-review access.

## Current checkpoint — apparel release, October 20, 2026

PJ brought the approved apparel review into this main website session and asked
to continue integration. Runtime `b69fba08f45feed479330d72d064c0575a61af9a` is
published as Production `dpl_E2mYuFVHC92ZcEQEz9ZoLYocGgQy`. The Apparel menu entry
now opens `apparel.html`, with the linked `apparel-collection.html` beneath it:
eight menu destinations and nine website pages. Continue from current `main`;
the original isolated apparel draft is development history.

The new pages retain the reviewed lighter campaign, exact v1.1 kit JPEG logo,
rounded glass carousel, phone/menu controls and saved light/dark switch. Every
temporary photo has its own **PLACEHOLDER IMAGE** label. Actual apparel photos
and approved item data are pending; the collection remains empty and noindex.
The seven original main/footer bodies, original logo and photographs, shared
design/appearance/menu/motion/form code, redirects and search files are unchanged.
Each original menu receives exactly one Apparel link.

Browser run `39476577094` passed in Chromium/WebKit: 70 original-site layouts,
56 apparel layouts, 28 existing navigation journeys, four apparel journeys,
four apparel JavaScript-disabled fallbacks, 28 appearance journeys and all
14 original-motion runs, with zero failures. All 16 final apparel screenshots
are byte-identical to the visually inspected renders. A carousel assertion was
corrected to wait for its queued control update. The catalogue browser module
uses `.js` because the existing private gateway rejects root `.mjs` paths; no
gateway or access-control change was needed.

Live authenticated HTTP checks through `https://sportmyfitness.com/admin` confirm
all 25 checked HTML/assets match the tested source after removing the gateway's
existing Admin control. Signed-out `/` still shows Coming soon; the two private
apparel URLs correctly return 404. No DNS, protection, Google, form delivery or
payment settings changed. See `verification/apparel-integration-release-20261020.json`
and `docs/APPAREL_DEVELOPMENT_20261020.md` for evidence and remaining inputs.

## Appearance checkpoint — October 19, 2026

This is the main website content/design workstream. Domain, hosting, DNS,
access controls and account setup are handled in the separate setup session.

All seven pages now have a light/dark appearance switch. Dark remains the
first-visit default; the selected mode is applied before page styles and saved
across navigation and reloads. Desktop uses a compact Light/Dark header control;
mobile uses a 44px sun/moon control beside the existing call and menu actions.
Light changes the canvas, text, borders and overlay colors, with readable
keyboard focus. The original header fade keeps the hero photographs visible.

Runtime `a68688581ee00897b436553284d73f2784822637` passed browser run
`39331578380`: 70 layouts, 28 appearance journeys, 77 header checks, 28 navigation
journeys, 14 motion runs and 24 safeguards, with zero failures in Chromium and
WebKit. All 70 dark layouts and photo dimensions match the approved desktop-call
baseline exactly; the original motion results also match. Theme changes preserve
page content, geometry and entered form values. Storage and script-failure
fallbacks passed, and final desktop/mobile renders were inspected.

Original page bodies, logo/photo assets, core stylesheet, form handling and
motion sources are unchanged. See `verification/appearance-20261019.json` for
hashes, evidence and the visual correction made before release.

### Desktop Call control

The existing call link now appears directly beneath Menu in the desktop left
rail: a small turquoise outline handset, compact Call label, subtle hover
highlight and “Call Yoshi” tooltip. It uses `tel:+14147914526`; mobile retains
its existing icon-only header placement. The shared control is consistent on
all seven pages, with no duplicated header call links.

Runtime `3af1038b9e586f8208b9fdbfb7aeef932014c3ea` passed browser run
`39328493582`: 70 layouts, 77 header checks, 28 navigation journeys, 14 original
motion runs and 22 safeguards with zero failures in Chromium and WebKit.
Desktop and mobile Home renders were inspected. All page bodies, logo assets,
photos, existing copy and motion remain unchanged. Light-mode concepts remain
preview-only. See `verification/desktop-call-20261019.json`.

### Earlier biography organization

About now groups colleges and dates into native bullets with each achievement
under the relevant school and Northcentral under Education. Showing up uses the
same bullet treatment, divided into Teaching & contract work and School
involvement. MATC and St. Joan Antida each show their stated role; American
Indian School keeps its September 2026 context; the three other schools each
have their own bullet. All existing facts are retained without extra claims.

Runtime `0f9384278741a867cca44a184a3c0a21bd9258de` passed browser run
`39319411960`: 70 layouts, 28 navigation journeys, 14 motion runs and 22
safeguards with zero failures. About mobile/desktop screenshots were inspected.
Only the Showing up article changes in this follow-up; all other About markup,
stylesheets, page bodies, photos, branding, navigation and motion are preserved.
See `verification/showing-up-20261019.json` for the evidence and live-check limit.
The earlier college layout is recorded in `verification/story-lists-20261019.json`;
primary athletics sources remain in `docs/ON_THE_COURT_SOURCES_20261019.md`.

October 19 client-content update is on
`review/approved-glass-yoshi-content-20261019`. Yoshi supplied corrected San José
State (2005–2008), Missouri Southern (2008–2010) and Northcentral University
(2015–2020) dates, plus her MATC instructor role teaching Health and Wellness and
Mental Health Performance, and contract work with St. Joan Antida. These facts
are published on About as runtime `7f659fb9c149520b7eb46209fb8349fca6a530e2`,
Production `dpl_5Bv3FdLh2Uen7qV6k3NGZkwZXRD2`. Browser run `39308633855`
passed 70 layouts, 28 navigation journeys, 14 original-motion runs and 22
safeguards in Chromium/WebKit with zero failures. About mobile/desktop renders
were inspected, and live HTML, stylesheet and logo match their checked bytes.
See `verification/yoshi-content-release-20261019.json` and
`docs/CLIENT_CHANGES_20261019.md` for the exact request mapping and remaining
main-photo replacement, apparel, classroom photos and upcoming event details.
Domain/hosting setup is a separate session; no setup or access settings change
with this copy update. The setup session should integrate this released content
before launch without restoring old dates or importing prelaunch noindex into
the currently public website.

October 18 desktop spacing correction is published as runtime
`757d3b527652ebce6dd265254945a4a34fde237f`, Production deployment `7158513074`.
PJ's Chromebook screenshot identified the 544px gap between About's heading and
social links at 1363px, caused by space-between alignment. Above 800px, all three
links now form one equal-width row directly beneath the heading, with 24px of
separation, a 900px maximum row width and tighter section padding. Mobile keeps
its original stacked layout and 32px heading gap.

Browser run `39151874295` passed 70 page layouts, 16 focused social-spacing checks,
28 navigation journeys, 250 image checks and 14 original-motion runs in Chromium
and WebKit with zero failures. Visual review includes 1366px, the 801px boundary
and 390px mobile. Public browser geometry confirms the row, shared left edge and
24px gap; all eight checked public files match the release. All seven page bodies,
platform SVGs, logo, photos, header, copy and motion remain unchanged. See
`verification/about-spacing-release-20261018.json` and the saved public screenshot.

October 18 header release: PJ chose to keep the existing full-logo version shown
in the accepted review and apply the phone/menu changes now. A separate symbol
and horizontal wordmark are optional future refinements, not release blockers.
The exact reviewed runtime is published at
`https://sport-my-fitness.vercel.app/` as commit
`63f3e5d20a0bb5b905de37ee707cd23e3251d2f1`, Production deployment `7150386635`.

All seven mobile headers now have one direct call action for 414-791-4526 and a
separate hamburger with 44px touch targets. The visible Menu word is removed on
mobile; its accessible name and the native menu fallback remain. Desktop
presentation, approved logo bytes, page content, photos and movement are preserved.
Browser run `39099546911` passed 70 layouts, 49 mobile-header checks, 28 menu
journeys and 14 original-motion runs. The released runtime is byte-identical to
that tested candidate; the later commits add documentation/evidence only.
All 13 checked public files match the release and every page has the correct
phone URI and refreshed stylesheet. Live browser inspection confirms the logo,
phone link and active stylesheet. See
`verification/mobile-header-release-20261018.json`; the prior review receipt is
historical and its symbol-only dependency is closed by PJ's latest decision.

October 18 correction: the existing official Instagram, Facebook and YouTube SVGs
are restored beside the three About links and Media's All videos link. The source
assets are not redrawn or recolored. Compact light clear space keeps the
black Instagram glyph legible on the dark canvas; proportional image sizing
preserves each mark. TMJ4's existing official mark stays in place. All seven pages
use the new stylesheet cache key so returning visitors receive the correction.
Published runtime `28b959b4ef8fc945504b81e0a1353f7f5a490877` deployed successfully
as Production `7149159062`. Browser run `39091843112` passed 70 layouts, 250 image
checks, 40 platform-link checks, 28 navigation journeys and 14 original-motion
runs in Chromium and WebKit with zero failures. About and Media mark components
were visually inspected at mobile and desktop sizes. Live public browser checks
confirm the four marks load, and all 15 checked public source files match the
released bytes without SEO-preparation metadata leaking into production.
See `verification/platform-marks-20261018.json` and its saved public screenshot.

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
