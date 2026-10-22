// Render website icons from the exact symbol already used in the header.
// Existing branding masters and package exports are never rewritten.
const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'assets/brand/site-icons');
(async () => {
  const header = fs.readFileSync(path.join(root, 'assets/brand/sport-my-fitness-header.svg'), 'utf8');
  const defs = header.match(/<defs>[\s\S]*?<\/defs>/)?.[0];
  const symbol = header.match(/<g transform="[^"]+"><image[\s\S]*?<\/g>/)?.[0];
  if (!defs || !symbol || !symbol.includes('data:image/png;base64,')) throw Error('Original header artwork is required');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 100 100"><rect width="100" height="100" rx="14" fill="#000"/>${defs}<g transform="translate(20.375 0)">${symbol}</g></svg>`;
  fs.mkdirSync(output, {recursive:true});
  for (const size of [16,32,48,180,192,512]) {
    const filename = size === 180 ? 'apple-touch-icon.png' : `icon-${size}.png`;
    await sharp(Buffer.from(svg)).resize(size,size).png().toFile(path.join(output,filename));
  }
  const python = process.env.CODEX_PRIMARY_RUNTIME_PYTHON || 'python3';
  const encoded = spawnSync(python, ['-c', 'from PIL import Image; import sys; from pathlib import Path; p=Path(sys.argv[1]); Image.open(p/"icon-512.png").save(p/"favicon.ico", format="ICO", sizes=[(16,16),(32,32),(48,48)])', output], {encoding:'utf8'});
  if (encoded.status !== 0) throw Error(encoded.stderr || 'ICO encoding failed');
  fs.copyFileSync(path.join(output,'favicon.ico'),path.join(root,'favicon.ico'));
  console.log('Rendered original-symbol site icons at 16, 32, 48, 180, 192 and 512 pixels.');
})().catch(error => { console.error(error); process.exitCode = 1; });
