const {pagePath} = require('./page-route.cjs');
/* Approved homepage button placement and its temporary book destination.
 * Read-only browsing only: no inquiries, purchases, calls or account changes. */
const {chromium, webkit} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.SMF_BASE_URL || 'http://127.0.0.1:8080';
const out = path.join(process.env.SMF_EVIDENCE_DIR || '/tmp/smf-evidence', 'home-actions');
const report = {started: new Date().toISOString(), layouts: [], journeys: [], fallbacks: [], motion: [], menus: [], menuFallbacks: [], failures: []};
fs.mkdirSync(out, {recursive: true});
const save = () => fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(report, null, 2));
async function load(page) {
  const response = await page.goto(base + '/home/', {waitUntil: 'networkidle'});
  assert.equal(response.status(), 200);
  await page.evaluate(() => document.fonts.ready);
}
async function layout(page, width) {
  const data = await page.locator('.home-actions').evaluate(group => {
    const rect = el => el.getBoundingClientRect().toJSON();
    return {group: rect(group), hero: rect(group.closest('.hero')), viewport: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      buttons: [...group.children].map(link => {
        const range = document.createRange();
        range.selectNodeContents(link.querySelector('.teal-hover-label') || link.firstChild);
        return {rect: rect(link), label: range.getBoundingClientRect().toJSON(),
          arrow: rect(link.querySelector('[aria-hidden]')), href: link.getAttribute('href'),
          font: parseFloat(getComputedStyle(link).fontSize), clipped: link.scrollWidth > link.clientWidth + 1};
      })};
  });
  assert.equal(data.buttons.length, 3);
  assert.deepEqual(data.buttons.map(x => x.href), ['/apparel/', '/training/', '/yoshis-book/']);
  assert(data.scrollWidth <= width, 'page overflows horizontally');
  for (const {rect, label, arrow, font, clipped} of data.buttons) {
    assert(rect.left >= 0 && rect.right <= width, 'button leaves viewport');
    assert(rect.height >= 44, 'tap target too short');
    assert(font >= 13, 'button label too small');
    assert(!clipped && label.left >= rect.left && label.right <= arrow.left - 3,
      'label clipped or overlaps arrow: ' + JSON.stringify(data));
    assert(arrow.right <= rect.right - 4, 'arrow leaves button');
    assert(rect.bottom <= data.hero.bottom, 'button leaves hero');
  }
  const [primary, training, book] = data.buttons.map(x => x.rect);
  if (width > 800) {
    assert([training, book].every(x => Math.abs(x.top - primary.top) < 1), 'desktop actions are not one row');
    assert([training, book].every(x => Math.abs(x.width - primary.width) < 1), 'desktop button widths differ');
    assert([training, book].every(x => Math.abs(x.height - primary.height) < 1), 'desktop button heights differ');
    assert(Math.abs((training.left - primary.right) - (book.left - training.right)) < 1, 'desktop spacing differs');
  } else {
    assert(Math.abs(primary.width - data.group.width) < 1, 'primary action does not span mobile row');
    assert(training.top >= primary.bottom + 9, 'mobile rows overlap');
    assert(Math.abs(training.top - book.top) < 1 && Math.abs(training.width - book.width) < 1, 'mobile secondary row is unbalanced');
    assert(Math.abs(training.height - book.height) < 1, 'mobile secondary heights differ');
    assert(Math.abs(primary.left - training.left) < 1 && Math.abs(primary.right - book.right) < 1, 'mobile button edges differ');
  }
  return data;
}
(async () => {
  for (const [engine, launcher] of Object.entries({chromium, webkit})) {
    const browser = await launcher.launch(engine === 'chromium' ? {args: ['--no-sandbox', '--disable-dev-shm-usage']} : {});
    report[engine + 'Version'] = browser.version();
    try {
      for (const width of [390, 1366]) {
        const page = await browser.newPage({viewport: {width, height: 657}, reducedMotion: 'reduce'});
        for (const route of ['index', 'apparel', 'training', 'programs', 'media', 'community', 'contact', 'yoshis-book']) {
          await page.goto(`${base}${pagePath(route)}`, {waitUntil: 'domcontentloaded'});
          await page.getByRole('button', {name: 'Menu', exact: true}).click();
          const nav = page.locator('#site-menu #primary-nav');
          assert.deepEqual(await nav.locator('a').allTextContents(), ['Home', 'Apparel', 'Yoshi’s Book', 'Train with Yoshi', 'Programs & Rates', 'Media', 'Community', 'Contact']);
          assert.equal(await nav.locator('[aria-current="page"]').getAttribute('href'), pagePath(route));
          if (route === 'index') await page.screenshot({path: path.join(out, `${engine}-book-menu-${width}.png`)});
          await nav.getByRole('link', {name: 'Yoshi’s Book', exact: true}).click();
          await page.waitForURL('**/yoshis-book/');
          assert(await page.getByRole('heading', {name: 'Yoshi’s book', exact: true}).isVisible());
          report.menus.push({engine, width, route, destinations: 8, bookPosition: 3, pass: true});
        }
        await page.close();
        const native = await browser.newPage({viewport: {width, height: 657}, javaScriptEnabled: false});
        await native.goto(base + '/home/');
        await native.locator('.menu-fallback summary').click();
        const nav = native.locator('.menu-fallback #primary-nav');
        assert.equal(await nav.locator('a:visible').count(), 8);
        await nav.getByRole('link', {name: 'Yoshi’s Book', exact: true}).click();
        await native.waitForURL('**/yoshis-book/');
        assert(await native.getByRole('heading', {name: 'Yoshi’s book', exact: true}).isVisible());
        report.menuFallbacks.push({engine, width, withoutJS: true, pass: true});
        await native.close();
      }
      if (process.env.SMF_BOOK_MENU_ONLY === '1') continue;
      for (const width of [320, 390, 600, 768, 800, 801, 900, 901, 1024, 1366, 1920]) {
        for (const theme of ['dark', 'light']) {
          const page = await browser.newPage({viewport: {width, height: 900}, reducedMotion: 'reduce'});
          await page.addInitScript(value => localStorage.setItem('smf-color-theme', value), theme);
          await load(page);
          assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
          const geometry = await layout(page, width);
          assert.equal(await page.locator('.brand-logo').first().getAttribute('src'), '/assets/brand/sport-my-fitness-header.svg?v=horizontal-20261022');
          if ([390, 1366].includes(width)) await page.screenshot({path: path.join(out, `${engine}-${theme}-${width}.png`), fullPage: true});
          report.layouts.push({engine, width, theme, geometry, pass: true});
          await page.close();
        }
      }
      for (const [width, height] of [[901, 657], [1366, 600], [1366, 657], [1366, 768], [1920, 657], [1920, 768]]) {
        for (const theme of ['dark', 'light']) {
          const page = await browser.newPage({viewport: {width, height}, reducedMotion: 'reduce'});
          await page.addInitScript(value => localStorage.setItem('smf-color-theme', value), theme);
          await load(page);
          const geometry = await layout(page, width);
          assert(geometry.buttons.every(button => button.rect.bottom <= height - 12), 'home actions fall below the first screen');
          if (width === 1366 && height !== 600) await page.screenshot({path: path.join(out, `${engine}-${theme}-${width}x${height}.png`), fullPage: false});
          report.layouts.push({engine, width, height, theme, geometry, firstScreen: true, pass: true});
          await page.close();
        }
      }
      for (const width of [390, 1366]) {
        const page = await browser.newPage({viewport: {width, height: 900}, reducedMotion: 'reduce'});
        for (const [label, destination] of [['Apparel', '/apparel/'], ['Explore training', '/training/'], ['Yoshi’s Book', '/yoshis-book/']]) {
          await load(page);
          const action = page.locator('.home-actions').getByRole('link', {name: label, exact: true});
          await action.focus(); await page.keyboard.press('Enter');
          await page.waitForURL('**' + destination);
          assert(await page.locator('h1').isVisible());
          if (destination === '/yoshis-book/') {
            assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex,nofollow');
            assert.equal(await page.locator('form, input, button[type="submit"]').count(), 0);
            await page.getByRole('switch', {name: 'Light mode', exact: true}).click();
            assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
            await page.getByRole('link', {name: 'Return home', exact: true}).click();
            await page.waitForURL('**/home/');
            assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
          }
          report.journeys.push({engine, width, destination, keyboard: true, pass: true});
        }
        await page.close();
        const native = await browser.newPage({viewport: {width, height: 900}, javaScriptEnabled: false});
        await load(native); await layout(native, width);
        await native.locator('.home-actions a[href="/yoshis-book/"]').click();
        await native.waitForURL('**/yoshis-book/');
        assert(await native.locator('h1').isVisible());
        report.fallbacks.push({engine, width, withoutJS: true, pass: true}); await native.close();
        const moving = await browser.newPage({viewport: {width, height: 900}, reducedMotion: 'no-preference'});
        await load(moving);
        await moving.waitForFunction(() => document.documentElement.dataset.smfMotionState === 'complete', {timeout: 7000});
        await layout(moving, width);
        report.motion.push({engine, width, originalEntranceCompletes: true, pass: true}); await moving.close();
      }
    } finally { await browser.close(); save(); }
  }
  report.completed = new Date().toISOString(); save();
  console.log(JSON.stringify({layouts: report.layouts.length, journeys: report.journeys.length, fallbacks: report.fallbacks.length, motion: report.motion.length, menus: report.menus.length, menuFallbacks: report.menuFallbacks.length, failures: report.failures.length}));
})().catch(error => { report.failures.push({error: error.stack}); save(); console.error(error.stack); process.exitCode = 1; });
