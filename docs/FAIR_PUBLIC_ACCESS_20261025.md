# Temporary public access for the fair — October 25, 2026

PJ explicitly authorized the existing Sport My Fitness website to be public
without the Admin password prompt for today, while Yoshi attends a fair.

The holding gateway admits anonymous visitors to the approved website from
October 25 at 00:00 through October 26 at 00:00 America/Chicago. The exact UTC
cutoff is `2026-10-26T05:00:00Z`. The clock check runs on every request, so
returning to private review does not depend on an automation or redeployment.
During the window, `/admin` goes to `/home/` and the Private preview / Admin
control is omitted. After expiry, Coming Soon and the normal password review
flow return; current signed review sessions retain their existing behavior.

Keep the full upstream project's Vercel protection, the holding project's
current protection, existing credentials, API/worker exclusions, no-store and
noindex headers unchanged. This is one-day visitor access, not permanent public
launch or a release of the unverified server-contact work in PR #20.

Only the gateway changes in the holding deployment. All other 16 deployment
sources are reused unchanged from `dpl_EGq6Ny1uPAGhzDcUsvk531e6b3Gz`; that
existing private deployment is also the explicit rollback target. The full
website continues serving approved main `70bfd5ee013bbd738df8732d62f9430fdb028bcb`.

Validation: 16 focused HTTP/security/routing checks pass, including all twelve
page routes without cookies, absence of the Admin control, old Admin links,
HEAD, API exclusions, precise expiry and existing sessions after expiry. Existing
private-mode tests explicitly disable the fair window. Live verification is
recorded separately after deployment; no real inquiry is submitted.
