"""Build the launch sitemap with content-backed dates and optional crawl hints."""
import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import re
import subprocess
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
ORIGIN = "https://sportmyfitness.com"
NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
# Preferences, not publication schedules or promises about search rankings.
PAGES = [
    ("/home/", "weekly", "1.0"),
    ("/apparel/", "weekly", "0.9"),
    ("/yoshis-book/", "monthly", "0.8"),
    ("/training/", "monthly", "0.9"),
    ("/programs/", "monthly", "0.9"),
    ("/media/", "weekly", "0.7"),
    ("/community/", "monthly", "0.7"),
    ("/contact/", "monthly", "0.8"),
]


def git(root, *arguments):
    return subprocess.check_output(["git", "-C", str(root), *arguments], stderr=subprocess.PIPE).decode().strip()


def main_content(source):
    match = re.search(r"<main\b[\s\S]*?</main>", source, re.IGNORECASE)
    if not match:
        raise ValueError("Cannot determine the page's main content")
    return match.group(0)


def timestamp(root, commit):
    return datetime.fromisoformat(git(root, "show", "-s", "--format=%cI", commit)).astimezone(timezone.utc)


def main_revision(root, filename):
    """Find the latest actual main-content change, ignoring head/footer edits."""
    source = (root / filename).read_text()
    if main_content(source) != main_content(git(root, "show", "HEAD:" + filename)):
        raise ValueError("Commit the main-content change before deriving lastmod: " + filename)
    shallow_path = Path(git(root, "rev-parse", "--git-path", "shallow"))
    if not shallow_path.is_absolute():
        shallow_path = root / shallow_path
    shallow = shallow_path.read_text().splitlines() if shallow_path.exists() else []
    commits = git(root, "log", "--first-parent", "--format=%H", "--", filename).splitlines()
    for commit in commits:
        if commit in shallow:
            raise ValueError("Fetch more Git history to verify lastmod for " + filename)
        current = main_content(git(root, "show", commit + ":" + filename))
        parent = subprocess.run(["git", "-C", str(root), "show", commit + "^:" + filename], capture_output=True)
        if parent.returncode or current != main_content(parent.stdout.decode()):
            return commit, timestamp(root, commit)
    raise ValueError("No verified content revision: " + filename)


def content_date(root, filename, dependencies):
    commit, modified = main_revision(root, filename)
    for dependency in dependencies:
        if not (root / dependency).is_file():
            raise ValueError("Missing content dependency: " + dependency)
        if git(root, "hash-object", dependency) != git(root, "rev-parse", "HEAD:" + dependency):
            raise ValueError("Commit the content dependency before deriving lastmod: " + dependency)
    if dependencies:
        dependency_commit = git(root, "log", "-1", "--format=%H", "--", *dependencies)
        dependency_date = timestamp(root, dependency_commit)
        if dependency_date > modified:
            commit, modified = dependency_commit, dependency_date
    if modified > datetime.now(timezone.utc):
        raise ValueError("Content revision date is in the future: " + filename)
    return commit, modified.strftime("%Y-%m-%dT%H:%M:%SZ")


def build(root=ROOT):
    rewrites = {item["source"]: item["destination"].lstrip("/") for item in json.loads((root / "vercel.json").read_text())["rewrites"]}
    ET.register_namespace("", NS)
    sitemap = ET.Element("{" + NS + "}urlset")
    evidence = []
    for route, frequency, priority in PAGES:
        filename = rewrites[route]
        fragment = main_content((root / filename).read_text())
        dependencies = sorted(set(re.findall(r"assets/[a-zA-Z0-9_./-]+\.(?:webp|png|jpe?g|svg|json)", fragment)))
        if route == "/apparel/":
            dependencies.append("assets/apparel/catalog.json")
        commit, modified = content_date(root, filename, dependencies)
        entry = ET.SubElement(sitemap, "{" + NS + "}url")
        for tag, value in [("loc", ORIGIN + route), ("lastmod", modified), ("changefreq", frequency), ("priority", priority)]:
            ET.SubElement(entry, "{" + NS + "}" + tag).text = value
        evidence.append({"route": route, "lastmod": modified, "content_commit": commit, "content_dependencies": dependencies, "changefreq": frequency, "priority": priority})
    ET.indent(sitemap, space="  ")
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(sitemap, encoding="unicode") + "\n"
    return xml, {"pages": len(evidence), "source": "Committed main-content markup and referenced image/data files", "entries": evidence}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--report", type=Path)
    options = parser.parse_args()
    xml, report = build()
    if options.check:
        if (ROOT / "sitemap.xml").read_text() != xml:
            raise SystemExit("Sitemap is stale. Run python3 design-tools/build-sitemap.py after committing content changes.")
    else:
        (ROOT / "sitemap.xml").write_text(xml)
    if options.report:
        options.report.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))
