/* Visitor-facing checks for the approved design. Does not submit inquiries,
 * complete bookings, or require production credentials. */
const {chromium, webkit} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = process.env.SMF_BASE_URL || 'http://127.0.0.1:8080';
const out = process.env.SMF_EVIDENCE_DIR || '/tmp/smf-design-evidence';
const routes = ['index', 'training', 'programs', 'yoshi', 'media', 'community', 'contact'];
const widths = [360, 390, 430, 768, 900, 901, 1334, 1920];
const report = {started: new Date().toISOString(), layouts: [], navigation: [], motion: [], safeguards: [], failures: []};
fs.mkdirSync(out, {recursive: true});
function save() { fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(report, null, 2)); }
async function check(name, fn) {
  try { await fn(); console.log('PASS ' + name); }
  catch (error) { report.failures.push({name, error: error.stack}); console.error('FAIL ' + name + '\n' + error.stack); save(); throw error; }
}
async function load(page, route) {
  const response = await page.goto(`${base}/${route}.html`, {waitUntil: 'networkidle'});
  assert.equal(response.status(), 200);
  await page.evaluate(() => document.fonts.ready);
}
async function allPhotos(page) {
  for (const img of await page.locator('main img').all()) {
    await img.scrollIntoViewIfNeeded();
    await img.evaluate(i => i.decode());
  }
  return page.evaluate(() => [...document.querySelectorAll('main img,.site-header .brand-logo')].map(i => {
    const r = i.getBoundingClientRect(), style = getComputedStyle(i);
    return {src: i.getAttribute('src'), natural: [i.naturalWidth, i.naturalHeight], rendered: [r.width, r.height], fit: style.objectFit, mask: style.maskImage,
      valid: i.complete && i.naturalWidth > 0 && r.width > 0 && r.height > 0 && Math.abs((r.width / r.height) / (i.naturalWidth / i.naturalHeight) - 1) < .015};
  }));
}
async function layout(page, route, width, engine) {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await load(page, route);
  const photos = await allPhotos(page);
  assert(photos.every(i => i.valid), 'image ratio/decode failure: ' + JSON.stringify(photos.filter(i => !i.valid)));
  assert(photos.every(i => i.mask === 'none'), 'an image is using a decorative alpha mask');
  assert.equal(await page.locator('.page-step,.footer-links,.footer-name').count(), 0, 'redundant page ending remains');
  assert.equal(await page.locator('#primary-nav a').count(), 7);
  const current = page.locator('#primary-nav a[aria-current="page"]');
  assert.equal(await current.count(), 1);
  assert.equal(await current.getAttribute('href'), route + '.html');
  const geometry = await page.evaluate(() => {
    const hero = document.querySelector('main > section').getBoundingClientRect();
    const h1 = document.querySelector('h1');
    const headline = [...h1.children].map(el => { const r = document.createRange(); r.selectNodeContents(el); return r.getBoundingClientRect().toJSON(); });
    const subline = document.querySelector('.hero-subline').getBoundingClientRect();
    const overflow = [...document.querySelectorAll('main *')].map(el => ({tag: el.tagName, classes: el.className, rect: el.getBoundingClientRect().toJSON()})).filter(el => el.rect.width && (el.rect.right > innerWidth + 1 || el.rect.left < -1));
    return {width: innerWidth, scrollWidth: document.documentElement.scrollWidth, overflow, headline, hero: hero.toJSON(), h1: h1.getBoundingClientRect().toJSON(), subline: subline.toJSON()};
  });
  assert(geometry.scrollWidth <= geometry.width, 'horizontal overflow: ' + JSON.stringify(geometry));
  assert(geometry.headline.every(r => r.left >= geometry.hero.left - 2 && r.right <= geometry.hero.right - 6), 'headline clipped at viewport edge: ' + JSON.stringify(geometry));
  assert(geometry.h1.bottom <= geometry.subline.top + 2, 'headline overlaps supporting copy');
  assert.deepEqual(errors, []);
  await page.evaluate(() => scrollTo({top: 0, behavior: 'instant'}));
  if (width === 390 || width === 1334) await page.screenshot({path: path.join(out, `${engine}-${route}-${width}.png`), fullPage: true});
  report.layouts.push({engine, route, width, photos, geometry, consoleErrors: errors});
  save();
}
async function navigation(page, route, width) {
  await load(page, route);
  const trigger = page.locator('.menu-toggle');
  const initial = await page.locator('h1').boundingBox();
  await trigger.click();
  assert.equal(await trigger.getAttribute('aria-expanded'), 'true');
  assert(await page.locator('#site-menu').isVisible());
  assert.equal(await page.locator('#site-menu #primary-nav a:visible').count(), 7);
  const during = await page.locator('h1').boundingBox();
  assert(Math.abs(initial.x - during.x) < 1 && Math.abs(initial.width - during.width) < 1, 'menu changes page geometry');
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    assert(await page.evaluate(() => document.querySelector('#site-menu').contains(document.activeElement)), 'modal focus escaped');
  }
  if (route === 'index') await page.screenshot({path: path.join(out, `menu-${width}.png`)});
  await page.keyboard.press('Escape');
  assert.equal(await trigger.getAttribute('aria-expanded'), 'false');
  assert(await trigger.evaluate(el => el === document.activeElement), 'Escape did not restore focus');
  await trigger.click();
  await page.locator('.menu-close').click();
  assert.equal(await trigger.getAttribute('aria-expanded'), 'false');
  await trigger.click();
  await page.mouse.click(width - 2, 898);
  assert.equal(await trigger.getAttribute('aria-expanded'), 'false', 'backdrop did not close');
  await page.evaluate(() => scrollTo({top: document.body.scrollHeight, behavior: 'instant'}));
  await trigger.click();
  assert(await page.locator('#site-menu').isVisible(), 'menu unavailable at bottom of page');
  await page.keyboard.press('Escape');
  report.navigation.push({route, width, sevenDestinations: true, keyboard: true, close: true, stablePage: true, bottomAccess: true});
}
async function motion(browser, route, width, record) {
  const context = await browser.newContext({viewport: {width, height: 900}, reducedMotion: 'no-preference', ...(record ? {recordVideo: {dir: path.join(out, 'motion'), size: {width, height: 900}}} : {})});
  const page = await context.newPage();
  await page.addInitScript(() => {
    window.motionCalls = [];
    const animate = Element.prototype.animate;
    Element.prototype.animate = function(frames, options) {
      window.motionCalls.push({tag: this.tagName, classes: this.className, parent: this.parentElement?.id, frames, options});
      return animate.call(this, frames, options);
    };
  });
  await load(page, route);
  await page.waitForFunction(() => document.documentElement.dataset.smfMotionState === 'complete', {timeout: 7000});
  const calls = await page.evaluate(() => window.motionCalls);
  const photo = calls.find(c => c.options.duration === 1367);
  const headline = calls.filter(c => c.parent === 'hero-heading');
  assert(photo, 'original photo choreography did not run');
  assert.equal(photo.frames[0].opacity, 1, 'photo becomes transparent during its entrance');
  assert(headline.length >= 2 && headline.every(c => c.options.duration === 967), 'original headline curves missing');
  if (route === 'index') {
    assert(parseFloat(photo.frames[0].translate) < 0, 'Home photo did not enter from the left');
    assert(headline.every(c => parseFloat(c.frames[0].translate.split(' ')[1]) < 0), 'Home headline did not drop from above');
    assert(headline[0].options.delay > photo.options.delay + photo.options.duration, 'headline starts before photo settles');
  } else {
    assert.equal(headline[0].options.delay, 80);
    assert(parseFloat(photo.frames[0].translate) > 0, 'original inner-page photo direction changed');
  }
  report.motion.push({route, width, photo: photo.options, photoFirstFrame: photo.frames[0], headlines: headline.map(c => c.options), final: 'complete'});
  const video = record ? page.video() : null;
  await context.close();
  if (video) fs.renameSync(await video.path(), path.join(out, 'motion', `${route}-${width}.webm`));
  save();
}
(async () => {
  const browser = await chromium.launch({...(process.env.CHROME_PATH ? {executablePath: process.env.CHROME_PATH} : {}), args: ['--no-sandbox', '--disable-dev-shm-usage']});
  report.chromiumVersion = browser.version();
  try {
    for (const route of routes) for (const width of widths) await check(`layout ${route} ${width}`, async () => {
      const page = await browser.newPage({viewport: {width, height: 900}, reducedMotion: 'reduce'});
      try { await layout(page, route, width, 'chromium'); } finally { await page.close(); }
    });
    for (const route of routes) for (const width of [390, 1334]) await check(`navigation ${route} ${width}`, async () => {
      const page = await browser.newPage({viewport: {width, height: 900}, reducedMotion: 'reduce'});
      try { await navigation(page, route, width); } finally { await page.close(); }
    });
    for (const route of routes) for (const width of [390, 1334]) await check(`motion ${route} ${width}`, () => motion(browser, route, width, width === 390 || route === 'index'));
    for (const route of routes) await check(`native menu without JS ${route}`, async () => {
      const context = await browser.newContext({viewport: {width: 390, height: 900}, javaScriptEnabled: false});
      const page = await context.newPage(); await load(page, route);
      await page.locator('.menu-fallback summary').click();
      assert.equal(await page.locator('.menu-fallback nav a:visible').count(), 7);
      assert(await page.locator('h1').isVisible());
      await page.locator('.menu-fallback a[href="contact.html"]').click();
      assert(new URL(page.url()).pathname.endsWith('/contact.html'));
      report.safeguards.push({test: 'no-js', route, pass: true}); await context.close();
    });
    await check('menu script failure', async () => {
      const page = await browser.newPage({viewport: {width: 390, height: 900}, reducedMotion: 'reduce'});
      await page.route('**/site-menu.js*', r => r.abort()); await load(page, 'index');
      await page.locator('.menu-fallback summary').click();
      assert.equal(await page.locator('.menu-fallback nav a:visible').count(), 7);
      report.safeguards.push({test: 'blocked-menu-js', pass: true}); await page.close();
    });
    await check('resize boundary', async () => {
      const page = await browser.newPage({viewport: {width: 900, height: 900}, reducedMotion: 'reduce'});
      await load(page, 'training'); await page.locator('.menu-toggle').click();
      await page.setViewportSize({width: 901, height: 900});
      await page.waitForFunction(() => !document.querySelector('#site-menu').open);
      await page.setViewportSize({width: 900, height: 900});
      await page.locator('.menu-toggle').click(); assert(await page.locator('#site-menu').isVisible());
      report.safeguards.push({test: '900-901-900', pass: true}); await page.close();
    });
    for (const [name, setup] of [
      ['motion-unavailable', page => page.route('**/smf-motion-curves.json', r => r.abort())],
      ['deep-link', async () => {}],
      ['interrupted', async () => {}],
      ['preference-change', async () => {}]
    ]) await check(name, async () => {
      const page = await browser.newPage({viewport: {width: 390, height: 900}, reducedMotion: 'no-preference'});
      await setup(page);
      if (name === 'deep-link') await page.goto(`${base}/programs.html#online-coaching`);
      else {
        await page.goto(`${base}/index.html`);
        if (name === 'interrupted') await page.keyboard.press('ArrowDown');
        if (name === 'preference-change') await page.emulateMedia({reducedMotion: 'reduce'});
      }
      await page.waitForFunction(() => !document.documentElement.classList.contains('smf-motion-boot'));
      await page.waitForTimeout(100);
      assert.equal(await page.locator('h1').evaluate(el => getComputedStyle(el).opacity), '1');
      assert(await page.locator('.menu-toggle').isVisible());
      report.safeguards.push({test: name, pass: true}); await page.close();
    });
    await check('form validation, no external submission', async () => {
      const page = await browser.newPage({viewport: {width: 390, height: 900}, reducedMotion: 'reduce'});
      let submissions = 0;
      await page.route('https://formsubmit.co/**', r => { submissions++; return r.abort(); });
      await load(page, 'contact'); await page.locator('.form-button').click();
      assert.equal(await page.locator('#inquiry-form').evaluate(f => f.checkValidity()), false);
      await page.locator('#inquiry-name').fill('   '); await page.locator('#inquiry-email').fill('test@example.invalid');
      await page.locator('#inquiry-goals').fill('   '); await page.locator('.form-button').click();
      assert.equal(await page.locator('#inquiry-name').evaluate(i => i.validity.customError), true);
      assert.equal(submissions, 0);
      report.safeguards.push({test: 'empty-and-whitespace-form', externalPosts: submissions, pass: true}); await page.close();
    });
  } finally { await browser.close(); save(); }
  const safari = await webkit.launch(); report.webkitVersion = safari.version();
  try {
    for (const route of routes) for (const width of [390, 1334]) await check(`WebKit layout ${route} ${width}`, async () => {
      const page = await safari.newPage({viewport: {width, height: 900}, reducedMotion: 'reduce'});
      try { await layout(page, route, width, 'webkit'); await navigation(page, route, width); } finally { await page.close(); }
    });
  } finally { await safari.close(); }
  report.completed = new Date().toISOString(); save();
  console.log(JSON.stringify({layouts: report.layouts.length, navigation: report.navigation.length, motion: report.motion.length, safeguards: report.safeguards.length, failures: report.failures.length, chromium: report.chromiumVersion, webkit: report.webkitVersion}));
})().catch(error => { save(); console.error(error.stack); process.exit(1); });
