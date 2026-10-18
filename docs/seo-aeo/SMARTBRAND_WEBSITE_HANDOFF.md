# Sport My Fitness — website / SmartBrand integration handoff

This is the website side of the work. Continue the SmartBrand engine and logo
work in its existing separate session. No SmartBrand source or image is edited
here. The website preparation is on `prep/seo-aeo-20261017`; production remains
the public Vercel review site until a separate final-domain launch decision.

## Shared identity contract

- Intended official website: `https://sportmyfitness.com/`.
- Existing public review website: `https://sport-my-fitness.vercel.app/`.
- Website entity identifier: `https://sportmyfitness.com/#organization`.
- Website identifier: `https://sportmyfitness.com/#website`.
- Coach identifier: `https://sportmyfitness.com/yoshi.html#person`.
- Authoritative website facts: `seo/site-identity.json`.
- Proposed official master path: `/assets/brand/sport-my-fitness-smart.jpg`.
- Planned brand reference page: `/brand-assets/`; not yet created or added to the sitemap.

The supplied SmartBrand v1.0 handoff specifies a 1248 × 884 JPEG, 109,884 bytes,
SHA-256 `0349a132474c265497fad5d884fd89adcb32bdeeb6ba6ef26baba2e27cf79487`.
The emblem, wordmark, tagline and glowing divider remain intact; the lower
“MIND. BODY. PURPOSE.” portion is excluded. The master inside the supplied `SmartBrand-v1.1.zip` was hash-checked during
the October 18 header-source review and matches this expected identity. The
metadata-rich JPEG is still not installed in this website; PJ chose to retain the
existing full-logo header artwork while applying the call/menu changes. If the
branding session delivers a revised master, reconcile its approved handoff before
changing this contract.

The existing website PNG is a separate earlier approved asset. It remains
byte-identical during SEO preparation and is not being presented as the new
metadata-rich master. Prelaunch Organization markup omits the pending master
instead of publishing a nonexistent image URL. The launch generator requires
the delivered JPEG to match the expected bytes/hash before adding its logo data.

## Integration when the final kit arrives

1. Read the latest kit's config and verification report; compare its canonical
   brand domain and approved master hash with this contract.
2. Copy the exact delivered JPEG to the agreed website path without re-encoding,
   cropping, metadata stripping or conversion. Verify both file hash and IPTC/XMP.
3. Apply the approved visual kit to the website in its own review step. Preserve
   image proportions, the approved motion and the clean menu. This preparation
   does not replace the visible logo or create a new visual design.
4. Use the existing SmartBrand engine's official profile and collaborator output;
   do not rebuild its metadata encoder in this repository. Align entity IDs when
   combining its Organization data with the website graph; avoid duplicate,
   contradictory organizations. Add the completed brand reference page to the
   sitemap only after it actually exists and is approved for publication.
5. Keep creator, copyright and licensing declarations unset until confirmed.
   The current permitted credit text is “Sport My Fitness”; a credit is not a
   license. Preserve the branding session's rights review state.
6. After explicit final-domain launch authorization, regenerate launch metadata,
   verify canonical/OG/image URLs on the real host, and confirm all intended
   public pages have no remaining `noindex` directive. The prelaunch branch must
   never be merged to production unchanged.

## Collaborator side

Distribute the exact JPEG plus the existing SmartBrand caption/attribution link
and page-local ImageObject snippet. The page should identify the real image with
its actual served `contentUrl`, describe it accurately, and retain a readable
Sport My Fitness credit linked to the approved official site/profile.

The collaborator remains the publisher of its own website. Do not replace its
Organization identity with Sport My Fitness or invent a partnership/endorsement.
The existing SOLAS lab is an independent technical demonstration, with its
existing noindex protections retained; it is not an endorsed collaboration.

Check the image actually delivered by each intended CMS. File-byte integrity,
embedded metadata, visible attribution, HTTP access, Google indexing and AI
citations are different observations. Image optimization can remove embedded
metadata; readable attribution and correct page-level ImageObject data remain
useful then. No ranking increase or AI citation is guaranteed by the JPEG.

## Primary references consulted October 17, 2026

- `SMARTBRAND_SOL61_HANDOFF_2026-10-17.md`, supplied by the existing branding workstream.
- [Google: Organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization).
- [Google: image metadata](https://developers.google.com/search/docs/appearance/structured-data/image-license-metadata).
- [Google: LocalBusiness structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business).
- [Google: AI features and website guidance](https://developers.google.com/search/docs/appearance/ai-features).

These sources support identity and attribution preparation. They do not establish
that the pending domain, latest kit, Google indexing or AI citations were verified.
