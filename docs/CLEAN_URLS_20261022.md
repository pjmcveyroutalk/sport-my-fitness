# Clean page addresses — October 22, 2026

PJ approved Xin's recommendation to remove `.html` from page addresses.
The eight destinations are `/home/`, `/apparel/`, `/yoshis-book/`, `/training/`,
`/programs/`, `/media/`, `/community/` and `/contact/`.

`vercel.json` permanently redirects old HTML addresses and historical aliases,
then rewrites clean addresses to the existing HTML source files. Trailing slashes
are canonical. Queries survive redirects; section links remain on their intended
page. The historical booking aliases still lead to Contact, while Yoshi's book
has its own destination. Internal links, canonical/social URL paths, sitemap,
manifest and worker Home fallback use the clean addresses.

Page resources now use absolute paths from the site root, including responsive
image/preload candidates, shared motion data and Apparel's fetched catalog and
rendered product photographs. Catalog data and its validation schema are retained.
No base element is introduced, so local fragments and Apparel history remain local.

The separate private gateway has a matching exact page allowlist and redirects.
It sends login to `/home/`, accepts existing sessions and preserves the public
Coming Soon page. Authentication and project protection settings are unchanged.
Its source provenance and packaging are documented in
`infrastructure/review-gateway/README.md`.

Verification: 13 contract tests pass, including real HTTP requests through the
site router and private gateway; syntax and whitespace checks pass. Tests cover
all eight pages twice, every declared old-address redirect, one-hop completion,
queries, HTML/responsive resources, navigation sections, an independently signed
existing-format session, anonymous denial, logout, HEAD, origin checks and worker/
API exclusions. Browser suites and CI now serve the same routing configuration.

Source comparison with `7c143f5ad000f440ee55e3bb46a5537113ba8896` confirms all
eight pages retain their non-URL markup and content. All 159 checked style,
asset and unchanged runtime files match, including automatic water movement.
Shared entrance motion changes only its data URL. See
`verification/clean-urls-source-20261022.json` for the source receipt.

No new browser rendering pass is claimed: the existing browser installation
limitation remains. Authenticated live page inspection requires the existing
human review session; production credential values were not read or changed.
Google setup, branding assets, payment work and DNS remain separate.
