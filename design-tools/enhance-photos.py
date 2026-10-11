"""Conservative, reproducible photographic corrections. No generative processing."""
from pathlib import Path
from PIL import Image, ImageFilter
import numpy as np
import json, hashlib

ROOT = Path(__file__).parent
SITE = ROOT.parent
OUT = SITE / 'assets' / 'photos'
OUT.mkdir(exist_ok=True)
inventory = json.loads((ROOT / 'photo-inventory.json').read_text())
report = []

for item in inventory:
    path = SITE / item['path']
    original = Image.open(path)
    rgb = original.convert('RGB')
    # Luminance-only sharpening keeps natural skin color and existing grain.
    arr = np.asarray(rgb).astype(np.float32)
    luma = arr @ np.array([.2126, .7152, .0722], dtype=np.float32)
    blurred = np.asarray(Image.fromarray(luma.clip(0, 255).astype('uint8')).filter(ImageFilter.GaussianBlur(.75))).astype(np.float32)
    detail = luma - blurred
    detail = np.where(np.abs(detail) > 2.5, detail * .30, 0).clip(-3.5, 3.5)
    # A slight shadow lift (maximum 1.5 levels) without changing white balance.
    lift = 1.5 * np.sin(np.pi * luma / 255) ** 2
    corrected = np.rint(arr + (detail + lift)[..., None]).clip(0, 255).astype('uint8')
    result = Image.fromarray(corrected, 'RGB')
    if original.mode == 'RGBA':
        result.putalpha(original.getchannel('A'))
    stem = path.stem.replace('-lossless', '').replace('-2026-10-07', '').replace('-2026-10-08', '').replace('-2026-10-09', '')
    files = []
    for width in sorted(set([min(480, original.width), min(800, original.width), min(1200, original.width), original.width])):
        image = result if width == original.width else result.resize((width, round(original.height * width / original.width)), Image.Resampling.LANCZOS)
        target = OUT / f'{stem}-{width}.webp'
        # Alpha is encoded losslessly by WebP; exact originals remain in assets.
        image.save(target, 'WEBP', quality=94, method=6, exact=True)
        files.append({'path': str(target.relative_to(SITE)), 'width': width, 'bytes': target.stat().st_size})
    native = files[-1]
    decoded = Image.open(SITE / native['path'])
    alpha_exact = original.mode != 'RGBA' or np.array_equal(np.asarray(original.getchannel('A')), np.asarray(decoded.getchannel('A')))
    assert alpha_exact, path
    report.append({**item, 'source_sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'files': files,
                   'native_bytes': native['bytes'], 'alpha_preserved': alpha_exact,
                   'max_correction_before_encoding': int(np.abs(corrected.astype('int16') - arr.astype('int16')).max()),
                   'mean_correction_before_encoding': round(float(np.abs(corrected - arr).mean()), 3)})

(ROOT / 'photo-enhancement-report.json').write_text(json.dumps(report, indent=2) + '\n')
alpha = Image.open(SITE / 'assets/training-gym-background-lossless.webp').getchannel('A')
mask = Image.new('RGBA', alpha.size, (255,255,255,255))
mask.putalpha(alpha)
mask.save(SITE / 'assets/smf-photo-alpha-mask.webp', 'WEBP', lossless=True, exact=True, method=6)
assert np.array_equal(np.asarray(alpha), np.asarray(Image.open(SITE / 'assets/smf-photo-alpha-mask.webp').getchannel('A')))
print(json.dumps({'photos':len(report), 'original_native_bytes':sum(x['bytes'] for x in report), 'enhanced_native_bytes':sum(x['native_bytes'] for x in report), 'all_alpha_exact':all(x['alpha_preserved'] for x in report)}))
