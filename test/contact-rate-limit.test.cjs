const {test} = require('node:test');
const assert = require('node:assert/strict');
const {createHmac} = require('node:crypto');
const {createRateLimit, createBlobCounterStore, CounterConflict, MAX_KEYS, WINDOW_MS} = require('../infrastructure/contact-rate-limit.cjs');
const secret = 'counter-test-key-'.repeat(4);
const request = ip => ({headers:{'x-vercel-forwarded-for':ip}});
function fixture(initial) {
  let value = initial || {version:1,window:0,counters:{}};
  let revision = 0;
  return {
    snapshot:() => structuredClone(value),
    async read() { const snapshot = {value:structuredClone(value),etag:String(revision)}; await new Promise(setImmediate); return snapshot; },
    async write(next,etag) { if(etag!==String(revision))throw new CounterConflict(); value=structuredClone(next);revision++; }
  };
}
const limiter = (store, extra={}) => createRateLimit({store,secret,isPlatform:true,now:()=>1200000,...extra});
test('fresh instances share six allowances and cannot reset the stored count',async()=>{
  const store=fixture();
  for(let i=0;i<7;i++)assert.equal((await limiter(store)(request('198.51.100.1'))).rateLimited,i===6);
  assert.equal(Object.values(store.snapshot().counters)[0],6);
  assert(!JSON.stringify(store.snapshot()).includes('198.51.100.1'));
});
test('concurrent readers cannot grant more than six sends with stale ETags',async()=>{
  const store=fixture();
  const results=await Promise.all(Array.from({length:20},()=>limiter(store)(request('198.51.100.2'))));
  assert.equal(results.filter(x=>x.rateLimited===false).length,6);
  assert.equal(results.filter(x=>x.rateLimited===true).length,14);
  assert.equal(Object.values(store.snapshot().counters)[0],6);
});
test('window expiry clears the old pseudonyms and allows the next attempt',async()=>{
  const store=fixture();let time=1200001;
  const rate=limiter(store,{now:()=>time});
  for(let i=0;i<6;i++)await rate(request('198.51.100.3'));
  assert.equal((await rate(request('198.51.100.3'))).retryAfter,600);
  const old=Object.keys(store.snapshot().counters)[0];time=1800000;
  assert.equal((await rate(request('198.51.100.3'))).rateLimited,false);
  assert.equal(store.snapshot().counters[old],undefined);
});
test('IPv6 variants share a bucket and visitor-supplied forwarded headers cannot select it',async()=>{
  const store=fixture();const rate=limiter(store);
  for(let i=0;i<6;i++)await rate(request('2001:0db8:0000:0000:0000:0000:0000:0001'));
  assert.equal((await rate({headers:{'x-vercel-forwarded-for':'2001:db8::1','x-forwarded-for':'198.51.100.99','x-real-ip':'198.51.100.88'}})).rateLimited,true);
  for(const headers of [{},{'x-forwarded-for':'198.51.100.1'},{'x-vercel-forwarded-for':'198.51.100.1, 198.51.100.2'},{'x-vercel-forwarded-for':['198.51.100.1']}])await assert.rejects(rate({headers}));
});
test('independent addresses get independent allowances without raw IP storage',async()=>{
  const store=fixture();const rate=limiter(store);
  for(let i=0;i<6;i++)await rate(request('198.51.100.4'));
  assert.equal((await rate(request('198.51.100.5'))).rateLimited,false);
  assert.equal(Object.keys(store.snapshot().counters).length,2);
});
test('missing setup, storage failures, corruption, clock rollback and bounded capacity fail closed',async()=>{
  for(const options of [{secret:'short'},{isPlatform:false},{store:{read:async()=>{throw Error('unavailable');}}},{store:fixture({version:1,window:4,counters:{}})},{store:fixture({version:1,window:2,counters:{bad:1}})}]) {
    await assert.rejects(limiter(fixture(),options)(request('198.51.100.6')));
  }
  const counters={};for(let i=0;i<MAX_KEYS;i++)counters[createHmac('sha256',secret).update(String(i)).digest('hex')]=1;
  await assert.rejects(limiter(fixture({version:1,window:2,counters}))(request('198.51.100.7')));
  const stalled={read:async()=>new Promise(()=>{})};
  await assert.rejects(limiter(stalled,{deadlineMs:15})(request('198.51.100.7')));
});
test('Blob adapter bypasses cached reads and requires an atomic conditional write',async()=>{
  const calls=[];let revision='"one"';let data={version:1,window:2,counters:{}};
  class Conflict extends Error {}
  const sdk={BlobPreconditionFailedError:Conflict,
    async get(path,options){calls.push({path,options});return {statusCode:200,blob:{etag:revision,size:JSON.stringify(data).length},stream:new Response(JSON.stringify(data)).body};},
    async put(path,text,options){calls.push({path,options});if(options.ifMatch!==revision)throw new Conflict();data=JSON.parse(text);revision='"two"';return {etag:revision};}};
  const store=createBlobCounterStore({sdk,storeId:'store_fixture',pathname:'contact-rates/test.json'});
  const read=await store.read();assert.equal(calls[0].options.useCache,false);assert.equal(calls[0].options.access,'private');
  await store.write(read.value,read.etag);assert.equal(calls[1].options.ifMatch,'"one"');assert.equal(calls[1].options.allowOverwrite,true);
  await assert.rejects(store.write(read.value,read.etag),CounterConflict);
  assert.equal(WINDOW_MS,600000);
});
