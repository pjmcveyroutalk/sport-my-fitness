/* Isolated design review: exact approved hero geometry, truthful proof, a shared
 * headline family, original entrance direction/timing, and useful fallbacks. */
const {chromium, webkit} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.SMF_BASE_URL || 'http://127.0.0.1:8080';
const out = path.join(process.env.SMF_EVIDENCE_DIR || '/tmp/smf-evidence', 'home-trust');
fs.mkdirSync(out, {recursive: true});
const report = {layouts: [], headlines: [], motion: [], fallbacks: [], failures: []};
const variants = ['badges', 'panel', 'quote'];
const pages = ['index', 'apparel', 'yoshis-book', 'training', 'programs', 'media', 'community', 'contact'];
const save = () => fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(report, null, 2));
async function load(page, route) {
  const response = await page.goto(`${base}/${route}.html`, {waitUntil: 'networkidle'});
  assert.equal(response.status(), 200);
  await page.evaluate(() => document.fonts.ready);
}
async function geometry(page) {
  return page.evaluate(() => {
    const rect = el => el.getBoundingClientRect().toJSON();
    return {
      hero: rect(document.querySelector('.hero')),
      spans: [...document.querySelectorAll('#hero-heading>span')].map(rect),
      actions: [...document.querySelectorAll('.home-actions>a')].map(el => ({...rect(el), href: el.getAttribute('href')})),
      photo: rect(document.querySelector('.yoshi-hero')),
      image: document.querySelector('.yoshi-hero').getAttribute('src'),
      header: rect(document.querySelector('.site-header')),
      logo: document.querySelector('.brand-logo').getAttribute('src'),
      scrollWidth: document.documentElement.scrollWidth,
    };
  });
}
async function proofGeometry(page) {
  return page.locator('.home-proof').evaluate(el => {
    const r = el.getBoundingClientRect();
    const sr = el.parentElement.querySelector('.hero-subline').getBoundingClientRect();
    const heading = [...el.parentElement.querySelectorAll('h1>span')].map(span => {
      const range = document.createRange(); range.selectNodeContents(span);
      return range.getBoundingClientRect().toJSON();
    });
    return {rect: r.toJSON(), subline: sr.toJSON(), heading, opacity: getComputedStyle(el).opacity,
      leaves: [...el.querySelectorAll('strong,.proof-detail,.proof-panel li span,blockquote,cite,.proof-qualification')]
        .filter(child => getComputedStyle(child).display !== 'none').map(child => {
          const range = document.createRange(); range.selectNodeContents(child);
          return {text: child.textContent, rect: range.getBoundingClientRect().toJSON()};
        })};
  });
}
(async () => {
  for (const [engine, launcher] of Object.entries({chromium, webkit})) {
    const browser = await launcher.launch(engine === 'chromium' ? {args: ['--no-sandbox', '--disable-dev-shm-usage']} : {});
    report[engine + 'Version'] = browser.version();
    try {
      for (const [width, height] of [[320,740], [390,844], [428,926], [768,1024], [900,700], [1024,768], [1366,657], [1366,768], [1920,900]]) {
        for (const theme of ['dark', 'light']) {
          const page = await browser.newPage({viewport: {width, height}, reducedMotion: 'reduce'});
          await page.addInitScript(value => localStorage.setItem('smf-color-theme', value), theme);
          await load(page, 'index');
          const original = await geometry(page);
          for (const variant of variants) {
            await load(page, 'home-trust-' + variant);
            const actual = await geometry(page);
            assert.deepEqual(actual, original, 'approved geometry changed: ' + JSON.stringify({engine,width,height,theme,variant}));
            assert(actual.scrollWidth <= width, 'horizontal overflow');
            const proof = await proofGeometry(page);
            assert.equal(proof.opacity, '1', 'proof not visible');
            assert(proof.rect.right <= width - 10, 'proof leaves viewport');
            assert(proof.rect.bottom <= proof.subline.top + 1, 'proof overlaps supporting copy: ' + JSON.stringify({engine,width,variant,proof}));
            for (const span of proof.heading) {
              assert(span.right <= proof.rect.left - 4, 'proof crowds the headline: ' + JSON.stringify({engine,width,variant,proof}));
            }
            for (const leaf of proof.leaves) {
              assert(leaf.rect.right <= proof.rect.right + 1, 'proof text leaves its box: ' + JSON.stringify({engine,width,variant,leaf,proof}));
            }
            if (width > 900 && height <= 768) assert(actual.actions.every(a => a.bottom <= height - 12), 'existing first-screen actions lost');
            if ((width === 390 || width === 1366) && height !== 657) {
              await page.screenshot({path: path.join(out, `${engine}-${theme}-${variant}-${width}.png`)});
            }
            report.layouts.push({engine,width,height,theme,variant,proof,approvedHeroUnchanged:true,pass:true});
          }
          await page.close();
        }
      }
      for (const width of [390, 1366]) {
        const page = await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
        for (const route of pages) {
          await load(page, route);
          const fonts = await page.locator('main :is(h1,h2,h3):not(.eyebrow)').evaluateAll(headings => headings.map(h => {
            const style = getComputedStyle(h);
            const r = document.createRange(); r.selectNodeContents(h);
            return {text:h.textContent,font:style.fontFamily,style:style.fontStyle,weight:style.fontWeight,size:parseFloat(style.fontSize),right:r.getBoundingClientRect().right};
          }));
          assert(fonts.every(f => f.font.includes('Barlow Condensed') && f.style === 'italic' && f.weight === '900'), 'headline style mismatch: '+JSON.stringify({route,width,fonts}));
          assert(fonts.every(f => f.right <= width + 2), 'headline outside viewport: '+JSON.stringify({route,width,fonts}));
          assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'page overflow: '+route);
          if (route === 'training') {
            const primary = fonts[0].size;
            assert(fonts.slice(1).every(f => f.size < primary), 'secondary headlines lack hierarchy');
            await page.screenshot({path:path.join(out,`${engine}-headline-training-${width}.png`)});
          }
          report.headlines.push({engine,width,route,fonts,pass:true});
        }
        await page.close();
        for (const variant of variants) {
          const moving = await browser.newPage({viewport:{width,height:900},reducedMotion:'no-preference'});
          await moving.addInitScript(() => {
            window.smfProofMotionTrace = [];
            const original = Element.prototype.animate;
            Element.prototype.animate = function(keyframes, options) {
              if (this.matches('.yoshi-stage,#hero-heading>span')) window.smfProofMotionTrace.push({photo:this.matches('.yoshi-stage'),first:keyframes[0],options});
              return original.call(this,keyframes,options);
            };
          });
          await load(moving, 'home-trust-' + variant);
          await moving.waitForFunction(() => document.documentElement.dataset.smfMotionState === 'complete', {timeout:8000});
          await moving.waitForFunction(() => getComputedStyle(document.querySelector('.home-proof')).opacity === '1');
          const trace = await moving.evaluate(() => window.smfProofMotionTrace);
          const photo = trace.find(t=>t.photo), text = trace.filter(t=>!t.photo);
          assert.equal(photo.first.opacity,1);
          assert(parseFloat(photo.first.translate) < 0, 'photo must enter from left');
          assert.equal(text.length,3);
          assert(text.every(t=>parseFloat(t.first.translate.split(' ')[1]) < 0 && t.options.delay > photo.options.delay + photo.options.duration), 'text must drop after photo');
          assert.equal(await moving.locator('.home-proof').evaluate(el=>getComputedStyle(el).opacity), '1');
          report.motion.push({engine,width,variant,trace,pass:true});
          await moving.close();
        }
        const native = await browser.newPage({viewport:{width,height:900},javaScriptEnabled:false});
        for (const variant of variants) {
          await load(native, 'home-trust-' + variant);
          assert.equal(await native.locator('.home-proof').evaluate(el=>getComputedStyle(el).opacity),'1');
          await native.locator('.home-actions a[href="training.html"]').click();
          await native.waitForURL('**/training.html');
          report.fallbacks.push({engine,width,variant,withoutJS:true,trainingLink:true,pass:true});
        }
        await native.close();
      }
    } finally { await browser.close(); save(); }
  }
  save(); console.log(JSON.stringify({layouts:report.layouts.length,headlines:report.headlines.length,motion:report.motion.length,fallbacks:report.fallbacks.length,failures:report.failures.length}));
})().catch(error=>{report.failures.push({error:error.stack});save();console.error(error.stack);process.exitCode=1;});
