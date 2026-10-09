# Six-page launch preparation

The current review keeps Home, Training, Programs, About, Media and Contact.
Production has not been released by this preparation change.

## Source changes prepared

- Each displayed photograph has one page assignment. Programs uses the
  previously unused original `assets/yoshi-coaching.jpg`; Contact uses the
  previously unused original `assets/yoshi-portrait.jpg`. Both are restored
  unchanged from the frozen ZIP21 source archive. The repeated background
  photograph is removed from About and Media. Reusable CSS paint masks and
  diagonal teal strokes preserve the established architecture.
- Five large PNGs are served as lossless WebP copies. Every decoded RGBA pixel
  and image dimension was compared with its current Git original. Older assets
  remain available for compatibility. Three fonts are served through lossless
  WOFF containers, with identical glyph outlines, character maps and metrics.
- Small informative teal labels and light-surface link states use a readable
  deep-teal variant from the shared palette. Large display lettering retains
  its existing face and single soft bevel. Button face/texture colors keep
  dark labels clear; the lower shade remains in the bottom inset. Shape,
  dimensions, 120ms states, depth, focus and reduced-motion settings remain.
- Canonical, Open Graph, Twitter metadata, robots.txt and sitemap.xml are
  prepared for the existing verified project address:
  `https://sport-my-fitness.vercel.app`. This is a provisional launch origin,
  not a custom-domain decision or a claim of anonymous availability. Page
  metadata uses its own hero image, with exact dimensions and descriptions.
- `/book.html` and `/book` redirect to `/contact.html`.
  `/training-options.html` and `/training-options` redirect to `/programs.html`.
  Vercel permanent redirects are accompanied by static refresh/link fallbacks.
  The old forms and old shell are no longer alternate entry journeys.
- The existing verifier test now uses the public API handler, with local
  signing keys and offline JWKS/health responses. No production API behavior,
  Pilot project binding, credentials or remote request is changed.

## Before production

1. Confirm the final public address and access configuration. If the address
   changes, update all six canonicals/OG URLs/image URLs, the two legacy
   fallback canonicals, sitemap.xml and robots.txt together. Do not change DNS
   or protection as a side effect of source preparation.
2. If sportmyfitnessmke.com moves, preserve its existing `/book-online` provider
   journey. Redirecting that path to the same hostname would create a loop;
   the provider destination must be established first. Existing external
   booking actions remain unchanged in this review.
3. Complete permitted browser checks on all six pages at 360, 390 and 430px,
   desktop/Chromebook and affected breakpoints. Confirm crop/blend quality,
   complete subjects, unclipped bevels/focus, no horizontal scrolling, menu
   states, video/profile actions, forms and social previews. Source checks
   and READY metadata do not establish these outcomes.
4. Confirm current rates/availability, public business facts and primary-source
   dates/credentials. A restored filename does not establish a posting date.
5. With explicit authorization for a controlled inquiry, confirm provider
   activation, receipt and delivery to the intended mailbox. No valid inquiry
   has been sent by this work. Check an already installed legacy service
   worker on the final origin before changing its compatibility behavior.
6. Record the final source revision and actual prior production deployment for
   rollback, then release after the remaining acceptance gates are closed.

The authoritative detailed assessment is
`Sport_My_Fitness_Final_Prelaunch_Audit_2026-10-08.md`; its original audit
evidence and later remediation status distinguish source proof from live proof.
