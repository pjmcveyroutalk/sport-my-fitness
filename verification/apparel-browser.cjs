/* Apparel customer journeys; no inquiries, calls or purchases are submitted. */
const {chromium, webkit} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.SMF_BASE_URL || 'http://127.0.0.1:8080';
const out = path.join(process.env.SMF_EVIDENCE_DIR || '/tmp/smf-design-evidence', 'apparel');
const report = {started: new Date().toISOString(), layouts: [], journeys: [], fallbacks: [], failures: []};
fs.mkdirSync(out, {recursive: true});
function save() { fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(report, null, 2)); }
async function load(page, route) {
  assert.equal((await page.goto(`${base}/${route}.html`, {waitUntil: 'networkidle'})).status(), 200);
  await page.evaluate(() => document.fonts.ready);
}
async function layout(browser, engine, route, width, theme) {
  const page = await browser.newPage({viewport: {width, height: 900}, reducedMotion: 'reduce'});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.addInitScript(value => localStorage.setItem('smf-color-theme', value), theme);
    await load(page, route);
    await page.locator('img[src]').evaluateAll(images => Promise.all(images.map(image => { image.loading = 'eager'; return image.decode(); })));
    assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('#primary-nav a').count(), 8);
    assert.equal(await page.locator('#primary-nav a[aria-current="page"]').getAttribute('href'), 'apparel.html');
    const logo = page.locator('.site-header .brand-logo');
    assert.equal(await logo.getAttribute('src'), 'assets/brand/apparel-kit/brand-smart.jpg');
    const geometry = await page.evaluate(() => {
      const logo = document.querySelector('.site-header .brand-logo');
      const box = logo.getBoundingClientRect();
      return {overflow: document.documentElement.scrollWidth - innerWidth, natural: [logo.naturalWidth, logo.naturalHeight], ratio: box.width / box.height};
    });
    assert(geometry.overflow <= 1, `page overflowed by ${geometry.overflow}px`);
    assert.deepEqual(geometry.natural, [1248, 884]);
    assert(Math.abs(geometry.ratio / (1248 / 884) - 1) < .01, 'official logo is distorted');
    const titleFits = await page.locator('h1 > span').evaluateAll(spans => spans.every(span => { const box = span.getBoundingClientRect(); return box.left >= -1 && box.right <= innerWidth + 1; }));
    assert(titleFits, 'headline clips outside the viewport');
    if (route === 'apparel') {
      assert.equal(await page.getByText('PLACEHOLDER IMAGE', {exact: true}).count(), 4);
      assert.equal(await page.locator('main img[alt^="Placeholder image:"]').count(), 4);
      const labelsFit = await page.locator('.apparel-placeholder-label').evaluateAll(labels => labels.every(label => {
        const box = label.getBoundingClientRect(), frame = label.parentElement.getBoundingClientRect();
        return getComputedStyle(label).visibility === 'visible' && box.width > 0 && box.height > 0 && box.left >= frame.left && box.right <= frame.right + 1 && box.top >= frame.top && box.bottom <= frame.bottom;
      }));
      assert(labelsFit, 'a placeholder label is clipped or hidden');
    } else {
      assert(await page.locator('[data-catalog-empty]').isVisible(), 'pending collection state is missing');
      assert.equal(await page.locator('[data-product-grid] > li').count(), 0, 'unapproved inventory appeared');
      assert.equal(await page.locator('[data-catalog-error]').isVisible(), false, 'collection module failed to load');
    }
    assert.deepEqual(errors, [], 'browser script errors');
    if ([390, 1334].includes(width)) await page.screenshot({path: path.join(out, `${engine}-${route}-${theme}-${width}.png`), fullPage: true});
    report.layouts.push({engine, route, width, theme, geometry, pass: true});
  } finally { await page.close(); }
}
async function journey(browser, engine, width) {
  const page = await browser.newPage({viewport: {width, height: 900}, reducedMotion: 'reduce'});
  try {
    await load(page, 'apparel');
    await page.locator('[data-carousel-next]').click();
    await page.waitForFunction(() => document.getElementById('apparel-look-track').scrollLeft > 10);
    assert.equal(await page.locator('[data-carousel-prev]').isDisabled(), false);
    await page.locator('[data-carousel-prev]').click();
    await page.waitForFunction(() => document.getElementById('apparel-look-track').scrollLeft < 3);
    await page.getByRole('switch', {name: 'Light mode', exact: true}).click();
    await page.locator('.apparel-hero-actions a').click();
    assert(new URL(page.url()).pathname.endsWith('/apparel-collection.html'));
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light', 'theme did not persist between apparel pages');
    assert(await page.locator('[data-catalog-empty]').isVisible());
    assert.equal(await page.locator('[data-catalog-empty] .button').getAttribute('href'), 'contact.html#inquiry');
    await page.getByRole('button', {name: 'Menu', exact: true}).click();
    assert.equal(await page.locator('#site-menu #primary-nav a:visible').count(), 8);
    await page.keyboard.press('Escape');
    assert(await page.getByRole('button', {name: 'Menu', exact: true}).evaluate(button => button === document.activeElement));
    await page.locator('.apparel-back-link').click();
    assert(new URL(page.url()).pathname.endsWith('/apparel.html'));
    report.journeys.push({engine, width, carousel: true, collection: true, appearancePersistence: true, menuEscapeFocus: true, pass: true});
  } finally { await page.close(); }
}
async function fallback(browser, engine, route) {
  const context = await browser.newContext({viewport: {width: 390, height: 900}, javaScriptEnabled: false});
  try {
    const page = await context.newPage(); await load(page, route);
    assert(await page.locator('h1').isVisible());
    await page.locator('.menu-fallback summary').click();
    assert.equal(await page.locator('.menu-fallback #primary-nav a:visible').count(), 8);
    await page.locator('.menu-fallback summary').click();
    if (route === 'apparel') {
      await page.locator('.apparel-look-link').last().focus();
      assert(await page.locator('#apparel-look-track').evaluate(track => track.scrollLeft > 10), 'native carousel focus did not scroll');
      assert.equal(await page.getByText('PLACEHOLDER IMAGE', {exact: true}).count(), 4);
    } else assert(await page.locator('[data-catalog-empty]').isVisible());
    report.fallbacks.push({engine, route, javaScriptDisabled: true, pass: true});
  } finally { await context.close(); }
}
(async () => {
  try {
    for (const [engine, launcher] of [['chromium', chromium], ['webkit', webkit]]) {
      const browser = await launcher.launch({...(engine === 'chromium' ? {args: ['--no-sandbox', '--disable-dev-shm-usage']} : {})});
      try {
        for (const route of ['apparel', 'apparel-collection']) for (const width of [360, 390, 768, 900, 901, 1334, 1920]) for (const theme of ['dark', 'light']) {
          await layout(browser, engine, route, width, theme);
          console.log(`PASS apparel layout ${engine} ${route} ${width} ${theme}`);
        }
        for (const width of [390, 1334]) await journey(browser, engine, width);
        for (const route of ['apparel', 'apparel-collection']) await fallback(browser, engine, route);
      } finally { await browser.close(); }
    }
    report.completed = new Date().toISOString(); save();
    console.log(JSON.stringify({layouts: report.layouts.length, journeys: report.journeys.length, fallbacks: report.fallbacks.length, failures: 0}));
  } catch (error) { report.failures.push(error.stack); save(); console.error(error); process.exitCode = 1; }
})();
