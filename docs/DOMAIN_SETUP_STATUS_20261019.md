# Domain setup checkpoint — October 19, 2026

Scope: domain, hosting, public holding page and password-only private review.
Latest user decision: Admin Only button and a password; Yoshi does not need a
Vercel account. This supersedes the earlier named-account access recommendation.

## Completed
- Official logo centered in the Coming Soon header and published first.
- Public page: https://sport-my-fitness-coming-soon.vercel.app/
- Admin Only opens /admin. The password is checked on the server.
- The gateway uses secure eight-hour sessions and a server-only credential to
  serve the current full website at the same origin after login.
- Full-site project sport-my-fitness (prj_gekwpLHnnGbcuGHOp47ieG9C93xJ) retains
  All Deployments Vercel Authentication.
- Holding project sport-my-fitness-coming-soon
  (prj_KlCwsCvrYBPgY5gcvKcQmpvaAGT5) remains isolated, with no Git repository
  connected. Its package now includes nine explicit files, including the gateway.
- Production dpl_6kxuyhjrFAMtemnqRkC5NiZ25Wt6 is READY.
- Source 74891dd62e56b801375be9c8c41b51d914f0734a, CI run 39316072078 success.
- Fresh live checks: public page and centered logo; password form; wrong password
  rejected; correct password works; all seven pages and ten asset requests pass;
  logout, altered cookies, source/API/worker exclusions and signed-out denials pass.
- No plaintext password or access credential is stored in source or receipts.
- sportmyfitness.com and www.sportmyfitness.com remain assigned to the holding
  project, with www temporarily redirecting to the apex (307).

See docs/ADMIN_PREVIEW_20261019.md and
verification/admin-preview-release-20261019.json for implementation and evidence.

## Next: Namecheap
PJ has Namecheap access and will follow the browser walkthrough on a Chromebook.
DNS has not been changed in this session. Read fresh Vercel domain-specific
recommendations before changing records. Save the existing DNS inventory and
preserve all MX/TXT/email records.

## Remaining
1. Apply only the required Namecheap web DNS records.
2. Verify apex/www DNS, HTTPS, redirects, public page and password access at the
   final domain. A new hostname has its own login cookie.
3. Confirm hosting plan/recurring costs if needed; no plan or paid password
   protection add-on was enabled.
4. The source repository remains public. Deployment access changes did not change
   repository visibility.
5. Google ownership/account and later full launch/indexing remain separate.

The current source branch contains older SEO preparation at its root. Do not
deploy or merge that root into the full website as part of this setup.
