# Sport My Fitness — Current Project State

Updated October 16, 2026 (America/Chicago). This is the current continuation point.

## Current correction — supersedes the completion claim below

PJ rejected the first implemented preview for failing to match the approved
composition. Its passing behavior/layout checks did not prove design fidelity.
Use `docs/design/approved-concept.webp` as the visual authority. The active
correction replaces the brush-edged Home hero with continuous waterfront art,
layers live type over that image on mobile, reduces mobile headline scale and
section spacing, and uses a smaller, plain mobile Menu control. The exact logo
and Blender motion data remain unchanged. Desktop/mobile screenshots and a
corrected preview are the pending acceptance evidence. Earlier verification
results below describe the rejected implementation and are historical only.

## Controlling decisions

PJ approved the black/turquoise desktop, expanded glass menu and mobile mockup on October 16, then authorized implementation. The supplied Sport My Fitness ad is the logo authority. Use its original stacked symbol/wordmark/“SPORT YOUR BEST SELF.” artwork, without redrawing or rearranging it.

Latest instructions supersede older visual handoffs and the former requirement to preserve every next-step panel: remove redundant page-end buttons and repeated content; retain each page's original movement; size every photograph proportionally. Keep useful contextual booking, inquiry, media and source actions.

## Implementation branch

- Repository: `pjmcveyroutalk/sport-my-fitness`
- Working branch: `review/approved-glass-20261017`
- Parent: `review/cinematic-recovery-20261016` at `44a68c32abcf51e4bc5f8225efddeefff5d71487`
- Technical motion/photo source: `03a1796faeadd8aa49ae221d2e5e81cc2196c638`
- Production remains `main` at `c6b209895aa01b7d419fa445d4c31d39ef90b920` until a separate release.
- Public production URL: https://sport-my-fitness.vercel.app/

## Applied changes

| Area | Current behavior |
| --- | --- |
| Branding | One original 1100×725 logo crop, preserving relative geometry, color and lettering; proportional scaling only. |
| Navigation | Fixed narrow desktop rail; mobile header control; smoked-glass modal menu with all seven routes and the current page. |
| Accessibility/fallback | Native modal plus explicit Tab boundaries, synchronous close/focus restoration, Escape and backdrop/root-edge close; a single server-rendered native details menu works without JavaScript or if the menu script fails. Its links are moved into the modal, never duplicated. |
| Page endings | Removed all seven next-step panels and repeated footer menus/wordmarks. Footer contains one copyright/location line. |
| Repetition | Home retains the mission and brand eyebrow; removed their repeats on inner pages, the duplicate responsive portrait credit, redundant film caption, repeated Contact booking link and unnecessary platform pictograms. Useful contextual actions remain. |
| Presentation | `site-design.css` is the active shared design; older per-page, white/diamond/brush styles are inactive. `site-menu.js` is the only active menu controller. |
| Photography | All original photo files/srcsets retained, natural aspect ratios, no fixed-height distortion or decorative alpha masks. The gym viewport removes only the artwork’s unused transparent canvas. Captions and source destinations remain. |
| Motion | Original Blender curves and six inner-page timing/directions retained. Home uses the previously requested photo-from-left → settle → headline-from-above sequence. Photos enter as opaque layers; reduced-motion, interruption and static fallbacks remain. |
| Contact | Same external form action, fields, validation and booking destinations; menu code removed from the form script and its URL versioned for returning visitors. |

## Verified checkpoint

Checked runtime commit: `816330afffb09aa034ac228a8250720d1578248a`.

Review preview: https://sport-my-fitness-378k0v1tj-routalk-builder.vercel.app

The preview retains existing Vercel sign-in protection (HTTP 302 to `/sso-api`). No protection or production setting was changed. The public production site remains on the original `main` revision above.

[Approved design review run 38996388020](https://github.com/pjmcveyroutalk/sport-my-fitness/actions/runs/38996388020) passed on October 17 UTC / October 16 America/Chicago:

| Evidence | Result |
| --- | --- |
| Chromium 151 + WebKit 26.5 layouts | 70 cases pass; seven pages, widths 360/390/430/768/900/901/1334/1920 as recorded. |
| Image decoding/proportions | 210 checks pass; original photo files remain unchanged. |
| Menu journeys | 28 pass, including both Tab directions, Escape, close control, outside/root-edge clicks, real mouse/keyboard link activation and menu access from page bottom. |
| Original motion | 14 runs pass; original Blender data retained, requested Home sequence verified. |
| Safeguards | 17 pass, including no-JS/missing-script menus, reduced motion, input interruption, deep links, width boundary, unavailable/late motion data, history return, invalid inquiry fields and a stale legacy service-worker cache. |
| Content contract | All seven pages match substantive copy, rates, source assignments, contextual destinations, forms and SEO metadata after the approved duplicate removals. |
| Logo | Direct crop of the supplied original; zero differing pixels against that crop. |
| Visual inspection | All seven desktop/mobile pages, both menu views and eight motion recordings inspected. |

The complete browser data is in `verification/approved-design-browser-results-20261017.json`. `verification/approved-design-verification-20261017.json` records source hashes, the exact checked commit, preview and artifact identity. Final checkpoint-only documentation changes do not alter these checked runtime files.

The local container blocks Chrome's Unix sockets, and the Vercel sandbox operation returned 403. Repository CI provided the assistant-operated browser environment. PJ does not need to install dependencies or debug the tests. No physical-device, real email delivery, completed booking/payment or new Lighthouse score is claimed.

## Next step

Review the implemented preview with PJ. If release is authorized, recheck `main` and promote/merge this verified branch through the existing GitHub/Vercel workflow. Keep the original production identifiers for rollback. No further design implementation is pending in this work item.

`docs/CINEMATIC_BRIEF.md` and the October 11/12 screenshots remain historical reference material. They do not override the approved October 16 design or the latest duplicate-removal decision. No framework, hosting migration, wallet work or unrelated projects are in scope.
