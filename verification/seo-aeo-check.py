"""Focused prelaunch search checks. Never submits a form or contacts Google."""
import copy
import hashlib
from html.parser import HTMLParser
import importlib.util
import json
from pathlib import Path
import re
import subprocess
import tempfile
import unittest
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BASE = '63f3e5d20a0bb5b905de37ee707cd23e3251d2f1'
ROUTES = ['index.html', 'training.html', 'programs.html', 'yoshi.html', 'media.html', 'community.html', 'contact.html']
spec = importlib.util.spec_from_file_location('prepare_search', ROOT / 'design-tools/prepare-search.py')
prepare = importlib.util.module_from_spec(spec)
spec.loader.exec_module(prepare)


class Document(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.meta = {}; self.canonicals = []; self.scripts = []; self.active = None
        self.titles = []; self.in_title = False
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'meta':
            key = a.get('name', a.get('property', ''))
            self.meta.setdefault(key, []).append(a.get('content', ''))
        if tag == 'link' and a.get('rel') == 'canonical':
            self.canonicals.append(a.get('href'))
        if tag == 'script':
            self.active = {'attrs': a, 'text': ''}; self.scripts.append(self.active)
        if tag == 'title':
            self.in_title = True; self.titles.append('')

    def handle_data(self, text):
        if self.active is not None: self.active['text'] += text
        if self.in_title: self.titles[-1] += text

    def handle_endtag(self, tag):
        if tag == 'script': self.active = None
        if tag == 'title': self.in_title = False

    def graph(self):
        data = [s for s in self.scripts if s['attrs'].get('type') == 'application/ld+json']
        if len(data) != 1: raise AssertionError('Expected one structured-data block')
        return json.loads(data[0]['text'])['@graph']


class SearchPreparation(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.identity, cls.pages = prepare.load_data()
        cls.documents = {p: Document((ROOT / p).read_text()) for p in ROUTES}

    def test_seven_distinct_page_intents(self):
        self.assertEqual(set(self.pages), set(ROUTES))
        self.assertEqual(len({d.titles[0] for d in self.documents.values()}), 7)
        self.assertEqual(len({d.meta['description'][0] for d in self.documents.values()}), 7)
        for doc in self.documents.values():
            self.assertEqual(len(doc.titles), 1)
            for key in ['description', 'robots', 'og:title', 'og:description', 'og:url', 'og:image', 'twitter:title', 'twitter:description']:
                self.assertEqual(len(doc.meta[key]), 1, key)

    def test_official_domain_and_home_canonical(self):
        expected = ['https://sportmyfitness.com/' if p == 'index.html' else 'https://sportmyfitness.com/' + p for p in ROUTES]
        for route, url in zip(ROUTES, expected):
            doc = self.documents[route]
            self.assertEqual(doc.canonicals, [url])
            self.assertEqual(doc.meta['og:url'], [url])
            self.assertTrue(doc.meta['og:image'][0].startswith('https://sportmyfitness.com/assets/'))

    def test_every_prelaunch_page_is_noindex(self):
        for doc in self.documents.values():
            self.assertEqual(doc.meta['robots'], ['noindex,follow'])

    def test_encoding_and_viewport_stay_before_generated_data(self):
        for route in ROUTES:
            source = (ROOT / route).read_text()
            charset = re.search(r'<meta\b[^>]*charset[^>]*>', source, re.I)
            viewport = re.search(r'<meta\b[^>]*viewport[^>]*>', source, re.I)
            self.assertLess(len(source[:charset.start()].encode()), 1024, route)
            self.assertLess(viewport.start(), source.index(prepare.START), route)

    def test_sitemap_has_only_the_seven_canonical_pages(self):
        tree = ET.fromstring((ROOT / 'sitemap.xml').read_text())
        urls = [el.text for el in tree.findall('{*}url/{*}loc')]
        expected = {'https://sportmyfitness.com/' if p == 'index.html' else 'https://sportmyfitness.com/' + p for p in ROUTES}
        self.assertEqual(set(urls), expected)
        self.assertEqual(len(urls), 7)
        self.assertNotIn('Disallow: /', (ROOT / 'robots.txt').read_text())
        self.assertIn('Sitemap: https://sportmyfitness.com/sitemap.xml', (ROOT / 'robots.txt').read_text())

    def test_original_bodies_are_byte_identical(self):
        for route in ROUTES:
            before = subprocess.check_output(['git', 'show', BASE + ':' + route], cwd=ROOT)
            after = (ROOT / route).read_bytes()
            self.assertEqual(re.search(br'<body\b.*', before, re.I | re.S).group(), re.search(br'<body\b.*', after, re.I | re.S).group(), route)

    def test_executable_scripts_are_unchanged(self):
        for route, doc in self.documents.items():
            before = Document(subprocess.check_output(['git', 'show', BASE + ':' + route], cwd=ROOT, text=True))
            scripts = [s for s in doc.scripts if s['attrs'].get('type') != 'application/ld+json']
            self.assertEqual(before.scripts, scripts, route)

    def test_logo_photographs_styles_and_runtime_are_unchanged(self):
        result = subprocess.run(['git', 'diff', '--exit-code', BASE, '--', 'assets', '*.css', '*.js', 'vercel.json'], cwd=ROOT, capture_output=True)
        self.assertEqual(result.returncode, 0, result.stdout.decode())
        self.assertEqual(hashlib.sha256((ROOT / 'assets/brand/sport-my-fitness-original-lockup.png').read_bytes()).hexdigest(), '202f885d450df6330d8b0809f0c61f43a7ce940f7c870004c9bf6683178aad63')

    def test_schema_entity_identity_is_consistent(self):
        for route, doc in self.documents.items():
            nodes = doc.graph()
            website = next(n for n in nodes if n['@type'] == 'WebSite')
            self.assertEqual(website['publisher'], {'@id': 'https://sportmyfitness.com/#organization'})
            self.assertEqual(website['name'], 'Sport My Fitness')
            self.assertNotIn('solas', json.dumps(nodes).lower())
            self.assertNotIn('sport-my-fitness.vercel.app', json.dumps(nodes))

    def test_local_business_matches_visible_location(self):
        local = next(n for n in self.documents['contact.html'].graph() if n['@type'] == 'ExerciseGym')
        self.assertEqual(local['telephone'], '+14147914526')
        self.assertEqual(local['address']['streetAddress'], '4722 W Vliet St')
        self.assertEqual(local['address']['postalCode'], '53208')
        hours = {n['dayOfWeek']: (n['opens'], n['closes']) for n in local['openingHoursSpecification']}
        self.assertEqual(hours['Saturday'], ('10:30', '12:30'))
        self.assertEqual(hours['Sunday'], ('00:00', '00:00'))
        self.assertEqual(local['geo'], {'@type': 'GeoCoordinates', 'latitude': 43.0489075, 'longitude': -87.9732069})

    def test_coach_has_own_identity_and_actual_profile_links(self):
        person = next(n for n in self.documents['yoshi.html'].graph() if n['@type'] == 'Person')
        self.assertEqual(person['name'], 'Yoshi Barnes')
        self.assertEqual(person['sameAs'], ['https://www.instagram.com/yoshibarnes/', 'https://www.facebook.com/yoshi.barnes/', 'https://www.youtube.com/@yoshibarnes'])
        self.assertEqual(person['worksFor']['@id'], 'https://sportmyfitness.com/#organization')

    def test_no_unconfirmed_ratings_rights_or_undelivered_logo(self):
        for doc in self.documents.values():
            data = json.dumps(doc.graph())
            for unsupported in ['aggregateRating', 'copyrightNotice', 'license', 'creator', 'FAQPage', 'sport-my-fitness-smart.jpg']:
                self.assertNotIn(unsupported, data)
        self.assertFalse(self.identity['smartbrand']['rights_confirmed'])
        self.assertEqual(self.identity['smartbrand']['expected_sha256'], '0349a132474c265497fad5d884fd89adcb32bdeeb6ba6ef26baba2e27cf79487')

    def test_sharing_images_have_real_sizes(self):
        from PIL import Image
        for route, page in self.pages.items():
            picture = page['image']
            with Image.open(ROOT / picture['path']) as image:
                self.assertEqual(image.size, (picture['width'], picture['height']), route)
                self.assertEqual(Image.MIME[image.format], picture['type'])

    def test_metadata_does_not_send_visitors_to_old_booking_site(self):
        data = json.dumps(self.pages).lower()
        self.assertNotIn('existing gym website', data)
        self.assertNotIn('sportmyfitnessmke.com', data)
        self.assertIn('availability', self.pages['programs.html']['description'])

    def test_data_cannot_close_the_json_script(self):
        page = copy.deepcopy(self.pages['index.html'])
        attack = 'A & B </script><script>alert("x")</script>'
        page['title'] = attack
        page['description'] = attack
        doc = Document(prepare.render('<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Old</title></head><body>Kept</body></html>', self.identity, 'index.html', page))
        self.assertEqual(len(doc.scripts), 1)
        self.assertEqual(doc.titles, [attack])
        self.assertEqual(next(n for n in doc.graph() if n['@type'] == 'WebPage')['description'], attack)

    def test_preparation_is_repeatable_without_rewriting_files(self):
        for path, content in prepare.generated_files().items():
            self.assertEqual((ROOT / path).read_text(), content, path)

    def test_launch_is_blocked_until_origin_and_real_master_arrive(self):
        with self.assertRaisesRegex(ValueError, 'explicitly selected'):
            prepare.generated_files(mode='launch')
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            with self.assertRaisesRegex(ValueError, 'not been integrated'):
                prepare.verify_launch(self.identity, root, 'https://sportmyfitness.com')
            image = root / self.identity['smartbrand']['expected_asset_path']
            image.parent.mkdir(parents=True)
            image.write_bytes(b'not the approved master')
            with self.assertRaisesRegex(ValueError, 'differs from the immutable'):
                prepare.verify_launch(self.identity, root, 'https://sportmyfitness.com')


if __name__ == '__main__':
    unittest.main(verbosity=2)
