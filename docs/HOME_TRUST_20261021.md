# Approved Home trust badges and headline system

PJ selected “Certified trainer” and “Community focused” on October 21, 2026,
with existing vector icon artwork. The chosen layout comes from concept A,
review source `de5303203867411f18d07fce57102e970ca47d50`. The other two review
concepts are not integrated. The existing hero font now also styles secondary
headings across all eight pages, using the reviewed smaller section scale.

## Artwork and content

The shield and people symbols use Lucide’s `shield-check` and `users-round`
artwork from version 0.468.0, pinned to upstream commit
`f12b0de177fbc2a6795e99be065887e72b237123`. Their original SVGs and ISC license
are retained in `assets/icons/lucide/`. Inline copies use the original drawing
geometry and add only accessible/decorative attributes. The original license
also appears beside the inline copies. No raster generation is used.

Upstream sources:

- https://github.com/lucide-icons/lucide/blob/f12b0de177fbc2a6795e99be065887e72b237123/icons/shield-check.svg
- https://github.com/lucide-icons/lucide/blob/f12b0de177fbc2a6795e99be065887e72b237123/icons/users-round.svg
- https://github.com/lucide-icons/lucide/blob/f12b0de177fbc2a6795e99be065887e72b237123/LICENSE

The qualification label uses the existing approved ISSA biography. Community
focus reflects the approved coaching and school involvement copy. These are
website information badges, not an institution’s seal or endorsement.

## Preserved behavior

Home’s three actions, headline, copy, original photograph, logo and header
remain intact. Badges occupy the reviewed space beside the headline. They
appear after the existing entrance and remain available in reduced motion,
interrupted and no-JavaScript views. Original motion files and curves remain
byte-identical to main `e07c1556cef0423842afbf706a8c42c0315ebf87`.

The uniform headline stylesheet changes secondary headline typography. It
retains hero lettering and sizes, body copy and small label styles. The Book
cover, centered composition and quote design remain intact.

The full existing browser workflow is retained and extended with the new
badge/heading checks. A pinned copy of the preceding Home is used only as an
intercepted browser response to compare existing hero geometry. It is never a
website destination or navigation target.

## Next image decision

PJ plans to change the Home picture to another photo of Yoshi or another
selected image. No replacement is selected or installed in this release.
Keep the current photograph until PJ supplies/approves the next choice, then
review its responsive crops with this headline and badge placement. Do not
apply the older unapproved face-only review image.

Setup/Google, branding-kit and payment sessions remain separate. Existing
Vercel All Deployments protection and the public Coming soon holding project
must remain intact. Release evidence belongs in
`verification/home-trust-release-20261021.json` after verification.

## Published verification

Runtime `e15b7e0` is production `dpl_2WPSbm4rpziDA7NspGC8w6MW53uw`, READY
with the expected project, main source SHA and full-site aliases. Run
`39721603611` passes the full existing browser workflow plus the new checks:
60 general layouts, 44 Apparel layouts, 68 Home action layouts, 24 Book
layouts and 36 trust layouts. All 32 headline checks and both icon-source
checks pass. The approved hero geometry matches its preceding source in every
trust comparison. All report failure counts are zero.

The stale appearance-test menu count was corrected to distinguish eight menu
destinations from the separate logo link. The website menu did not change.
Final phone and desktop Home renders were inspected. Eight signed-out privacy
checks pass and All Deployments protection remains enabled.

Authenticated served-page fetching remains unavailable through the existing
connection. This release verifies browser-rendered source, provider deployment
identity and public privacy; no new signed-in live-browser check is claimed.
Review through https://sportmyfitness.com/admin in the signed-in tab. Full
source hashes and evidence references are recorded in the release receipt.
