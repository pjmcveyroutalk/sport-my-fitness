const {test} = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const crypto = require('node:crypto');
const {createGateway} = require('../infrastructure/review-gateway/gateway.cjs');
const START = Date.parse('2026-10-25T05:00:00Z') / 1000;
const END = Date.parse('2026-10-26T05:00:00Z') / 1000;
const pages=['/home/','/apparel/','/yoshis-book/','/training/','/programs/','/media/','/community/','/contact/','/privacy/','/terms/','/shipping-returns/','/fitness-disclaimer/'];
async function setup(time=START+3600) {
  let clock=time;const forwarded=[];
  const salt='0123456789abcdef0123456789abcdef';
  const handler=createGateway({publicFrom:START,publicUntil:END,now:()=>clock,
    passwordHash:salt+':'+crypto.scryptSync('fixture',salt,64).toString('hex'),
    sessionKey:'fair-test-session-key-'.repeat(4),bypassSecret:'fair-test-upstream-only',
    readPublic:async()=>Buffer.from('<h1>Coming Soon</h1>'),
    fetchUpstream:async(url,options)=>{forwarded.push({url,options});return new Response('<html><body><h1>Approved website</h1></body></html>',{headers:{'Content-Type':'text/html','Content-Security-Policy':"default-src 'self'"}});}});
  const server=http.createServer(handler);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  return {base,forwarded,setTime:t=>clock=t,request:(p,options={})=>fetch(base+p,{redirect:'manual',...options}),
    close:async()=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}};
}
test('fair visitors open all approved pages without cookies, a login prompt or Admin badge',async()=>{
  const h=await setup();try {
    for(const p of pages){const r=await h.request(p);assert.equal(r.status,200,p);assert.equal(await r.text(),'<html><body><h1>Approved website</h1></body></html>');assert.match(r.headers.get('cache-control'),/no-store/);assert.equal(r.headers.get('set-cookie'),null);}
    assert.equal(h.forwarded.length,pages.length);
    for(const f of h.forwarded){assert.equal(f.options.headers['x-vercel-protection-bypass'],'fair-test-upstream-only');assert.equal(f.options.headers.Cookie,undefined);}
  } finally {await h.close();}
});
test('homepage and an old Admin link go directly to the website during the fair',async()=>{
  const h=await setup();try {
    for(const p of ['/','/admin']){const r=await h.request(p);assert([303,308].includes(r.status));assert.equal(r.headers.get('location'),'/home/');assert.match(r.headers.get('cache-control'),/no-store/);}
    const head=await h.request('/home/',{method:'HEAD'});assert.equal(head.status,200);assert.equal(await head.text(),'');
    assert.equal((await h.request('/contact/?public=1')).status,200);
  }finally{await h.close();}
});
test('temporary publication keeps internal APIs and workers excluded',async()=>{
  const h=await setup();try {
    for(const p of ['/api/pilot-verify-production','/api/contact/','/service-worker.js','/pwa-register.js'])assert.equal((await h.request(p)).status,404,p);
    assert.equal((await h.request('/api/contact/',{method:'POST',body:'{}'})).status,405);
    assert.equal(h.forwarded.length,0);
  }finally{await h.close();}
});
test('anonymous access closes exactly at midnight and is also closed before the event',async()=>{
  const h=await setup(START-1);try {
    assert.match(await (await h.request('/home/')).text(),/Coming Soon/);
    assert.equal((await h.request('/contact/')).status,404);
    h.setTime(END-1);assert.match(await (await h.request('/home/')).text(),/Approved website/);
    h.setTime(END);assert.match(await (await h.request('/home/')).text(),/Coming Soon/);
    assert.equal((await h.request('/contact/')).status,404);
    assert.match(await (await h.request('/admin')).text(),/type="password"/);
  }finally{await h.close();}
});
test('expiry preserves the existing signed-in review session and private controls',async()=>{
  const h=await setup(END-1);try {
    const login=await h.request('/admin',{method:'POST',headers:{Origin:h.base,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({password:'fixture'})});
    assert.equal(login.status,303);const cookie=login.headers.get('set-cookie').split(';')[0];
    h.setTime(END);
    const signed=await h.request('/contact/',{headers:{Cookie:cookie}});assert.equal(signed.status,200);assert.match(await signed.text(),/Private preview · Admin/);
    assert.equal((await h.request('/contact/')).status,404);
  }finally{await h.close();}
});
