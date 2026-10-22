# Sport My Fitness — Current Project State

## Enlarged, centered Book mockup — October 21, 2026

**Review branch only.** PJ accepted the overall book layout and requested a
cleaner, more proportionate placeholder and removal of the entire bottom About
section. Revised concept `5ad3e11` centers the enlarged upright 3:4 cover on the main
page at desktop widths, keeping its subtle edge/spine,
quiet labels and a single introduction section. The removed About action is
absent; Return home sits beneath the edition status. The existing footer remains.

Run `39707625984` passes 24 layouts, four journeys and four native fallbacks in
both themes and Chromium/WebKit. Desktop/phone renders were inspected. See
`verification/book-page-concept-centered-20261021.json`. No production integration,
other page, shared movement, setup, branding or payments change is included.
Restore the full main review workflow before any future production integration.


## Book-page concept ready for PJ’s review — October 21, 2026

**Review branch only; not a production release.**
`review/approved-glass-book-concept-20261021` contains the focused book-page
concept, tested at `a1ccc0e`. The existing main and production still serve the
temporary Book message. The design adds a responsive cover/introduction and a
short About section using the current site style. Cover and book copy remain
explicit placeholders; there is no checkout, preview file or delivery flow.

All 24 concept layouts, four journeys and four native fallbacks pass in
Chromium/WebKit, with dark/light and six screen widths. Existing header/menu/
footer source is exact. Home, its buttons, photos, shared movement and all other
existing runtime files remain unchanged. See `docs/BOOK_PAGE_CONCEPT_20261021.md`
and `verification/book-page-concept-20261021.json`. Next is PJ’s composition
decision and actual book material. The branch has a temporary focused review
workflow; restore the main workflow before integration. Keep setup, branding
and payment workstreams separate.

## Homepage buttons and book link — October 21, 2026
## Book added to every side menu — October 21, 2026

**Published and live-verified:** Runtime `686e1b6537c0e11349c2507c06b13a52b775b6fa`, Production
`dpl_4jQ1vitywbepnQ6go3rGqMiZAHrV` (READY). **Yoshi’s Book** is now directly under Apparel
in the side menu on all eight full pages and opens `yoshis-book.html`, matching
the home button. The Book page marks that entry as current. The shared menu
controller, page content, photos, logo and button layout are unchanged.

Run `39701675498` passes 32 menu-to-book journeys and four native no-JavaScript
fallbacks in Chromium/WebKit at desktop and mobile widths, with zero failures.
Nine live HTML/controller comparisons, six signed-out privacy checks and the
legacy booking redirect pass. All Deployments protection remains enabled.
See `verification/book-menu-20261021.json`. The full book page is still the next
task; the current destination is the branded temporary Coming soon page.


**Published and live-verified:** Runtime `6724e2e6e079af150abc12739327a880f7dacf70`, Production
`dpl_AoVNPdcjHpjApUD9Q5nm6m5bnnmh` (READY). The homepage now has three equal buttons in one row
on desktop: Apparel, Explore training and Yoshi’s Book. Mobile keeps Apparel
across the first row, with equal Training and Book buttons side by side below.
Home-only responsive rules keep the actions within the first screen on shorter
laptops. The exact logo, running artwork, shared styles and original entrance
motion are preserved.

The Book button opens `yoshis-book.html`, a small branded Coming soon destination
with a return-home link and the existing menu/theme controls. It is noindex and
contains no invented title, cover, price, preview, stock or payment claim. The full
book page and protected digital purchasing/delivery are the next work item.
Legacy `book.html` and `/book` remain training-booking redirects to Contact;
do not reuse those addresses for the book storefront.

Accepted browser run `39700246775` passes 68 responsive layouts, including
24 short-screen cases, 12 navigation journeys, four no-JavaScript fallbacks and
four original-motion checks in Chromium/WebKit. Both appearances are checked;
phone, desktop and short Chromebook renders were inspected. Twelve actual live
HTML/asset comparisons, six signed-out privacy checks and the old booking
redirect pass. `/index.html` intentionally serves the public Coming soon page
when signed out; its content is checked, rather than incorrectly requiring 404.
The private book page and its new CSS remain excluded while signed out.

See `verification/home-actions-20261021.json`. Review through
https://sportmyfitness.com/admin and choose Home in that signed-in tab.
All Deployments protection, the public holding page, DNS, accounts and Google
settings remain intact. Physical-device testing is not claimed.


Updated October 21, 2026 (America/Chicago). The current Apparel implementation uses the approved centered carousel and a single replaceable card.

## Latest carousel motion correction — October 21, 2026

