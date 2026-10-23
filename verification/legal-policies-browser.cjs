/* Read-only local browser checks: no external requests, form sends or real logins. */
const {chromium} = require('playwright');
const {createPreviewServer} = require('./site-preview-server.cjs');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const out = process.env.SMF_LEGAL_EVIDENCE_DIR || '/tmp/smf-legal-evidence';
const policies = ['/privacy/', '/terms/', '/shipping-returns/', '/fitness-disclaimer/'];
const existing = ['/home/', '/apparel/', '/yoshis-book/', '/training/', '/programs/', '/media/', '/community/', '/contact/'];
const report = {layouts: [], navigation: [], print: [], failures: []};
fs.mkdirSync(out, {recursive: true});
(async () => {
  const server = createPreviewServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  let browser;
  try {
    browser = await chromium.launch({...(process.env.SMF_CHROMIUM_EXECUTABLE ? {executablePath: process.env.SMF_CHROMIUM_EXECUTABLE} : {}), args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']});
    report.browser = browser.version();
    const context = await browser.newContext({reducedMotion: 'reduce'});
    await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
    async function check(route, width, theme) {
      const page = await context.newPage({viewport: {width, height: 900}});
      await page.setViewportSize({width, height: 900});
      await page.addInitScript(value => {if (self === top && location.hostname === '127.0.0.1') localStorage.setItem('smf-color-theme', value);}, theme);
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      try {
        assert.equal((await page.goto(base + route, {waitUntil: 'domcontentloaded'})).status(), 200);
        await page.evaluate(() => document.fonts.ready);
        const links = page.locator('.footer-legal-nav a');
        assert.deepEqual(await links.evaluateAll(items => items.map(item => new URL(item.href).pathname)), policies);
        await page.locator('.site-footer').scrollIntoViewIfNeeded();
        const state = await page.evaluate(() => ({width: innerWidth, scrollWidth: document.documentElement.scrollWidth, footer: document.querySelector('.site-footer').getBoundingClientRect().toJSON(), links: [...document.querySelectorAll('.footer-legal-nav a')].map(a => a.getBoundingClientRect().toJSON()), heading: document.querySelector('h1').getBoundingClientRect().toJSON()}));
        assert(state.scrollWidth <= width, 'page overflows: ' + route);
        for (const box of state.links) assert(box.left >= 0 && box.right <= width && box.height >= 44 && box.top >= state.footer.top && box.bottom <= state.footer.bottom, 'footer link clipped: ' + route);
        assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
        if (policies.includes(route)) {
          assert.equal(await page.locator('form,input,textarea').count(), 0);
          assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex,nofollow');
          for (const href of await page.locator('.policy-index a').evaluateAll(items => items.map(a => a.hash))) assert.equal(await page.locator(href).count(), 1);
          await page.locator('.policy-index a').first().click();
          const section = await page.locator('.policy-section').first().boundingBox();
          const header = await page.locator('.site-header').boundingBox();
          if (width <= 900) assert(section.y >= header.y + header.height, 'section anchor covered by header');
          if (width === 390 && theme === 'dark') {await page.goto(base + route); await page.screenshot({path: path.join(out, route.split('/')[1] + '-mobile.png'), fullPage: true});}
        }
        assert.deepEqual(errors, []);
        report.layouts.push({route, width, theme});
      } finally {await page.close();}
    }
    for (const theme of ['dark', 'light']) for (const route of policies) for (const width of [320, 390, 1366]) await check(route, width, theme);
    for (const route of existing) await check(route, 390, 'dark');
    const page = await context.newPage();
    await page.goto(base + '/home/');
    await page.locator('.footer-legal-nav a').first().click();
    assert.equal(new URL(page.url()).pathname, '/privacy/');
    await page.locator('.footer-legal-nav a[href="/terms/"]').click();
    assert.equal(new URL(page.url()).pathname, '/terms/');
    await page.goBack();
    assert.equal(new URL(page.url()).pathname, '/privacy/');
    report.navigation.push('Home → Privacy → Terms → Back');
    await page.goto(base + '/contact/');
    const form = page.locator('#inquiry-form');
    assert.equal(await form.getAttribute('action'), 'https://formsubmit.co/Yoshi_barnes@outlook.com');
    await page.locator('#inquiry-privacy a').click();
    assert.equal(new URL(page.url()).pathname, '/privacy/');
    report.navigation.push('Contact notice → Privacy; form delivery destination retained');
    for (const route of policies) {
      await page.goto(base + route);
      await page.emulateMedia({media: 'print'});
      assert.equal(await page.locator('.site-header').isVisible(), false);
      assert.equal(await page.locator('h1').isVisible(), true);
      assert.equal(await page.locator('.policy-review').isVisible(), true);
      report.print.push(route);
      await page.emulateMedia({media: 'screen'});
    }
    await page.goto(base + '/privacy/');
    await page.setViewportSize({width: 1366, height: 900});
    await page.screenshot({path: path.join(out, 'privacy-desktop.png'), fullPage: true});
    await context.close();
  } catch (error) {report.failures.push(String(error.stack || error)); process.exitCode = 1;}
  finally {
    if (browser) await browser.close();
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({browser: report.browser, layouts: report.layouts.length, navigation: report.navigation.length, print: report.print.length, failures: report.failures}));
  }
})();
