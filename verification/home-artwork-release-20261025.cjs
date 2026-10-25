// Verify the approved homepage layout in the normal browser motion setting.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright' : 'playwright');
const {createPreviewServer}=require('./site-preview-server.cjs');
const expected=require('./fixtures/home-artwork-approved-layout-20261025.json');
const out=process.env.SMF_EVIDENCE_DIR||'/tmp/smf-home-artwork-release-20261025';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const server=process.env.SMF_BASE_URL?null:createPreviewServer(path.resolve(__dirname,'..'));
 if(server)await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=process.env.SMF_BASE_URL||'http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,...(process.env.SMF_CHROMIUM_EXECUTABLE?{executablePath:process.env.SMF_CHROMIUM_EXECUTABLE,args:process.env.SMF_CHROMIUM_ARGS?JSON.parse(process.env.SMF_CHROMIUM_ARGS):['--no-sandbox','--no-zygote','--single-process','--font-render-hinting=none','--disable-gpu','--disable-webgl']}: {})});
 const context=await browser.newContext({deviceScaleFactor:1,reducedMotion:'no-preference'});
 await context.addInitScript(()=>localStorage.setItem('smf-color-theme',new URL(location.href).searchParams.get('reviewTheme')||'dark'));
 const page=await context.newPage(),report={base,normalMotionPreference:true,checks:[]};
 try{
  for(const item of expected){
   const errors=[];const onError=e=>errors.push(e.message);page.on('pageerror',onError);
   await page.setViewportSize({width:item.width,height:item.height});
   const response=await page.goto(base+'/home/?reviewTheme='+item.theme,{waitUntil:'networkidle'});assert.equal(response.status(),200);
   await page.evaluate(()=>Promise.all([document.fonts.ready,...[...document.images].map(i=>i.decode())]));
   const actual=await page.evaluate(selectors=>({geometry:Object.fromEntries(selectors.map(selector=>{const el=document.querySelector(selector),b=el.getBoundingClientRect(),s=getComputedStyle(el);return [selector,{x:b.x,y:b.y,width:b.width,height:b.height,text:el.textContent.trim(),font:s.font,fontSize:s.fontSize}];})),links:[...document.querySelectorAll('.home-actions a')].map(el=>({text:el.textContent,href:el.getAttribute('href')})),motionScripts:[...document.scripts].map(s=>s.src).filter(s=>/site-motion|home-water-motion/.test(s)),canvas:document.querySelectorAll('.smf-water-canvas').length,activeAnimations:document.getAnimations().filter(a=>a.playState==='running').length,overflow:document.documentElement.scrollWidth>innerWidth}),Object.keys(item.geometry));
   assert.deepEqual(actual.geometry,item.geometry);assert.deepEqual(actual.links,item.links);
   assert.deepEqual(actual.motionScripts,[]);assert.equal(actual.canvas,0);assert.equal(actual.activeAnimations,0);assert(!actual.overflow);assert.deepEqual(errors,[]);
   await page.screenshot({path:path.join(out,`home-${item.width}-${item.theme}.png`),fullPage:true});
   report.checks.push({width:item.width,theme:item.theme,layoutMatchesApproved:true,linksUnchanged:true,motionAbsent:true,errors});page.off('pageerror',onError);
   console.log('PASS',item.width,item.theme,'approved layout; static homepage');
  }
  report.passed=true;
 }finally{fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(report,null,2)+'\n');await browser.close();if(server)await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