**Published and live-verified:** Runtime `1ecc57b8763e34b3a1857c02764dcb43cfbde2cd`,
Production `dpl_7zYB59fbbPXqbjMS8ox5eajhZva6` (READY). All 15 authenticated
HTML/asset comparisons match the tested source, including the new versioned CSS
and JS. Collection forwarding and all six signed-out privacy checks pass.
The existing full-site protection and public Coming soon page are preserved.
Refresh the Apparel page to load the new asset versions. The checkpoint after
this runtime changes documentation/evidence only.

PJ reported choppy desktop motion. The cause was removing side garments from
rendering during entry/exit. Rows now remain painted through a 460ms transform/
opacity animation. Rapid input continues from the composed frame; nearby images
are warmed before browsing. Reduced-motion mode stays immediate. Offstage items
are inert and excluded from assistive navigation. The approved design and single
replaceable product card are preserved.

The same runtime passes 44 responsive layouts plus the existing visitor/data/
fallback journeys in run `39651637738`. The dedicated motion comparison passes
all six Chromium/WebKit phone/desktop cases in run `39652430417` and reproduces
the old popping in six baseline cases. The initial motion harness mixed two
WebKit compositor times; the final test holds an exact interrupted frame.
No runtime change was made between those two checks. Frame timings are recorded,
not treated as physical-device FPS certification. CI now retains this regression.
See `verification/apparel-smoothness-20261021.json` for the current release status.

## Current Apparel carousel — October 21, 2026

**Published and live-verified:** Runtime `c9a061b5977aae2ba69fb229fec7fe230e14f59a`
is Production `dpl_561nQ4amD9Ji421aehxQVApYY6fC`, READY. All 15 authenticated
HTML/asset comparisons match the accepted source at the actual versioned CSS/JS
URLs. Legacy Collection forwarding and all six signed-out privacy checks pass.
All Deployments Vercel Authentication remains enabled; the public holding page
and existing login continue to work. No account, DNS, billing or access setting
was changed. The final checkpoint commit changes documentation/evidence only.

PJ approved the final three-panel mockup: carousel above; exactly one enlarged
product card below. A new selection replaces that card. Desktop has two-column
details; phones stack the cutout and information. The carousel has side arrows,
keyboard navigation and touch gestures; no bottom counter/progress strip.
Initially details stay closed until a garment is selected. Once open, cycling
also updates the card. History, deep links, appearance and menu remain supported.

This supersedes the native scrolling row and four simultaneously displayed
cards documented in the earlier checkpoints below. Samples now explicitly label
illustrative color/size controls; prices remain pending. Real approved data uses
only supplied options and prices. The exact logo, campaign hero, shared motion,
other pages, public Coming soon page and privacy configuration stay intact.

Verified in run `39644190729`: 44 responsive layouts, 44 lettering checks, six
selection/resizing journeys, six approved-product fixture checks, four fallbacks
and four motion checks; zero failures in Chromium/WebKit, dark/light, 320–1920px.
Desktop and mobile renders were inspected. Physical-device testing is not claimed.

Implementation: `docs/APPAREL_CAROUSEL_20261021.md`.
Fresh browser evidence: `verification/apparel-carousel-20261021.json`.
Review entrance: https://sportmyfitness.com/admin, then Apparel in the same tab.

## Latest Apparel cleanup — October 21, 2026

At PJ's request, the redundant hero **View apparel** button is removed. The
collection and full item cards already sit on this page. Only that button and
its unused CSS are removed; the existing browser journey now scrolls directly
to the collection. The CSS URL is versioned for this cleanup. Native garment
scrolling, item anchors, cards and all other controls stay unchanged. Focused
source and syntax checks cover this removal; the browser baseline below is
from the preceding design release, not a rerun for this change.

## Earlier floating-row release — October 21, 2026

**Published:** Runtime `46c3c326bf4c7f87e1461cd9e7df632fe250a899` is Production
`dpl_wF9Nnv9e8mSmuLiLxa2DyAH8i1tp` (READY). The complete floating design is live,
including PJ's latest removal of the counter, arrow buttons and progress bar.
Native swipe/trackpad/keyboard scrolling and same-page product detail links remain.
No empty space replaces the deleted controls. Headers, photos, exact logo,
original motion, product details and other pages are unchanged by that cleanup.

**Live verification:** All 15 checked HTML/assets match the release; CSS and JS
are checked at the actual versioned URLs used by the page. The former Collection
URL forwards to `apparel.html#collection`. Six signed-out checks preserve public
Coming soon, the existing login, and exclusion of private pages/product assets.
The full-site project's All Deployments Vercel Authentication remains enabled.
No access, billing, domain, Google, account or protection setting changed.

