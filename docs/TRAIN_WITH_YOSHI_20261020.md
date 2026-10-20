# Train with Yoshi — page consolidation

PJ approved combining Training and About Yoshi into one page. This change is
website content/navigation work. Domain, account, Google and branding-kit setup
remain separate. The unapproved face-only Home preview remains unapplied.

## Accepted page flow

1. Training introduction, using the existing gym hero and original entrance.
2. Meet Yoshi: coaching approach, qualifications and the business's 2015 start.
3. Her background: organized college basketball and education bullets.
4. Teaching/community work: MATC, St. Joan Antida, school involvement and photos.
5. Client reviews, one training-inquiry action, and the existing social links.

The combined title and menu label are **Train with Yoshi**. Its canonical page
remains `training.html`. Programs & Rates remains a separate page. The menu now
has seven destinations: Home, Apparel, Train with Yoshi, Programs & Rates, Media,
Community and Contact. The apparel collection remains beneath Apparel, giving
eight active full pages in total.

## Preservation and compatibility

- Keep the original Training gym hero; no photo generation/replacement.
- All six distinct photographs from the two pages are retained once each,
  with their source credits, responsive sources and proportional dimensions.
- Keep the organized owner-supplied college/education dates, teaching roles,
  school names, basketball facts, client-review wording and official social SVGs.
- Move the youth/community introduction to its relevant section; introduce Yoshi
  once rather than keeping two separate introductory pages.
- Keep the exact shared design, textured palette, logo assets, appearance control,
  original motion code/curves, phone control, form, apparel content and rates.
- One small `training-merged.css` file supplies page-specific spacing and the
  single hero action layout; other pages do not load it.
- The hero links to Programs & Rates. The client-review section has one inquiry
  action to `contact.html#inquiry`. Do not restore bottom page-step navigation.
- `/yoshi.html` and `/yoshi` permanently forward to `/training.html` through
  the existing Vercel redirect configuration. Existing destination fragments,
  including `#story`, retain matching IDs on the combined page.
- `yoshi.html` is a small compatibility document for static hosting: JavaScript
  preserves its query/fragment, with a no-JavaScript refresh and a plain link.
- Remove the retired About URL from the current sitemap. Existing Training
  canonical/sharing URL stays the same; its title/description match the new page.
  No future-domain SEO preparation or account/indexing actions are imported.

## Verification and release

The existing Chromium/WebKit visitor workflow is updated for the seven-link
menu and the consolidated page. It checks ordered content, the owner-supplied
dates/roles, six non-duplicated photographs, inquiry/program destinations,
official platform marks, social spacing, appearance, layouts and original motion.
Legacy About navigation is exercised with and without JavaScript. Platform-level
redirects are checked on the deployment, since the CI static server does not
execute `vercel.json`.

See `verification/training-consolidation-20261020.json` for current evidence.
Browser and live evidence are recorded after those checks run; this document
does not itself claim they have passed.

The reliable human entry point remains `https://sportmyfitness.com/admin`.
After login, choose **Train with Yoshi** from the menu in that same tab. Standalone
private links from chat may arrive without the site's strict session cookie;
do not present them as public links or weaken preview protection to support them.
