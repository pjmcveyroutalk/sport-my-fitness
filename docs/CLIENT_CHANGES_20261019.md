# Sport My Fitness — Yoshi's October 19 changes

Source: Yoshi's own adjustment list, forwarded by PJ on October 19, 2026.
This workstream covers website content. Domain, hosting, access protection,
Google account setup and the temporary Coming soon page are handled separately.

## Confirmed copy changes

| Request | Website treatment | State |
| --- | --- | --- |
| San José dates: 2005–2008 | About's college history now shows the full range instead of the single 2006–07 season. | Implemented; release verification pending. |
| Missouri Southern dates: 2008–2010 | About's college history now shows the full range instead of the single 2008–09 season. | Implemented; release verification pending. |
| Northcentral University: 2015–2020 | Added to About's background. No degree, program, graduation or completion claim is inferred from attendance dates. | Implemented; release verification pending. |
| MATC instructor | About states that she is an instructor at MATC, teaching Health and Wellness and Mental Health Performance. | Implemented; release verification pending. |
| St. Joan Antida contract work | About states that she contracts with St. Joan Antida, using the name supplied by Yoshi. | Implemented; release verification pending. |

These are owner-provided facts. They supersede the shorter basketball-season
labels in the historical content baseline. Existing biography, credentials,
schools, captions and attributions are retained. The rest of the website body,
logo, photos, aspect ratios, styles, navigation and original movement are unchanged.

## Pending material and decisions

| Request | Needed before implementation | Current treatment |
| --- | --- | --- |
| Main photo does not look like Yoshi | Identify the exact image if she means something other than the homepage running artwork; receive her approved replacement, or choose an existing real photograph with her approval. | Replacement pending. Do not generate or retouch a substitute likeness. |
| Apparel page | Approved apparel photos, item names/details, and whether this is a display page or needs an ordering path. Prices/sizes and order destination are needed if orders are intended. | Tracked; no empty public page, invented products or dead menu link. |
| Photos of Yoshi in class | Original photos she approves for use and any necessary context/captions. | Awaiting delivery; no placeholder classroom image. |
| Upcoming event | Event name, full date/year, time/timezone, location, description and contact/registration link, plus approved artwork if available. | No guessed date, event listing or signup destination. |

## Coordination with the setup session

The content candidate starts from public `main` checkpoint
`e837156581c5db40cbf515517c55f3449b4fbe78`, on review branch
`review/approved-glass-yoshi-content-20261019`. Only `yoshi.html` changes at runtime.
Do not merge either prelaunch branch's future-domain metadata/noindex settings into
production as part of these copy corrections. After release, the website-setup
session should bring the released content commit into its preparation branch
before the final domain launch. This session must not change DNS, hosting,
protection settings or billing.

Keep the main-photo rejection open until an approved replacement is actually
installed and checked in both page display and social-sharing image metadata.
Existing homepage art uses `assets/photos/smf-waterfront-hero-{800,1200,1585}.webp`;
Home's current sharing tags reference the earlier Milwaukee running artwork.
Changing only one of those would leave the rejected image in other placements.
