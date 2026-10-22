/* Concept review only. No real inquiries, calls, payment or delivery requests. */
const {chromium, webkit} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.SMF_BASE_URL || 'http://127.0.0.1:8080';
const out = path.join(process.env.SMF_EVIDENCE_DIR || '/tmp/smf-evidence', 'book-concept');
const report = {started: new Date().toISOString(), layouts: [], journeys: [], fallbacks: [], failures: []};
fs.mkdirSync(out, {recursive: true});
const save = () => fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(report, null, 2));
async function load(page) {
  const response = await page.goto(base + '/yoshis-book.html', {waitUntil: 'networkidle'});
  assert.equal(response.status(), 200);
  await page.evaluate(() => document.fonts.ready);
}
(async () => {
  for (const [engine, launcher] of Object.entries({chromium, webkit})) {
    const browser = await launcher.launch(engine === 'chromium' ? {args: ['--no-sandbox', '--disable-dev-shm-usage']} : {});
    report[engine + 'Version'] = browser.version();
    try {
      for (const width of [320, 390, 768, 901, 1366, 1920]) {
        for (const theme of ['dark', 'light']) {
          const page = await browser.newPage({viewport: {width, height: 768}, reducedMotion: 'reduce'});
          const errors = [];
          page.on('pageerror', error => errors.push(error.message));
          await page.addInitScript(value => localStorage.setItem('smf-color-theme', value), theme);
          await load(page);
          assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
          assert(await page.getByRole('heading', {name: 'Yoshi’s book', exact: true}).isVisible());
          assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex,nofollow');
          assert.equal(await page.locator('form, input, button[type="submit"], a[download]').count(), 0);
          const geometry = await page.evaluate(() => {
            const bounds = selector => document.querySelector(selector).getBoundingClientRect().toJSON();
            return {scrollWidth: document.documentElement.scrollWidth, intro: bounds('.book-intro'), copy: bounds('.book-copy'),
              cover: bounds('.book-cover-placeholder'), header: bounds('.site-header'),
              heading: bounds('h1'), action: bounds('.book-return'), quote: bounds('.book-quote')};
          });
          assert(geometry.scrollWidth <= width, 'horizontal overflow');
          for (const key of ['cover', 'heading', 'action', 'quote']) {
            assert(geometry[key].left >= 0 && geometry[key].right <= width, key + ' leaves viewport');
          }
          assert(geometry.heading.top >= geometry.header.bottom, 'heading overlaps header');
          assert(geometry.action.height >= 44, 'primary link too short');
          if (width > 600) assert(geometry.cover.left > geometry.copy.right, 'desktop columns overlap');
          else assert(geometry.cover.top > geometry.copy.bottom, 'mobile cover overlaps introduction');
          if (width >= 1200 || width <= 600) {
            assert(Math.abs((geometry.cover.left + geometry.cover.right) / 2 -
              (geometry.intro.left + geometry.intro.right) / 2) < 1, 'book is not centered on the page');
          }
          if (width >= 1200) assert(geometry.quote.left > geometry.cover.right, 'quote overlaps centered book');
          else assert(geometry.quote.top > geometry.cover.bottom, 'stacked quote overlaps book');
          assert(await page.getByText('Sample text · not a book excerpt', {exact: true}).isVisible());
          assert.equal(await page.locator('.book-quote cite').count(), 0, 'sample must not be attributed to the author');
          assert(await page.getByText('Cover placeholder', {exact: true}).isVisible());
          assert.equal(await page.locator('main > section').count(), 1, 'removed bottom section returns');
          assert.equal(await page.locator('a[href="#about-the-book"]').count(), 0, 'orphaned about link');
          assert(Math.abs(geometry.cover.width / geometry.cover.height - .75) < .002, 'cover ratio differs');
          assert.equal(await page.locator('a[href^="tel:"]').getAttribute('href'), 'tel:+14147914526');
          if ([390, 1366].includes(width)) {
            await page.screenshot({path: path.join(out, `${engine}-${theme}-${width}.png`), fullPage: true});
          }
          assert.deepEqual(errors, []);
          report.layouts.push({engine, width, theme, geometry, pass: true});
          await page.close();
        }
      }
      for (const width of [390, 1366]) {
        const page = await browser.newPage({viewport: {width, height: 768}, reducedMotion: 'no-preference'});
        await load(page);
        const menu = page.getByRole('button', {name: 'Menu', exact: true});
        await menu.click();
        const nav = page.locator('#site-menu #primary-nav');
        assert.equal(await nav.locator('a').count(), 8);
        assert.equal(await nav.locator('[aria-current="page"]').getAttribute('href'), 'yoshis-book.html');
        await page.keyboard.press('Escape');
        assert(!(await page.locator('#site-menu').isVisible()));
        await page.getByRole('switch', {name: 'Light mode', exact: true}).click();
        await page.getByRole('link', {name: 'Return home', exact: true}).focus();
        await page.keyboard.press('Enter');
        await page.waitForURL('**/index.html');
        assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
        report.journeys.push({engine, width, keyboardReturn: true, menu: true, themePersists: true, pass: true});
        await page.close();
        const native = await browser.newPage({viewport: {width, height: 768}, javaScriptEnabled: false});
        await load(native);
        assert(await native.getByRole('heading', {name: 'Yoshi’s book', exact: true}).isVisible());
        await native.locator('.menu-fallback summary').click();
        const nativeNav = native.locator('.menu-fallback #primary-nav');
        assert.equal(await nativeNav.locator('a:visible').count(), 8);
        await nativeNav.getByRole('link', {name: 'Home', exact: true}).click();
        await native.waitForURL('**/index.html');
        report.fallbacks.push({engine, width, noJS: true, pass: true});
        await native.close();
      }
    } finally { await browser.close(); save(); }
  }
  report.completed = new Date().toISOString(); save();
  console.log(JSON.stringify({layouts: report.layouts.length, journeys: report.journeys.length,
    fallbacks: report.fallbacks.length, failures: report.failures.length}));
})().catch(error => { report.failures.push({error: error.stack}); save(); console.error(error.stack); process.exitCode = 1; });
