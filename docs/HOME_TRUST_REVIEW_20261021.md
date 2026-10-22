# Homepage trust and headline review — October 21, 2026

Status: design review only. Main and the approved live website are unchanged.
Baseline: `e07c1556cef0423842afbf706a8c42c0315ebf87`.

## Design fit

Xin’s manufacturing example uses specific business facts to answer why a visitor
should choose the company. For Sport My Fitness, trainer qualifications,
community work, independent media coverage and a named client review are more
relevant than large numerical tiles. Put a small amount of evidence beside the
existing headline so it does not add height or move the accepted actions.

| Concept | Actual proposed copy | Reason to choose it |
| --- | --- | --- |
| A — Open badges | Certified trainer / ISSA certification; Community focused / Milwaukee, WI | Closest to Xin’s annotated example; friendly and restrained. |
| B — Experience panel | ISSA / Certified trainer; MATC / Wellness instructor; TMJ4 / Fitness Friday guest | Most concrete evidence in the available space. |
| C — Client words | A faithful excerpt of B. Thorn’s existing review; certified trainer on larger layouts | Gives the visitor a human reason to choose Yoshi. No aggregate rating is inferred. |

These are website information treatments, not third-party accreditation seals.
“Community supported” or “community trusted” should be supported by specific
client words or named work; the mockup uses the narrower “community focused.”
Do not invent client totals, years of coaching, success rates or weight-loss
outcomes. Keep the detailed athletic achievements on Train with Yoshi instead
of fitting the whole biography into Home.

## Evidence and wording

- ISSA certification: retained from the approved biography in `training.html`.
  A current certificate has not been independently inspected in this review.
- MATC: Yoshi’s own October 19 correction identifies her as an instructor in
  Health and Wellness and Mental Health Performance. “Wellness instructor” is
  a short description, not a medical or counseling credential.
- Community: the existing approved coaching, youth and school involvement
  supports a community focus. No institution endorsement is implied.
- TMJ4: the station’s own archive says Yoshi Barnes with Sport My Fitness
  joined Live at Four for a Fitness Friday segment on stretching:
  https://www.tmj4.com/on-air/fitness-friday-all-about-stretching
- B. Thorn: existing client review in `training.html`. The mockup quotes the
  first sentence verbatim and retains the reviewer’s name. No aggregate stars
  or customer outcomes are inferred.
- Athletics: SJSU’s archive lists Myosha Barnes as a January 22, 2007 Spartan
  Foundation Student-Athlete of the Week. The migrated 2018 page date is not
  the award date. More detailed verified athletic sources remain in
  `ON_THE_COURT_SOURCES_20261019.md`.

## Headline system

`headline-system.css` uses the existing Barlow Condensed heavy italic for major
section and item headings, matching the approved hero. Secondary h2 headings
use a smaller 44–64px scale. The current hero sizes, strokes, lettering,
original logo, body copy, small labels and all existing motion remain intact.
The small Contact location label retains its label treatment.

The shared link is demonstrated on all eight review-branch pages. The three
trust treatments are separate review pages generated from the current Home by
`design-tools/build-home-trust-mockups.py`. Home on main is not changed.

## Implementation limits

The original photograph, headline spans, support text and action rectangles
must match the baseline at every checked size. New proof is absolutely placed
in unused heading space and reveals after the existing entrance finishes.
No changes to `site-motion.js`, `site-motion.css` or its curve data are needed.
Reduced motion, interrupted entrances and no-JavaScript views retain proof.

The focused browser workflow change exists only on this review branch. Never
merge its temporary replacement of the full production review suite.
Deployment approval and a chosen trust treatment are still pending PJ’s review.
Setup, branding-kit and payment sessions remain separate.
