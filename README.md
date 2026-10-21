# Sport My Fitness

Seven-page static website for Sport My Fitness and Coach Yoshi Barnes.

Start with [the current project state](docs/PROJECT_STATE.md). It resolves the older handoffs, identifies the verified source revisions, records the audit evidence, and gives the next task.

## Current work

The Apparel page now uses the approved **centered cutout carousel with one
selected product card beneath it**. Side arrows work with a mouse; keyboard and
touch input cycle styles. Selecting another item replaces the card in place.
Desktop details sit beside the enlarged cutout; mobile details stack below it.
There is no bottom counter/progress strip, popup or separate product page.

Clearly labeled sample garments and illustrative option controls remain until
Yoshi supplies actual photos, prices, descriptions and available sizes/colors.
Only owner-approved catalogue entries replace those samples. Unknown real
prices are inquiries, never zero. There is no checkout.

See [the implementation](docs/APPAREL_CAROUSEL_20261021.md),
[verification receipt](verification/apparel-carousel-20261021.json), and
[current project state](docs/PROJECT_STATE.md). The existing full-site project,
private review entrance and separate public Coming soon page are retained.
Review at https://sportmyfitness.com/admin, then choose Apparel in the same tab.

## Earlier design checkpoints

The finished design is live at [sport-my-fitness.vercel.app](https://sport-my-fitness.vercel.app/), released from `main` at `cb0786118740c8b146978a1d6aac3304ac5245b2` after PJ's explicit publishing request. The [review preview](https://sport-my-fitness-naghhevku-routalk-builder.vercel.app) remains a historical reference with its existing sign-in protection.
Mobile inner heroes now end naturally after their copy, removing the large empty
bands. Layered charcoal, turquoise directional light, background planes and fine
grain add depth throughout the site. The redundant Home “Find your training” link
group is removed. The exact original logo, source photographs, original movement,
remaining copy, rates, credits and useful actions are preserved.

Contact now has one compact Google business map, a single directions link,
expandable published hours and verified parking information.
Its “Sessions & packages” link opens the current Programs page, whose single
session-request action opens the existing inquiry form. Both stay on this site;
the former website's booking links were removed at PJ's request.

Runtime `3f39e6b` passes 70 Chromium/WebKit layouts, 210 image checks, four native
map checks, navigation, motion and map-failure safeguards. Native mobile/desktop
map renders and the Contact layout were inspected. See
[current project state](docs/PROJECT_STATE.md), [the reference comparison](docs/design/background-comparison-20261017.md)
and [current evidence](verification/studio-map-verification-20261017.json).
The original design release matched all 18 approved runtime hashes and the root page;
the subsequent booking-link correction changes only Contact and Programs HTML.
Live checks followed all seven menu destinations, rendered the Google business
map, operated Studio hours and observed the original Home entrance complete.
All four existing redirects also pass. See the
[public release receipt](verification/public-release-20261017.json) and its saved screenshots.
Earlier design reports are historical checkpoints, not current acceptance.

## Routes

Home (`index.html`), Apparel (`apparel.html`), Train with Yoshi (`training.html`), Programs (`programs.html`), Media (`media.html`), Community (`community.html`), and Contact (`contact.html`). The former About paths (`yoshi.html` and `/yoshi`) forward to Training. The former `apparel-collection.html` and `/apparel-collection` paths forward to `apparel.html#collection`; the static compatibility file also supports JavaScript-disabled visits.

Keep the existing static HTML/CSS/JavaScript and GitHub/Vercel workflow. No framework or hosting migration is needed.

## Working locally

Serve the repository over HTTP, for example `python3 -m http.server 8000`. Motion fetches its data over HTTP; opening an HTML file directly is not a complete runtime check.

The existing API contract check is `node --test test/pilot-verify-production.test.js`. It covers the isolated production verifier, not visitor journeys or cinematic visual acceptance.

See [launch gates](LAUNCH.md), [the corrected cinematic brief](docs/CINEMATIC_BRIEF.md), and [asset/motion authoring](design-tools/README.md).

Older prototype documentation is historical. It does not override the current project state.

