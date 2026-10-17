# Sport My Fitness

Seven-page static website for Sport My Fitness and Coach Yoshi Barnes.

Start with [the current project state](docs/PROJECT_STATE.md). It resolves the older handoffs, identifies the verified source revisions, records the audit evidence, and gives the next task.

## Current work

The approved black/turquoise design with a restrained glass menu is implemented on `review/approved-glass-20261017`, based on the verified recovery commit. The original logo artwork and photographs are preserved. Redundant page-end panels and footer navigation are removed; contextual actions and original motion remain.

The verified [review preview](https://sport-my-fitness-378k0v1tj-routalk-builder.vercel.app) uses the project’s existing Vercel sign-in protection. Chrome/WebKit verification passes across all seven pages. See [the current project state](docs/PROJECT_STATE.md) for the October 16 decisions, evidence and release boundary. Production remains [sport-my-fitness.vercel.app](https://sport-my-fitness.vercel.app/) until release authorization.

## Routes

Home (`index.html`), Training (`training.html`), Programs (`programs.html`), About (`yoshi.html`), Media (`media.html`), Contact (`contact.html`), and Community (`community.html`).

Keep the existing static HTML/CSS/JavaScript and GitHub/Vercel workflow. No framework or hosting migration is needed.

## Working locally

Serve the repository over HTTP, for example `python3 -m http.server 8000`. Motion fetches its data over HTTP; opening an HTML file directly is not a complete runtime check.

The existing API contract check is `node --test test/pilot-verify-production.test.js`. It covers the isolated production verifier, not visitor journeys or cinematic visual acceptance.

See [launch gates](LAUNCH.md), [the corrected cinematic brief](docs/CINEMATIC_BRIEF.md), and [asset/motion authoring](design-tools/README.md).

Older prototype documentation is historical. It does not override the current project state.

