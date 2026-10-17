# Approved visual reference

`approved-concept.webp` is PJ's supplied, approved desktop/menu/mobile board. It is
the composition authority, together with the original source-ad logo and the
later instruction to remove repeated page-end panels and footer navigation.

The first implementation at `e80dbf6` was rejected for visual mismatch even
though its browser behavior checks passed. In particular, its mobile artwork
was stacked above oversized text instead of forming the continuous hero behind
the headline. Passing technical checks does not establish a visual match.

The correction must retain:

- A compact black mobile header with the exact original logo and plain Menu control.
- Full-bleed blue waterfront artwork with no brush perimeter or diagonal slashes.
- Live headline and supporting copy over the image, including on mobile.
- Smaller mobile typography and close spacing into the mission/training rows.
- Smoked-glass navigation with seven text destinations, no generic fitness icons.
- The original motion timing/directions, useful actions and proportional photos.
- The approved removal of repeated next-page panels and footer navigation.

`assets/photos/smf-waterfront-hero-{800,1200,1585}.webp` are responsive encodings of
a background edit made with the built-in image editing tool. The prompt was to
extend the existing Milwaukee waterfront continuously, remove the painted edge
and diagonal graphics, and preserve Yoshi's identity, clothing and running pose
against the supplied board. This is a new review asset, not the unchanged old
brush composition. All original source photographs remain available. The exact
logo file is reused unchanged; it was not passed through image generation.

Visual acceptance requires inspecting the actual rendered desktop and mobile
pages alongside the board. Geometry checks catch the former stacking/scale
regression but do not replace that comparison or PJ's review.
