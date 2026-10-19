# Sport My Fitness — domain and private review setup

Prepared for Monday, October 19, 2026. This is a preparation checklist, not a
record of completed DNS, hosting or access changes. The full website remains at
its existing public address until tomorrow's access changes are applied.

## Intended result

| Audience | Address / destination | What they can see |
| --- | --- | --- |
| Public | `https://sportmyfitness.com/` | Branded Coming soon page, one call action and one email action. |
| Public using www | `https://www.sportmyfitness.com/` | Redirect to the root domain above. |
| PJ and Yoshi | Existing full-site Vercel project, behind sign-in | All seven website pages for continued review and client changes. |
| Signed-out visitor with an old full-site link | Every production alias, branch URL, deployment URL and direct asset/API path | Authentication gate, never the full review website. |

Use a small temporary Vercel project containing **only** the holding-page package.
Keep the existing `sport-my-fitness` project as the protected full-site review
project. This separates the public files from the private website and keeps the
existing full-site deployment and Git integration available for the eventual
launch. No hosting migration or new website framework is needed.

## Access recommendation

Use **Vercel Authentication → All Deployments** on the full-site project. PJ signs
in with his existing account; Yoshi signs in with her own Vercel account and
requests access to the agreed review branch. Approve her request only after
matching her account with her directly. Use the least access needed to review,
without billing or deployment permissions. Check current team/project access so
only the intended reviewers and necessary account administrators have access.

Vercel's September 9, 2026 announcement makes this protection scope available
on every plan at no additional protection charge. Current docs allow one external
reviewer per Hobby account; existing grants and actual plan must be checked.
A shared-password alternative currently costs $20/month per protected project
on Pro (legacy plans differ); the base hosting plan is separate. No paid option
has been enabled or purchased. Do not place a password in public HTML/JavaScript,
GitHub, the checklist or a URL. Named sign-in is the recommended default.

Review all protection exceptions, existing shareable bypass links, automation
bypasses and granted users. Do not create a public bypass link for convenience.
Retain only required automation access; revoke unneeded reviewer bypasses after
confirming they are safe to remove. An access change is complete only after
signed-out checks and successful access by both PJ and Yoshi.

## Tomorrow's ordered tasks

| Order | Task | Owner | Done when |
| --- | --- | --- | --- |
| 1 | Confirm the registrar/DNS provider, domain ownership and account access. Export current DNS and record the current destination, nameservers and TTL. Confirm the existing Vercel hosting plan supports business use and its cost. | PJ / domain owner | Owner can manage `sportmyfitness.com`; restore values are saved privately. Keep email MX, SPF, DKIM, DMARC and other verification records. |
| 2 | Review the prepared Coming soon page and confirm public call/email details. | PJ / Yoshi | Approved original logo, proportional size, clean mobile/desktop layout and working call/email actions. No promised launch date or duplicate navigation. |
| 3 | Audit current access and enable All Deployments protection on the full-site project. Arrange Yoshi's named review access. | PJ / website session / Yoshi | Full-site root, all seven page URLs, old aliases, direct images/API and relevant bypass settings checked. PJ and Yoshi can review; a fresh signed-out session cannot. |
| 4 | Publish only the isolated holding-page package to a clearly named temporary project, e.g. `sport-my-fitness-coming-soon`. | Website session | Its deployment contains exactly the eight allowlisted public files. `/contact.html`, `/yoshi.html`, `/api/inquiry` and full-site images are absent; custom 404 returns HTTP 404. |
| 5 | Add root and www domains to that temporary public project. Read the actual DNS targets and any ownership TXT value Vercel returns. | Website session / domain owner | Exact project-specific values are recorded. No generic IP or CNAME is guessed. Registrar transfer is unnecessary. |
| 6 | Update only the required web DNS records at the authoritative DNS provider. Configure www → root and verify both hosts. | Domain owner / website session | Both names resolve correctly; unrelated DNS/email records remain intact. No nameserver change unless separately needed and fully reconciled. |
| 7 | Verify HTTPS, redirects, public layout and private access from fresh sessions. | Website session / PJ / Yoshi | Valid certificates for root and www; HTTP reaches HTTPS without loops. Public sees the holding page; private site stays gated. Test mobile and Chromebook/desktop. |
| 8 | Prepare Google ownership and analytics account access. Keep launch indexing separate. | PJ / Yoshi / website session | Search Console domain-property TXT verification can be added now. Existing GBP ownership and GA4 access are confirmed. Do not submit the full sitemap or change GBP website to the placeholder. |
| 9 | Save a dated handoff with the final public URL, private review URL, authorized reviewers, DNS/certificate checks, project IDs and rollback destinations. | Website session | PJ and Yoshi have their appropriate working links. Keep secrets/access tokens out of screenshots and the public repository. |

