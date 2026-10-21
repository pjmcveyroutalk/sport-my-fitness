/* Apparel visitor journeys. Fixtures stay in the browser; no real inventory,
   inquiries, phone calls, payments or production settings are changed. */
const {chromium, webkit} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const heroLettering = require('./hero-lettering.cjs');
const base = process.env.SMF_BASE_URL || 'http://127.0.0.1:8080';
const out = path.join(process.env.SMF_EVIDENCE_DIR || '/tmp/smf-design-evidence', 'apparel');
const report = {started: new Date().toISOString(), layouts: [], lettering: [], journeys: [], approvedProducts: [], fallbacks: [], failures: []};
fs.mkdirSync(out, {recursive: true});
function save() { fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(report, null, 2)); }
async function load(page, route = 'apparel', hash = '') {
  assert.equal((await page.goto(`${base}/${route}.html${hash}`, {waitUntil: 'networkidle'})).status(), 200);
  await page.evaluate(() => document.fonts.ready);
}
async function sampleContract(page) {
  assert.equal(await page.locator('[data-apparel-catalog]').getAttribute('data-apparel-state'), 'samples');
  assert.equal(await page.locator('#apparel-look-track > li').count(), 4);
  assert.equal(await page.locator('[data-apparel-products] > article').count(), 4);
  assert.equal(await page.locator('.apparel-product-dialog').count(), 0, 'product details still use a popup');
  assert.equal(await page.locator('main a[href*="apparel-collection"]').count(), 0, 'collection still requires a second page');
  assert.equal(await page.locator('.apparel-sample-label').count(), 8, 'a sample garment lacks its image notice');
  assert.equal(await page.getByText('PLACEHOLDER IMAGE', {exact: true}).count(), 1, 'the preserved campaign photo lost its notice');
  assert(await page.locator('[data-apparel-pending]').isVisible());
  assert.equal(await page.locator('[data-catalog-error]').isVisible(), false);
  assert(!/\$|pricing|price/i.test(await page.locator('#apparel-look-track').innerText()), 'pricing appeared in the floating row');
  assert.equal(await page.getByText('Ask Yoshi for pricing', {exact: true}).count(), 4);
  const targets = await page.locator('.apparel-look-link').evaluateAll(links => links.map(link => ({hash: link.hash, tag: document.getElementById(link.hash.slice(1))?.tagName})));
  assert(targets.every(target => target.tag === 'ARTICLE'), 'a garment does not link to its own inline card');
}
async function layout(browser, engine, width, theme) {
  const page = await browser.newPage({viewport: {width, height: 900}, reducedMotion: 'reduce'});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.addInitScript(value => localStorage.setItem('smf-color-theme', value), theme);
    await load(page);
    await page.locator('img[src]').evaluateAll(images => Promise.all(images.map(image => { image.loading = 'eager'; return image.decode(); })));
    report.lettering.push(await heroLettering(page, 'apparel', width, engine, out));
    await sampleContract(page);
    assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('#primary-nav a').count(), 7);
    assert.equal(await page.locator('#primary-nav a[aria-current="page"]').getAttribute('href'), 'apparel.html');
    assert.equal(await page.locator('.site-header .brand-logo').getAttribute('src'), 'assets/brand/apparel-kit/brand-smart.jpg');
    const geometry = await page.evaluate(() => {
      const logo = document.querySelector('.site-header .brand-logo');
      const box = logo.getBoundingClientRect();
      const track = document.getElementById('apparel-look-track');
      const row = track.getBoundingClientRect();
      const children = [...track.children].map(item => item.getBoundingClientRect());
      const transparent = el => {
        const s = getComputedStyle(el);
        return s.backgroundColor === 'rgba(0, 0, 0, 0)' && s.backgroundImage === 'none' && parseFloat(s.borderTopWidth) === 0 && s.boxShadow === 'none';
      };
      return {overflow: document.documentElement.scrollWidth - innerWidth, natural: [logo.naturalWidth, logo.naturalHeight], ratio: box.width / box.height,
        railOverflows: track.scrollWidth > track.clientWidth + 10,
        firstFraction: children[0].width / row.width, nextPeeks: children[1].left < row.right - 4,
        railHasNoFrames: [...track.querySelectorAll('li,a,img')].every(transparent),
        photosContained: [...document.querySelectorAll('.apparel-floating-photo,.apparel-detail-photo')].every(img => getComputedStyle(img).objectFit === 'contain' && img.naturalWidth > 0),
        surface: getComputedStyle(document.getElementById('collection')).backgroundImage};
    });
    assert(geometry.overflow <= 1, `page overflowed by ${geometry.overflow}px`);
    assert.deepEqual(geometry.natural, [1248, 884]);
    assert(Math.abs(geometry.ratio / (1248 / 884) - 1) < .01, 'official logo is distorted');
    assert(geometry.railHasNoFrames, 'floating garments acquired a card/frame/background');
    assert(geometry.photosContained, 'garment proportions are cropped or stretched');
    assert(geometry.railOverflows, 'rail is no longer horizontally scrollable');
    assert(geometry.surface.includes('athletic-grain.svg') && geometry.surface.includes('linear-gradient'), 'shared textured background is missing');
    if (width <= 600) assert(geometry.firstFraction > .74 && geometry.firstFraction < .94 && geometry.nextPeeks, 'mobile rail lacks its large garment and next-item peek');
    assert.deepEqual(errors, [], 'browser script errors');
    if ([390, 1334].includes(width)) {
      await page.locator('#collection').scrollIntoViewIfNeeded();
      await page.evaluate(() => document.getElementById('collection').scrollIntoView({behavior: 'instant'}));
      await page.screenshot({path: path.join(out, `${engine}-apparel-row-${theme}-${width}.png`)});
      await page.locator('[data-apparel-products] > article').first().evaluate(card => card.scrollIntoView({behavior: 'instant'}));
      await page.screenshot({path: path.join(out, `${engine}-apparel-detail-${theme}-${width}.png`)});
    }
    report.layouts.push({engine, width, theme, geometry, pass: true});
  } finally { await page.close(); }
}
async function journey(browser, engine, width) {
  const page = await browser.newPage({viewport: {width, height: 900}, reducedMotion: 'reduce'});
  try {
    await load(page);
    await page.locator('.apparel-hero-actions a').click();
    assert.equal(new URL(page.url()).pathname, '/apparel.html');
    assert.equal(new URL(page.url()).hash, '#collection');
    await page.locator('[data-carousel-next]').click();
    await page.waitForFunction(() => document.getElementById('apparel-look-track').scrollLeft > 10 && !document.querySelector('[data-carousel-prev]').disabled);
    await page.locator('[data-carousel-prev]').click();
    await page.waitForFunction(() => document.getElementById('apparel-look-track').scrollLeft < 3);
    await page.locator('#apparel-look-track').focus();
    await page.keyboard.press('End');
    await page.waitForFunction(() => document.querySelector('[data-carousel-next]').disabled);
    await page.keyboard.press('Home');
    await page.waitForFunction(() => document.querySelector('[data-carousel-prev]').disabled);
    const link = page.locator('.apparel-look-link').first();
    const target = await link.getAttribute('href');
    await link.click();
    assert.equal(new URL(page.url()).pathname, '/apparel.html');
    assert.equal(new URL(page.url()).hash, target);
    // Native fragment navigation commits the URL before its hashchange task.
    // Wait for the visible/current-item update instead of racing the browser.
    await page.waitForFunction(hash => [...document.querySelectorAll('.apparel-look-link')].some(link => link.hash === hash && link.getAttribute('aria-current') === 'location'), target);
    assert.equal(await link.getAttribute('aria-current'), 'location');
    const card = page.locator(target);
    const top = await card.evaluate(el => ({top: el.getBoundingClientRect().top, header: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height'))}));
    assert(top.top >= top.header, 'fixed header covers the selected product');
    assert.equal(await page.locator('[data-apparel-products] > article:visible').count(), 4, 'selection removed the rest of the collection');
    assert.equal(await page.locator('dialog[open]').count(), 0, 'selection opened a popup');
    assert.equal(await card.locator('.button').getAttribute('href'), 'contact.html#inquiry');
    await card.locator('.apparel-back-link').click();
    assert.equal(new URL(page.url()).hash, '#collection');
    await page.goBack({waitUntil: 'networkidle'});
    assert.equal(new URL(page.url()).hash, target, 'browser back lost the selected product');
    await page.getByRole('switch', {name: 'Light mode', exact: true}).click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    assert.equal(new URL(page.url()).hash, target, 'theme toggle lost selection');
    await page.getByRole('button', {name: 'Menu', exact: true}).click();
    assert.equal(await page.locator('#site-menu #primary-nav a:visible').count(), 7);
    await page.keyboard.press('Escape');
    assert(await page.getByRole('button', {name: 'Menu', exact: true}).evaluate(button => button === document.activeElement));
    await page.reload({waitUntil: 'networkidle'});
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    assert.equal(new URL(page.url()).hash, target);
    report.journeys.push({engine, width, nativeCarousel: true, keyboardScroll: true, samePageDetails: true, headerClearance: true, allOtherCardsRetained: true, history: true, appearance: true, menuEscapeFocus: true, pass: true});
  } finally { await page.close(); }
}
async function approvedProducts(browser, engine, width) {
  const page = await browser.newPage({viewport: {width, height: 900}, reducedMotion: 'reduce'});
  const tee = {id: 'fixture-tee', name: 'Browser fixture tee', approved: true, available: true, category: 'Tops', description: 'Browser fixture description, not real inventory.', colors: ['Grey'], sizes: ['M'], price: 28, currency: 'USD', photos: [
    {src: 'assets/apparel/placeholders/sample-tee-20261021.webp', alt: 'Browser fixture front', label: 'Front'},
    {src: 'assets/apparel/placeholders/sample-hoodie-20261021.webp', alt: 'Browser fixture alternate', label: 'Alternate'}
  ]};
  const pants = {...tee, id: 'fixture-pants', name: 'Browser fixture pants', price: undefined, colors: [], sizes: [], photos: [tee.photos[0]]};
  try {
    await page.route('**/assets/apparel/catalog.json?*', route => route.fulfill({json: {version: 1, items: [tee, pants, {...tee, id: 'unapproved', approved: false}, {...tee, id: 'unavailable', available: false}]}}));
    await load(page, 'apparel', '#apparel-fixture-tee');
    await page.waitForFunction(() => document.querySelector('[data-apparel-catalog]').dataset.apparelState === 'approved');
    assert.equal(await page.locator('#apparel-look-track > li').count(), 2);
    assert.equal(await page.locator('[data-apparel-products] > article').count(), 2);
    assert.equal(await page.locator('.apparel-sample-label').count(), 0, 'real products mixed with sample cards');
    assert.equal(await page.locator('[data-apparel-pending]').isVisible(), false);
    assert(!/\$|pricing/i.test(await page.locator('#apparel-look-track').innerText()));
    const card = page.locator('#apparel-fixture-tee');
    await card.waitFor({state: 'visible'});
    await page.waitForFunction(() => document.getElementById('apparel-fixture-tee').getBoundingClientRect().top < innerHeight);
    assert.equal(await card.locator('.apparel-detail-price').innerText(), '$28.00');
    assert.equal(await card.locator('.apparel-detail-description').innerText(), tee.description);
    assert.equal(await card.locator('.apparel-item-specifications dd').first().innerText(), 'Grey');
    await card.getByRole('button', {name: 'Alternate', exact: true}).click();
    assert.equal(await card.locator('.apparel-detail-photo').getAttribute('src'), tee.photos[1].src);
    assert.equal(await card.getByRole('button', {name: 'Alternate', exact: true}).getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('#apparel-fixture-pants .apparel-detail-price').innerText(), 'Ask Yoshi for pricing');
    assert.equal(await page.locator('#apparel-fixture-pants .apparel-item-specifications dd').first().innerText(), 'To be confirmed');
    assert.equal(await page.locator('dialog[open]').count(), 0);
    await page.locator('#apparel-fixture-pants .apparel-back-link').click();
    await page.locator('.apparel-look-link').last().click();
    assert.equal(new URL(page.url()).hash, '#apparel-fixture-pants');
    assert.equal(new URL(page.url()).pathname, '/apparel.html');
    report.approvedProducts.push({engine, width, fixtureOnly: true, approvalGates: true, fragmentEntry: true, photoSelection: true, priceAndOptions: true, unknownsNotZero: true, samePage: true, pass: true});
  } finally { await page.close(); }
}
async function fallback(browser, engine, mode) {
  const context = await browser.newContext({viewport: {width: 390, height: 900}, javaScriptEnabled: mode !== 'no-js'});
  try {
    const page = await context.newPage();
    if (mode === 'network') await page.route('**/assets/apparel/catalog.json?*', route => route.fulfill({status: 503, body: 'Unavailable'}));
    await load(page);
    await page.locator('.apparel-look-link').last().focus();
    assert(await page.locator('#apparel-look-track').evaluate(track => track.scrollLeft > 10), 'native focus did not scroll the garment row');
    await page.locator('.apparel-look-link').last().click();
    assert.equal(new URL(page.url()).hash, '#apparel-sample-jacket');
    assert.equal(await page.locator('[data-apparel-products] > article:visible').count(), 4);
    if (mode === 'no-js') {
      await page.locator('.menu-fallback summary').click();
      assert.equal(await page.locator('.menu-fallback #primary-nav a:visible').count(), 7);
    } else assert(await page.locator('[data-catalog-error]').isVisible());
    await load(page, 'apparel-collection');
    await page.waitForURL('**/apparel.html#collection');
    assert.equal(await page.locator('[data-apparel-products] > article').count(), 4);
    report.fallbacks.push({engine, mode, nativeAnchors: true, detailsAvailable: true, oldCollectionForward: true, pass: true});
  } finally { await context.close(); }
}
(async () => {
  try {
    for (const [engine, launcher] of [['chromium', chromium], ['webkit', webkit]]) {
      const browser = await launcher.launch({...(engine === 'chromium' ? {args: ['--no-sandbox', '--disable-dev-shm-usage']} : {})});
      try {
        for (const width of [320, 360, 390, 600, 768, 900, 901, 1334, 1920]) for (const theme of ['dark', 'light']) {
          await layout(browser, engine, width, theme);
          console.log(`PASS apparel layout ${engine} ${width} ${theme}`);
        }
        for (const width of [390, 1334]) {
          await journey(browser, engine, width);
          await approvedProducts(browser, engine, width);
        }
        for (const mode of ['no-js', 'network']) await fallback(browser, engine, mode);
      } finally { await browser.close(); }
    }
    report.completed = new Date().toISOString(); save();
    console.log(JSON.stringify({layouts: report.layouts.length, journeys: report.journeys.length, approvedProducts: report.approvedProducts.length, fallbacks: report.fallbacks.length, failures: 0}));
  } catch (error) { report.failures.push(error.stack); save(); console.error(error); process.exitCode = 1; }
})();
