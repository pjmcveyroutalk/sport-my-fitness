# Sport My Fitness apparel assets

This is the isolated October 20, 2026 apparel implementation. These pages are
development drafts with `noindex,nofollow`; they are not a product launch.

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

Every temporary photo on the page — the hero and each of the three lookbook
cards — has its own visible **PLACEHOLDER IMAGE** label and a placeholder alt
description. The hero credit also identifies the campaign as AI-generated.
The collection has no temporary product photos or mock inventory.

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

`catalog.json` starts with no products because Yoshi's approved inventory,
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
enter the collection. Photo views, category filters and specifications appear
only when the approved data supports them. Optional pricing requires a numeric
`price` and `currency: "USD"`; unknown pricing becomes an inquiry, never zero.

The collection is display/inquiry only. It links to the existing contact page;
it has no payment, checkout, shipping, order or stock-management system.
