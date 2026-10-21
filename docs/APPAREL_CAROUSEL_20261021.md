# Centered Apparel Carousel — October 21, 2026

PJ approved the mockup showing a cutout carousel above exactly one enlarged
product card. Picking a different garment replaces that card in the same place.
The earlier flat native scroll row and simultaneously displayed cards are retired
for JavaScript-enabled visitors.

## Visitor behavior

- The centered garment is largest; two smaller neighbouring cutouts remain
  visible without product tiles or image frames. The texture and appearance
  follow the existing Sport My Fitness design.
- Side arrows support desktop mouse input and cycle through the full collection.
  Arrow keys, Home/End and Enter/Space work from the carousel. Touch swipes cycle
  styles while vertical page scrolling remains available. There is no autoplay.
- Details initially remain closed. Clicking/tapping a garment opens its card
  directly beneath the carousel. Once a card is open, cycling updates it too.
  Old detail cards are removed from the page, not stacked or opened in a popup.
- Desktop places information beside the enlarged cutout. Phones put the image
  above its heading, price, colors, sizes and existing Ask Yoshi inquiry link.
- Product choices are accessible buttons. Additional approved photo views work
  within the selected card. No photo recoloring or unsupported variant facts are
  inferred from a color choice.
- Product fragments, reloads and browser history restore the selected item.
  Light/dark preferences and menu behavior continue to work.
- Without JavaScript, existing static anchors/details remain available. A failed
  catalogue fetch leaves the sample carousel operational and reports the failure.
  The old Collection URL still forwards to the same-page collection.

## Product information

Yoshi's actual photos, descriptions, prices, sizes and colors are pending.
The unbranded cutouts remain illustrative samples. Their controls are explicitly
labeled Color examples / Size examples and carry the owner-confirmation note;
price is marked coming soon. They do not claim inventory or available variants.

`assets/apparel/catalog.json` remains empty. Existing approval, availability and
photo-validation gates remain intact. When supplied, real approved entries
replace the samples in both carousel and card. They use only supplied options
and confirmed prices; missing real options are To be confirmed and unknown
prices are Ask Yoshi for pricing. No checkout, cart or order handling is added.

## Verification and release

`verification/apparel-browser.cjs` checks the actual browser flow, not a DOM-only
mock: centered geometry, visible mouse controls, product replacement, touch and
keyboard input, reflow/resizing, image containment, dark/light appearances,
approved-product fixtures, photos/options, history, deep links and fallbacks.
The test matrix covers widths 320 through 1920 including Chromebook-sized 1366.
Both Chromium and WebKit execute it. Exact fresh results and limits belong in
`verification/apparel-carousel-20261021.json`.

The review branch runs the existing CI browser setup with only the Apparel
journeys selected; that temporary workflow selection is excluded from main.
Release runtime must match the checked source hashes. Preserve All Deployments
Vercel Authentication on `sport-my-fitness`; the public holding project and DNS
are outside this change. Review through https://sportmyfitness.com/admin and
select Apparel in that same tab. Never submit a real inquiry while testing.
