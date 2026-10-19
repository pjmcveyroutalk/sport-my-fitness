# Password-only preview — October 19, 2026

PJ requested an Admin Only button and a shared password so Yoshi can view the
website without a Vercel account. This supersedes the earlier named Vercel-login
recommendation in the domain setup documents.

The header logo was centered and published as
`dpl_DJMjbUjv8gZTxStxtekYv7suSaE7`, source `e25e9ce81a7d644e3343f66bfb3c51bcdd2a425a`.
The existing 14-layout CI passed; a fresh signed-out request returned 200 and
the centered-logo rule.

## Behavior
- The public origin shows Coming Soon and the original logo.
- Admin Only opens `/admin`; the shared password is verified on the server.
- A successful login sets a Secure, HttpOnly, SameSite=Strict, host-only cookie
  for eight hours and shows the current website at the same origin.
- A small Private preview · Admin link opens the view/logout controls.
- The full website remains on its original project with All Deployments
  Vercel Authentication. Only the gateway holds a server-side automation credential.
- The gateway follows the existing full-site production alias, so future full-site
  changes appear without copying an old website snapshot.
- Public visitors cannot request private pages, assets or API paths through the
  gateway. Service workers are blocked for private previews to avoid offline caches.
- All responses disable shared caching; sessions expire and password rotation
  invalidates existing sessions. Logout clears the browser session.
- A per-instance attempt limit supplements the high-entropy generated password;
  it is not a globally coordinated rate limiter.
- No paid password-protection add-on, DNS change or repository-visibility change.

## Configuration
Only the public holding project receives these sensitive production/preview
environment variables:
`SMF_REVIEW_PASSWORD_HASH`, `SMF_REVIEW_SESSION_KEY`,
`SMF_REVIEW_UPSTREAM_SECRET`.
There is no plaintext password, signing key or bypass credential in GitHub,
HTML, URLs or public JavaScript. The upstream host is fixed in the gateway.
Passwords and tokens must not be added to this document or any evidence.

The isolated packager includes the gateway and the approved public assets,
never the full-site source. Keep `prelaunch/coming-soon` separate from main-site
content/SEO work.

## Validation
Fresh Node HTTP integration checks passed all nine tests covering public access,
valid/invalid passwords, cross-site posts, secure cookies, current-site fetching,
asset loading, no shared caching, tampered/expired sessions, logout, attempt limits,
source/API/worker exclusions, missing configuration and password rotation.
Live deployment and end-to-end results are recorded in the follow-up release receipt.

## Live release confirmed

Production deployment `dpl_6kxuyhjrFAMtemnqRkC5NiZ25Wt6` is READY at
https://sport-my-fitness-coming-soon.vercel.app/ . Source is
`74891dd62e56b801375be9c8c41b51d914f0734a`; GitHub run `39316072078` passed.
Fresh live checks passed public page, wrong and correct passwords, secure session,
all seven current pages, ten asset requests, logout, tampered sessions and private
path restrictions. See `verification/admin-preview-release-20261019.json`.
The Namecheap DNS connection remains the next user-guided step.
