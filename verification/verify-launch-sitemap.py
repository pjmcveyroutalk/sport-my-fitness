"""Validate the prepared production sitemap against navigation and real routes.

Run locally before launch and when public pages change. This checks source files;
the separate launch checklist covers public availability and Search Console.
"""
import argparse
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
ORIGIN = "https://sportmyfitness.com"
NAMESPACE = "{http://www.sitemaps.org/schemas/sitemap/0.9}"


class Page(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.in_head = False
        self.in_primary = False
        self.canonicals = []
        self.meta = {}
        self.navigation = []
        self.feed(source)

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == "head":
            self.in_head = True
        if tag == "nav" and attrs.get("id") == "primary-nav":
            self.in_primary = True
        if tag == "a" and self.in_primary:
            self.navigation.append(attrs.get("href"))
        if not self.in_head:
            return
        if tag == "link" and "canonical" in attrs.get("rel", "").split():
            self.canonicals.append(attrs.get("href"))
        if tag == "meta":
            self.meta[attrs.get("property", attrs.get("name", ""))] = attrs.get("content", "")

    def handle_endtag(self, tag):
        if tag == "head":
            self.in_head = False
        if tag == "nav":
            self.in_primary = False


def require(condition, message):
    if not condition:
        raise ValueError(message)


def verify():
    config = json.loads((ROOT / "vercel.json").read_text())
    rewrites = {rule["source"]: rule["destination"] for rule in config["rewrites"]}
    redirects = {rule["source"] for rule in config["redirects"]}
    navigation = Page((ROOT / "index.html").read_text()).navigation
    require(len(navigation) == 8 and len(set(navigation)) == 8, "Expected eight distinct primary destinations")
    sitemap = ET.parse(ROOT / "sitemap.xml").getroot()
    require(sitemap.tag == NAMESPACE + "urlset", "Invalid sitemap namespace or root")
    entries = list(sitemap)
    require(all(entry.tag == NAMESPACE + "url" for entry in entries), "Unexpected sitemap element")
    urls = []
    for entry in entries:
        locations = entry.findall(NAMESPACE + "loc")
        require(len(locations) == 1 and locations[0].text, "Each entry needs one location")
        urls.append(locations[0].text.strip())
    require(len(urls) == len(set(urls)), "Duplicate sitemap locations")
    require(set(urls) == {ORIGIN + route for route in navigation}, "Sitemap must match the approved primary destinations")
    private_noindex = []
    image_count = 0
    for url in urls:
        parsed = urlsplit(url)
        require(parsed.scheme == "https" and parsed.netloc == "sportmyfitness.com", "Wrong public origin: " + url)
        require(not parsed.query and not parsed.fragment and parsed.path.endswith("/"), "Noncanonical location: " + url)
        require(parsed.path not in redirects and parsed.path in rewrites, "Location must resolve without a redirect: " + url)
        filename = ROOT / rewrites[parsed.path].lstrip("/")
        require(filename.is_file(), "Missing page: " + str(filename))
        source = filename.read_text()
        page = Page(source)
        require(page.canonicals == [url], "Canonical mismatch: " + filename.name)
        if "og:url" in page.meta:
            require(page.meta["og:url"] == url, "Social URL mismatch: " + filename.name)
        require("sport-my-fitness.vercel.app" not in source.split("</head>", 1)[0], "Preview origin remains in page metadata: " + filename.name)
        for name in ["og:image", "twitter:image"]:
            if name not in page.meta:
                continue
            image = urlsplit(page.meta[name])
            require(image.scheme == "https" and image.netloc == "sportmyfitness.com", "Wrong image origin: " + filename.name)
            require(image.path.startswith("/assets/") and (ROOT / image.path.lstrip("/")).is_file(), "Missing social image: " + filename.name)
            image_count += 1
        if "noindex" in page.meta.get("robots", "").lower():
            private_noindex.append(parsed.path)
    robots = [line.strip() for line in (ROOT / "robots.txt").read_text().splitlines() if line.strip()]
    require(robots == ["User-agent: *", "Allow: /", "Sitemap: " + ORIGIN + "/sitemap.xml"], "Robots directives or sitemap reference differ")
    require((ROOT / "infrastructure/review-gateway/robots.txt").read_text() == "User-agent: *\nAllow: /\n", "Public holding robots must retain its current directives")
    drafts = ["/privacy/", "/terms/", "/shipping-returns/", "/fitness-disclaimer/"]
    for route in drafts:
        require(ORIGIN + route not in urls, "Review draft exposed in sitemap")
        page = Page((ROOT / rewrites[route].lstrip("/")).read_text())
        require("noindex" in page.meta.get("robots", "").lower(), "Review draft lost noindex: " + route)
    return {
        "status": "PREPARED_FOR_APPROVED_LAUNCH",
        "sitemap": ORIGIN + "/sitemap.xml",
        "pages": len(urls),
        "urls": urls,
        "canonical_checks": len(urls),
        "social_image_checks": image_count,
        "draft_policy_pages_excluded": drafts,
        "source_noindex_retained_pending_launch_review": private_noindex,
        "public_launch_or_search_console_submission_performed": False,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--report", type=Path)
    arguments = parser.parse_args()
    result = json.dumps(verify(), indent=2) + "\n"
    if arguments.report:
        arguments.report.write_text(result)
    print(result, end="")
