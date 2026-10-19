# Domain setup checkpoint — October 19, 2026

Scope: domain, hosting, public holding page and password-only private review.
Latest user decision: Admin Only button and a password; Yoshi does not need a
Vercel account. This supersedes the earlier named-account access recommendation.

## Completed
- Official logo centered in the Coming Soon header and published first.
- Public page: https://sportmyfitness.com/
- Vercel fallback: https://sport-my-fitness-coming-soon.vercel.app/
- Admin Only opens /admin. The password is checked on the server.
- The gateway uses secure eight-hour sessions and a server-only credential to
  serve the current full website at the same origin after login.
- Full-site project sport-my-fitness (prj_gekwpLHnnGbcuGHOp47ieG9C93xJ) retains
  All Deployments Vercel Authentication.
- Holding project sport-my-fitness-coming-soon
  (prj_KlCwsCvrYBPgY5gcvKcQmpvaAGT5) remains isolated, with no Git repository
  connected. Its package now includes nine explicit files, including the gateway.
- Production dpl_8mUXU2vsvTYFxuGoqJb7diP4jwuZ is READY.
- The user-requested password rotation was deployed and verified. The previous
  password and sessions are rejected. Credentials are not recorded here.
- Source 74891dd62e56b801375be9c8c41b51d914f0734a, CI run 39316072078 success.
- Fresh live checks: public page and centered logo; password form; wrong password
  rejected; correct password works; all seven pages and ten asset requests pass;
  logout, altered cookies, source/API/worker exclusions and signed-out denials pass.
- No plaintext password or access credential is stored in source or receipts.
- sportmyfitness.com and www.sportmyfitness.com remain assigned to the holding
  project, with www temporarily redirecting to the apex (307).

See docs/ADMIN_PREVIEW_20261019.md and
verification/admin-preview-release-20261019.json for implementation and evidence.

## Domain connection completed
PJ saved the Namecheap records on October 19, 2026:
- A record: @ -> 76.76.21.21.
- CNAME record: www -> cname.vercel-dns.com.
- Existing Namecheap nameservers remain authoritative.
- Both domain-specific Vercel configuration checks report misconfigured=false.
- The apex HTTPS certificate was issued and has automatic renewal enabled.
- Verified at 2026-10-19T20:26:09Z (3:26 p.m. America/Chicago): HTTPS Coming Soon,
  official logo, Admin Only form, password login, private home and biography,
  signed-out denial, logout and cookie clearing all pass.
- HTTPS www redirects to https://sportmyfitness.com/ with 307.
- Verification used normal certificate validation. Port-80 probes were reset by
  the execution network, so HTTP-to-HTTPS redirects are not claimed as tested.
- No further Namecheap changes are required by the verified configuration.

See verification/domain-connection-20261019.json for the domain and password
rotation receipts. Earlier admin-preview evidence remains a historical record.

## Later work
1. Continue approved website content/design work in its separate main session.
2. Google ownership/account setup and eventual public launch/indexing remain
   separate. The public domain currently serves Coming Soon to signed-out users.
3. No hosting plan or paid password-protection add-on was enabled.
4. The source repository remains public; its visibility was not changed.

The current source branch contains older SEO preparation at its root. Do not
deploy or merge that root into the full website as part of this setup.
