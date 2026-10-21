# Sport My Fitness apparel assets

The October 21 floating design is integrated on **one** Apparel page, retaining
`noindex,nofollow` and the existing private-review entrance. See
`docs/APPAREL_FLOATING_20261021.md` for the current layout and release evidence.
Yoshi's actual product photos, descriptions, prices and options are pending.

## Floating sample garments

`placeholders/sample-{hoodie,tee,pants,jacket}-20261021.webp` are transparent,
unbranded illustrative cutouts generated with the built-in image-generation
tool to implement PJ's approved mockup. They are not actual SMF inventory.
Each image has a visible SAMPLE IMAGE label and placeholder alt text. All are
1254 × 1254, exported proportionally with their alpha preserved. Exact prompts
and export settings are in `placeholders/prompts-20261021.json`.

The four sample detail cards state that descriptions/options are pending and
pricing is by inquiry. They do not invent actual product facts. The approved
catalogue remains empty. Once actual approved entries exist, the browser replaces
both sample browsing and detail areas with those entries, on the same page.

## Official branding

The apparel header, menu and favicon use the exact approved JPEG master from
`Sport-My-Fitness-Smart-Brand-Kit-v1.1.zip`, retrieved at version 4:
`../brand/apparel-kit/brand-smart.jpg`, 1248 × 884.

SHA-256: `0349a132474c265497fad5d884fd89adcb32bdeeb6ba6ef26baba2e27cf79487`.

The asset was verified against the kit's `formats-checksums.json` and remains
byte-identical, including embedded metadata. It has not been redrawn, recolored,
cropped or converted. Scoped CSS preserves its original proportions. The
existing seven pages retain their previous branding assets and behavior.

## Campaign imagery

`campaign-source.png` is an illustrative AI campaign image created with the
built-in image-generation tool from the lighter Canva composition. A targeted
edit removes the inaccurate generated garment marks and leaves the sample
clothing plain. It does not represent real inventory or real customers.

The preserved hero photo has its original visible **PLACEHOLDER IMAGE** label,
placeholder alt description and AI-generated campaign credit. The former three
framed campaign cards have been replaced by the explicitly labeled floating
samples above; they were not imported as real inventory.

`campaign-960.webp`, `campaign-1600.webp` and `campaign-full.webp` are proportional
WebP exports, without cropping or retouching. HTML/CSS performs intentional
responsive crops. Live headings and controls are not baked into the image.

Initial prompt brief: a luminous, calm Milwaukee-style riverwalk campaign; a jogging
pair, a smaller background workout subject and two friends talking; charcoal
and turquoise sample apparel; natural photographic skin, fabric and anatomy;
softly unified backgrounds; quiet space for live page lettering; no website
chrome, headline, buttons, prices or other UI in the photograph. The image
generation request used the prior Canva composition and official logo as its
two visual references. No likeness of Yoshi or claim of real customers was
requested. Correction prompt: remove all garment emblems, swooshes and logos;
preserve the five people's identities, poses, clothing colors, fabric, scene,
composition and light; leave all clothing plain; no new text, symbols or objects.

Final use still requires PJ/Yoshi's imagery approval. Owner-supplied photographs
of the actual gear are the preferred replacement for a fully real campaign.

## Collection data

`catalog.json` still has no products because Yoshi's approved inventory,
photographs, sizes, colors and prices have not been received. Generated campaign
clothes and old mockup product names are not imported as inventory.

Add one item only after its name, photographs and availability are confirmed:

```json
{
  "id": "owner-confirmed-id",
  "name": "Exact owner-approved item name",
  "approved": false,
  "available": false,
  "category": "Owner-approved category",
  "description": "Owner-approved description, or omit",
  "photos": [
    {
      "src": "assets/apparel/products/owner-approved-front.webp",
      "alt": "An accurate description of the actual item photograph",
      "label": "Front"
    }
  ],
  "colors": [],
  "sizes": []
}
```

The two flags in this example intentionally default to false. Only items with
both flags true, a unique valid ID, a supplied name and a usable local photograph
enter the collection. The first photograph supplies the floating image; use an
approved transparent cutout to retain the design. Additional photo views appear
inside the same-page item card. Unknown options are marked To be confirmed. Optional pricing requires a numeric
`price` and `currency: "USD"`; unknown pricing becomes an inquiry, never zero.

The collection is display/inquiry only. It links to the existing contact page;
it has no payment, checkout, shipping, order or stock-management system.