**Resolved connection issue:** Explicit `teamId`/`slug` arguments caused the
connector's project/deployment calls to fail. Using its default account scope
finds the same correct project and publishes successfully. For this connection,
omit those explicit selectors and verify returned account/project IDs before
writes: account `team_jC9jlJ9GZ9GSjrbYoD0pin3U`, project
`prj_gekwpLHnnGbcuGHOp47ieG9C93xJ` (`sport-my-fitness`). Browser fallback is not
needed. An older queued automatic build briefly overtook the manual deployment;
final live checks were made after current main became READY.

The preceding Chromium/WebKit baseline passes 36 Apparel layouts, four item
journeys, four data/photo fixtures and four JS/network fallbacks; the unchanged
main site passes 60 layouts, 24 navigation, 24 appearance and 12 motion runs.
All 24 design captures match the inspected runtime. The small control-strip
removal has focused syntax/source checks and live hash verification; the full
browser suite was not repeated. Exact evidence and limits are recorded in
`verification/apparel-floating-20261021.json`. Continue from latest main.

Review: https://sportmyfitness.com/admin, then choose Apparel in the same tab.

PJ approved the floating cutout carousel and inline product cards, then explicitly
requested applying it to the live site. `apparel.html` now contains both browsing
and full product details. Native item anchors scroll to each garment’s card;
Back to apparel returns to the row. The row has no product boxes, image fills or
prices. Dark/light appearances use the existing textured athletic canvas. Mobile
shows one large garment and the next item peeking in; desktop shows several.

Four clearly labeled, unbranded generated samples demonstrate the approved
layout while Yoshi prepares real photos, descriptions, prices and options.
`assets/apparel/catalog.json` remains empty. Sample details never assert a price,
available size/color, fabric, stock or delivery. Approved catalogue entries
replace both sample areas together when supplied; prices remain in full detail
cards and unknown prices become “Ask Yoshi for pricing”. No checkout is added.

The separate Collection UI/popup is retired. Its old URL forwards to the main
Apparel page, including a static JavaScript-disabled fallback. The exact kit
master, existing Apparel campaign hero (apart from the removed redundant button),
header/menu/call/theme controls, original motion and every other full-site page
remain unchanged. The public Coming soon project and access settings are separate.
See `docs/APPAREL_FLOATING_20261021.md` and the release receipt for fresh checks.

## Latest content refinement — college background, October 20, 2026

At PJ's request, Train with Yoshi now combines the former On the court and
Education articles under **Basketball & Education**. One chronological bullet
list holds San José State (2005–2008), Missouri Southern (2008–2010), and
Northcentral University (2015–2020). All three original school/date rows and
basketball achievements are retained verbatim. The duplicate chapter heading,
label and separating article/list boundary are removed. Source comparison
confirms the rest of Training is identical; no stylesheet, other page, photo,
logo, movement, hosting or access setting changes.

## Current checkpoint — shared hero lettering, October 20, 2026

PJ approved the refined outlined lettering and foreground visibility throughout
the full website. All eight active pages now load `hero-lettering.css?v=20261020`.
The live H1 text keeps its original words, font, sizes, line breaks, colors and
spacing; a clean outline, shallow depth and feathered local contrast add clarity.
Light mode and Apparel use a pale edge around their existing dark title faces.
The heading stays above hero photos/decorations inside its own scrolling section;
the header/menu/call controls, credits and placeholder notices remain usable.
Body headings, logos, photos, original motion and form/navigation code are unchanged.
The Home face draft remains unapplied. The public Coming soon package is separate.

Runtime `d240c0836754cc748e29fd4fd26f93c89d944080` is published; its GitHub Vercel
check reports completion at 2026-10-20T21:56:20Z, dashboard reference
`4kETgJ1ku1SCRS1bpkdvhTK8DPnS` in `routalk-builder/sport-my-fitness`.
Browser run `39502775703` passes 140 lettering cases, 60 main layouts, 56 apparel
layouts, 24 navigation and 24 appearance journeys, 12 original-motion runs and
existing map/form/fallback safeguards, with zero failures in Chromium/WebKit.
All 60 main hero geometry/photo-size cases match the preceding release. All eight
pages were visually reviewed in both themes at mobile/desktop sizes, plus WebKit
spot checks. Seventeen authenticated live files match the tested source; the
legacy About redirect and five public/privacy checks pass.

Use https://sportmyfitness.com/admin and navigate within that signed-in tab.
See `docs/HERO_LETTERING_20261020.md` and
`verification/hero-lettering-20261020.json` for exact scope, hashes, evidence and
live-check limits. No DNS, Google, billing, account or access-control setting changed.

