# Sport My Fitness

Seven-page static website for Sport My Fitness and Coach Yoshi Barnes.

Start with [the current project state](docs/PROJECT_STATE.md). It resolves the older handoffs, identifies the verified source revisions, records the audit evidence, and gives the next task.

## Current work

The current seven-page hero and texture refinement is on `review/approved-glass-20261017`.
Use the [updated review preview](https://sport-my-fitness-3foglprnk-routalk-builder.vercel.app); it retains existing Vercel sign-in protection.
All seven heroes share a responsive type scale, title alignment, canvas height and
photo treatment. Charcoal grain, fine weave and subtle turquoise depth continue
through the page backgrounds. The exact original logo, source photographs,
substantive content and original motion remain intact. Repeated page-end panels
and footer navigation remain removed.

Runtime `7f39769` passes 70 Chromium/WebKit layouts plus image, navigation, motion
and safeguard checks. Desktop/mobile renders of all seven heroes were inspected.
It is ready for PJ's visual review. See [current project state](docs/PROJECT_STATE.md)
and [current evidence](verification/uniform-hero-texture-verification-20261017.json).
Earlier reference-match reports record the preceding Home composition correction;
earlier approved-design reports record the rejected first visual implementation.
Production remains [sport-my-fitness.vercel.app](https://sport-my-fitness.vercel.app/).

## Routes

Home (`index.html`), Training (`training.html`), Programs (`programs.html`), About (`yoshi.html`), Media (`media.html`), Contact (`contact.html`), and Community (`community.html`).

Keep the existing static HTML/CSS/JavaScript and GitHub/Vercel workflow. No framework or hosting migration is needed.

## Working locally

Serve the repository over HTTP, for example `python3 -m http.server 8000`. Motion fetches its data over HTTP; opening an HTML file directly is not a complete runtime check.

The existing API contract check is `node --test test/pilot-verify-production.test.js`. It covers the isolated production verifier, not visitor journeys or cinematic visual acceptance.

See [launch gates](LAUNCH.md), [the corrected cinematic brief](docs/CINEMATIC_BRIEF.md), and [asset/motion authoring](design-tools/README.md).

Older prototype documentation is historical. It does not override the current project state.

