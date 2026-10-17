# Sport My Fitness

Seven-page static website for Sport My Fitness and Coach Yoshi Barnes.

Start with [the current project state](docs/PROJECT_STATE.md). It resolves the older handoffs, identifies the verified source revisions, records the audit evidence, and gives the next task.

## Current work

Use the [current review preview](https://sport-my-fitness-naghhevku-routalk-builder.vercel.app) on `review/approved-glass-20261017`; existing Vercel sign-in protection remains.
Mobile inner heroes now end naturally after their copy, removing the large empty
bands. Layered charcoal, turquoise directional light, background planes and fine
grain add depth throughout the site. The redundant Home “Find your training” link
group is removed. The exact original logo, source photographs, original movement,
remaining copy, rates, credits and useful actions are preserved.

Contact now has one compact Google business map, a single directions link,
expandable published hours and verified parking information.

Runtime `3f39e6b` passes 70 Chromium/WebKit layouts, 210 image checks, four native
map checks, navigation, motion and map-failure safeguards. Native mobile/desktop
map renders and the Contact layout were inspected. See
[current project state](docs/PROJECT_STATE.md), [the reference comparison](docs/design/background-comparison-20261017.md)
and [current evidence](verification/studio-map-verification-20261017.json).
PJ's visual review is the next step. Production remains
[sport-my-fitness.vercel.app](https://sport-my-fitness.vercel.app/).
Earlier design reports are historical checkpoints, not current acceptance.

## Routes

Home (`index.html`), Training (`training.html`), Programs (`programs.html`), About (`yoshi.html`), Media (`media.html`), Contact (`contact.html`), and Community (`community.html`).

Keep the existing static HTML/CSS/JavaScript and GitHub/Vercel workflow. No framework or hosting migration is needed.

## Working locally

Serve the repository over HTTP, for example `python3 -m http.server 8000`. Motion fetches its data over HTTP; opening an HTML file directly is not a complete runtime check.

The existing API contract check is `node --test test/pilot-verify-production.test.js`. It covers the isolated production verifier, not visitor journeys or cinematic visual acceptance.

See [launch gates](LAUNCH.md), [the corrected cinematic brief](docs/CINEMATIC_BRIEF.md), and [asset/motion authoring](design-tools/README.md).

Older prototype documentation is historical. It does not override the current project state.

