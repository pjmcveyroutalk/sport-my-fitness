# Approved design release gates

Start at [docs/PROJECT_STATE.md](docs/PROJECT_STATE.md). The October 16 black/turquoise glass-menu design and latest duplicate-removal instructions supersede earlier visual references and the requirement to preserve redundant page-step panels.

## Before public launch: sitemap and indexing

- [x] Prepare `sitemap.xml` with the eight primary pages on
  `https://sportmyfitness.com`, matching page canonical URLs and the full site's
  `robots.txt` sitemap reference. Source validation passes on October 23, 2026.
- [x] Expand each entry with verified content-update dates, change-frequency
  hints and priorities, following the Valpe example. Regeneration and source
  checks protect date accuracy and catch stale XML. Google ignores the optional
  frequency/priority hints; they are not ranking guarantees.
- [ ] Review the final list of pages intended for search results. Keep Admin,
  redirects, private pages and unapproved policy drafts out. Resolve the current
  Apparel and Book `noindex` settings only when their final content and public
  indexing are approved.
- [ ] After PJ explicitly approves public launch, verify that
  `https://sportmyfitness.com/sitemap.xml` returns XML with HTTP 200 without a
  login, each listed URL returns its approved public page with HTTP 200, and its
  canonical URL matches the sitemap. Check public pages' indexing directives.
- [ ] At that approved launch, verify that public `robots.txt` references
  `https://sportmyfitness.com/sitemap.xml`. Keep genuinely private endpoints
  protected. A sitemap or robots rule is not an access-control mechanism.
- [ ] Coordinate with the separate Google setup session: verify the correct
  Search Console property, submit the public sitemap, record its processing
  status and monitor page indexing. Submission has not been performed.

After committing content changes, run `python3 design-tools/build-sitemap.py`,
then `python3 verification/verify-launch-sitemap.py`. Repeat the check before
launch. See [sitemap preparation and launch steps](docs/LAUNCH_SITEMAP_20261023.md).

## Before public launch: contact security and spam protection

- [x] Keep the restrictive browser headers in the existing private preview.
- [x] Prepare the same-origin server endpoint, strict field/size validation,
  mandatory BotID Basic verification, fail-closed hosted rate checks, fixed
  recipient/service controls and honest success/error states. Verify locally
  without real messages. This replacement is staged, not activated on main.
- [x] Install independent production `RATE_LIMIT_SECRET` values on the full-site
  and private-gateway projects as server-only sensitive environment variables.
  Existing review credentials remain untouched.
- [ ] Finish the hosted firewall configuration on both projects. Vercel's
  connector returns `404 Seawall Config not found` for configuration reads and
  writes, including explicit team scope. Configure the exact SDK rule in
  `infrastructure/contact-firewall-rule.json` through an approved dashboard
  fallback; do not replace unrelated rules.
- [ ] Verify the actual hosted counter persists across separate processes,
  returns 429 after six attempts per ten-minute window per key/region, and
  checks the right SDK ID. Keep Basic mode on both client and server; do not
  activate paid Deep Analysis.
- [ ] After the counter is active, deploy the prepared replacement to the full
  site and the private gateway, retaining Coming Soon and access protection.
  Verify missing proof is blocked and a browser proof reaches schema validation
  without sending a real inquiry. Do not deploy a nonfunctional replacement.
- [ ] Verify mailbox activation and delivery only with PJ's explicit instruction
  for controlled real test submissions. Confirm mailbox filtering, monitoring
  and provider retention with the business before launch.

See [server protection status and deployment recipe](docs/SERVER_CONTACT_PROTECTION_20261023.md).

## Before public launch: finalize website policies

The four policy pages are implemented in the private preview. Their final
wording and remaining business details are open launch-checklist items:

- [ ] Review and approve the Privacy Policy, Website Terms, Shipping & Returns,
  and Fitness Disclaimer for the features actually launching, with appropriate
  legal review.
- [ ] Confirm Yoshi's legal business identity, contact information, inquiry/email
  handling, data-retention practices and service providers. Ensure the Privacy
  Policy matches the final website and any analytics or consent setup.
- [ ] Confirm shipping destinations, rates and processing estimates; return and
  exchange eligibility, request periods and return-shipping responsibilities;
  and digital-edition delivery, use and refund terms before online orders open.
  If ordering is not launching with the website, keep its unavailable status
  accurate and checkout disabled.
- [ ] After approval, replace private-draft labels with the approved public
  wording and effective dates, then verify all footer links and the inquiry
  privacy notice.
- [ ] Obtain PJ's explicit public-launch approval before removing access
  restrictions or allowing indexing of the full website.

Booking/cancellation policy remains deferred. Participant, minor and guardian
forms remain excluded. See [policy scope and remaining decisions](docs/WEBSITE_POLICIES_20261022.md).

## Required before release

1. Apply the approved identity to all seven pages. Use the original logo asset intact, scaled proportionally; no generated, traced, simplified or rearranged substitute.
2. Preserve substantive information, prices, durations, schedules, reviews, attributions, media destinations, inquiry fields and useful contextual actions. The approved removal list is in `verification/approved-design-content-check.json`.
3. Use one active presentation layer (`site-design.css`) and one menu controller (`site-menu.js`). Keep the former white/diamond/emboss/brush styling inactive. Original photographic artwork remains intact, including its native content; do not generate replacement people or scenes.
4. Keep each image's proportions and authentic subjects. Remove empty transparent canvas in layout where needed, rather than distorting the picture. No decorative face masks, rejected cutouts or SVG patches; photographs remain opaque during their entrance.
5. Retain the original Blender motion curves. Home's photo enters from the left and settles before the headline drops from above. The other six pages retain their original timing/direction. Verify real recordings, static fallbacks and reduced motion.
6. Verify all seven pages on desktop and narrow/mobile widths, including 360, 390, 430, 768, 900, 901, 1334 and 1920 px. Check no page overflow, clipped headlines, content collisions, missing images or unstable header/menu geometry.
7. Verify keyboard focus in both directions, Escape, close control, actual backdrop taps, current-page labels, all seven destinations, real link following and access from the bottom of the page. The menu must remain usable with JavaScript disabled or its script unavailable.
8. Verify input interruption, history/deep links, width boundaries and failed/late motion assets. A late response must never hide content or replay an abandoned entrance.
9. Verify returning visitors with the retained legacy service worker and old cached HTML/JavaScript. Changed active assets use versioned/new URLs; never assume old cached menu code is harmless.
10. Keep the inquiry service and current redirects. Contact's sessions/packages link opens this site's Programs page; its session-request action opens `contact.html#inquiry`. Do not restore the former website's booking URL. Automated validation must not send a real inquiry, email or booking. Client validation and preserved configuration do not prove mailbox delivery.
11. Record the exact checked commit, browser evidence and preview URL. Preserve the production baseline and rollback identifiers. Merge/promote production only under the user's release authorization after the review build passes.

## Infrastructure and destinations

Keep the GitHub repository, Vercel project, FormSubmit delivery to `Yoshi_barnes@outlook.com` behind the prepared server guard, direct contact/social/media destinations and existing redirects. PJ's October 17 post-release correction replaces the former site's booking links with the current Programs page and inquiry form.

Do not change domain/DNS, access/protection, environment variables, unrelated API integrations or the external booking provider during presentation work. No framework or hosting migration is required.
