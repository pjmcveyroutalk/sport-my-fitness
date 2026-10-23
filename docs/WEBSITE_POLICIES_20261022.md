# Website policies — October 22, 2026

PJ approved Privacy, Website Terms, Shipping & Returns, and a Fitness Disclaimer.
Booking and cancellation are deferred. PJ subsequently removed all participant,
minor and guardian forms from scope. No forms, signatures, releases or enrollment
workflow are created by this change.

## Implemented

Four readable policy pages share the approved original horizontal header, menu,
appearance switch, athletic headline family and canvas. They have local contents
links, visible review status and print styles. All eight existing pages have
the same four footer links. Contact includes a short privacy notice beside its
existing form; its action, fields, validation and delivery provider are retained.
Existing main content on the other seven pages is unchanged.

| Page | Canonical route |
| --- | --- |
| Privacy Policy | `/privacy/` |
| Website Terms | `/terms/` |
| Shipping & Returns | `/shipping-returns/` |
| Fitness Disclaimer | `/fitness-disclaimer/` |

The HTML addresses redirect to clean routes. The review gateway admits exactly
these four additional routes for authenticated sessions. No new public-file
permissions are added. Authentication, credentials, cookie attributes, CSRF
checks, rate limits, response privacy headers and API/worker exclusions retain
their original code. The public holding deployment needs only the new gateway
source; its existing files and project settings are reused.

The new pages carry `noindex,nofollow` and are absent from the sitemap while they
are review drafts. Public launch, analytics, Google setup, payment integration,
DNS and the separate brand package are outside this change.

## Policy basis and owner decisions

Privacy describes the current form fields and FormSubmit/email destination,
Vercel hosting, Google Maps, external links, appearance storage and the eight-hour
private-review cookie. No analytics, advertising, newsletter, customer account or
payment feature is introduced. Data-rights language is conditional on applicable
law, and no unsupported claim about selling data, HIPAA status or universal
compliance is made. The legal business identity, mailbox practices, retention
procedures and provider configuration need owner confirmation before launch.

Shipping makes the current absence of online ordering explicit. It does not
invent a shipping price, delivery guarantee, ordinary return period, restocking
fee or final-sale rule. Those commercial choices and digital-edition terms need
Yoshi's confirmation before checkout opens. The draft preserves applicable
consumer rights and describes the federal merchandise shipment/delay baseline.

Website Terms do not impose arbitration, a damages cap or a broad liability
release. The Fitness Disclaimer describes general education, exercise risks,
individual results and the limits of online guidance. Neither claims to create
a signed agreement or waive legal rights. Owner and appropriate legal review
remain necessary before treating these private drafts as final public policies.

Primary references checked October 22, 2026:

- FTC privacy and security: https://www.ftc.gov/business-guidance/privacy-security
- FTC merchandise rule: https://www.ftc.gov/business-guidance/resources/business-guide-ftcs-mail-internet-or-telephone-order-merchandise-rule
- FTC children's privacy rule: https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa
- Vercel privacy notice: https://vercel.com/legal/privacy-notice
- Google privacy policy: https://policies.google.com/privacy
- FormSubmit's service: https://formsubmit.co/

FormSubmit's linked privacy PDF was discoverable but failed in the web reader.
The notice identifies the configured delivery path without inventing provider
retention or deletion guarantees. No inquiry or real login was sent.

## Verification

All 13 existing contracts pass with the route suite expanded from eight to
twelve pages. They exercise actual local HTTP requests, authenticated direct
navigation and refresh, redirects, resource and fragment targets, retained
sessions, anonymous denial, logout, HEAD and excluded routes.

Chromium 153 passes 32 layouts: the four policies at 320, 390 and 1366 px in both
themes, plus all eight existing footers at 390 px. Two actual navigation flows
and four print cases pass. Screenshots of the new mobile pages and desktop
Privacy layout were inspected. A separate check through the actual local gateway
confirms that its fixed Admin control does not cover legal links at 320, 390 and
1366 px; the Fitness link can be followed at each width. Test credentials are
synthetic. No physical-device, WebKit or authenticated production rendering
result is claimed.

Header/menu markup on all original pages and the original brand, favicons,
shared design, appearance, menu and motion files match baseline `91562d5`.
Evidence is in `verification/legal-policies-browser-20261022.json` and
`verification/legal-private-links-20261022.json`. Browser images are local QA
outputs rather than additional website assets.
