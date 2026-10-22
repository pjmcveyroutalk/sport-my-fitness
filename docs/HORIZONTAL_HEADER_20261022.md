# Horizontal website logo — October 22, 2026

PJ approved the supplied horizontal header direction and explicitly kept the
branding package separate. The website now uses one shared SVG: a turquoise
runner ribbon beside SPORT MY in white and FITNESS in turquoise. The original
symbol artwork from `brand/android-chrome-512x512.png` is embedded byte-for-byte
and clipped inside the SVG. The symbol is not redrawn. Lettering is outlined
from the website's existing Barlow Condensed Bold font; all artwork is embedded.

PJ rejected the first header symbol because its redrawn shape did not match the
brand. The current header uses the original image pixels, shape and shading.
Keep this original artwork; do not substitute a traced or generated symbol.

All eight page headers and menu headings use this website asset, with correct
intrinsic dimensions, accessible labels and a fresh stylesheet cache key. The
shared CSS balances the logo with the existing 44px controls, reserves space for
the native menu when JavaScript is unavailable, and keeps the approved 88px mobile
and 176px desktop header heights. The older shared shell also uses this asset.
Coming Soon and Admin use the same horizontal version. Older favicon/master PNG
assets remain available.

The branding package, its master images, metadata and existing exports are not
edited or repackaged. No existing asset under `assets/` or `brand/` is changed;
the horizontal SVG is a new website-only file. Page content, clean routes,
typography, hero artwork, entrance code and automatic water code are preserved.

Fresh Chromium 153.0.8010.0 checks pass: 60 page/theme/viewport layouts, three
menus, three native navigation cases, two private entry pages and one original
entrance case. Layout widths range from 320 to 1920px. Checks verify complete
logos, proportions, separate 44px controls, alignment, no horizontal overflow,
menu close access, all eight menu links, and native Book navigation. Mobile and
desktop screenshots were inspected in dark/light modes. This is browser-engine
evidence, not a physical-device or fresh WebKit pass.

All 13 existing contracts pass. Syntax and whitespace checks pass. Source
preservation and browser results are recorded in
`verification/horizontal-header-source-20261022.json` and
`verification/horizontal-header-results-20261022.json`.

The first browser harness attempt wrote theme state into an embedded third-party
frame; the test setup now limits that write to its top-level local page. A second
test assertion assumed the desktop phone lived to the right of the brand; the
assertion now checks actual non-overlap, including the existing left rail. These
were test-harness fixes, with no corresponding changes to the website runtime.

The full site remains private. Gateway changes only add the named public SVG
asset and replace the Admin logo markup. Authentication, cookies, credentials,
privacy headers, route exclusions, public robots rules and Vercel protection
remain intact. Google setup, indexing, payment work and package revisions stay
in their separate sessions.
