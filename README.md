# Sport My Fitness

Seven-page static website for Sport My Fitness and Coach Yoshi Barnes.

Start with [the current project state](docs/PROJECT_STATE.md). It resolves the older handoffs, identifies the verified source revisions, records the audit evidence, and gives the next task.

## Current work

The corrected black/turquoise waterfront design is on `review/approved-glass-20261017`.
Use the [corrected review preview](https://sport-my-fitness-kxolu0xcn-routalk-builder.vercel.app); it retains existing Vercel sign-in protection.
Actual Home desktop/mobile renders were compared with [PJ's approved board](docs/design/approved-concept.webp).
The original logo, inner-page photographs, substantive content and motion remain intact.
Home uses a new full-bleed background edit with live overlaid text. Redundant page-end
panels and footer navigation remain removed.

The first implemented preview was rejected for visual mismatch; its earlier technical
passes are historical. The corrected runtime `ada5a43` passes Chromium/WebKit checks
and is ready for PJ's visual review. See [current project state](docs/PROJECT_STATE.md)
and [current evidence](verification/reference-match-verification-20261017.json).
Production remains [sport-my-fitness.vercel.app](https://sport-my-fitness.vercel.app/).

## Routes

Home (`index.html`), Training (`training.html`), Programs (`programs.html`), About (`yoshi.html`), Media (`media.html`), Contact (`contact.html`), and Community (`community.html`).

Keep the existing static HTML/CSS/JavaScript and GitHub/Vercel workflow. No framework or hosting migration is needed.

## Working locally

Serve the repository over HTTP, for example `python3 -m http.server 8000`. Motion fetches its data over HTTP; opening an HTML file directly is not a complete runtime check.

The existing API contract check is `node --test test/pilot-verify-production.test.js`. It covers the isolated production verifier, not visitor journeys or cinematic visual acceptance.

See [launch gates](LAUNCH.md), [the corrected cinematic brief](docs/CINEMATIC_BRIEF.md), and [asset/motion authoring](design-tools/README.md).

Older prototype documentation is historical. It does not override the current project state.

