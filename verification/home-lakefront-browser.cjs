/* Approved Home lakefront, woman on the bench, and water motion. No real submissions. */
const {chromium, webkit} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.SMF_BASE_URL || 'http://127.0.0.1:8080';
const out = path.join(process.env.SMF_EVIDENCE_DIR || '/tmp/smf-evidence', 'home-lakefront');
fs.mkdirSync(out, {recursive:true});
const report = {layouts:[], water:[], fallbacks:[], failures:[]};
const delay = milliseconds => new Promise(resolve=>setTimeout(resolve,milliseconds));
const save = () => fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));
async function load(page) {
  const response = await page.goto(base+'/index.html',{waitUntil:'domcontentloaded'});
  assert.equal(response.status(),200);
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(image=>image.decode()));});
  await page.waitForFunction(()=>['playing','reduced','unavailable','paused'].includes(document.querySelector('.smf-water-canvas').dataset.waterState));
}
(async()=>{
  const selected=(process.env.SMF_BROWSER_ENGINES||'chromium,webkit').split(',');
  for (const [engine,launcher] of Object.entries({chromium,webkit}).filter(([name])=>selected.includes(name))) {
    const browser=await launcher.launch(engine==='chromium'?{args:['--no-sandbox','--disable-dev-shm-usage']}:{});
    report[engine+'Version']=browser.version();
    try {
      for (const width of [390,1366]) {
        for (const theme of ['dark','light']) {
          const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
          await page.addInitScript(theme=>localStorage.setItem('smf-color-theme',theme),theme);
          await load(page);
          const data=await page.evaluate(()=>{
            const photo=document.querySelector('.yoshi-hero'),style=getComputedStyle(photo);
            const box=photo.getBoundingClientRect(),hero=photo.closest('.hero').getBoundingClientRect();
            const button=document.querySelector('.water-toggle').getBoundingClientRect();
            return {src:photo.getAttribute('src'),fit:style.objectFit,box:box.toJSON(),hero:hero.toJSON(),button:button.toJSON(),overflow:document.documentElement.scrollWidth>innerWidth,water:document.querySelector('.smf-water-canvas').dataset.waterState,og:document.querySelector('meta[property="og:image"]').content,twitter:document.querySelector('meta[name="twitter:image"]').content};
          });
          assert.equal(data.src,'assets/photos/smf-lakefront-bench-20261022-1584.webp');
          assert.equal(data.fit,'cover');
          assert(!data.overflow);
          assert.equal(data.og,data.twitter);
          assert(data.og.endsWith('/'+data.src));
          assert(['reduced','unavailable'].includes(data.water));
          if (width<=800) assert(data.button.height===0||data.button.top-data.hero.top<64,'water control obscures the skyline');
          const fit=Math.max(data.box.width/1584,data.box.height/993);
          const position=width<=800?0.84:0.74;
          const offset=(1584*fit-data.box.width)*position;
          const womanHead={x:1340*fit-offset,y:605*fit-(993*fit-data.box.height)*0.5};
          assert(womanHead.x>0&&womanHead.x<data.box.width&&womanHead.y>0&&womanHead.y<data.box.height,'woman is cropped out');
          await page.screenshot({path:path.join(out,`${engine}-${theme}-${width}.png`),fullPage:true});
          report.layouts.push({engine,width,theme,data,womanHead,pass:true});
          await page.close();
        }
        const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'no-preference'});
        const errors=[];
        page.on('pageerror',error=>errors.push(error.message));
        await load(page);
        await page.waitForFunction(()=>['complete','static'].includes(document.documentElement.dataset.smfMotionState)&&getComputedStyle(document.querySelector('.home-proof')).opacity==='1');
        const state=await page.locator('.smf-water-canvas').getAttribute('data-water-state');
        if(state==='unavailable') {
          assert(await page.locator('.yoshi-hero').isVisible());
          assert.equal(await page.locator('.water-toggle').isVisible(),false);
          report.water.push({engine,width,capability:'static-fallback',pass:true});
        } else {
          assert.equal(state,'playing');
          const before=await page.screenshot();
          await delay(900);
          const after=await page.screenshot();
          assert(!before.equals(after),'water does not visibly move');
          await page.getByRole('button',{name:'Pause water animation',exact:true}).click();
          await page.mouse.move(0,0);
          await page.waitForFunction(()=>document.querySelector('.smf-water-canvas').dataset.waterState==='paused');
          const paused=await page.screenshot();
          await delay(350);
          assert(paused.equals(await page.screenshot()),'paused page still moves');
          await page.getByRole('button',{name:'Play water animation',exact:true}).click();
          await page.waitForFunction(()=>document.querySelector('.smf-water-canvas').dataset.waterState==='playing');
          await page.evaluate(()=>{
            dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));
            dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));
          });
          await page.waitForFunction(()=>document.querySelector('.smf-water-canvas').dataset.waterState==='playing');
          const frames=await page.locator('.smf-water-canvas').getAttribute('data-rendered-frames');
          await page.waitForFunction(previous=>document.querySelector('.smf-water-canvas').dataset.renderedFrames!==previous,frames);
          await page.emulateMedia({reducedMotion:'reduce'});
          await page.waitForFunction(()=>document.querySelector('.smf-water-canvas').dataset.waterState==='reduced');
          assert.equal(await page.locator('.smf-water-canvas').isVisible(),false);
          report.water.push({engine,width,capability:'animated',pause:true,resume:true,restoredPageLifecycle:true,reducedMotion:true,pass:true});
        }
        assert.deepEqual(errors,[]);
        await page.close();
        const native=await browser.newPage({viewport:{width,height:900},javaScriptEnabled:false});
        await native.goto(base+'/index.html');
        assert(await native.locator('.yoshi-hero').isVisible());
        assert.equal(await native.locator('.water-toggle').isVisible(),false);
        assert.equal(await native.locator('.home-actions a').count(),3);
        report.fallbacks.push({engine,width,noJavaScript:true,staticArt:true,actions:3,pass:true});
        await native.close();
      }
    } finally {await browser.close();save();}
  }
  save();
  console.log(JSON.stringify({layouts:report.layouts.length,water:report.water,fallbacks:report.fallbacks.length,failures:report.failures.length}));
})().catch(error=>{report.failures.push({message:error.stack});save();console.error(error);process.exit(1);});
