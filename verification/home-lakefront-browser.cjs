/* Approved Home lakefront, woman on the bench, and water motion. No real submissions. */
const {chromium, webkit} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {PNG} = require('pngjs');
const base = process.env.SMF_BASE_URL || 'http://127.0.0.1:8080';
const out = path.join(process.env.SMF_EVIDENCE_DIR || '/tmp/smf-evidence', 'home-lakefront');
fs.mkdirSync(out, {recursive:true});
const report = {layouts:[], water:[], fallbacks:[], failures:[]};
const delay = milliseconds => new Promise(resolve=>setTimeout(resolve,milliseconds));
const save = () => fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));
function pixelChange(before,after) {
  const a=PNG.sync.read(before),b=PNG.sync.read(after);
  assert.equal(a.width,b.width);assert.equal(a.height,b.height);
  let changed=0,total=0,maximum=0;
  const channels=[0,0,0];
  for(let i=0;i<a.data.length;i+=4) {
    let largest=0;
    for(let c=0;c<3;c+=1) {
      const delta=Math.abs(a.data[i+c]-b.data[i+c]);total+=delta;largest=Math.max(largest,delta);
      channels[c]+=a.data[i+c]-b.data[i+c];
    }
    maximum=Math.max(maximum,largest);
    // Ignore imperceptible compositor rounding; compare rendered pixels,
    // rather than requiring identical PNG compression bytes.
    if(largest>3)changed+=1;
  }
  return {changed,pixels:a.width*a.height,mean:total/(a.width*a.height*3),maximum,colorMeanDelta:Math.max(...channels.map(value=>Math.abs(value)/(a.width*a.height)))};
}
async function load(page) {
  const response = await page.goto(base+'/home/',{waitUntil:'domcontentloaded'});
  assert.equal(response.status(),200);
  await page.waitForFunction(()=>document.fonts.status==='loaded'&&[...document.images].every(image=>image.complete&&image.naturalWidth>0));
  await page.waitForFunction(()=>['playing','reduced','unavailable','paused'].includes(document.querySelector('.smf-water-canvas').dataset.waterState));
}

