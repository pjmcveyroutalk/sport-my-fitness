#!/usr/bin/env python3
"""Prepare static search metadata; does not publish, change DNS or submit URLs."""
import argparse
import hashlib
import html
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
START = '<!-- SMF SEARCH METADATA START -->'
END = '<!-- SMF SEARCH METADATA END -->'
BLOCK = re.compile(re.escape(START) + r'.*?' + re.escape(END), re.S)
BASELINE = '757d3b527652ebce6dd265254945a4a34fde237f'


def load_data(root=ROOT):
    identity = json.loads((root / 'seo/site-identity.json').read_text())
    pages = json.loads((root / 'seo/page-metadata.json').read_text())
    origin = urlsplit(identity['origin'])
    if (origin.scheme != 'https' or not origin.hostname or origin.username
            or origin.password or origin.path or origin.query or origin.fragment):
        raise ValueError('The official origin must be an HTTPS origin without a path or credentials.')
    for route, page in pages.items():
        if Path(route).name != route or not route.endswith('.html'):
            raise ValueError('Page routes must be root HTML filenames.')
        image = Path(page['image']['path'])
        if image.is_absolute() or '..' in image.parts or not (root / image).is_file():
            raise ValueError('Every sharing image must exist inside the website.')
    return identity, pages


def canonical(identity, route):
    return identity['origin'] + ('/' if route == 'index.html' else '/' + route)


def verify_launch(identity, root, approved_origin):
    if approved_origin != identity['origin']:
        raise ValueError('Final-domain launch must be explicitly selected; this is currently prelaunch preparation.')
    expected = identity['smartbrand']
    relative = Path(expected['expected_asset_path'])
    if relative.is_absolute() or '..' in relative.parts:
        raise ValueError('The approved logo must be a local website asset.')
    asset = root / relative
    if not asset.is_file():
        raise ValueError('The approved SmartBrand JPEG has not been integrated yet.')
    data = asset.read_bytes()
    if (len(data) != expected['expected_bytes']
            or hashlib.sha256(data).hexdigest() != expected['expected_sha256']):
        raise ValueError('The SmartBrand JPEG differs from the immutable approved master.')


def graph(identity, route, page, mode):
    origin = identity['origin']
    business_id = origin + '/#organization'
    website_id = origin + '/#website'
    coach_id = origin + '/yoshi.html#person'
    url = canonical(identity, route)
    website = {
        '@type': 'WebSite', '@id': website_id, 'url': origin + '/',
        'name': identity['name'], 'inLanguage': 'en-US',
        'publisher': {'@id': business_id}
    }
    webpage = {
        '@type': page['page_type'], '@id': url + '#webpage', 'url': url,
        'name': page['title'], 'description': page['description'],
        'inLanguage': 'en-US', 'isPartOf': {'@id': website_id},
        'about': {'@id': coach_id if route == 'yoshi.html' else business_id}
    }
    nodes = [website, webpage]
    if route in ('index.html', 'contact.html'):
        organization = {
            '@type': 'ExerciseGym' if route == 'contact.html' else 'Organization',
            '@id': business_id, 'url': origin + '/', 'name': identity['name'],
            'alternateName': identity['alternate_name'], 'description': identity['description'],
            'telephone': identity['telephone'], 'email': identity['email'],
            'sameAs': identity['business_profiles'] + [identity['maps_url']]
        }
        if route == 'contact.html':
            organization.update({
                'address': {'@type': 'PostalAddress', **identity['address']},
                'geo': {'@type': 'GeoCoordinates', **identity['geo']},
                'hasMap': identity['maps_url'],
                'openingHoursSpecification': [
                    {'@type': 'OpeningHoursSpecification', 'dayOfWeek': day,
                     'opens': hours[0] if hours else '00:00',
                     'closes': hours[1] if hours else '00:00'}
                    for day, hours in identity['hours'].items()
                ]
            })
        if mode == 'launch':
            master = identity['smartbrand']
            organization['logo'] = {
                '@type': 'ImageObject', '@id': origin + '/#approved-brand-image',
                'contentUrl': origin + '/' + master['expected_asset_path'],
                'url': origin + '/' + master['expected_asset_path'],
                'width': master['width'], 'height': master['height'],
                'creditText': master['credit_text'],
                'name': identity['name'] + ' — ' + identity['tagline']
            }
        nodes.append(organization)
    if route == 'yoshi.html':
        coach = identity['coach']
        webpage['mainEntity'] = {'@id': coach_id}
        nodes.append({
            '@type': 'Person', '@id': coach_id, 'name': coach['name'],
            'alternateName': coach['alternate_name'], 'jobTitle': coach['role'],
            'url': origin + '/yoshi.html', 'worksFor': {'@id': business_id},
            'sameAs': coach['profiles']
        })
    return {'@context': 'https://schema.org', '@graph': nodes}


