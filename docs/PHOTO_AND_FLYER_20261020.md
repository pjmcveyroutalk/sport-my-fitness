# Sport My Fitness — original running photo and flyer

PJ supplied the original running photograph and a screenshot of Yoshi's flyer,
then clarified: **only her face needs correcting**. The existing waterfront,
body, pose, clothing, framing, proportions, design and original motion stay.
This is the main website content workstream; domain/account setup is separate.

## Facial correction: review only

The new original photograph is the identity reference, not a replacement for
the whole Home hero. A built-in image edit was requested with this prompt:

> Correct only the woman's face in the existing Milwaukee waterfront image to
> match Yoshi's authentic original photograph. Preserve the head angle and smile;
> keep the hood, hair, body, hands, clothing, pose, shoes, entire waterfront,
> lighting, crop and dark text space unchanged. Do not use the track background.

The full generated draft changed details outside the face and is **rejected as
a whole-image replacement**. Only its facial region is used in the review asset,
through a small feathered mask composited onto the original decoded pixels and
saved losslessly. The precise mask, input hashes and verification results are
recorded in `verification/face-and-flyer-20261020.json`.

Review asset: `assets/photos/review/smf-waterfront-face-review-20261020.webp`.
It retains the exact 1585 × 992 dimensions. Pixel comparison confirms **zero
changed pixels outside the facial mask**. The existing hood, hair, earrings,
body, clothes and waterfront therefore retain their original pixels.

This establishes preservation of the surrounding artwork, **not approval of
the generated likeness**. PJ/Yoshi must review that likeness; no claim of an
exact photographic identity is made. The preview is not referenced by Home,
any responsive image source, mission-strip background or social-sharing tag.
The deployed hero remains unchanged until this preview is accepted.

After acceptance, prepare proportionate responsive variants and update every
Home display/sharing placement together. `index.html` currently displays
`smf-waterfront-hero-{800,1200,1585}.webp`, while its sharing metadata still uses
the earlier `yoshi-hero-milwaukee-natural-2026-10-08-lossless.webp`. Do not leave
the rejected face in a responsive size or a sharing image. Preserve the authored
motion and current `yoshi-hero` dimensions/placement; no CSS redesign is needed.

## Flyer information mapping

| Owner-supplied information | Treatment |
| --- | --- |
| Weight loss, muscle building, cardio training, core training | Added in one sentence in the existing Personal training description on Programs. No new Home link group or duplicate services section. |
| Rehab therapy | Existing Functional movement & rehab entry already covers movement and progressive strength. Retained without adding a clinical qualification or treatment claim. |
| Professional trainer | Existing trainer biography/credentials already provide context. No duplicate badge or invented certification. |
| Affordable price; `$$` | Promotional language/symbol, not a numeric rate. Existing rates unchanged. |
| Billed Monthly | Recorded for owner clarification: does this apply to memberships, packages or all services? It does not silently replace the existing per-session rates. |
| 414-791-4526 | Matches the current contact details and one-tap call links. No duplicated contact section. |
| sportmyfitness on Instagram and Facebook | Existing official links retained. The flyer does not require new destinations. |
| Cash App: `$SPORTMYFITNESS` | Recorded as owner-provided information. No payment link, checkout or billing integration added. Confirm its intended use before introducing payment instructions. |
| Flyer gym photograph | Screenshot retained as source evidence; no low-resolution screenshot crop substituted for a website photograph. |

## Source identity

- Flyer upload `01-1000006536.png`, 720 × 1612,
  SHA-256 `f9904116ef94bebfd7bcf5d94d1624245974b24dea10e95922817fa6cd3dc3cd`.
- Authentic running upload `02-1000006537.jpg`, 1364 × 2048,
  SHA-256 `26b177a76ae4d1bb3a11c7249b3d868ed29cac37cf79864c2d3ccd0d663bc729`.
- Existing waterfront image SHA-256
  `b34ee59f501384a00aa5b053475fbe2b9ef2ed5a6edd09018a73d8c87f39e22e`.

The source uploads themselves are not committed into the publicly hosted asset
tree. This note supersedes the older instruction to wait for a reference photo;
the supplied original now exists and face-only preview work is authorized. The
main-photo approval remains open. Classroom photos, actual apparel photos/item
data and upcoming-event details are still pending.

## Release evidence

The service sentence is published as runtime
`a846f5a717fceef94643fd13c3706617180e5a42`, Production
`dpl_29UY66jNmXBprhsFqiWse7qjxHNg`. Seven authenticated live files match the
checked source. Coming soon remains public; signed-out Programs and the draft
asset return 404. The hero and its three existing sizes retain their original
bytes. The facial draft is saved for review and is not used by the website.
The following documentation commit adds evidence only.
