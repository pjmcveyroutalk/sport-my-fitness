# Private review gateway

`gateway.cjs` is the source for `api/gateway.js` in the separate
`sport-my-fitness-coming-soon` Vercel project. It is kept outside this repository's
`api` directory so it does not become another endpoint on the full website.

The October 22 clean-URL revision starts from the exact deployed gateway:
raw SHA-1 `deb80eb415080bf4eec29c9d6685eaa08921f890`, recovered from
`prep/domain-coming-soon-20261019` commit
`d27eaab03c4e34a23f59c7a780c570044af95204` and matched against deployment
`dpl_CThrzErdtBNfRVCW3hyVZUrYGkqe` before editing.

The change admits only the eight named clean page routes, canonicalizes their
old addresses, and sends successful login and the signed-in Home link to
`/home/`. Public Home still shows Coming Soon. Authentication, session signatures,
cookie attributes, origin checks, rate limits, credential environment variables,
response privacy headers, API/worker exclusions and asset permissions are retained.

Deploy the full website first. Then deploy this source as `api/gateway.js` to the
existing holding project, retaining its other eight source files and all project
settings. Do not copy the full website into the public holding deployment or
change deployment protection. Credential values are never required for packaging.

Deploy this directory's `robots.txt` as the holding project's root `robots.txt`.
It contains only the active crawler directives; explanatory notes belong here.
The main website's separate root file retains its sitemap reference for launch.

`node --test test/clean-urls.test.cjs` runs real HTTP requests through the gateway
and the routing-aware site server using local synthetic credentials only.