async function water(page, engine, width, mode) {
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  if (mode==='without-webgl' || mode==='shader-failure' || mode==='without-graphics') {
    await page.addInitScript(mode=>{
      const original=HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext=function(kind,...args){
        if(mode==='without-graphics'||(mode==='without-webgl'&&/webgl/.test(kind)))return null;
        const context=original.call(this,kind,...args);
        if(mode==='shader-failure'&&kind==='webgl'&&context)context.getShaderParameter=()=>false;
        return context;
      };
    },mode);
  }
  await load(page);
  assert.equal(await page.locator('.water-toggle').count(),0,'water must run without a control button');
  if(mode==='without-graphics') {
    assert.equal(await page.locator('.smf-water-canvas').getAttribute('data-water-state'),'unavailable');
    assert(await page.locator('.yoshi-hero').isVisible());
    assert.equal(await page.locator('.home-actions a').count(),3);
    assert.deepEqual(errors,[]);
    return {engine,width,mode,staticArt:true,pass:true};
  }
  await page.waitForFunction(()=>['complete','static'].includes(document.documentElement.dataset.smfMotionState)&&getComputedStyle(document.querySelector('.home-proof')).opacity==='1');
  assert.equal(await page.locator('.smf-water-canvas').getAttribute('data-water-state'),'playing','water did not start automatically');
  let renderer=await page.locator('.smf-water-canvas').getAttribute('data-water-renderer');
  if(mode==='without-webgl'||mode==='shader-failure')assert.equal(renderer,'canvas2d');
  let recovered=false;
  if(mode==='context-loss'&&renderer==='webgl') {
    await page.evaluate(()=>document.querySelector('.smf-water-canvas').getContext('webgl').getExtension('WEBGL_lose_context').loseContext());
    await page.waitForFunction(()=>document.querySelector('.smf-water-canvas').dataset.waterRenderer==='canvas2d');
    renderer='canvas2d';recovered=true;
  }
  const boxes=await page.locator('.yoshi-hero').evaluate(photo=>{
    const b=photo.getBoundingClientRect(),position=getComputedStyle(photo).objectPosition.split(' ').map(parseFloat);
    const scale=Math.max(b.width/1584,b.height/993);
    const ox=(1584*scale-b.width)*position[0]/100,oy=(993*scale-b.height)*position[1]/100;
    // Independent landmarks in the approved artwork; none of these coordinates
    // come from the animation's mask or wave implementation.
    const regions={water:[900,500,1100,600],museum:[1020,330,1220,440],woman:[1290,600,1385,685],sky:[250,60,850,270],pavement:[200,970,850,990]};
    return Object.fromEntries(Object.entries(regions).map(([name,[x1,y1,x2,y2]])=>{
      const x=Math.max(0,Math.ceil(b.x+x1*scale-ox)),y=Math.max(0,Math.ceil(b.y+y1*scale-oy));
      return [name,{x,y,width:Math.floor(Math.min(innerWidth,b.x+x2*scale-ox))-x,height:Math.floor(Math.min(innerHeight,b.y+y2*scale-oy))-y}];
    }));
  });
  const before={};
  for(const [name,clip] of Object.entries(boxes)) {
    assert(clip.width>0&&clip.height>0,'landmark outside viewport: '+name);
    before[name]=await page.screenshot({clip});
    fs.writeFileSync(path.join(out,`${engine}-${mode}-${width}-${name}-a.png`),before[name]);
  }
  await page.screenshot({path:path.join(out,`${engine}-${mode}-${width}-a.png`),fullPage:true});
  await delay(1000);
  const regions={};
  let activeWater;
  for(const [name,clip] of Object.entries(boxes)) {
    const after=await page.screenshot({clip});
    fs.writeFileSync(path.join(out,`${engine}-${mode}-${width}-${name}-b.png`),after);
    const delta=pixelChange(before[name],after);
    if(name==='water') {
      assert(delta.changed>delta.pixels*0.15&&delta.mean>1,'water is visibly still: '+JSON.stringify(delta));
      activeWater=after;
    }
    else assert(delta.maximum<=3,name+' moves with the water: '+JSON.stringify(delta));
    regions[name]=delta;
  }
  await page.screenshot({path:path.join(out,`${engine}-${mode}-${width}-b.png`),fullPage:true});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(()=>document.querySelector('.smf-water-canvas').dataset.waterState==='reduced');
  assert.equal(await page.locator('.smf-water-canvas').isVisible(),false);
  const appearance=pixelChange(activeWater,await page.screenshot({clip:boxes.water}));
  assert(appearance.colorMeanDelta<5,'moving water samples the wrong part of the image: '+JSON.stringify(appearance));
  const still=await page.screenshot();await delay(250);
  assert(still.equals(await page.screenshot()),'reduced-motion page still moves');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.waitForFunction(()=>document.querySelector('.smf-water-canvas').dataset.waterState==='playing');
  await page.evaluate(()=>{
    dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));
    dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));
  });
  const frames=await page.locator('.smf-water-canvas').getAttribute('data-rendered-frames');
  await page.waitForFunction(previous=>document.querySelector('.smf-water-canvas').dataset.renderedFrames!==previous,frames);
  assert.deepEqual(errors,[]);
  return {engine,width,mode,renderer,automatic:true,noButton:true,regions,appearance,recovered,restoredPageLifecycle:true,reducedMotion:true,pass:true};
}
(async()=>{
  const selected=(process.env.SMF_BROWSER_ENGINES||'chromium,webkit').split(',');
  for (const [engine,launcher] of Object.entries({chromium,webkit}).filter(([name])=>selected.includes(name))) {
    const browser=await launcher.launch(engine==='chromium'?{args:['--no-sandbox','--disable-dev-shm-usage']}:{});
    report[engine+'Version']=browser.version();
    try {
      for (const width of (process.env.SMF_WATER_WIDTHS||'390,1366').split(',').map(Number)) {
        for (const theme of ['dark','light']) {
          const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
          await page.addInitScript(theme=>localStorage.setItem('smf-color-theme',theme),theme);
          await load(page);
          const data=await page.evaluate(()=>{
            const photo=document.querySelector('.yoshi-hero'),style=getComputedStyle(photo);
            const box=photo.getBoundingClientRect(),hero=photo.closest('.hero').getBoundingClientRect();
            return {src:photo.getAttribute('src'),fit:style.objectFit,box:box.toJSON(),hero:hero.toJSON(),waterControls:document.querySelectorAll('.water-toggle').length,overflow:document.documentElement.scrollWidth>innerWidth,water:document.querySelector('.smf-water-canvas').dataset.waterState,og:document.querySelector('meta[property="og:image"]').content,twitter:document.querySelector('meta[name="twitter:image"]').content};
          });
          assert.equal(data.src,'/assets/photos/smf-lakefront-bench-20261022-1584.webp');
          assert.equal(data.fit,'cover');
          assert(!data.overflow);
          assert.equal(data.og,data.twitter);
          assert(data.og.endsWith(data.src));
          assert(['reduced','unavailable'].includes(data.water));
          assert.equal(data.waterControls,0,'water control must be removed');
          const fit=Math.max(data.box.width/1584,data.box.height/993);
          const position=width<=800?0.84:0.74;
          const offset=(1584*fit-data.box.width)*position;
          const womanHead={x:1340*fit-offset,y:605*fit-(993*fit-data.box.height)*0.5};
          assert(womanHead.x>0&&womanHead.x<data.box.width&&womanHead.y>0&&womanHead.y<data.box.height,'woman is cropped out');
          await page.screenshot({path:path.join(out,`${engine}-${theme}-${width}.png`),fullPage:true});
          report.layouts.push({engine,width,theme,data,womanHead,pass:true});
          await page.close();
        }
        for(const mode of (process.env.SMF_WATER_MODES||'normal,without-webgl,shader-failure,context-loss,without-graphics').split(',')) {
          const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'no-preference'});
          try {
            const result=await water(page,engine,width,mode);
            (mode==='without-graphics'?report.fallbacks:report.water).push(result);
            console.log(`PASS automatic water ${engine} ${width} ${mode}`);
          } finally {await page.close();}
        }
        const native=await browser.newPage({viewport:{width,height:900},javaScriptEnabled:false});
        await native.goto(base+'/home/');
        assert(await native.locator('.yoshi-hero').isVisible());
        assert.equal(await native.locator('.water-toggle').count(),0);
        assert.equal(await native.locator('.home-actions a').count(),3);
        report.fallbacks.push({engine,width,noJavaScript:true,staticArt:true,actions:3,pass:true});
        await native.close();
      }
    } finally {await browser.close();save();}
  }
  save();
  console.log(JSON.stringify({layouts:report.layouts.length,water:report.water.length,fallbacks:report.fallbacks.length,failures:report.failures.length}));
})().catch(error=>{report.failures.push({message:error.stack});save();console.error(error);process.exit(1);});
