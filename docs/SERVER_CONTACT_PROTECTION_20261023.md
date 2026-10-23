# Server-enforced contact protection — October 23, 2026

Status: implementation prepared and locally verified; native firewall setup is
blocked by the Vercel connector. Do not merge/deploy until the hosted rule is
active and verified. The working private website remains on main `70bfd5e`.

## Prepared behavior

The approved form fields and layout are retained. Its browser script initializes
BotID Basic, then sends JSON to `/api/contact/` on the same host. The browser no
longer submits to an email-service URL or supplies `_captcha`, recipient,
subject, template or redirect controls. Without JavaScript, the Send button is
disabled and the existing phone/email alternatives remain available.

The server applies these boundaries before forwarding anything:

1. POST only, same-origin request, allowlisted production/verified deployment
   host, JSON media type and a 16 KiB maximum request body. Chunked input has the
   same byte limit. Body reading has a deadline.
2. The native Vercel rate service must positively allow the attempt. A missing
   rule, unexpected response, network failure or timeout returns 503; it never
   falls back to an in-memory counter or permission to send.
3. BotID Basic must positively classify the original browser as human. Missing
   or invalid proof, SDK development bypasses and verified crawlers cannot send
   inquiries. Verification failure never grants permission. Both browser and
   server explicitly use Basic; paid Deep Analysis is not enabled.
4. Exactly the five expected string fields; required values, name ≤100,
   email ≤254, message ≤1500, exact membership in the approved interest list,
   an empty honeypot and no inappropriate control characters. HTML/SQL-like text
   is treated as text, not executed or interpolated into a site template/query.
5. The delivery adapter constructs a fresh FormSubmit request with the original
   Outlook recipient and fixed subject/template. Visitor service controls,
   headers, cookies and redirect URLs are not forwarded. No uploads, CC or
   autoresponder are enabled. FormSubmit's own browser CAPTCHA is replaced by
   the mandatory server-verified BotID boundary on this website's route.

The handler does not publish messages or keep a message database. Responses and
logs contain no submitted message bodies. The browser shows success only when
the provider returns a positive acceptance receipt; acceptance does not prove
inbox delivery. Errors retain the user's message and do not automatically retry.

The current private gateway checks its existing session before executing this
handler on the original host. It does not forward contact submissions with an
upstream bypass credential. Other APIs remain excluded. Private access, Coming
Soon, branding, the approved entrances and automatic ripples remain unchanged.

## Hosted counter configuration — remaining step

`infrastructure/contact-firewall-rule.json` is the exact prepared native rule:

- SDK rate-limit ID: `smf-contact-submit`
- Fixed window: 600 seconds
- Six attempts per rate key, with 429 when exceeded
- Only SDK calls with that exact ID match; no general page or crawler rule
- Vercel counts per region, so this is not a single global cross-region quota

Configure it on both existing projects, preserving any existing/draft rules:

| Project | ID | Dashboard |
| --- | --- | --- |
| Full site | `prj_gekwpLHnnGbcuGHOp47ieG9C93xJ` | https://vercel.com/routalk-builder/sport-my-fitness/firewall |
| Private gateway | `prj_KlCwsCvrYBPgY5gcvKcQmpvaAGT5` | https://vercel.com/routalk-builder/sport-my-fitness-coming-soon/firewall |

The connector returned `404: not_found — Seawall Config not found` for active
and draft reads, a scoped read with the known team ID, configuration PUT and an
initialization PATCH. These were API failures, not successful rule updates or
automatic approval rejections. Avoid repeating the same calls without new
evidence. The connector's documented browser fallback needs user approval.

Independent fresh 48-byte random `RATE_LIMIT_SECRET` values have already been
saved as sensitive, production-only environment variables on both projects.
They sign/namespace rate keys and do not reuse the review session/upstream keys.
No existing secret was retrieved or rotated. Future preview environments need
separate preview values; production values should not be copied into them.

After setup, exercise the real native SDK with an isolated verification key
across separate processes. Check six allows followed by 429, and verify the
native window reset. Such checks do not call FormSubmit or send email. Do not
claim hosted persistence from local fixtures alone.

## Integration and deployment recipe

1. Finish and verify the exact hosted rule. Review configuration and stage
   scoped changes in the existing protected review environment.
2. Verify source and regenerate the sitemap after the actual content commit.
3. Merge the prepared branch to main only when its rate service is ready;
   verify the exact Git commit in the full site's READY deployment. Keep its
   current deployment protection enabled.
4. Prepare the minimal holding deployment using the current 17 sources, replace
   the gateway, and add the shared contact handler at root plus the pinned
   package manifests. The source mapping is in the gateway README. Retain its
   current config, icons, branding and project protection.
5. Verify anonymous Coming Soon, private contact/API denial and the existing
   Admin session behavior. Verify a missing proof cannot forward anything and
   a browser proof reaches schema rejection using an empty JSON payload. Do not
   test a valid real inquiry without PJ's separate instruction.
6. Confirm recipient activation and mailbox delivery separately before launch.
   This implementation does not establish delivery or finalize legal policies.

## Verification commands and evidence

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run build:contact
npm test
NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" SMF_CHROMIUM_EXECUTABLE=/path/to/chromium node verification/site-security-browser.cjs
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest test/sitemap_dates_test.py
python3 design-tools/build-sitemap.py --check
```

The handler tests exercise real HTTP parsing, invalid/oversized/forged input,
mandatory bot and rate results, failure closure, provider error receipts,
fixed delivery controls and an externally owned fixture counter across handler
restarts. These fixtures do not prove the unconfigured native hosted counter.
Browser checks intercept all external delivery requests, use an explicitly
local BotID challenge fixture, verify the JSON/proof headers and error states,
and check the approved visuals and movement. They do not claim a production
BotID classification.

Evidence: `verification/server-contact-source-20261023.json` and
`verification/server-contact-browser-20261023.json`. No real inquiry, provider
activation or production login was performed.

Primary documentation used:

- https://vercel.com/docs/botid
- https://vercel.com/docs/botid/get-started
- https://vercel.com/docs/botid/advanced-configuration
- https://vercel.com/docs/botid/form-submissions
- https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting-sdk
- https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting
- https://formsubmit.co/ajax-documentation
