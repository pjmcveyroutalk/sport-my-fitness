# Apparel development checkpoint — October 20, 2026

Base checkpoint: `b14145df8434086b606c8557d0db854e4859c5f2`.
Original source: `review/approved-glass-apparel-20261020`, commit `0bfe6eef4cf071c3b378bc54b81e19e99a97ed45`.
Integrated release runtime: `b69fba08f45feed479330d72d064c0575a61af9a`, now on `main`.
Production: `dpl_E2mYuFVHC92ZcEQEz9ZoLYocGgQy`.
Review access: https://sportmyfitness.com/admin (existing login, then Apparel).

PJ requested applying the real branding and beginning the actual apparel
subpage, using the developed campaign and linking to the available apparel.
He then requested the official logo and explicit labels on every placeholder
picture. The apparel pages now use the byte-identical JPEG master from the
approved v1.1 kit, version 4, rather than the earlier website crop. The hero
and all three lookbook photos visibly read **PLACEHOLDER IMAGE**. Inaccurate
generated garment marks are removed; real apparel photographs remain pending.

## Implemented

- `apparel.html`: a lighter photographic lookbook with live SMF typography,
  the shared site header/menu/phone/theme controls and exact kit logo, a soft glass-card
  carousel and collection/inquiry links.
- `apparel-collection.html`: the linked collection, with an honest pending-data
  state and data-driven item grid, category filters, accessible item dialog,
  multiple photo views and an inquiry destination.
- `apparel.css`: styles scoped to the apparel pages; lighter campaign surfaces
  in both existing appearances and softer, translucent rounded cards.
- `apparel.js`, `apparel-catalog.js`: customer-controlled native scrolling,
  reduced-motion support, collection loading, confirmed-item selection and
  native-dialog details. The native scroll row and existing fallback menu
  remain usable without JavaScript.
- The seven existing pages receive one Apparel menu link. Their main content,
  footers, logo, shared design/appearance/motion scripts and source photographs
  retain the approved baseline.
- `assets/apparel/`: illustrative campaign source/optimized exports and an
  initially empty approved-products data file. See its README for provenance
  and the exact distinction between campaign concepts and real inventory.

## Release request and limits

PJ approved applying this reviewed version to the live website on October 20.
The release candidate preserves all four PLACEHOLDER IMAGE labels and the
pending collection state. The existing browser regression workflow also runs
focused apparel checks before production is updated. This publishes the apparel
addition to the full website; it does not launch the separate coming-soon site.

The pages retain noindex metadata while campaign photography and item data are
pending. DNS, Google setup, real inquiries, calls, messages and payments remain
outside this release. The checked integration is published on `main`; continue
from the latest `main` rather than restoring the original draft branch.

Before the finished apparel launch: receive Yoshi's actual apparel photos and item details; approve
the final campaign photography/garment branding; populate and verify the real
collection; run the actual browser checks and inspect affected renders; review
the draft indexing state and publication scope explicitly. Existing account
and access controls belong to the separate setup session.

## Verification

Focused catalogue tests cover approval/availability gates, photographs,
unknown-price handling, supplied details and duplicate IDs. The existing
production-verifier contract is also run as required by the repository.
Syntax, local links/asset paths, ARIA references and preservation of the
existing bodies/footer are checked separately.

Actual browser QA passed as run `39476577094` in Chromium and WebKit: 70 original
layouts plus 56 apparel layouts, the existing navigation/appearance/motion
checks, four focused apparel journeys and four JavaScript-disabled apparel
fallbacks. Desktop/mobile renders were inspected; all 16 final apparel captures
match the inspected candidate byte-for-byte. The carousel test now waits for
the customer-visible control update instead of racing its animation frame.

The catalogue helper is served as `apparel-catalog.js`, compatible with the
existing private gateway's extension allowlist. Page script cache keys were
updated accordingly. No gateway, domain or access-control change was made.
Authenticated live checks confirm 25 source files match the release; public
Coming soon and signed-out exclusion of both apparel pages remain intact.
Populated product filters/details still need their real-data browser check when
Yoshi's approved item photographs and information arrive. No real inquiry was sent.

The initial `verification/apparel-20261020.json` is historical source-only
evidence. Current acceptance and live verification are recorded in
`verification/apparel-integration-release-20261020.json`. The supplied standalone
HTML export is the reviewed reference; the website serves the actual editable
page files rather than that embedded review wrapper.
