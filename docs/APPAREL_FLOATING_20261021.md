# Floating Apparel — October 21, 2026

PJ approved the two mockups and explicitly requested applying the design to the
live review site. The agreed flow is one Apparel page: swipe/scroll isolated
clothing, select an item, scroll to its full detail card, continue browsing the
same collection. There is no separate product page or modal.

## Current publication checkpoint

The source is implemented and verified on main (`df34ef40a5ba0201a0e4463b057c41ff5b01862e`),
but **the live site still serves the previous design**. Production publishing
through the connected Vercel app fails with HTTP 403 (no permission to create a
Production Deployment for this project). GitHub updates succeeded, but there is
no Vercel status for the new source and live source hashes do not match yet.
No access, hosting, billing, account or DNS setting was changed.

Main-site browser checks pass run `39627916870`; the remaining Apparel checks
pass focused run `39629389215`. All 36 Apparel layouts, four customer journeys,
four data/photo fixtures and four JS/network fallbacks pass. The focused review
branch changes only its workflow command, which is deliberately absent from
main. All 24 captures are byte-identical to the inspected runtime. Current main
only refreshes the HTML asset-version queries beyond the tested candidate.

Resume by deploying **current main** to the existing full-site project using
authorized Vercel access, then rerun live hash/redirect/privacy checks. Preserve
the separate Coming soon project and private-review controls. The existing
browser-tool fallback rule requires approval before switching from the blocked
connector to dashboard interaction. Full details are saved in
`verification/apparel-floating-20261021.json`; passing browser checks need not
be repeated unless runtime changes.

## Scope and behavior

- `apparel.html` contains the borderless floating rail and four sample detail
  cards, each once. The former Collection UI is a compatibility forward.
- Garments have true alpha backgrounds, restrained silhouette shadows, no
  rectangular frames/fills, and proportional `object-fit: contain` sizing.
- The collection uses the existing textured dark/light site canvas. Mobile
  displays a large garment and a peek of the next; desktop displays several.
- The native row supports touch, trackpad, Tab focus, previous/next controls and
  focused-row Arrow/Home/End keys. There is no autoplay or scroll hijacking.
- Ordinary item fragments keep navigation on `apparel.html`. Full cards include
  the photograph(s), description, confirmed price/options and inquiry action.
  Other cards remain present. Back to apparel and browser history work normally.
- Original site motion and reduced-motion behavior remain. The exact kit JPEG,
  original campaign photo/hero geometry, menu, phone and appearance controls are
  retained; only the hero’s View apparel target changes to `#collection`.
- All other pages, shared styles/scripts, logos, photographs and form handling
  are unchanged. No Google, DNS, billing, protection or account setting changes.

## Pending owner information

Yoshi is supplying actual garment photos, names, descriptions, prices, sizes,
colors and availability. Four explicitly labeled unbranded samples show the
layout meanwhile. They are illustrative, **not actual SMF stock**. The real
`assets/apparel/catalog.json` still has no products. No invented dollar prices,
stock, materials or availability appear. Unknown pricing remains **Ask Yoshi
for pricing**, and unknown sizes/colors remain **To be confirmed**.

Use the existing approved-products schema in `assets/apparel/README.md`.
Approved, available entries with valid local photographs replace both sample
areas together. No sample garments are mixed with real products. The first
photo supplies the floating image; provide a clean transparent cutout for it.
Additional photos appear as named thumbnail controls inside that item’s card.
The first approved update should be visually reviewed with the actual assets.
The catalogue and main page retain noindex while launch work is pending.

The existing inquiry destination is `contact.html#inquiry`. This change adds no
cart, checkout, payment, shipping, order handling or automatic messages.

## Assets and provenance

The built-in image-generation tool produced four garment cutouts from the
approved floating mockup as a design reference. They have no logos or people.
The original tool alpha is preserved in proportional WebP exports (quality 90,
alpha quality 100), without cropping, recoloring or retouching:

- `assets/apparel/placeholders/sample-hoodie-20261021.webp`
- `assets/apparel/placeholders/sample-tee-20261021.webp`
- `assets/apparel/placeholders/sample-pants-20261021.webp`
- `assets/apparel/placeholders/sample-jacket-20261021.webp`

All are 1254 × 1254. Exact prompts are saved in
`assets/apparel/placeholders/prompts-20261021.json`. The approved kit master
remains SHA-256 `0349a132474c265497fad5d884fd89adcb32bdeeb6ba6ef26baba2e27cf79487`.

## Verification and release

Run `node --test test/pilot-verify-production.test.js test/apparel-catalog.test.mjs`
and JavaScript syntax/source checks. The repository’s existing approved-design
workflow verifies the unchanged main site plus the updated Apparel journey in
Chromium and WebKit, including 320–1920px layouts in both themes, foreground hero
lettering, native carousel/keyboard interaction, same-page fragments/history,
header clearance, approval/availability and unknown-price behavior, multiple
photo views, direct product fragments, network/JavaScript fallbacks and legacy
Collection forwarding. Approved-item browser fixtures never enter live data.
Inspect desktop/mobile row and detail captures before promoting the exact
checked runtime to `main`. Record the actual workflow/production status and
live hashes in `verification/apparel-floating-20261021.json` after verification.

Review entrance: https://sportmyfitness.com/admin, then choose Apparel from the
menu in that same signed-in tab. Public `/` remains the separate Coming soon
site, and signed-out private routes remain excluded. Never weaken access for QA.
