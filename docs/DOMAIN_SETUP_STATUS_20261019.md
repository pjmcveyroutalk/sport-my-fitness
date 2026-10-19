# Domain setup checkpoint — October 19, 2026

Scope: domain, hosting, public holding page and private review only. No full-site content edits.

## Completed
- Full-site Vercel project sport-my-fitness (prj_gekwpLHnnGbcuGHOp47ieG9C93xJ): All Deployments Vercel Authentication enabled.
- Signed-out audit of 49 aliases/paths/deployment URLs: 28 authentication-gated; 21 retired with HTTP 410; none returned full-site content.
- Created isolated static project sport-my-fitness-coming-soon (prj_KlCwsCvrYBPgY5gcvKcQmpvaAGT5), same Routalk builder team. No Git repository connected. Exactly eight allowlisted files deployed.
- Deployment dpl_6Ych1kgHuF3VSaNyRHyHu4kHnipi READY.
- Public holding page: https://sport-my-fitness-coming-soon.vercel.app/
- Browser inspection confirmed original proportional logo, textured background, Coming soon copy, call/email links, and no full-site navigation.
- Live HTTP: root, original logo, robots.txt return 200 and byte-match prepared package. X-Robots-Tag noindex,nofollow present. /contact.html, /yoshi.html and /api/inquiry return real 404.
- sportmyfitness.com and www.sportmyfitness.com assigned to holding project. www configured to temporarily redirect to apex (307).

## DNS remains unchanged / next blocker
Namecheap browser is signed out. Secure sign-in could not attach to the form; manual browser handoff required.
Before editing, save full current registrar DNS inventory and preserve MX/TXT/email records.
Vercel get_domain_config after project assignment returned:
- Apex current A: 162.255.119.211; recommended A target: 76.76.21.21.
- www current CNAME: parkingpage.namecheap.com.; recommended CNAME target: cname.vercel-dns.com.
- Nameservers: dns1.registrar-servers.com and dns2.registrar-servers.com.
- Both domains still misconfigured. Vercel domain ownership verification is not DNS/HTTPS completion.

## Remaining
1. Sign in to Namecheap, save all existing DNS records, then apply only required web-hosting records.
2. Verify apex/www DNS, HTTPS and redirects.
3. Confirm actual hosting plan and recurring cost; no billing/plan changes made.
4. Arrange Yoshi's named Vercel review access. Only PJ owner membership confirmed; no invitation or bypass link sent.
5. Review access exceptions/bypasses as needed; repository remains public, so deployment authentication does not protect source. Repository visibility unchanged, pending owner decision.
6. Prepare Google ownership verification. Full sitemap submission, indexing launch and GBP website publication remain deferred.
7. Recheck privacy after future deployments/access changes.

No DNS, email, billing, repository visibility or Google account changes were made in this setup step.
