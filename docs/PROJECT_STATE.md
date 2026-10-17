# Sport My Fitness — Current Project State

Updated October 16, 2026 (America/Chicago); browser run completed 2026-10-17T04:11:57.425Z.

## Current checkpoint

The first implemented preview was rejected for failing to follow the approved
composition. Its passing technical checks did not establish visual acceptance.
That completion claim is superseded by this corrected review checkpoint.

- Branch: `review/approved-glass-20261017`
- Verified runtime: `ada5a43fd2e1e8c4adc313735001786f7e098524`
- Corrected review preview: https://sport-my-fitness-kxolu0xcn-routalk-builder.vercel.app
- Visual authority: `docs/design/approved-concept.webp`, supplied by PJ.
- Exact logo authority: the original source-ad crop in `assets/brand/`.
- Production remains `main` at `c6b209895aa01b7d419fa445d4c31d39ef90b920`.
- Public site: https://sport-my-fitness.vercel.app/

## Corrected design

Home now uses a continuous daytime waterfront scene with live type over the
photograph on desktop and mobile. It replaces the brush-edged, diagonal-striped
presentation that failed to match the board. The new responsive artwork is a
background edit from the original Home composition; original source assets remain
available. All six inner-page photo assignments remain unchanged.

Mobile uses an 88px header, the proportional original logo, plain Menu control,
smaller headline, tighter hero copy and training rows. Desktop uses the reference
header proportions and two equal hero action columns. The smoked-glass menu has
seven readable text destinations and sufficient opacity in Chromium and WebKit.

All redundant next-page panels and repeated footer navigation remain removed.
Useful contextual actions, exact substantive copy, rates, credits, links, form
contracts, original motion code and Blender curves remain unchanged. No generated
logo or generic fitness pictograms were introduced.

## Evidence

[Browser run 39001442859](https://github.com/pjmcveyroutalk/sport-my-fitness/actions/runs/39001442859)
passed on the exact runtime above: 70 layouts, 210 image checks, 28 navigation
journeys, 14 motion runs, 21 safeguards, zero failures, Chromium 151 and WebKit
26.5. New composition checks catch mobile image/text stacking, oversize/tall heroes,
missing waterfront behind actions, and desktop hero actions wrapping onto two rows.

Actual Home desktop/mobile screenshots were compared against the board. Both menu
views, the six inner mobile hero views and Home mobile motion frames were inspected.
These checks support review readiness; PJ's visual approval is still pending.

- `verification/reference-match-browser-results-20261017.json`: full browser results.
- `verification/reference-match-verification-20261017.json`: exact source hashes,
  preview, artifact identity, content contract and remaining limits.
- CI artifact `12089097293`: screenshots and motion recordings.

The earlier `approved-design-*` result files describe the rejected first visual
implementation and are historical. Original source-ad logo pixels are unchanged.
Local Chrome cannot run in this container; repository CI is the working browser
environment. Do not repeat successful verification without a new change or finding.

## Next step

PJ reviews the corrected preview above. If publishing is requested, recheck `main`
and release this reviewed branch through the existing GitHub/Vercel workflow.
No production promotion, merge, domain, environment or protection setting changed.

Keep this static HTML/CSS/JavaScript architecture. The October 11/12 cinematic
handoffs and old design studies are historical and cannot override PJ's supplied
board, exact source logo or duplicate-removal decision.
