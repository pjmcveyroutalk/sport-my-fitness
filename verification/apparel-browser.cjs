/* Responsive carousel and single-card visitor checks. Inventory fixtures stay
   in the browser; no inquiries, calls, payments or account settings change. */
const {chromium, webkit} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const heroLettering = require('./hero-lettering.cjs');
const base = process.env.SMF_BASE_URL || 'http://127.0.0.1:8080';
const out = path.join(process.env.SMF_EVIDENCE_DIR || '/tmp/smf-design-evidence', 'apparel');
const report = {started: new Date().toISOString(), layouts: [], lettering: [], journeys: [], approvedProducts: [], fallbacks: [], motion: [], failures: []};
fs.mkdirSync(out, {recursive: true});
function save() { fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(report, null, 2)); }
async function load(page, route = 'apparel', hash = '') {
  assert.equal((await page.goto(`${base}/${route}.html${hash}`, {waitUntil: 'networkidle'})).status(), 200);
  await page.evaluate(() => document.fonts.ready);
}
const visibleCards = page => page.locator('[data-apparel-products] > article:visible');
const currentLink = page => page.locator('[data-position="current"] .apparel-look-link');
async function selectedCard(page, id) {
  assert.equal(await page.locator('[data-apparel-products] > article').count(), 1, 'old cards accumulated in the page');
  assert.equal(await visibleCards(page).count(), 1);
  assert.equal(await visibleCards(page).getAttribute('id'), id);
  assert.equal(await currentLink(page).getAttribute('href'), `#${id}`);
  assert.equal(await currentLink(page).getAttribute('aria-expanded'), 'true');
  assert.equal(new URL(page.url()).hash, `#${id}`);
  assert.equal(new URL(page.url()).pathname, '/apparel.html');
  const geometry = await page.evaluate(() => {
    const carousel = document.querySelector('.apparel-carousel').getBoundingClientRect();
    const card = document.querySelector('[data-apparel-products] > article').getBoundingClientRect();
    return {cardTop: card.top, carouselBottom: carousel.bottom, overflow: document.documentElement.scrollWidth - innerWidth};
  });
  assert(geometry.cardTop >= geometry.carouselBottom - 1, 'product card is not underneath the carousel');
  assert(geometry.overflow <= 1, 'selected product caused horizontal page overflow');
  assert.equal(await page.locator('dialog[open]').count(), 0, 'product opened an overlay');
}
async function sampleContract(page) {
  assert.equal(await page.locator('[data-apparel-catalog]').getAttribute('data-apparel-state'), 'samples');
  assert.equal(await page.locator('#apparel-look-track > li').count(), 4);
  assert.equal(await page.locator('[data-apparel-products] > article').count(), 0, 'details must wait for a product selection');
  assert.equal(await page.locator('.apparel-carousel[data-carousel-ready="true"]').count(), 1);
  assert.equal(await page.locator('#apparel-look-track > li:not([aria-hidden="true"])').count(), 3);
  assert.equal(await page.locator('main a[href*="apparel-collection"]').count(), 0);
  assert.equal(await page.locator('.apparel-hero-actions').count(), 0);
  assert.equal(await page.getByText('PLACEHOLDER IMAGE', {exact: true}).count(), 1);
  assert(await page.locator('[data-apparel-pending]').isVisible());
  assert.equal(await page.locator('[data-catalog-error]').isVisible(), false);
  assert.equal(await page.locator('[data-carousel-position], [data-carousel-controls]').count(), 0, 'old bottom control strip returned');
  assert.equal(await page.locator('[data-carousel-note]').innerText(), 'DESIGN SAMPLE');
  assert(!/\$|price|pricing/i.test(await page.locator('.apparel-carousel').innerText()));
  const alts = await page.locator('.apparel-floating-photo').evaluateAll(images => images.map(image => image.alt));
  assert(alts.every(alt => alt.startsWith('Placeholder image:')));
}
async function layout(browser, engine, width, theme) {
  const page = await browser.newPage({viewport: {width, height: width === 1366 ? 768 : 900}, reducedMotion: 'reduce'});
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
    assert.equal(await page.locator('#primary-nav a').count(), 8);
    assert.equal(await page.locator('.site-header .brand-logo').getAttribute('src'), 'assets/brand/sport-my-fitness-logo.png?v=without-tagline-20261022');
    const geometry = await page.evaluate(() => {
      const logo = document.querySelector('.site-header .brand-logo');
      const box = logo.getBoundingClientRect();
      const track = document.getElementById('apparel-look-track');
      const center = track.querySelector('[data-position="current"]').getBoundingClientRect();
      const side = track.querySelector('[data-position="next"]').getBoundingClientRect();
      const row = track.getBoundingClientRect();
      const transparent = el => { const s = getComputedStyle(el); return s.backgroundColor === 'rgba(0, 0, 0, 0)' && s.backgroundImage === 'none' && parseFloat(s.borderTopWidth) === 0 && s.boxShadow === 'none'; };
      const controls = [...document.querySelectorAll('.apparel-carousel-arrow')].map(button => { const r = button.getBoundingClientRect(); return {width: r.width, height: r.height, left: r.left, right: r.right}; });
      return {overflow: document.documentElement.scrollWidth - innerWidth, natural: [logo.naturalWidth, logo.naturalHeight], ratio: box.width / box.height,
        carouselFits: row.left >= 0 && row.right <= innerWidth && getComputedStyle(track).overflowX === 'hidden', centerOffset: Math.abs((center.left + center.right) / 2 - (row.left + row.right) / 2),
        centerScale: center.width / side.width, neighboringItemVisible: side.left < row.right - 8,
        cutoutsUnframed: [...track.querySelectorAll('li,a,img')].every(transparent),
        controls, touchAction: getComputedStyle(track).touchAction, transition: getComputedStyle(track.querySelector('li')).transitionDuration,
        surface: getComputedStyle(document.getElementById('collection')).backgroundImage};
    });
    assert(geometry.overflow <= 1, `page overflowed by ${geometry.overflow}px`);
    assert.deepEqual(geometry.natural, [1100, 725]);
    assert(Math.abs(geometry.ratio / (1100 / 725) - 1) < .01);
    assert(geometry.cutoutsUnframed);
    assert(geometry.carouselFits, 'carousel still depends on horizontal native scrolling');
    assert(geometry.centerOffset <= 1 && geometry.centerScale > 1.4 && geometry.neighboringItemVisible, 'centered carousel depth/peek is missing');
    assert(geometry.controls.every(button => button.width >= 44 && button.height >= 44 && button.left >= 0 && button.right <= width));
    assert.equal(geometry.touchAction, 'pan-y');
    assert.equal(geometry.transition, '0s', 'reduced-motion preference is ignored');
    assert(geometry.surface.includes('athletic-grain.svg') && geometry.surface.includes('linear-gradient'));
    const original = await currentLink(page).getAttribute('href');
    await page.getByRole('button', {name: 'Next style', exact: true}).click();
    assert.notEqual(await currentLink(page).getAttribute('href'), original, 'desktop mouse arrow did not cycle');
    await page.getByRole('button', {name: 'Previous style', exact: true}).click();
    assert.equal(await currentLink(page).getAttribute('href'), original, 'reverse navigation did not restore the item');
    await currentLink(page).click();
    await selectedCard(page, original.slice(1));
    await page.locator('.apparel-detail-photo').evaluate(image => { image.loading = 'eager'; return image.decode(); });
    assert.equal(await page.locator('.apparel-detail-price').innerText(), 'Price coming soon');
    assert.equal(await page.getByRole('group', {name: 'Sample size', exact: true}).getByRole('button').count(), 4);
    const detail = await page.locator('.apparel-product-card').evaluate(card => {
      const photo = card.querySelector('.apparel-detail-photo');
      const picture = card.querySelector('.apparel-product-photos').getBoundingClientRect();
      const title = card.querySelector('.apparel-product-heading').getBoundingClientRect();
      return {fit: getComputedStyle(photo).objectFit, natural: photo.naturalWidth, pictureBottom: picture.bottom, pictureRight: picture.right, titleTop: title.top, titleLeft: title.left};
    });
    assert(detail.fit === 'contain' && detail.natural > 0);
    if (width <= 600) assert(detail.titleTop >= detail.pictureBottom, 'mobile details do not stack beneath the cutout');
    else assert(detail.titleLeft >= detail.pictureRight, 'desktop details do not sit beside the enlarged cutout');
    assert.deepEqual(errors, []);
    if ([390, 1366].includes(width)) {
      await page.locator('#collection').screenshot({path: path.join(out, `${engine}-apparel-combined-${theme}-${width}.png`)});
      await page.getByRole('button', {name: 'Previous style', exact: true}).click();
      await selectedCard(page, 'apparel-sample-tee');
      await page.locator('.apparel-detail-photo').evaluate(image => { image.loading = 'eager'; return image.decode(); });
      await page.locator('#collection').screenshot({path: path.join(out, `${engine}-apparel-replaced-${theme}-${width}.png`)});
    }
    report.layouts.push({engine, width, theme, geometry, selectedLayout: detail, pass: true});
  } finally { await page.close(); }
}
async function journey(browser, engine, width) {
  const page = await browser.newPage({viewport: {width, height: 900}, reducedMotion: 'reduce', hasTouch: width <= 600});
  try {
    await load(page);
    if (width <= 600) {
      await currentLink(page).scrollIntoViewIfNeeded();
      const box = await currentLink(page).boundingBox();
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
      await selectedCard(page, 'apparel-sample-hoodie');
    }
    await page.locator('#apparel-look-track').focus();
    await page.keyboard.press('End');
    assert.equal(await currentLink(page).getAttribute('href'), '#apparel-sample-tee');
    await page.keyboard.press('ArrowRight');
    assert.equal(await currentLink(page).getAttribute('href'), '#apparel-sample-hoodie', 'carousel did not wrap');
    await page.keyboard.press('Enter');
    await selectedCard(page, 'apparel-sample-hoodie');
    assert(await visibleCards(page).evaluate(card => card === document.activeElement));
    await page.getByRole('button', {name: 'Next style', exact: true}).click();
    await selectedCard(page, 'apparel-sample-jacket');
    await page.getByRole('button', {name: 'Previous style', exact: true}).click();
    await selectedCard(page, 'apparel-sample-hoodie');
    await page.locator('[data-position="next"] a').click();
    await selectedCard(page, 'apparel-sample-jacket');
    await page.goBack({waitUntil: 'networkidle'});
    await selectedCard(page, 'apparel-sample-hoodie');
    await page.getByRole('button', {name: 'Size: M', exact: true}).click();
    assert.equal(await page.getByRole('button', {name: 'Size: M', exact: true}).getAttribute('aria-pressed'), 'true');
    await page.getByRole('button', {name: 'Color: Cream', exact: true}).click();
    assert.equal(await page.locator('.apparel-option-selection').innerText(), 'Cream');
    assert.equal(await page.locator('.apparel-inquiry-link').getAttribute('href'), 'contact.html#inquiry');
    const selected = await visibleCards(page).getAttribute('id');
    for (const nextWidth of [390, 1366, width]) {
      await page.setViewportSize({width: nextWidth, height: 900});
      await selectedCard(page, selected);
    }
    if (width <= 600) {
      await page.locator('#apparel-look-track').scrollIntoViewIfNeeded();
      const track = page.locator('#apparel-look-track');
      await track.dispatchEvent('pointerdown', {pointerId: 7, pointerType: 'touch', isPrimary: true, clientX: 280, clientY: 350});
      await track.dispatchEvent('pointerup', {pointerId: 7, pointerType: 'touch', isPrimary: true, clientX: 110, clientY: 355});
      await selectedCard(page, 'apparel-sample-jacket');
    }
    const target = new URL(page.url()).hash;
    await page.getByRole('switch', {name: 'Light mode', exact: true}).click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    assert.equal(new URL(page.url()).hash, target);
    await page.getByRole('button', {name: 'Menu', exact: true}).click();
    assert.equal(await page.locator('#site-menu #primary-nav a:visible').count(), 8);
    await page.keyboard.press('Escape');
    assert(await page.getByRole('button', {name: 'Menu', exact: true}).evaluate(button => button === document.activeElement));
    await page.reload({waitUntil: 'networkidle'});
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await selectedCard(page, target.slice(1));
    const anchor = await visibleCards(page).evaluate(card => {
      const header = document.querySelector('.site-header');
      const headerBottom = getComputedStyle(header).position === 'fixed' ? header.getBoundingClientRect().bottom : 0;
      return {clearance: card.getBoundingClientRect().top - headerBottom, atDocumentEnd: scrollY + innerHeight >= document.documentElement.scrollHeight - 2, scrollY, documentHeight: document.documentElement.scrollHeight};
    });
    // A short last card cannot align at the top after reaching document end.
    assert(anchor.clearance >= 0 && (anchor.clearance <= 65 || anchor.atDocumentEnd), `deep-link clearance: ${JSON.stringify(anchor)}`);
    report.journeys.push({engine, width, mouseAndKeyboard: true, touchInput: width <= 600, replacement: true, history: true, resize: true, options: true, appearance: true, menu: true, deepLinkClearance: anchor, pass: true});
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
    await selectedCard(page, 'apparel-fixture-tee');
    assert.equal(await page.locator('.apparel-sample-label:visible').count(), 1, 'sample labels leaked into actual data');
    assert.equal(await page.locator('[data-apparel-pending]').isVisible(), false);
    const card = page.locator('#apparel-fixture-tee');
    assert.equal(await card.locator('.apparel-detail-price').innerText(), '$28.00');
    assert.equal(await card.locator('.apparel-detail-description').innerText(), tee.description);
    assert.equal(await card.getByRole('group', {name: 'color', exact: true}).getByRole('button').count(), 1);
    assert.equal(await card.getByRole('button', {name: 'Color: Grey', exact: true}).getAttribute('aria-pressed'), 'true');
    assert.equal(await card.getByRole('group', {name: 'size', exact: true}).getByRole('button').count(), 1);
    await card.getByRole('button', {name: 'Alternate', exact: true}).click();
    assert.equal(await card.locator('.apparel-detail-photo').getAttribute('src'), tee.photos[1].src);
    await page.getByRole('button', {name: 'Next style', exact: true}).click();
    await selectedCard(page, 'apparel-fixture-pants');
    assert.equal(await page.locator('.apparel-detail-price').innerText(), 'Ask Yoshi for pricing');
    assert.equal(await page.locator('.apparel-item-specifications dd').first().innerText(), 'To be confirmed');
    assert.equal(await page.locator('.apparel-option').count(), 0, 'unsupplied options were invented');
    // A one-item catalogue needs neither arrow and still has a usable detail.
    await page.route('**/assets/apparel/catalog.json?*', route => route.fulfill({json: {version: 1, items: [tee]}}));
    await page.reload({waitUntil: 'networkidle'});
    await page.waitForFunction(() => document.querySelector('[data-apparel-catalog]').dataset.apparelState === 'approved');
    assert.equal(await page.locator('#apparel-look-track > li').count(), 1);
    await currentLink(page).click();
    await selectedCard(page, 'apparel-fixture-tee');
    assert.equal(await page.locator('.apparel-carousel-arrow:visible').count(), 0);
    report.approvedProducts.push({engine, width, fixtureOnly: true, approvalGates: true, oneAndTwoItems: true, photoSelection: true, realOptionsOnly: true, unknownsNotZero: true, pass: true});
  } finally { await page.close(); }
}
async function fallback(browser, engine, mode) {
  const context = await browser.newContext({viewport: {width: 390, height: 900}, reducedMotion: 'reduce', javaScriptEnabled: mode !== 'no-js'});
  try {
    const page = await context.newPage();
    if (mode === 'network') await page.route('**/assets/apparel/catalog.json?*', route => route.fulfill({status: 503, body: 'Unavailable'}));
    await load(page);
    if (mode === 'no-js') {
      await page.locator('a[href="#apparel-sample-jacket"]').focus();
      await page.keyboard.press('Enter');
      await page.waitForURL('**/apparel.html#apparel-sample-jacket');
      assert.equal(await visibleCards(page).count(), 4, 'static fallback details are missing');
      await page.locator('.menu-fallback summary').click();
      assert.equal(await page.locator('.menu-fallback #primary-nav a:visible').count(), 8);
    } else {
      assert(await page.locator('[data-catalog-error]').isVisible());
      await page.getByRole('button', {name: 'Next style', exact: true}).click();
      await currentLink(page).click();
      await selectedCard(page, 'apparel-sample-jacket');
    }
    await load(page, 'apparel-collection');
    await page.waitForURL('**/apparel.html#collection');
    assert.equal(await page.locator('[data-apparel-products] > article').count(), mode === 'no-js' ? 4 : 0);
    report.fallbacks.push({engine, mode, detailsAvailable: true, oldCollectionForward: true, pass: true});
  } finally { await context.close(); }
}
async function motion(browser, engine, width) {
  const page = await browser.newPage({viewport: {width, height: 900}, reducedMotion: 'no-preference'});
  try {
    await load(page);
    await page.getByRole('button', {name: 'Next style', exact: true}).click();
    await currentLink(page).click();
    await selectedCard(page, 'apparel-sample-jacket');
    report.motion.push({engine, width, transitionAndSelection: true, pass: true});
  } finally { await page.close(); }
}
(async () => {
  try {
    for (const [engine, launcher] of [['chromium', chromium], ['webkit', webkit]]) {
      const browser = await launcher.launch({...(engine === 'chromium' ? {args: ['--no-sandbox', '--disable-dev-shm-usage']} : {})});
      try {
        for (const width of [320, 360, 390, 600, 768, 900, 901, 1024, 1334, 1366, 1920]) for (const theme of ['dark', 'light']) {
          await layout(browser, engine, width, theme);
          console.log(`PASS apparel layout ${engine} ${width} ${theme}`);
        }
        for (const width of [390, 768, 1366]) { await journey(browser, engine, width); await approvedProducts(browser, engine, width); }
        for (const mode of ['no-js', 'network']) await fallback(browser, engine, mode);
        for (const width of [390, 1366]) await motion(browser, engine, width);
      } finally { await browser.close(); }
    }
    report.completed = new Date().toISOString(); save();
    console.log(JSON.stringify({layouts: report.layouts.length, journeys: report.journeys.length, approvedProducts: report.approvedProducts.length, fallbacks: report.fallbacks.length, motion: report.motion.length, failures: 0}));
  } catch (error) { report.failures.push(error.stack); save(); console.error(error); process.exitCode = 1; }
})();
