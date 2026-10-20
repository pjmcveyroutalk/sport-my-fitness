# Apparel development checkpoint — October 20, 2026

Base: `b14145df8434086b606c8557d0db854e4859c5f2` from current GitHub `main`.
Isolated local branch: `work/smf-apparel-20261020`.

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
- `apparel.js`, `apparel-catalog.mjs`: customer-controlled native scrolling,
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
outside this release. Source preparation stays on an isolated review branch.

Before release: receive Yoshi's actual apparel photos and item details; approve
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

Actual browser QA is pending: this managed session has neither the advertised
control-browser skill nor an installed local browser, so a preview server or
browser installation is not improvised. The existing GitHub Actions Chromium/
WebKit workflow remains available after an authorized review-branch push.

See `verification/apparel-20261020.json` for the fresh source-check results and
their limitations. A self-contained review export, when provided, is derived
from these actual page files and is not the production deployment.
