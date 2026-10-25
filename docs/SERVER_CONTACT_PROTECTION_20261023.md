# Server contact protection — October 23, 2026

**Status: not finished and not active on production.** The source is prepared in
PR #20, and its protected preview builds successfully. Activation and deployed
verification are blocked by concrete Vercel permission errors. Main remains
`70bfd5ee013bbd738df8732d62f9430fdb028bcb`; the public holding deployment and
private gateway have not been replaced.

## Current implementation

The approved contact layout, branding and motion are retained. The browser
initializes BotID Basic and submits exactly the five form fields as JSON to
`/api/contact/` on the same host. Service controls, recipients and redirect URLs
are constructed only on the server. No paid Deep Analysis is enabled.

The server requires POST, matching allowed Origin/Host, JSON, a 16 KiB body cap,
fixed allowed fields, valid field lengths, an approved interest and an empty
honeypot. It rejects inappropriate control characters and treats HTML/SQL-like
strings as text. A positive, non-bypassed human BotID verdict is required before
accessing the hosted counter; this avoids storage work for unverified bots.
The counter must positively allow the attempt before anything is forwarded.
Failures, missing setup, malformed state and unknown SDK results fail closed.

The attempted native Firewall SDK configuration could not be created: Vercel
returned `404 Seawall Config not found`. The current branch therefore contains
an alternative in `infrastructure/contact-rate-limit.cjs`: a bounded private
Vercel Blob JSON counter, using uncached reads and atomic conditional writes
with ETags. Stale writers retry rather than overwriting another server's
increment. A restart cannot reset the hosted state. The limit is six attempts
per trusted Vercel client IP per fixed ten-minute window, across instances and
regions sharing that counter. This behavior has passed local concurrency tests;
**the actual hosted counter is not yet verified**.

Counter keys are HMACs of the window and platform-supplied client IP; raw IPs,
contact details and message bodies are not written to the counter. Keys rotate
when the window changes. State is bounded at 512 active keys/64 KiB, with a
4.5-second deadline and bounded retries. Capacity, timeout and service errors
return an unavailable response rather than permission to send. Old keys are
replaced on the next window's successful update. This is intended for a small
contact form, not a high-volume general rate-limit service.

Delivery uses the original FormSubmit Outlook recipient, fixed subject/template
and server-controlled provider options. The browser only reports acceptance
when the provider positively acknowledges it. Acceptance does not establish
mailbox delivery. Errors retain the message and do not automatically retry.
No real inquiry, mailbox activation or production login was performed.

The gateway checks its existing private session before running the handler on
the visitor's host. It never proxies contact POSTs with an upstream bypass key.
The production gateway is still using its previous implementation.

## Confirmed access blocker

The existing Vercel connection is present and can read projects, write the
prepared preview variables, create commits/deployments and read deployment
state. It is not sufficient for two required operations:

- Creating storage with a project binding returned **403 Forbidden**:
  `You don't have permission to create the project environment variable.`
  Operation `POST /storage/stores/blob`, resource `projectEnvVars`, request ID
  `iad1:sfo1::tvmvf-1792816179898-650d15ef3352`.
- Reading the protected preview through the supported Vercel fetch tool returned
  **403 Forbidden** at `read_protection_bypass`, endpoint
  `/v2/deployments/dpl_iWqyhao78ZLihnsMy6Te99uCN5xU/aliases`. The tool explicitly
  requires the existing connection to authorize the deployment's project/team.

The explicit-team access helper also could not resolve the known preview (404).
The mapped CLI fallback is unavailable: no CLI, configured Vercel token or
official CLI auth file is present. No credential values were inspected.

The connection needs the relevant storage-binding and protected-preview access
permissions for `routalk-builder` and these existing projects:

| Project | ID |
| --- | --- |
| sport-my-fitness | prj_gekwpLHnnGbcuGHOp47ieG9C93xJ |
| sport-my-fitness-coming-soon | prj_KlCwsCvrYBPgY5gcvKcQmpvaAGT5 |

Do not repeat unchanged failed requests, change ChatGPT's global permission
mode, retrieve existing review credentials, weaken Deployment Protection, or
restart a separate Google sign-in. The browser review rejected that separate
flow because PJ directed use of the existing connection. Plain approval in chat
does not modify the permissions Vercel grants the connected application.

## Prepared resources and configuration

- Original independent production-only `RATE_LIMIT_SECRET` values remain on
  both projects; no existing review/Pilot credential was read or rotated.
- The feature branch has its own preview-only signing secret and non-secret
  storage/path/verification configuration. Production-only store/path variables are also prepared on both projects,
  with separate counter paths. The actual runtime storage connection remains
  unconfirmed.
