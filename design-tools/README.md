> Historical reference for the October 11 motion/photo candidate. Start at [docs/PROJECT_STATE.md](../docs/PROJECT_STATE.md) for the cinematic design and current Home sequence. The older composition preserved below is not the current visual specification.

# Sport My Fitness motion and photography

This pass keeps the existing seven-page composition, wording, links, photographs,
teal lettering and button finish. It changes entrance/reveal motion and the delivery
of conservatively corrected photos.

## Motion source

`sport-my-fitness-motion.blend` contains five normalized progress F-curves authored
in Blender 5.0.1: headline, photo, support, band and reveal. The curves are sampled
at 60 fps. `site-motion.js` applies them to live DOM elements using Web Animations,
preserving the original type and photo masks. This is Blender-authored motion,
not a video render or a new 3D scene.

Re-export from the repository root with Blender 5.0 or later:

```sh
blender --background --factory-startup --python design-tools/author-motion.py -- /tmp/smf-motion-export
cp /tmp/smf-motion-export/smf-motion-curves.json assets/smf-motion-curves.json
```

The live controller respects reduced motion, interrupts the entrance on input,
skips deep-link and history entrances, and shows all content if loading fails.
Scroll reveals run once. Header positioning and native navigation are unchanged.
The former home/page intro scripts and original render remain available for rollback
but are no longer loaded by the seven pages.

## Photo source

All original image files remain intact. `photo-inventory.json` names the 13 sources;
`photo-enhancement-report.json` records source SHA-256, dimensions and delivery sizes.
Corrections use luminance-only sharpening and a slight shadow lift, bounded to
five 8-bit intensity levels before encoding. No generative tools, face processing,
object removal, scene replacement or new crops are used. Grayscale stays grayscale.
Native image alpha and the shared brush mask are preserved losslessly.

With Python, Pillow and NumPy installed, regenerate the WebP derivatives with:

```sh
python3 design-tools/enhance-photos.py
```

Derivative byte sizes can differ slightly between WebP encoder versions. The
original dimensions and the CSS aspect ratio keep layout identical across the
480/800/1200/native-width sources. The transparent white brush-mask asset has the
exact alpha channel of the approved gym artwork and avoids downloading its RGB
photograph for masking.

## Review

Browser verification compares the resting layout, words and actions with release
`c6b209895aa01b7d419fa445d4c31d39ef90b920`. Reports in `verification/` record the
responsive and fallback checks. No valid contact inquiry was submitted.

# Search metadata preparation

`prepare-search.py` reads `seo/site-identity.json` and `seo/page-metadata.json`
and renders static metadata and JSON-LD into the seven existing pages. It never
changes a page body, publishes a site, submits a form or contacts Google.

The preparation branch defaults to `noindex,follow` with the planned official
domain. `python3 design-tools/prepare-search.py` checks generated files without
writing them; `--apply` updates local files. Focused checks run with
`python3 verification/seo-aeo-check.py` (Pillow is used only by the image-size check).

The later `--mode launch --approved-origin https://sportmyfitness.com --apply`
transition is for an explicitly authorized domain launch. It requires the exact
approved SmartBrand master at the agreed path; it does not itself deploy or verify
DNS, ownership, HTTPS, rights, final client approval, Google indexing or mailbox
delivery. Use `docs/LAUNCH_TASKS.md` and the SmartBrand website handoff for those
remaining steps. The existing SmartBrand engine remains in its own workstream.

