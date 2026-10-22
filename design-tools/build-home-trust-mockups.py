"""Rebuild three review-only pages from the approved homepage without shifting it."""
from pathlib import Path
root = Path(__file__).resolve().parent.parent
pages = ['index', 'apparel', 'yoshis-book', 'training', 'programs', 'media', 'community', 'contact']
headline_link = '  <link rel="stylesheet" href="headline-system.css?v=review-20261021">\n'
for page in pages:
    target = root / (page + '.html')
    source = target.read_text()
    if 'headline-system.css' not in source:
        assert source.count('</head>') == 1
        target.write_text(source.replace('</head>', headline_link + '</head>'))

source = (root / 'index.html').read_text()
anchor = '          <div class="hero-details">'
assert source.count(anchor) == 1
def icon(paths):
    return '<span class="proof-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">' + paths + '</svg></span>'
shield = icon('<path d="M12 3 4.5 6v5c0 4.7 3.1 7.8 7.5 10 4.4-2.2 7.5-5.3 7.5-10V6L12 3Z"/><path d="m8.5 12 2.3 2.3 4.7-5"/>')
people = icon('<circle cx="12" cy="7.5" r="3"/><path d="M6.5 20v-2a5.5 5.5 0 0 1 11 0v2H6.5ZM5.5 5.5a2.5 2.5 0 0 0 0 5M3 18v-1a4 4 0 0 1 2.5-3.7M18.5 5.5a2.5 2.5 0 0 1 0 5M21 18v-1a4 4 0 0 0-2.5-3.7"/>')
variants = {
    'badges': '<aside class="home-proof home-proof--badges" aria-label="Yoshi’s coaching background"><ul class="proof-badges"><li>' + shield + '<span><strong>Certified<br>trainer</strong><span class="proof-detail">ISSA certification</span></span></li><li>' + people + '<span><strong>Community<br>focused</strong><span class="proof-detail">Milwaukee, WI</span></span></li></ul></aside>',
    'panel': '<aside class="home-proof home-proof--panel proof-panel" aria-label="Yoshi’s experience"><p class="proof-kicker">BEHIND THE WORK</p><ul><li><strong>ISSA</strong><span>Certified trainer</span></li><li><strong>MATC</strong><span>Wellness instructor</span></li><li><strong>TMJ4</strong><span>Fitness Friday guest</span></li></ul></aside>',
    'quote': '<figure class="home-proof home-proof--quote proof-client" aria-label="A Sport My Fitness client review"><blockquote>“Kind, encouraging trainers who will tailor your workouts just for you.”</blockquote><figcaption><cite>— B. Thorn, client</cite></figcaption><span class="proof-qualification">Certified trainer · ISSA</span></figure>',
}
for key, markup in variants.items():
    result = source.replace('</head>', '  <meta name="robots" content="noindex,nofollow">\n  <link rel="stylesheet" href="home-trust.css?v=review-20261021">\n</head>')
    result = result.replace(anchor, '          ' + markup + '\n' + anchor)
    result = result.replace('<title>Sport My Fitness | Coach Yoshi Barnes</title>', '<title>Homepage trust concept — ' + key + ' | Sport My Fitness</title>')
    (root / ('home-trust-' + key + '.html')).write_text(result)
print('Three isolated trust mockups and eight shared headline previews prepared.')
