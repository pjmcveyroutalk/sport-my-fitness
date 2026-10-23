# Sitemap prepared for launch — October 23, 2026

PJ requested the sitemap be made ready for public launch. The prepared file is
`sitemap.xml`, with the intended public URL:

https://sportmyfitness.com/sitemap.xml

It lists Home, Apparel, Yoshi's Book, Training, Programs, Media, Community and
Contact using their canonical trailing-slash addresses. It contains no preview
domains, old HTML aliases, duplicate locations, queries, fragments, Admin links
or unapproved policy drafts. No modification dates or ranking priorities are
invented.

The main site's `robots.txt` references the final public sitemap URL. Six pages'
existing canonical and social URLs now use the final domain; Apparel gains its
missing canonical link. Yoshi's Book already used the final canonical domain.
The referenced social images remain the original files.

## Privacy and launch boundary

This is preparation, not public-launch approval. No access controls, credential
configuration, gateway routes, public holding files, DNS, noindex directives or
Search Console settings are changed. The current public holding site continues
to serve Coming Soon; its `robots.txt` remains the two active directives and its
`/sitemap.xml` remains unavailable. Public availability must be checked after
PJ approves launch.

Apparel and Book currently retain source `noindex` directives, and the protected
preview has additional privacy controls. Their actual launch content and
indexing decisions must be approved before those directives are changed. The
prepared sitemap is a list for the intended future launch, not a claim that
these pages are currently public or indexed.

The four policy pages remain review drafts with `noindex,nofollow`. Add any
additional pages to the sitemap only when approved and intended for search
results. Do not add a URL simply because it exists in the repository.

## Verification and use

Run:

```bash
python3 verification/verify-launch-sitemap.py
```

The standard-library verifier parses the XML and independently compares its
locations with the actual primary navigation and Vercel routing configuration.
It checks all eight page canonicals, twelve social-image references and local
image files, the robots sitemap URL, and exclusion/protection of policy drafts.
The source receipt is `verification/launch-sitemap-20261023.json`.

All 13 existing contracts pass. Local HTTP checks confirm that the sitemap and
robots file return HTTP 200, correct content types and exact prepared bytes.
Diff and preservation checks pass. No visual-browser rerun is needed or claimed
for changes confined to page metadata and crawler files.

Existing page bodies, all shared visual/motion files, current logo and favicons,
and all private-gateway/holding sources retain baseline `48c18f9` bytes. This
metadata-only change does not alter approved visual design or movement.

After launch approval, follow the sitemap section in `LAUNCH.md`: verify public
HTTP responses and intended indexing, then submit through the verified Search
Console property in coordination with the separate Google setup session.
Search Console submission and actual indexing are not reported as completed.

Primary guidance already reviewed:

- Google sitemap overview: https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
- Google sitemap construction and submission: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