## Prepared files and packaging

The draft uses the existing exact full-logo PNG, site fonts, charcoal/turquoise
planes and grain. The separate branding-kit integration remains its own pending
step. There is no fake login UI, countdown, newsletter collection, tracking script,
public private-review link, full-site menu or external booking redirect.

From the preparation branch, build into a **new directory outside the repository**:

```bash
python3 design-tools/package-coming-soon.py --output /tmp/smf-coming-soon-20261019
```

Deploy that output directory alone to the temporary project. Do not deploy the
repository root as the public holding site. The root contains the complete
website and prepared SEO pages. The packager checks the approved logo SHA-256,
copies eight explicit files and refuses an existing output directory.
`404.html` reuses the branded message while preserving an unknown URL's 404 status.
The holding page has HTML and HTTP `noindex`; robots.txt allows crawlers to read
that directive. There is no public sitemap in the package. Neither `noindex` nor
robots.txt provides privacy; the full site's host-level authentication does that.

## Checks before calling tomorrow's setup complete

- [ ] Root and www show the approved holding page over HTTPS, with one canonical host.
- [ ] Public package has no full-site pages, confidential data, API or service worker.
- [ ] A fresh signed-out browser is challenged at the full site's root, all seven
  pages, direct assets/API, historic deployment URLs and branch aliases.
- [ ] PJ and Yoshi can both access the complete review version on their own devices.
- [ ] Existing public/cached full-site URLs and any indexed copies are inventoried.
  Authentication cannot retract content already downloaded or copied.
- [ ] Source-repository visibility is explicitly decided: the GitHub repository is
  currently public. Hosting protection does not make public source or images private.
  If source privacy is intended too, address repository visibility and its copies.
- [ ] HTTPS, www redirect, contact links, noindex headers and real 404 status pass.
- [ ] Existing domain email works and its DNS entries are preserved.
- [ ] A concise private handoff records destinations and rollback steps, without secrets.

## Full launch later — a separate milestone

1. Receive Yoshi's requested changes, finish branding-kit integration and approve
   the final review version while preserving photos, original movement and menu.
2. Prove inquiry delivery with one authorized test received by Yoshi. Finish the
   owner-confirmed service, price, hours and business-fact review.
3. Integrate prepared SEO/AEO metadata and visible answers as approved. Generate
   launch mode for the seven intended public pages; verify canonical URLs,
   structured data, social previews, robots.txt, sitemap and no accidental noindex.
4. Prepare the final project as public only for intended production domains, keep
   preview protection, and move the root/www domain assignments from the temporary
   project to the approved full-site deployment. Re-check any project-specific DNS
   targets Vercel returns. Keep the holding page available until the switch passes.
5. Verify final URLs, HTTPS, redirect paths, navigation, mobile/desktop, fonts,
   images, original motion and actual inquiry flow. The old Vercel public alias
   must redirect appropriately or remain protected, not become a duplicate website.
6. Submit the final sitemap in Search Console, inspect key URLs, and update the
   existing GBP website to the final working domain. Configure approved GA4/key
   events and record a baseline. Indexing, rankings and AI citations are outcomes
   to measure, not guarantees. The SmartBrand integration is not an indexing substitute.

If final launch checks fail, reassign root/www to the verified holding-page
deployment and restore any changed web DNS targets from the recorded values.
Keep the full-site project protected. Do not restore an older public full-site
deployment or weaken protection as a rollback. For a domain-setup failure, use the
saved original DNS values and verify resolution/email after restoration.

## Current observations and limits

Read-only connector checks on October 19 UTC found project
`prj_gekwpLHnnGbcuGHOp47ieG9C93xJ` (`sport-my-fitness`), team `Routalk builder`,
with `sport-my-fitness.vercel.app` as its sole configured domain. The connector
reports SSO enabled with scope `all_except_custom_domains` and password protection
disabled. This setting is not proof that every existing URL is private: the
previously released production alias is public. Tomorrow's All Deployments setting
and fresh behavioral checks are required. The team's plan/billing detail was not
returned, so no existing entitlement or bill is asserted. Registrar access and
Yoshi's Vercel account are not yet verified. No live DNS, project, access, billing,
Google profile or production deployment was changed for this preparation.

## Official guidance checked

- [Vercel: full-deployment authentication is free on every plan, September 9, 2026](https://vercel.com/changelog/protect-production-deployments-for-free-on-every-plan)
- [Vercel Authentication: named access, requests and reviewer limits](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication)
- [Vercel Password Protection: current pricing](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/password-protection)
- [Vercel: domain setup, actual DNS recommendations and HTTPS](https://vercel.com/docs/domains/set-up-custom-domain)
- [Google: private content versus noindex](https://developers.google.com/search/docs/crawling-indexing/control-what-you-share)
