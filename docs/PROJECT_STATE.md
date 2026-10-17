# Sport My Fitness — Current Project State

Updated October 17, 2026 (UTC); final browser run completed 2026-10-17T05:01:40.340Z.

## Current checkpoint

The current refinement removes the empty mobile hero bands, strengthens the dark
background treatment and removes the redundant landing-page training link group.

- Branch: `review/approved-glass-20261017`
- Verified runtime: `38445de6578ab0c9e22d05358e895fe0bca7e1af`
- Review preview: https://sport-my-fitness-6t7000gh4-routalk-builder.vercel.app
- Visual authority: PJ's approved board, exact original brand and later refinement requests.
- Production remains `main` at `c6b209895aa01b7d419fa445d4c31d39ef90b920`.
- Public site: https://sport-my-fitness.vercel.app/

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
Blender curves and form code are unchanged. Inner-page HTML changes only the CSS
cache key. Home changes that key and removes the requested section. Remaining
copy, credits, prices, destinations and contracts are intact.

## Research and evidence

[The comparison](design/background-comparison-20261017.md) records official
Equinox, Nike Training Club and Les Mills references, Carbon dark-surface guidance,
the root cause and the chosen treatment. This is an interpretation for the
existing Sport My Fitness brand, not a replacement brand or site architecture.

[Browser run 39004509768](https://github.com/pjmcveyroutalk/sport-my-fitness/actions/runs/39004509768)
passed: 70 layouts, 210 image checks, 28 navigation journeys, 14 motion runs,
21 safeguards, zero failures, Chromium 151.0.7922.34 and WebKit 26.5. All 30 mobile
inner-hero cases have 33px after the actual copy. Regression checks also enforce
removal of the Home link group and preservation of both Home hero actions.

Final renders of all seven mobile pages, WebKit Contact mobile, Programs desktop
and WebKit Home desktop were inspected. These checks establish review readiness;
PJ's visual approval remains pending.

- `verification/charcoal-depth-browser-results-20261017.json`: full current results.
- `verification/charcoal-depth-verification-20261017.json`: exact source hashes,
  unchanged asset tree, preview, artifact digest, spacing and visual review.
- CI artifact `12090711297`: final screenshots and motion recordings.

The preceding `uniform-hero-texture-*` reports capture the first uniform-hero pass
before the mobile-gap and background feedback. `reference-match-*` records the
Home composition correction; `approved-design-*` records the rejected first
visual implementation. Preserve these as history, not current acceptance.

## Next step

PJ reviews the preview above. If publishing is requested, recheck `main` and
release the reviewed branch through the existing GitHub/Vercel workflow.
No production promotion, merge, domain, environment or protection setting changed.

Keep the existing static HTML/CSS/JavaScript architecture. Historical handoffs and
studies cannot override PJ's board or later removal and refinement requests.
Repository CI is the working browser environment. Do not repeat successful
verification without a new change or finding.
