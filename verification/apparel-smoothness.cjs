/* Motion regression: compare the previous release with the candidate using
   real animation frames. Frame timing is diagnostic, not a hardware FPS claim. */
const {chromium, webkit} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const out = path.join(process.env.SMF_EVIDENCE_DIR || '/tmp/smf-design-evidence', 'apparel-motion');
fs.mkdirSync(out, {recursive: true});
const report = {baseline: [], candidate: [], failures: []};
async function probe(browser, engine, width, base, baseline) {
  const page = await browser.newPage({viewport: {width, height: 900}, reducedMotion: 'no-preference'});
  try {
    await page.goto(`${base}/apparel.html`, {waitUntil: 'networkidle'});
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.apparel-carousel').scrollIntoViewIfNeeded();
    // Warm baseline images too, so a decode delay cannot explain its failure.
    if (baseline) await page.locator('.apparel-floating-photo').evaluateAll(images => images.forEach(image => { image.loading = 'eager'; }));
    await page.locator('.apparel-floating-photo').evaluateAll(images => Promise.all(images.map(image => image.decode())));
    const result = await page.evaluate(async () => {
      const track = document.getElementById('apparel-look-track');
      const rows = [...track.children];
      const outgoing = track.querySelector('[data-position="previous"]');
      const incoming = rows.find(row => !['current', 'previous', 'next'].includes(row.dataset.position));
      const next = document.querySelector('[data-carousel-next]');
      const center = track.querySelector('[data-position="next"]');
      const frames = [];
      const state = node => {
        const style = getComputedStyle(node);
        return {display: style.display, opacity: Number(style.opacity), scale: style.display === 'none' ? null : new DOMMatrixReadOnly(style.transform).a};
      };
      const start = performance.now();
      next.click();
      await new Promise(resolve => {
        function frame(now) {
          frames.push({time: now - start, exit: state(outgoing), enter: state(incoming), center: state(center), displayed: rows.filter(row => getComputedStyle(row).display !== 'none').length});
          if (now - start < 650) requestAnimationFrame(frame);
          else resolve();
        }
        requestAnimationFrame(frame);
      });
      const gaps = frames.slice(1).map((frame, i) => frame.time - frames[i].time).sort((a,b) => a-b);
      const exitSamples = frames.filter(frame => frame.exit.display !== 'none' && frame.exit.opacity > .03 && frame.exit.opacity < .77).length;
      const enterSamples = frames.filter(frame => frame.enter.opacity > .03 && frame.enter.opacity < .77).length;
      return {exitSamples, enterSamples, persistentRows: frames.every(frame => frame.displayed === rows.length), frameCount: frames.length,
        centerSamples: frames.filter(frame => frame.center.scale > .66 && frame.center.scale < .98).length,
        frameTiming: {medianMs: gaps[Math.floor(gaps.length / 2)], p95Ms: gaps[Math.floor(gaps.length * .95)], maxMs: gaps.at(-1)},
        imagesReady: [...track.querySelectorAll('img')].every(image => image.complete && image.naturalWidth > 0),
        endpoints: {first: frames[0], last: frames.at(-1)}};
    });
    result.engine = engine; result.width = width;
    result.continuous = result.persistentRows && result.exitSamples >= 2 && result.enterSamples >= 2 && result.centerSamples >= 2;
    if (baseline) {
      assert.equal(result.continuous, false, 'the old release unexpectedly passed the popping regression');
      report.baseline.push(result); return;
    }
    assert(result.continuous, `entry/exit continuity failed: ${JSON.stringify(result)}`);
    assert(result.imagesReady);
    const rapid = await page.evaluate(async () => {
      const rows = [...document.querySelectorAll('#apparel-look-track > li')];
      const next = document.querySelector('[data-carousel-next]');
      const snapshot = row => { const s = getComputedStyle(row); return {x: new DOMMatrixReadOnly(s.transform).m41, opacity: Number(s.opacity)}; };
      let maxShift = 0, maxOpacityJump = 0;
      for (let step = 0; step < 3; step++) {
        // Hold a precise composed frame. WebKit's compositor clock otherwise
        // advances between the two measurements and looks like a tiny jump.
        rows.flatMap(row => row.getAnimations()).forEach(animation => {
          const time = animation.currentTime;
          animation.pause();
          if (time !== null) animation.currentTime = time;
        });
        const before = rows.map(snapshot);
        next.click();
        const restarted = rows.flatMap(row => row.getAnimations());
        restarted.forEach(animation => { animation.pause(); animation.currentTime = 0; });
        const after = rows.map(snapshot);
        before.forEach((old, i) => {
          if (old.opacity > .05 || after[i].opacity > .05) maxShift = Math.max(maxShift, Math.abs(old.x - after[i].x));
          maxOpacityJump = Math.max(maxOpacityJump, Math.abs(old.opacity - after[i].opacity));
        });
        restarted.forEach(animation => animation.play());
        await new Promise(resolve => setTimeout(resolve, 90));
      }
      await Promise.all(rows.flatMap(row => row.getAnimations()).map(animation => animation.finished.catch(() => {})));
      return {maxShift, maxOpacityJump, current: document.querySelector('[data-position="current"] a').hash, hiddenRows: rows.filter(row => row.hidden).length};
    });
    assert(rapid.maxShift <= 2 && rapid.maxOpacityJump <= .03, `rapid input snapped an in-flight garment: ${JSON.stringify(rapid)}`);
    assert.equal(rapid.current, '#apparel-sample-hoodie');
    assert.equal(rapid.hiddenRows, 0);
    await page.locator('[data-position="current"] a').click();
    assert.equal(await page.locator('[data-apparel-products] > article').count(), 1);
    await page.getByRole('button', {name: 'Next style', exact: true}).click();
    assert.equal(await page.locator('[data-apparel-products] > article').getAttribute('id'), 'apparel-sample-jacket');
    await page.emulateMedia({reducedMotion: 'reduce'});
    await page.getByRole('button', {name: 'Next style', exact: true}).click();
    assert.equal(await page.locator('#apparel-look-track').evaluate(track => [...track.children].flatMap(row => row.getAnimations()).length), 0, 'reduced-motion mode left an animation running');
    report.candidate.push({...result, rapid, oneCardPreserved: true, reducedMotion: true, pass: true});
  } finally { await page.close(); }
}
(async () => {
  try {
    for (const [engine, launcher] of [['chromium', chromium], ['webkit', webkit]]) {
      const browser = await launcher.launch(engine === 'chromium' ? {args: ['--no-sandbox', '--disable-dev-shm-usage']} : {});
      try {
        for (const width of [390, 1366, 1920]) {
          if (process.env.SMF_BASELINE_URL) await probe(browser, engine, width, process.env.SMF_BASELINE_URL, true);
          await probe(browser, engine, width, process.env.SMF_BASE_URL || 'http://127.0.0.1:8080', false);
          console.log(`PASS motion continuity ${engine} ${width}`);
        }
      } finally { await browser.close(); }
    }
  } catch (error) { report.failures.push(error.stack); console.error(error); process.exitCode = 1; }
  finally { fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(report, null, 2)); }
})();
