/* Website-only horizontal logo: responsive controls, menus and private entry.
 * Uses synthetic local gateway settings; never sends an inquiry or real login. */
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {createPreviewServer} = require('./site-preview-server.cjs');
const {createGateway} = require('../infrastructure/review-gateway/gateway.cjs');
const root = path.resolve(__dirname, '..');
const out = process.env.SMF_EVIDENCE_DIR ? path.join(process.env.SMF_EVIDENCE_DIR, 'horizontal-header') : '/tmp/smf-horizontal-header-evidence';
const logo = '/assets/brand/sport-my-fitness-header.svg?v=horizontal-original-20261022';
const routes = ['/home/','/apparel/','/yoshis-book/','/training/','/programs/','/media/','/community/','/contact/'];
const report = {layouts:[],menus:[],fallbacks:[],entryPages:[],motion:[],failures:[]};
fs.mkdirSync(out,{recursive:true});
async function listen(server) { await new Promise(r=>server.listen(0,'127.0.0.1',r)); return 'http://127.0.0.1:'+server.address().port; }
async function load(page,url) {
  assert.equal((await page.goto(url,{waitUntil:'domcontentloaded'})).status(),200);
  await page.evaluate(()=>document.fonts.ready);
  await page.locator('img').first().evaluate(img=>img.decode());
}
async function checkLayout(page,width,theme,route) {
  const data = await page.evaluate(()=>{
    const box = s=>document.querySelector(s).getBoundingClientRect().toJSON();
    const image = document.querySelector('.site-header .brand-logo');
    return {header:box('.site-header'),brand:box('.site-header .brand'),theme:box('.theme-toggle'),phone:box('.header-call'),menu:box('.menu-toggle'),
      src:image.getAttribute('src'),natural:[image.naturalWidth,image.naturalHeight],scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth};
  });
  assert.equal(data.src,logo); assert.deepEqual(data.natural,[366,100]);
  assert(data.scrollWidth<=width,'page overflow: '+route);
  const boxes = [data.brand,data.theme,data.phone,data.menu];
  for (const box of boxes) assert(box.left>=0 && box.right<=width && box.top>=0,'header item leaves viewport');
  for (const box of boxes.slice(1)) assert(box.width>=44 && box.height>=44,'control target too small');
  for (let a=0;a<boxes.length;a++) for(let b=a+1;b<boxes.length;b++) {
    const x=boxes[a],y=boxes[b]; assert(x.right<=y.left || y.right<=x.left || x.bottom<=y.top || y.bottom<=x.top,'header items overlap');
  }
  assert(Math.abs(data.brand.width/data.brand.height-3.66)<.01,'logo distorted');
  if(width<=900) {
    for(const box of boxes) assert(Math.abs((box.top+box.bottom)/2-(data.header.top+data.header.bottom)/2)<1,'controls not centered');
    assert(data.brand.width>=140,'wordmark compressed too far');
    assert.equal(data.header.height,88);
  } else assert.equal(data.header.height,176);
  assert.equal(await page.locator('html').getAttribute('data-theme'),theme);
  report.layouts.push({width,theme,route,...data});
}
(async()=>{
  const site=createPreviewServer(); const base=await listen(site);
  const gateway=http.createServer(createGateway({passwordHash:'0'.repeat(32)+':'+ '0'.repeat(128),sessionKey:'fixture-only-session-key-'.repeat(4),bypassSecret:'fixture-only-upstream-key',
    readPublic:name=>fs.promises.readFile(path.join(root,name==='index.html'?'infrastructure/review-gateway/coming-soon.html':name))}));
  const entry=await listen(gateway);
  let browser;
  try {
    browser=await chromium.launch({...(process.env.SMF_CHROMIUM_EXECUTABLE?{executablePath:process.env.SMF_CHROMIUM_EXECUTABLE}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});
    report.chromiumVersion=browser.version();
    for(const theme of ['dark','light']) {
      for(const route of routes) for(const width of [320,390,1366]) {
        const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
        const errors=[];page.on('pageerror',e=>errors.push(e.message));
        await page.addInitScript(value=>{if(self===top && location.hostname==='127.0.0.1')localStorage.setItem('smf-color-theme',value);},theme);
        try {
          await load(page,base+route);await checkLayout(page,width,theme,route);
          if(route==='/home/' && width!==320) await page.screenshot({path:path.join(out,`home-${theme}-${width}.png`)});
          assert.deepEqual(errors,[]);
        } finally {await page.close();}
      }
      for(const width of [360,428,768,900,901,1920]) {
        const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
        await page.addInitScript(value=>{if(self===top && location.hostname==='127.0.0.1')localStorage.setItem('smf-color-theme',value);},theme);
        await load(page,base+'/home/');await checkLayout(page,width,theme,'/home/');await page.close();
      }
    }
    for(const width of [320,390,1366]) {
      const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
      await load(page,base+'/home/');await page.getByRole('button',{name:'Menu',exact:true}).click();
      const menu=page.locator('.menu-panel');assert(await menu.isVisible());
      const image=menu.locator('.brand-logo');await image.evaluate(img=>img.decode());assert.equal(await image.getAttribute('src'),logo);
      const a=await image.boundingBox(),b=await menu.locator('.menu-close').boundingBox();assert(a.x+a.width+4<=b.x,'menu logo crowds close control');
      assert.equal(await menu.locator('.primary-nav a').count(),8);
      await page.screenshot({path:path.join(out,`menu-${width}.png`)});
      await page.keyboard.press('Escape');assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
      report.menus.push({width,pass:true});await page.close();
      const native=await browser.newPage({viewport:{width,height:900},javaScriptEnabled:false});await load(native,base+'/home/');
      const brand=await native.locator('.site-header .brand').boundingBox(),phone=await native.locator('.header-call').boundingBox();
      assert(brand.x+brand.width<=phone.x || phone.x+phone.width<=brand.x || brand.y+brand.height<=phone.y || phone.y+phone.height<=brand.y,'native header overlaps phone at '+width);
      if(width<=900){const button=await native.locator('.menu-fallback summary').boundingBox();assert(phone.x+phone.width+4<=button.x,'native menu overlaps phone');}
      await native.locator('.menu-fallback summary').click();assert.equal(await native.locator('#primary-nav a:visible').count(),8);
      await native.locator('#primary-nav a[href="/yoshis-book/"]').click();await native.waitForURL('**/yoshis-book/');
      report.fallbacks.push({width,withoutJavaScript:true,bookNavigation:true});await native.close();
    }
    for(const route of ['/','/admin']) {
      const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await load(page,entry+route);
      assert.equal(await page.locator('img.logo').getAttribute('src'),logo);assert(await page.locator('img.logo').isVisible());
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      await page.screenshot({path:path.join(out,route==='/'?'coming-soon.png':'admin.png')});report.entryPages.push({route,pass:true});await page.close();
    }
    const moving=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'no-preference'});await load(moving,base+'/home/');
    await moving.waitForFunction(()=>document.documentElement.dataset.smfMotionState==='complete',{timeout:8000});
    assert.equal(await moving.locator('.water-motion-toggle').count(),0);report.motion.push({originalEntranceCompleted:true,waterControlAbsent:true});await moving.close();
    console.log(JSON.stringify({layouts:report.layouts.length,menus:report.menus.length,fallbacks:report.fallbacks.length,entryPages:report.entryPages.length,motion:report.motion.length,failures:0,chromiumVersion:report.chromiumVersion}));
  } catch(error) {report.failures.push({error:error.stack});throw error;}
  finally {
    fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2)+'\n');
    if(browser)await browser.close();for(const server of [site,gateway]){server.closeAllConnections();await new Promise(r=>server.close(r));}
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
