# Sport My Fitness

Seven-page static website for Sport My Fitness and Coach Yoshi Barnes.

Start with [the current project state](docs/PROJECT_STATE.md). It resolves the older handoffs, identifies the verified source revisions, records the audit evidence, and gives the next task.

## Current work

The approved target is the cinematic redesign, using the four supplied references. The existing seven-page content, authentic photographic subjects, destinations, and form behavior remain protected.

The technical starting point is `review/motion-photo-polish-20261011` at `03a1796faeadd8aa49ae221d2e5e81cc2196c638`. It is reusable motion/photo work in the older composition, not a completed cinematic redesign.

Production is [sport-my-fitness.vercel.app](https://sport-my-fitness.vercel.app/) at `c6b209895aa01b7d419fa445d4c31d39ef90b920`, verified October 16, 2026.

## Routes

Home (`index.html`), Training (`training.html`), Programs (`programs.html`), About (`yoshi.html`), Media (`media.html`), Contact (`contact.html`), and Community (`community.html`).

Keep the existing static HTML/CSS/JavaScript and GitHub/Vercel workflow. No framework or hosting migration is needed.

## Working locally

Serve the repository over HTTP, for example `python3 -m http.server 8000`. Motion fetches its data over HTTP; opening an HTML file directly is not a complete runtime check.

The existing API contract check is `node --test test/pilot-verify-production.test.js`. It covers the isolated production verifier, not visitor journeys or cinematic visual acceptance.

See [launch gates](LAUNCH.md), [the corrected cinematic brief](docs/CINEMATIC_BRIEF.md), and [asset/motion authoring](design-tools/README.md).

Older prototype documentation is historical. It does not override the current project state.

