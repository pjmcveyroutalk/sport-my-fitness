const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const root=path.resolve(__dirname,'..');
const original=process.env.SMF_BASELINE_DIR||null;
const {createPreviewServer}=require(root+'/verification/site-preview-server.cjs');
const out=process.env.SMF_EVIDENCE_DIR||'/tmp/smf-light-arm-seam-verify-20261025';fs.mkdirSync(out,{recursive:true});
const sizes=process.env.SMF_BASE_URL?[[390,844],[901,1000],[1366,768],[1440,1000]]:[[390,844],[800,1000],[801,1000],[900,1000],[901,1000],[1100,1000],[1366,768],[1440,1000],[1920,1080]];
const selectors=['.site-header','.brand-logo','.theme-toggle','.header-call','.menu-toggle','.hero','.hero-copy','.hero h1','.home-proof','.hero-subline','.hero-description','.home-actions','.mission-strip','.site-footer'];
(async()=>{
 const servers=[];
 const serve=async dir=>{const s=createPreviewServer(dir);await new Promise(r=>s.listen(0,'127.0.0.1',r));servers.push(s);return 'http://127.0.0.1:'+s.address().port;};
 const base=process.env.SMF_BASE_URL||await serve(root),before=process.env.SMF_BASE_URL||!original?null:await serve(original);
 const c=(await import('/workspace/scratch/eacfe6178b16/smf-mockup-runtime/node_modules/@sparticuz/chromium/build/index.js')).default;
 const args=[...c.args.filter(a=>!['--in-process-gpu','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'].includes(a)),'--disable-gpu','--disable-webgl'];
 let proxy;
 if(process.env.SMF_BASE_URL){const u=new URL(process.env.HTTPS_PROXY||process.env.HTTP_PROXY);proxy={server:u.protocol+'//'+u.host};if(u.username)proxy.username=decodeURIComponent(u.username);if(u.password)proxy.password=decodeURIComponent(u.password);}
 const browser=await chromium.launch({headless:true,executablePath:'/tmp/chromium',args,...(proxy?{proxy}:{})});
 const context=await browser.newContext({deviceScaleFactor:1,reducedMotion:'no-preference',...(proxy?{ignoreHTTPSErrors:true}:{})});
 await context.addInitScript(()=>{const theme=new URL(location.href).searchParams.get('reviewTheme');if(theme)localStorage.setItem('smf-color-theme',theme);});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const load=async url=>{const r=await page.goto(url,{waitUntil:'networkidle'});assert.equal(r.status(),200);await page.evaluate(()=>Promise.all([document.fonts.ready,...[...document.images].map(i=>i.decode())]));};
 const layout=()=>page.evaluate(selectors=>({boxes:Object.fromEntries(selectors.map(s=>{const e=document.querySelector(s),b=e.getBoundingClientRect(),c=getComputedStyle(e);return [s,{x:b.x,y:b.y,width:b.width,height:b.height,font:c.font,text:e.textContent.trim()}];})),links:[...document.querySelectorAll('.home-actions a')].map(a=>[a.textContent,a.getAttribute('href')]),photo:{src:document.querySelector('.yoshi-hero').getAttribute('src'),srcset:document.querySelector('.yoshi-hero').getAttribute('srcset'),fit:getComputedStyle(document.querySelector('.yoshi-hero')).objectFit,position:getComputedStyle(document.querySelector('.yoshi-hero')).objectPosition}}),selectors);
 const report={checkedAt:new Date().toISOString(),base,checks:[],photoRegions:[],pixelComparisons:[],interaction:[],...(proxy?{runtimeProxy:true,browserAcceptsProxyCertificate:true}:{})};
 try{
  for(const [width,height]of sizes){
   await page.setViewportSize({width,height});
   for(const theme of ['dark','light']){
    let oldLayout,oldScreenshot;
    if(before){await load(before+'/home/?reviewTheme='+theme);oldLayout=await layout();oldScreenshot=await page.screenshot({fullPage:true});}
    await load(base+'/home/?reviewTheme='+theme);const now=await layout();
    if(before)assert.deepEqual(now,oldLayout,'Approved layout, copy, links or photo crop changed');
    assert.equal(await page.locator('html').getAttribute('data-theme'),theme);
    assert.equal(await page.locator('[data-theme-toggle]').getAttribute('aria-checked'),String(theme==='light'));
    assert.equal(await page.locator('.smf-water-canvas').count(),0);
    assert.equal(await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length),0);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    const screenshot=await page.screenshot({path:path.join(out,`home-${width}-${theme}.png`),fullPage:true});
    if(before&&(theme==='dark'||width<=800)){assert(oldScreenshot.equals(screenshot),'Dark/mobile appearance changed');report.pixelComparisons.push({width,theme,exactMatch:true});}
    report.checks.push({width,height,theme,layoutAndLinksUnchanged:before?true:null,photoCropUnchanged:before?true:null,motionAbsent:true,overflow:false});
    if(theme==='light'&&width>=801){
     assert.equal(await page.locator('.yoshi-arm-detail').evaluate(e=>getComputedStyle(e).display),'none');
     const clip=await page.locator('.yoshi-hero').evaluate(el=>{const b=el.getBoundingClientRect(),s=Math.max(b.width/1672,b.height/941);return {x:b.x+(b.width-1672*s)*.74+815*s,y:b.y+(b.height-941*s)*.5+120*s,width:330*s,height:315*s};});
     await page.evaluate(()=>{document.querySelector('.hero-inner').style.visibility='hidden';document.querySelector('.site-header').style.visibility='hidden';});
     const actual=await page.screenshot({path:path.join(out,`arm-${width}.png`),clip});
     await page.locator('.hero-art').evaluate(e=>e.style.visibility='hidden');
     const natural=await page.screenshot({path:path.join(out,`natural-${width}.png`),clip});
     assert(actual.equals(natural),'The whole arm/underarm region must match the unblended photograph');
     report.photoRegions.push({width,clip,originalPhotoExactMatch:true,sha256:crypto.createHash('sha256').update(actual).digest('hex')});
     await page.evaluate(()=>{for(const s of ['.hero-inner','.site-header','.hero-art'])document.querySelector(s).style.visibility='';});
    }
   }
   await load(base+'/home/?reviewTheme=dark');const button=page.locator('[data-theme-toggle]');await button.click();assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
   await page.evaluate(()=>history.replaceState(null,'','/home/'));await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
   await button.focus();await page.keyboard.press('Space');assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
   report.interaction.push({width,click:true,reloadPersists:true,keyboard:true});
   console.log('PASS',width,'both themes; original photo continuity; preserved layout');
  }
  assert.deepEqual(errors,[]);report.passed=true;
 }finally{report.pageErrors=errors;fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(report,null,2)+'\n');await browser.close();for(const s of servers)await new Promise(r=>s.close(r));}
 console.log(JSON.stringify({passed:report.passed,layouts:report.checks.length,exactPhotoRegions:report.photoRegions.length,unchangedPixelComparisons:report.pixelComparisons.length}));
})().catch(e=>{console.error(e);process.exitCode=1;});
