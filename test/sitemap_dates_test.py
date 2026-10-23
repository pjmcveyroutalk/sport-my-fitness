"""Exercise date provenance using real isolated Git histories."""
import importlib.util
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

SPEC = importlib.util.spec_from_file_location("sitemap_builder", Path(__file__).resolve().parents[1] / "design-tools/build-sitemap.py")
BUILDER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(BUILDER)


class ContentDates(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        subprocess.run(["git", "init", "-q", str(self.root)], check=True)
        self.git("config", "user.name", "Sitemap fixture")
        self.git("config", "user.email", "fixture@example.invalid")
        self.write("page.html", "<head>One</head><main>Content one</main><footer>One</footer>")
        self.write("image.png", "image one")
        self.commit("2026-01-01T12:00:00Z")

    def git(self, *args, **kwargs):
        return subprocess.check_output(["git", "-C", str(self.root), *args], stderr=subprocess.PIPE, **kwargs).decode().strip()

    def write(self, name, value):
        (self.root / name).write_text(value)

    def commit(self, date):
        self.git("add", ".")
        environment = dict(os.environ, GIT_AUTHOR_DATE=date, GIT_COMMITTER_DATE=date)
        self.git("-c", "commit.gpgsign=false", "commit", "-qm", "fixture change", env=environment)

    def test_head_and_footer_changes_keep_the_content_date(self):
        self.write("page.html", "<head>Two</head><main>Content one</main><footer>Two</footer>")
        self.commit("2026-01-02T12:00:00Z")
        self.assertEqual(BUILDER.content_date(self.root, "page.html", ["image.png"])[1], "2026-01-01T12:00:00Z")

    def test_main_content_changes_advance_the_date(self):
        self.write("page.html", "<head>One</head><main>Content two</main><footer>One</footer>")
        self.commit("2026-01-03T12:00:00Z")
        self.assertEqual(BUILDER.content_date(self.root, "page.html", ["image.png"])[1], "2026-01-03T12:00:00Z")

    def test_content_image_or_data_changes_advance_the_date(self):
        self.write("image.png", "image two")
        self.commit("2026-01-04T12:00:00Z")
        self.assertEqual(BUILDER.content_date(self.root, "page.html", ["image.png"])[1], "2026-01-04T12:00:00Z")

    def test_uncommitted_content_cannot_borrow_an_old_date(self):
        self.write("page.html", "<main>Uncommitted replacement</main>")
        with self.assertRaisesRegex(ValueError, "Commit the main-content change"):
            BUILDER.content_date(self.root, "page.html", ["image.png"])

    def test_uncommitted_image_cannot_borrow_an_old_date(self):
        self.write("image.png", "uncommitted replacement")
        with self.assertRaisesRegex(ValueError, "Commit the content dependency"):
            BUILDER.content_date(self.root, "page.html", ["image.png"])

    def test_shallow_history_is_not_treated_as_a_known_creation_date(self):
        clone = self.root / "shallow"
        subprocess.run(["git", "clone", "--depth=1", "--quiet", self.root.as_uri(), str(clone)], check=True)
        with self.assertRaisesRegex(ValueError, "Fetch more Git history"):
            BUILDER.content_date(clone, "page.html", [])


if __name__ == "__main__":
    unittest.main()
