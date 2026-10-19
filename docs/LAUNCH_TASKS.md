# Sport My Fitness — current launch task list

Updated October 19, 2026 (UTC). This is the working checklist for this website. The
SmartBrand product and final branding kit remain in their separate workstream.
The Vercel website is currently public; official-domain launch is pending.

## Immediate milestone: domain with public holding page and private review

Tomorrow's requested setup is **not the full website launch**. Follow
[DOMAIN_SETUP_20261019.md](DOMAIN_SETUP_20261019.md) in order: confirm domain/DNS
access and save rollback values; protect the existing full-site project with
All Deployments authentication; grant Yoshi named review access; publish only
the isolated Coming soon package; connect root/www and verify DNS, HTTPS,
signed-out privacy, contact actions and email preservation. Verify Google
ownership now if available; full sitemap submission and GBP website publication
wait for the finished website. No live infrastructure change has been made.

The prepared package is built with `design-tools/package-coming-soon.py` from
`prelaunch/coming-soon/`. It uses the exact approved logo and existing texture/fonts.
The recommended access method is free Vercel account sign-in; a shared-password
option remains a separate paid decision. Existing public links, bypasses and
repository visibility are explicit checks in the setup runbook.

## Full website launch tasks

| ID | Task | Owner | Current state / completion evidence |
| --- | --- | --- | --- |
| L01 | Collect Yoshi's change requests; confirm services, prices, hours, biography, contact details and image choices. | Yoshi / PJ | Waiting on client input. |
| L02 | Confirm domain control, hosting plan and Google account access. | Yoshi / PJ | Purchased `sportmyfitness.com` is the target. Registrar/DNS access, hosting plan/cost, HTTPS and Google ownership remain unverified. Tomorrow's holding-page setup is documented separately above. |
| L03 | Receive and apply final branding kit. | Branding session / website session | Exact master/domain contract prepared; latest kit import, rights state and visual application pending. |
| L04 | Combine client changes and final branding into one review version. | Website session / Yoshi | Waiting on L01 and L03; preserve current movement and clean navigation. |
| L05 | Confirm the inquiry path works through actual mailbox receipt. | Yoshi / website session | Form configuration is preserved; activation and real delivery not proven. Obtain authorization for one controlled test. Confirm whether a separate booking system is needed. |
| L06 | Prepare seven-page SEO metadata and business/coach structured data. | Website session | Implemented in the prelaunch preparation branch. Local verification is recorded in `verification/seo-aeo-prep-20261017.json`; final-domain and Google validation remain pending. |
| L07 | Prepare concise AEO answers without repeated site sections. | Website session / Yoshi | Draft ready in `docs/seo-aeo/AEO_ANSWER_DRAFT.md`; owner questions flagged, visible page bodies unchanged. |
| L08 | Final review of the integrated website. | Website session / Yoshi | After L04/L05: mobile/desktop, accessibility, performance, navigation, actual contact flow and approval. Reuse passed evidence where code has not changed. |
| L09 | Replace the holding page with the approved full website and migrate intended URLs. | Domain owner / website session | After final approval: reassign root/www, check project-specific DNS/HTTPS, canonical host, relevant old URL redirects and assets. Regenerate launch mode; verify intended public pages have no accidental noindex while previews remain protected. |
| L10 | Update the existing Google Business Profile. | Profile owner / website session | After final domain: website, accurate name/address/phone, category/services, hours and approved photos. No profile mutation performed. |
| L11 | Verify Search Console and submit the final sitemap. | Property owner / website session | After L09: inspect key pages, request indexing where useful, record the accepted sitemap and actual indexing results separately. |
| L12 | Measure search visibility and real inquiries. | PJ / website session | Record dated baseline, then useful post-launch reviews; no ranking or AI-citation improvement is claimed yet. |

## Current preparation milestone

- Seven unique Milwaukee/service-focused titles, descriptions and sharing tags.
- Canonical metadata and the seven-page sitemap prepared for the official domain.
- Organization on Home, accurate local business details/hours on Contact,
  separate Yoshi Person identity, and connected WebSite/WebPage entities.
- All preparation pages explicitly `noindex,follow`; production is unchanged.
- No unconfirmed ratings, credentials, event dates, creator or licensing claims.
- No visible FAQ block added; answers are drafted against existing page sections.
- SmartBrand website integration contract prepared; no logo bytes edited.

## Next handoff

Start with the domain/private-review runbook for October 19. Continue branding
and Yoshi's changes inside the protected review site. Reconcile the immutable
master and business facts, combine the review changes, then complete full public
launch and Google setup under the owner's authorization. A ready deployment,
crawl request, Google indexing and an AI citation remain distinct milestones.