- Private standalone store `store_4FTSRyxydcewHHGI`, `smf-contact-security`, was
  created in `iad1`. Its runtime project binding is unconfirmed. No paid plan
  upgrade was requested. A subsequent project-bound creation returned the 403
  above; do not blindly repeat creation or create duplicate resources.
- Both projects now explicitly enable system variables and their normal
  short-lived Vercel OIDC identities. The full project's existing `all`
  Deployment Protection remains enabled; the holding protection is unchanged.

`npm run build` builds the pinned BotID client, prepares the counter and copies
only the existing public pages/assets into `public/`. Dependencies, server
source, tests and documents are excluded from the static output. Copied page
bytes were checked against source. This fixes Vercel's missing-public-directory
build error without changing the approved visuals.

The protected preview can emit a sanitized hosted-check JSON artifact when
`SMF_VERIFY_HOSTED_COUNTER=1`. A READY deployment is not proof this check passed:
read `assets/contact/hosted-counter-check.json` and require `status: PASS`.
Production counter setup errors always fail the build. The test-only diagnostic
mode is restricted to Preview; it never enables sending around a failed counter.

A separate protected verification deployment,
`dpl_CiemqDexZT4bfhsw1oAVkaWhRvWE`, forced the hosted-test flag and required the
generated receipt to be PASS before its build could succeed. It exited with
`BUILD_UTILS_SPAWN_1`; the hosted gate did not pass. No production target was
changed. Normal project build defaults were restored after this one-off check.
This avoids treating a READY diagnostic preview as successful verification.

## Required continuation

1. Update the existing Vercel connection's relevant team/project permissions.
   No further approval of the code/security work is needed.
2. Finish a legitimate runtime binding for the private counter, then read the
   protected hosted-check receipt. Its isolated tests use separate Node
   processes, concurrent attempts and a real-clock short-window reset. They
   send no emails. Production remains fixed at 600 seconds; the reset test uses
   a separate 4-second verification window rather than claiming a ten-minute
   production wait occurred.
3. Production store IDs, separate counter paths and signing keys are already
   prepared. Confirm legitimate runtime access on both projects. Verify startup
   preserves existing counts and missing storage fails closed.
4. Verify deployed BotID proof and API rejection using a deliberately invalid
   payload that cannot be delivered. Do not submit a valid real inquiry without
   separate instruction. Check CSP compatibility with the actual client.
5. Resolve or explicitly assess the existing design-review CI failure before
   merge. The current run fails the mobile phone/menu target-gap assertion;
   approved layout/CSS bytes were not changed by this security work. The
   pre-counter source checkpoint also has a failed design-review run.
6. Merge only after the hosted gates pass. Verify the exact READY production
   commit, then update the holding gateway without changing Coming Soon,
   existing review sessions, branding or protection. For gateway packaging use
   the canonical infrastructure handler and counter modules, a root handler
   wrapper, the pinned manifests and the counter/public build scripts.
7. Verify anonymous Coming Soon, private contact/API denial, current sessions
   and actual negative API paths. Keep the whole site private until PJ approves
   public launch. Mailbox activation/delivery remains a separate launch check.

## Evidence

- 58 Node tests passed after the counter implementation.
- Static build passed locally; public page bytes match source, with server code
  and dependencies excluded from the static output.
- Protected preview `dpl_iWqyhao78ZLihnsMy6Te99uCN5xU` is READY at
  `102a7f9a5f4e49d77d4ed7469daa2b54f08a5a93`; its hosted receipt cannot yet be
  read with the current connection. No hosted-counter pass is claimed.
- Historical local browser checks cover 20 page/width combinations and four
  blocked injection cases using an explicit local BotID fixture. Current
  branding/motion/page hashes still match those records; no actual deployed
  positive human classification is claimed.
- Current design review: run 40063500949 fails `phone and navigation targets
  overlap`; pre-counter checkpoint run 40029384641 also failed. Do not describe
  the entire CI suite as passing.

See `verification/server-contact-source-20261023.json`,
`verification/contact-vercel-permissions-20261023.json` and `LAUNCH.md`.

Primary implementation references:

- https://vercel.com/docs/botid/get-started
- https://vercel.com/docs/botid/advanced-configuration
- https://vercel.com/docs/vercel-blob#conditional-writes
- https://vercel.com/changelog/vercel-blob-now-supports-consistent-reads-on-private-storage
- https://vercel.com/docs/headers/request-headers
- https://vercel.com/docs/vercel-blob/usage-and-pricing
