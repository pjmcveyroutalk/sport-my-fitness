const {test} = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const crypto = require('node:crypto');
const {createGateway} = require('../infrastructure/review-gateway/gateway.cjs');
const {createContactHandler, createDelivery, MAX_BYTES, INTERESTS} = require('../infrastructure/contact-handler.cjs');
const valid = () => ({name:'Zoë O’Connor', email:'fixture@example.invalid', interest:'Help me choose',
  goals:'Strength & mobility.\nCan we talk next week?', _honey:''});
async function harness(options = {}) {
  let handler;
  const sent = [], calls = [];
  const server = http.createServer((req,res) => handler(req,res));
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  handler = createContactHandler({isPlatform:true, origins:new Set([base]),
    rateLimit:async () => {calls.push('rate'); return {rateLimited:false};},
    verifyBot:async req => {calls.push('bot'); return {isHuman:req.headers['x-is-human']==='fixture-valid', isBot:req.headers['x-is-human']!=='fixture-valid', bypassed:false, isVerifiedBot:false};},
    deliver:async value => {sent.push(value); return true;}, ...options});
  return {sent,calls,base,
    async request(body=valid(), init={}) {
      const {headers,...rest}=init;
      return fetch(base+'/api/contact/',{method:'POST',headers:{Origin:base,'Content-Type':'application/json','x-is-human':'fixture-valid',...headers},body:typeof body==='string'?body:JSON.stringify(body),...rest});
    },
    async close() {server.closeAllConnections(); await new Promise(resolve => server.close(resolve));}
  };
}
test('verified same-origin message reaches only the server delivery adapter as text', async () => {
  const h=await harness();try {
    const body=valid();body.goals='<img src=x onerror="alert(1)"> & SELECT * FROM members;';
    const r=await h.request(body); assert.equal(r.status,200);
    assert.equal((await r.json()).code,'accepted');
    assert.deepEqual(h.sent,[body]);assert.deepEqual(h.calls,['rate','bot']);
    assert.equal(r.headers.get('cache-control'),'private, no-store, max-age=0');
    assert(!r.headers.has('access-control-allow-origin'));
  } finally {await h.close();}
});
for (const [label,change] of [
  ['missing required field',b=>{delete b.goals;}], ['unexpected service control',b=>{b._captcha='false';}],
  ['injected recipient',b=>{b._cc='other@example.invalid';}], ['array field',b=>{b.email=['x@example.invalid'];}],
  ['name too long',b=>{b.name='a'.repeat(101);}], ['email too long',b=>{b.email='a'.repeat(255)+'@example.invalid';}],
  ['message too long',b=>{b.goals='a'.repeat(1501);}], ['empty message',b=>{b.goals='  \n ';}],
  ['unknown interest',b=>{b.interest='arbitrary';}], ['header injection',b=>{b.email='x@example.invalid\r\nBcc:other@example.invalid';}],
  ['name control character',b=>{b.name='A\r\nB';}], ['message control character',b=>{b.goals='a\u0000b';}],
  ['filled honeypot',b=>{b._honey='https://spam.invalid';}], ['whitespace honeypot',b=>{b._honey=' ';}]
]) test('server rejects '+label,async()=>{
  const h=await harness();try {const b=valid();change(b);assert.equal((await h.request(b)).status,400);assert.equal(h.sent.length,0);}finally{await h.close();}
});
test('all approved interest choices and boundary lengths are accepted',async()=>{
  const h=await harness();try {
    for(const interest of INTERESTS){const b=valid();b.interest=interest;assert.equal((await h.request(b)).status,200);}
    const b=valid();b.name='a'.repeat(100);b.goals='a'.repeat(1500);assert.equal((await h.request(b)).status,200);
  }finally{await h.close();}
});
test('JSON parse errors, service controls and non-object bodies cannot send',async()=>{
  const h=await harness();try {
    for(const body of ['{','null','[]','"text"','{"_subject":"attack","name":"a"}'])assert.equal((await h.request(body)).status,400);
    assert.equal(h.sent.length,0);
  }finally{await h.close();}
});
test('the real delivery adapter fixes the destination and never forwards visitor controls or headers',async()=>{
  const calls=[];
  const send=createDelivery(async(url,init)=>{calls.push({url,init});return Response.json({success:'true'});});
  assert.equal(await send({...valid(), _cc:'attack@example.invalid', _subject:'attack', _next:'https://outside.invalid'}),true);
  const {url,init}=calls[0];
  assert.equal(url,'https://formsubmit.co/ajax/Yoshi_barnes@outlook.com');
  assert.equal(init.method,'POST');assert.equal(init.redirect,'error');
  const data=JSON.parse(init.body);
  assert.equal(data._subject,'Sport My Fitness — new website message');
  assert.equal(data._template,'table');
  assert.equal(data._cc,undefined);assert.equal(data._next,undefined);
  assert.equal(init.headers.Cookie,undefined);assert.equal(data._honey,undefined);
});
test('oversized bodies are rejected with and without Content-Length',async()=>{
  const h=await harness();try{
    assert.equal((await h.request('a'.repeat(MAX_BYTES+1))).status,413);
    const response=await new Promise((resolve,reject)=>{
      const req=http.request(h.base+'/api/contact/',{method:'POST',headers:{Origin:h.base,'Content-Type':'application/json','x-is-human':'fixture-valid','Transfer-Encoding':'chunked'}},res=>{res.resume();res.on('end',()=>resolve(res.statusCode));});
      req.on('error',reject);req.write('x'.repeat(MAX_BYTES));req.end('x');
    });
    assert.equal(response,413);assert.equal(h.sent.length,0);
  }finally{await h.close();}
});
test('native form bypass, missing origin and cross-site requests cannot reach delivery',async()=>{
  const h=await harness();try{
    assert.equal((await h.request(valid(),{headers:{Origin:'https://outside.invalid'}})).status,403);
    assert.equal((await h.request(valid(),{headers:{Origin:''}})).status,403);
    assert.equal((await h.request(valid(),{headers:{'sec-fetch-site':'cross-site'}})).status,403);
    assert.equal((await h.request('name=x',{headers:{'Content-Type':'application/x-www-form-urlencoded'}})).status,415);
    assert.equal(h.sent.length,0);assert.deepEqual(h.calls,[]);
  }finally{await h.close();}
});
test('only POST can process a contact request',async()=>{
  const h=await harness();try{
    const r=await fetch(h.base+'/api/contact/');
    assert.equal(r.status,405);assert.equal(r.headers.get('allow'),'POST');
    assert.deepEqual(h.calls,[]);assert.equal(h.sent.length,0);
  }finally{await h.close();}
});
for(const [label,override,status] of [
  ['missing bot proof',{verifyBot:async()=>({isBot:true,isHuman:false})},403],
  ['local SDK bypass',{verifyBot:async()=>({isBot:false,isHuman:true,bypassed:true})},403],
  ['verified crawler',{verifyBot:async()=>({isBot:false,isHuman:false,isVerifiedBot:true})},403],
  ['bot verifier outage',{verifyBot:async()=>{throw Error('fixture timeout');}},503],
  ['missing rate rule',{rateLimit:async()=>({rateLimited:false,error:'not-found'})},503],
  ['rate service outage',{rateLimit:async()=>{throw Error('fixture timeout');}},503],
  ['unknown rate result',{rateLimit:async()=>({})},503],
  ['rate exceeded',{rateLimit:async()=>({rateLimited:true})},429],
  ['unconfigured local runtime',{isPlatform:false},503]
])test(label+' fails closed',async()=>{
  const h=await harness(override);try{const r=await h.request();assert.equal(r.status,status);assert.equal(h.sent.length,0);if(status===429)assert.equal(r.headers.get('retry-after'),'600');}finally{await h.close();}
});
test('the handler cannot reset the externally owned rate counter by restarting',async()=>{
  let count=0;const rateLimit=async()=>({rateLimited:++count>2});
  for(let i=0;i<3;i++){
    const h=await harness({rateLimit});try{assert.equal((await h.request()).status,i===2?429:200);}finally{await h.close();}
  }
  assert.equal(count,3);
});
for(const deliver of [async()=>false,async()=>{throw Error('provider timeout');}])test('provider failure never reports success',async()=>{
  const h=await harness({deliver});try{const r=await h.request();assert.equal(r.status,502);assert.equal((await r.json()).ok,false);}finally{await h.close();}
});
test('the private gateway checks its session and keeps contact POSTs on the original host',async()=>{
  const password='contact-gateway-fixture';
  const salt='0123456789abcdef0123456789abcdef';
  let contact;
  const sent=[];
  const gateway=createGateway({passwordHash:salt+':'+crypto.scryptSync(password,salt,64).toString('hex'),
    sessionKey:'contact-gateway-fixture-key-'.repeat(3), bypassSecret:'contact-fixture-upstream-key',
    contactHandler:(req,res)=>contact(req,res),
    fetchUpstream:async()=>{throw Error('Contact must not use upstream proxy');}});
  const server=http.createServer(gateway);
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  contact=createContactHandler({isPlatform:true,origins:new Set([base]),
    rateLimit:async req=>{assert.equal(req.headers.host,new URL(base).host);return {rateLimited:false};},
    verifyBot:async()=>({isHuman:true,isBot:false,bypassed:false,isVerifiedBot:false}),
    deliver:async value=>{sent.push(value);return true;}});
  try{
    const options={method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify(valid())};
    assert.equal((await fetch(base+'/api/contact/',options)).status,404);
    const login=await fetch(base+'/admin',{method:'POST',redirect:'manual',headers:{Origin:base,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({password})});
    assert.equal(login.status,303);
    const cookie=login.headers.get('set-cookie').split(';')[0];
    const response=await fetch(base+'/api/contact/',{...options,headers:{...options.headers,Cookie:cookie}});
    assert.equal(response.status,200);assert.equal((await response.json()).code,'accepted');
    assert.deepEqual(sent,[valid()]);
    assert.equal((await fetch(base+'/api/health',{headers:{Cookie:cookie}})).status,404);
  }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
