# Contact form and browser security — October 23, 2026

PJ requested safeguards against spam and injections, especially through the
contact form. This change preserves the approved design, movement, inquiry
fields, FormSubmit destination and private launch status. It does not activate
payments, analytics, participant forms or any new service account.

## Trust boundaries and implemented controls

The visitor's browser posts name, email, selected interest and message directly
to `https://formsubmit.co/Yoshi_barnes@outlook.com`. The website has no message
database and does not render the submitted message into its HTML. FormSubmit
and the business mailbox handle delivery and provider-side filtering.

- Keep FormSubmit's documented reCAPTCHA enabled, now explicitly configured in
  the form markup, including when JavaScript is disabled. Keep the existing
  hidden `_honey` field. No attachments, autoresponder or CC field is enabled.
- Keep native required/email/length limits and existing whitespace and
  fixed-choice browser validation. These improve feedback; direct HTTP clients
  can bypass them. No HTML-stripping or punctuation blacklist is represented as
  an injection defense.
- Add response Content Security Policy to all website routes. Scripts are
  restricted to this site's files plus the exact SHA-256 hash of the approved
  motion boot script. Arbitrary inline scripts, inline event handlers and eval
  are not authorized. Browser form submissions are limited to the existing
  FormSubmit recipient endpoint. Objects, workers, base-URL changes and framing
  of this website are disallowed.
- Keep the approved Google Maps frame and local images/fonts/media/data. Inline
  styles remain allowed because existing styling and movement use them; scripts
  do not receive an `unsafe-inline` or `unsafe-eval` exception.
- Add `nosniff`, frame denial, a referrer policy and disabled camera/microphone/
  geolocation permissions. The review gateway retains its stricter existing
  same-origin referrer policy, no-store/noindex headers and authentication.
- Forward the trusted upstream CSP and permissions policy through the private
  gateway, so review and the prepared launch site exercise the same restrictions.
- Update the private Privacy Policy draft to disclose FormSubmit's spam checks
  and Google reCAPTCHA processing. This does not finalize the legal draft.

## Limits and launch gate

This is defense in depth, not a claim that spam or compromise is impossible.
CSP protects browsers; it is not a firewall for arbitrary requests sent directly
to FormSubmit. CAPTCHA and honeypot fields are public, client-controlled
configuration. FormSubmit documents a `_captcha=false` option. We therefore
cannot claim the current HTML enforces a mandatory challenge against a
purpose-built direct bot, or that provider rate limits/schema checks have been
independently verified.

Before public launch, verify recipient activation and challenge/filtering on
the actual service, then select a provider configuration or server endpoint
that enforces challenge verification, payload/field limits and durable rate
limits independently of the submitted hidden fields. A site-owned endpoint
must use a fixed recipient/subject, reject unexpected and oversized fields,
encode any output, keep secrets on the server, and avoid logging message bodies.
Do not reuse private-review authentication secrets for form delivery.

Confirm mailbox filtering and monitoring, plus retention and provider copies,
with the business. Any controlled delivery/abuse test that would email Yoshi or
activate the provider requires separate explicit instructions. No real inquiry,
email, activation or production login was sent during this implementation.

## Verification and maintenance

Run:

```sh
node --test test/site-security.test.cjs test/clean-urls.test.cjs test/pilot-verify-production.test.js test/apparel-catalog.test.mjs
NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" SMF_CHROMIUM_EXECUTABLE=/path/to/chromium node verification/site-security-browser.cjs
```

The local preview server applies the project's response-header rules. Tests
exercise the real gateway with synthetic local credentials. Browser checks
intercept every external request, including valid form POSTs, so nothing is
sent to the business. They check blocked injected scripts, event handlers and
unapproved form destinations; valid Unicode messages; invalid empty messages;
no-JavaScript form configuration; all pages' menu/theme behavior; the original
entrances and automatic homepage ripples.

The approved inline motion hash is a maintenance contract. If that exact
script changes, update its CSP hash and rerun these tests. New script hosts,
embeds or form/payment destinations require a deliberate policy review; do not
weaken the policy with blanket script exceptions.

Evidence: `verification/site-security-browser-20261023.json` and
`verification/contact-security-source-20261023.json`. Provider delivery and
mandatory server-side spam controls remain unverified launch gates.

Primary references reviewed:

- https://formsubmit.co/documentation
- https://formsubmit.co/help
- https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
- https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/script-src
- https://vercel.com/docs/project-configuration/vercel-json