def script_json(value):
    # Prevent data from terminating its inert script element.
    return json.dumps(value, ensure_ascii=False, indent=2).replace('<', '\\u003c').replace('&', '\\u0026')


def metadata_block(identity, route, page, mode):
    esc = lambda value: html.escape(str(value), quote=True)
    url = canonical(identity, route)
    image = page['image']
    image_url = identity['origin'] + '/' + image['path']
    parts = [START, '<title>' + esc(page['title']) + '</title>',
             '<meta name="description" content="' + esc(page['description']) + '">',
             '<meta name="robots" content="' + ('noindex,follow' if mode == 'prelaunch' else 'index,follow') + '">',
             '<link rel="canonical" href="' + esc(url) + '">']
    social = {
        'og:type': 'website', 'og:site_name': identity['name'], 'og:locale': 'en_US',
        'og:title': page['title'], 'og:description': page['description'], 'og:url': url,
        'og:image': image_url, 'og:image:type': image['type'],
        'og:image:width': image['width'], 'og:image:height': image['height'],
        'og:image:alt': image['alt']
    }
    for key, value in social.items():
        parts.append('<meta property="' + key + '" content="' + esc(value) + '">')
    for key, value in {
        'card': 'summary_large_image', 'title': page['title'],
        'description': page['description'], 'image': image_url, 'image:alt': image['alt']
    }.items():
        parts.append('<meta name="twitter:' + key + '" content="' + esc(value) + '">')
    parts.extend(['<script id="smf-search-identity" type="application/ld+json">',
                  script_json(graph(identity, route, page, mode)), '</script>', END])
    return '\n'.join(parts)


class Tag(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.tag = None
        self.attrs = {}
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        self.tag = tag
        self.attrs = dict(attrs)


def render(document, identity, route, page, mode='prelaunch'):
    block = metadata_block(identity, route, page, mode)
    document = BLOCK.sub('', document, count=1)
    head_match = re.search(r'<head\b[^>]*>(.*?)</head>', document, re.I | re.S)
    if not head_match:
        raise ValueError('The page has no head element.')
    head = head_match.group(1)
    head = re.sub(r'[ \t]*<title\b[^>]*>.*?</title>[ \t]*\n?', '', head, flags=re.I | re.S)

    def remove_owned(match):
        tag = Tag(match.group())
        name = tag.attrs.get('name', '')
        prop = tag.attrs.get('property', '')
        owned = (tag.tag == 'meta' and (name in ('description', 'robots')
                 or name.startswith('twitter:') or prop.startswith('og:')))
        owned |= tag.tag == 'link' and tag.attrs.get('rel') == 'canonical'
        return '' if owned else match.group()

    head = re.sub(r'[ \t]*<(?:meta|link)\b[^>]*>[ \t]*\n?', remove_owned, head, flags=re.I)
    viewport = next((m for m in re.finditer(r'<meta\b[^>]*>', head, re.I)
                     if Tag(m.group()).attrs.get('name') == 'viewport'), None)
    if viewport is None:
        raise ValueError('The page must declare its viewport before search metadata.')
    # Preserve early encoding/viewport declarations and every executable script.
    after = re.sub(r'^(?:[ \t]*\r?\n)+', '\n', head[viewport.end():])
    updated = head[:viewport.end()] + '\n' + block + after
    return document[:head_match.start(1)] + updated + document[head_match.end(1):]


def generated_files(root=ROOT, mode='prelaunch', approved_origin=None):
    identity, pages = load_data(root)
    if mode not in ('prelaunch', 'launch'):
        raise ValueError('Unknown release mode.')
    if mode == 'launch':
        verify_launch(identity, root, approved_origin)
    files = {
        route: render((root / route).read_text(), identity, route, page, mode)
        for route, page in pages.items()
    }
    urls = '\n'.join('  <url><loc>' + html.escape(canonical(identity, route)) + '</loc></url>' for route in pages)
    files['sitemap.xml'] = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + '\n</urlset>\n'
    # Crawlers must be allowed to read each prelaunch page's noindex directive.
    files['robots.txt'] = 'User-agent: *\nAllow: /\n\nSitemap: ' + identity['origin'] + '/sitemap.xml\n'
    return files


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true', help='Write local prepared files; never deploys.')
    parser.add_argument('--mode', choices=['prelaunch', 'launch'], default='prelaunch')
    parser.add_argument('--approved-origin', help='Select the approved official origin for a later authorized launch.')
    args = parser.parse_args()
    try:
        files = generated_files(mode=args.mode, approved_origin=args.approved_origin)
    except ValueError as error:
        parser.error(str(error))
    changed = [name for name, content in files.items() if (ROOT / name).read_text() != content]
    if args.apply:
        for name in changed:
            (ROOT / name).write_text(files[name])
    print(json.dumps({'mode': args.mode, 'files': len(files), 'changed': changed,
                      'applied': args.apply, 'published': False}, indent=2))
    if changed and not args.apply:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