## Current checkpoint — Train with Yoshi consolidation, October 20, 2026

PJ approved combining Training and About Yoshi. `training.html` now brings the
coaching introduction, qualifications, college/education bullets, teaching and
community work, photographs and client reviews into one ordered page. Its title
and menu label are **Train with Yoshi**. Programs & Rates remains separate. The
eight full pages share seven menu destinations; the separate About entry is gone.

All six distinct photos remain, once each, with their credits and responsive
proportions. The existing gym hero, logo, shared design/appearance, phone controls,
form, original motion code and curves stay intact. The Home face draft remains
unapplied. Only a local Training stylesheet supplies the merged page's spacing.
Old `/yoshi.html` and `/yoshi` paths forward to Training; the static compatibility
document also works without JavaScript. Current sitemap/title/description reflect
the page consolidation; hosting, protection and Google setup are unchanged.

Runtime `b318df8a8ed47849a52ff1ed6c5d9c968c58d2d3` is Production
`dpl_8eaTXjQFbYC8T7jnBtvM92oPgBYG`. Browser run `39492626727` passed 60 main-site
layouts, 56 apparel layouts, 24 navigation journeys, 24 appearance journeys,
12 original-motion runs, 10 combined-content checks and four legacy About
fallbacks in Chromium/WebKit, with zero failures. Desktop/mobile/light renders
were inspected. Thirteen authenticated live files match the source; the actual
former `yoshi.html` link returns a permanent redirect to Training. Four public
checks preserve Coming soon, the login page and exclusion of private content.

The additional `/yoshi` alias is configured in the full-site Vercel project; the
existing private gateway does not admit extensionless content paths. That alias
is not claimed as verified through the gateway. No gateway/access change is in
scope. Use `https://sportmyfitness.com/admin`, then Train with Yoshi in the menu.
Continue with `docs/TRAIN_WITH_YOSHI_20261020.md` and
`verification/training-consolidation-20261020.json`, not the older two-page map.

## Current checkpoint — face-only preview and flyer, October 20, 2026

PJ supplied Yoshi's authentic running photograph and clarified that **only her
face** needs correcting. A review-only asset is saved at
`assets/photos/review/smf-waterfront-face-review-20261020.webp`. It uses a narrowly
masked facial edit; decoded-pixel comparison confirms zero changes outside the
face. No Home asset reference, responsive image, sharing image, layout, logo or
motion changes yet. The likeness requires PJ/Yoshi's visual approval before
application. Do not replace the waterfront hero with the original track photo.

The supplied flyer adds weight loss, muscle building, cardio and core training
to the existing Personal training description on Programs. Existing rates,
phone/social details and Functional movement & rehab entry are retained.
The flyer’s ambiguous monthly-billing note and Cash App handle are recorded for
clarification, not turned into a new billing or payment flow. See
`docs/PHOTO_AND_FLYER_20261020.md` and
`verification/face-and-flyer-20261020.json` for scope and evidence.

Published runtime `a846f5a717fceef94643fd13c3706617180e5a42` is Production
`dpl_29UY66jNmXBprhsFqiWse7qjxHNg`. Seven authenticated live files match the
checked source, including Programs, unchanged Home, all three original hero
variants, the original logo and the unreferenced review asset. Three signed-out
checks retain public Coming soon and exclude Programs/the photo draft. The
preceding full browser baseline remains run `39476577094`; this single-sentence
copy change and unused draft asset did not repeat it. No Google, DNS, billing,
access controls, payment flow or runtime Home image changed.

## Current checkpoint — Home apparel entry, October 20, 2026

The Home hero's former “Let’s train” button now reads **Apparel** and opens
`apparel.html`. Every one of the nine page menus starts Home, Apparel, then
Training, Programs & Rates, About Yoshi, Media, Community and Contact. Current-page
markers are retained. The existing Home “Explore training” action remains.

Runtime `e4c471360c2e6bfdcf51e93e055e72d0911657a9` is published as Production
`dpl_BKYfFEZ7qDxCnXcN78bByCm6Wi92`. Focused source checks verified the order and
links on all nine pages and exact preservation outside those requested markup
changes; the existing browser guard now expects the new Home destination.
Authenticated live checks confirm all nine HTML files match the release.
Public Coming soon and signed-out exclusion of the apparel pages still pass.
No shared styles, logo/photo assets, appearance/motion or form code changed.
The broad browser suite was not repeated for this link/label/order-only change;
its preceding green baseline remains the apparel release below. See
`verification/apparel-entry-release-20261020.json` for current focused evidence.

## Apparel release — October 20, 2026

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
