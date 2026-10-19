#!/usr/bin/env python3
"""Package only the public holding page; never copy the full review website."""
import argparse
import hashlib
from pathlib import Path
import shutil
import tempfile

ROOT = Path(__file__).resolve().parents[1]
FILES = {
    "index.html": "prelaunch/coming-soon/index.html",
    "404.html": "prelaunch/coming-soon/index.html",
    "robots.txt": "prelaunch/coming-soon/robots.txt",
    "vercel.json": "prelaunch/coming-soon/vercel.json",
    "assets/brand/sport-my-fitness-original-lockup.png": "assets/brand/sport-my-fitness-original-lockup.png",
    "assets/athletic-grain.svg": "assets/athletic-grain.svg",
    "assets/barlow-condensed-900-italic.woff": "assets/barlow-condensed-900-italic.woff",
    "assets/font-4.woff": "assets/font-4.woff",
}
LOGO_SHA256 = "202f885d450df6330d8b0809f0c61f43a7ce940f7c870004c9bf6683178aad63"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True,
                        help="New, absent directory outside this repository")
    output = parser.parse_args().output.resolve()
    if output == ROOT or ROOT in output.parents:
        parser.error("Output must be outside the repository to avoid publishing source files.")
    if output.exists():
        parser.error("Output already exists; choose a new directory. Nothing was overwritten.")
    for source in FILES.values():
        if not (ROOT / source).is_file():
            parser.error(f"Required asset is missing: {source}")
    logo = ROOT / FILES["assets/brand/sport-my-fitness-original-lockup.png"]
    if hashlib.sha256(logo.read_bytes()).hexdigest() != LOGO_SHA256:
        parser.error("Approved logo bytes changed; reconcile the branding handoff first.")
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = Path(tempfile.mkdtemp(prefix="smf-coming-soon-", dir=output.parent))
    try:
        for target, source in FILES.items():
            destination = temporary / target
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(ROOT / source, destination)
        temporary.rename(output)
    except BaseException:
        shutil.rmtree(temporary, ignore_errors=True)
        raise
    total = sum(path.stat().st_size for path in output.rglob("*") if path.is_file())
    print(f"Prepared {len(FILES)} public files ({total:,} bytes) at {output}")
    print("Not deployed. No full-site pages, API, service worker, sitemap or private access link included.")


if __name__ == "__main__":
    main()
