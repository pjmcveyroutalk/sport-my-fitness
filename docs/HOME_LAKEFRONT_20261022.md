# Approved Home lakefront and water motion

PJ approved the final homepage mockup on October 22, 2026: Milwaukee-inspired
lakefront artwork at dusk, a hooded woman seated on a workout bench in the lower
right, the existing trust badges and actions, and subtle moving water. The woman
is an illustrative figure, not an authenticated photograph of Yoshi or a client.

The selected 1584 × 993 artwork has proportionate 800, 1200 and 1584 pixel WebP
sources. The same new image supplies Home's sharing metadata and mission strip.
Earlier source images remain available in repository history and assets; the
unapproved face correction is not used. The original logo and vector badge
drawings remain unchanged.

`home-lakefront.css` implements the reviewed desktop and mobile crops
without changing the headline, badges, buttons, menu or footer geometry. The
portrait-era image rectangle is intentionally replaced by a landscape cover
crop. Mobile art fades into the existing dark canvas behind the actions.

`home-water-motion.js` refracts only the water through a transparent
canvas above the still image. The far bank, near shore and woman's silhouette
are excluded. The existing hero contrast layers and semantic text remain above
the effect. PJ requested automatic ripples with no water-control button after
reporting still water. The original WebGL-only path was reproduced leaving the
image still, with zero frames, when WebGL was disabled. That is a confirmed
failure mode, not a claim about PJ's uninspected device.

The effect now starts automatically. Native Canvas 2D keeps it moving when
WebGL is unavailable, shader setup fails, or a running WebGL context is lost.
The ripples are more visible at phone sizes. WebGL is capped at 30 frames per
second; Canvas 2D at 24, with a smaller bounded drawing surface. Both keep the
water mask and the existing crop. The controller and stylesheet now use root
URLs, consistent with the private site’s established script/style routing;
the gateway code and access policy are unchanged. System reduced motion retains still artwork.
Rendering stops while hidden or outside the viewport and resumes on eligible
back/forward restoration. No JavaScript or no drawing support retains the still
photograph and normal site controls.

The original `site-motion.js`, `site-motion.css` and authored curves are not
changed. The lakefront and its moving-water layer travel together through the
existing entrance. Other pages, private access, domain setup, branding-kit work
and payments are outside this change.

The full browser workflow is retained and extended with
`verification/home-lakefront-browser.cjs`. Existing image checks now recognize
Home's approved `object-fit: cover` crop. Trust comparisons continue to protect
every foreground measurement while allowing the newly approved artwork and
photo rectangle. The mobile backdrop check covers the full hero canvas rather
than requiring the landscape image itself to extend below the approved fade.
The focused water review also checks WebGL absence, shader failure and context
loss, actual moving-water versus stationary landmark screenshots, automatic
start without a button, reduced motion and page restoration in both engines.
The original image release is recorded in
`verification/home-lakefront-release-20261022.json`; automatic-motion repair
evidence belongs in `verification/home-water-automatic-20261022.json`.
