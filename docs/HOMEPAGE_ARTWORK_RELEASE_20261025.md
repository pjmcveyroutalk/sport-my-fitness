# Approved homepage artwork release — October 25, 2026

PJ approved the final Canva mockup and requested it on the live website.
The homepage uses the supplied turquoise waterfront artwork, the approved
continuous blend, and the original arm/hand detail above that blend. The
header and headline background panels are removed. Layout, copy, navigation,
branding, badges, actions, lower strip and other pages retain their existing
approved behavior and geometry.

The homepage's entrance and water animation are removed as PJ requested.
Shared motion assets remain available to the other pages. The new artwork
has responsive WebP variants; the original uploaded source remains in PJ's
existing artwork file. The arm detail uses an SVG mask and original image
pixels, with no regenerated face or pose.

Base main: `70bfd5ee013bbd738df8732d62f9430fdb028bcb`.
Previous full-site production: `dpl_8eKd6PxYFvTugRzUL56C5e8MGckB`.
The separate fair gateway remains `dpl_HdQ6Nz7koQpwMwKGd4H9qEtTwV6H`;
its public cutoff stays `2026-10-26T05:00:00Z` (midnight Milwaukee time).
Vercel protection, contact processing, payments and the branding kit are
outside this release. PR #20 is not included.

Validation: 11 routing/security tests pass. Four fresh browser cases cover
desktop and mobile, light and dark mode, with the normal motion preference.
Geometry and links match the approved fixture; no homepage animation runs,
all images decode, and no browser errors or horizontal overflow occur.
See `verification/home-artwork-release-20261025.json` for the browser result.
The Canva draft was saved after PJ approved it.
