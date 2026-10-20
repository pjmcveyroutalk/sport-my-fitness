/* Shared browser assertions for readable, foreground hero text. */
const assert = require('node:assert/strict');
const path = require('node:path');

module.exports = async function heroLettering(page, route, width, engine, out) {
  await page.evaluate(() => scrollTo({top: 0, behavior: 'instant'}));
  const result = await page.evaluate(() => {
    const heading = document.querySelector('#hero-heading');
    const hero = heading.closest('section');
    const frame = hero.getBoundingClientRect();
    const style = getComputedStyle(heading);
    const scrim = getComputedStyle(heading, '::before');
    const luminance = color => {
      const rgb = color.match(/[\d.]+/g).slice(0, 3).map(Number).map(v => {
        v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
      });
      return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2];
    };
    // Let real photo/decorative boxes participate in hit testing so this also
    // detects a layer that visually covers text despite pointer-events:none.
    const decoration = [...hero.querySelectorAll('.hero-art,.hero-visual,.yoshi-stage,.apparel-campaign-photo,.apparel-photo-wash')];
    const saved = decoration.map(el => el.getAttribute('style'));
    decoration.forEach(el => el.style.setProperty('pointer-events', 'auto', 'important'));
    let lines;
    try {
      lines = [...heading.children].map(el => {
        const range = document.createRange(); range.selectNodeContents(el);
        const box = range.getBoundingClientRect();
        const paint = getComputedStyle(el);
        const a = luminance(paint.color), b = luminance(paint.webkitTextStrokeColor);
        const samples = [.2, .5, .8].map(x => {
          const hit = document.elementFromPoint(box.left + box.width * x, box.top + box.height * .5);
          return !!hit && (hit === heading || heading.contains(hit));
        });
        return {text: el.textContent, left: box.left, right: box.right,
          stroke: parseFloat(paint.webkitTextStrokeWidth), outline: paint.webkitTextStrokeColor,
          color: paint.color, contrast: (Math.max(a, b) + .05) / (Math.min(a, b) + .05),
          paintOrder: paint.paintOrder, shadow: paint.textShadow, opacity: paint.opacity, foreground: samples.every(Boolean)};
      });
    } finally {
      decoration.forEach((el, i) => saved[i] === null ? el.removeAttribute('style') : el.setAttribute('style', saved[i]));
    }
    const controls = [...document.querySelectorAll('.menu-toggle,.header-call,.theme-toggle')].filter(el => !el.hidden).map(el => {
      const r = el.getBoundingClientRect(), hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !!hit && (hit === el || el.contains(hit));
    });
    return {theme: document.documentElement.dataset.theme || 'dark', frame: {left: frame.left, right: frame.right},
      lines, controls, position: style.position, opacity: style.opacity,
      scrim: {background: scrim.backgroundImage, pointerEvents: scrim.pointerEvents},
      bodyHeadingsUntouched: [...document.querySelectorAll('h2,h3')].every(el => parseFloat(getComputedStyle(el).webkitTextStrokeWidth) === 0)};
  });
  assert(!['fixed', 'sticky'].includes(result.position), 'headline must scroll inside its hero');
  assert.equal(result.opacity, '1', 'headline is hidden');
  assert(result.lines.every(line => line.foreground), `photo or decoration covers lettering: ${JSON.stringify(result)}`);
  assert(result.lines.every(line => line.stroke >= 1 && line.stroke <= 2.5 && line.paintOrder.includes('stroke') && line.shadow !== 'none'), 'outline or restrained depth is missing');
  assert(result.lines.every(line => line.contrast >= 3), 'large lettering lacks 3:1 edge contrast');
  assert(result.lines.every(line => line.left - line.stroke >= result.frame.left && line.right + line.stroke + 4 <= result.frame.right), 'lettering effects clip at a hero edge');
  assert(result.controls.length >= 3 && result.controls.every(Boolean), 'foreground text obstructs a header control');
  assert.equal(result.scrim.pointerEvents, 'none', 'heading backdrop intercepts controls');
  assert(result.scrim.background.includes('radial-gradient'), 'feathered heading contrast is missing');
  assert(result.bodyHeadingsUntouched, 'hero effect leaked into body headings');
  if ([390, 1334].includes(width)) {
    await page.locator('main > section').first().screenshot({path: path.join(out, `${engine}-${route}-lettering-${result.theme}-${width}.png`)});
  }
  await page.evaluate(() => scrollTo({top: 0, behavior: 'instant'}));
  return {route, width, engine, ...result, pass: true};
};
