'use strict';
// Real private storage; isolated synthetic IPs and paths. No BotID bypass,
// contact delivery, provider activation or message submission is performed.
const {randomUUID,createHmac} = require('node:crypto');
const {fork} = require('node:child_process');
const assert = require('node:assert/strict');
const sdk = require('@vercel/blob');
const {createRateLimit,WINDOW_MS} = require('../infrastructure/contact-rate-limit.cjs');
const ip='198.51.100.240';
function child(pathname,windowMs=WINDOW_MS) {
  return new Promise((resolve,reject)=>{
    const worker=fork(__filename,['--child',String(windowMs)],{env:{...process.env,SMF_CONTACT_COUNTER_PATH:pathname},silent:true});
    let output='';worker.stdout.on('data',chunk=>output+=chunk);worker.stderr.resume();
    const timer=setTimeout(()=>{worker.kill();reject(Error('Hosted worker deadline'));},20000);
    worker.on('error',reject);worker.on('exit',code=>{clearTimeout(timer);try{if(code!==0)throw Error('Hosted worker failed');resolve(JSON.parse(output));}catch(error){reject(error);}});
  });
}
async function verify() {
  const auth=process.env.SMF_CONTACT_BLOB_TOKEN?{token:process.env.SMF_CONTACT_BLOB_TOKEN}:{storeId:process.env.SMF_CONTACT_BLOB_STORE_ID};
  const prefix='contact-rates/verification/'+randomUUID().replaceAll('-','');
  const paths=[prefix+'-sequential.json',prefix+'-concurrent.json',prefix+'-reset.json'];
  const seed=async(pathname,state={version:1,window:0,counters:{}})=>sdk.put(pathname,JSON.stringify(state),{access:'private',addRandomSuffix:false,allowOverwrite:false,contentType:'application/json',abortSignal:AbortSignal.timeout(10000),...auth});
  const created=[];
  try {
    for(const pathname of paths){await seed(pathname);created.push(pathname);}
    for(let i=0;i<7;i++)assert.equal((await child(paths[0])).rateLimited,i===6);
    const concurrent=await Promise.all(Array.from({length:12},()=>child(paths[1])));
    assert.equal(concurrent.filter(x=>x.rateLimited===false).length,6);
    assert.equal(concurrent.filter(x=>x.rateLimited===true).length,6);
    const windowMs=4000;
    if(Date.now()%windowMs>1500)await new Promise(resolve=>setTimeout(resolve,windowMs-Date.now()%windowMs+25));
    const window=Math.floor(Date.now()/windowMs);
    const key=createHmac('sha256',process.env.RATE_LIMIT_SECRET).update(window+'\0'+ip).digest('hex');
    await sdk.put(paths[2],JSON.stringify({version:1,window,counters:{[key]:6}}),{access:'private',addRandomSuffix:false,allowOverwrite:true,contentType:'application/json',...auth});
    assert.equal((await child(paths[2],windowMs)).rateLimited,true);
    await new Promise(resolve=>setTimeout(resolve,Math.max(0,(window+1)*windowMs-Date.now()+75)));
    assert.equal((await child(paths[2],windowMs)).rateLimited,false);
    console.log('HOSTED_COUNTER_VERIFICATION_PASS',JSON.stringify({separateProcessAllows:6,seventhLimited:true,concurrentAllows:6,concurrentLimited:6,realClockReset:true,productionWindowMs:WINDOW_MS,resetVerificationWindowMs:windowMs,realEmailsSent:0}));
  } finally {
    if(created.length)await sdk.del(created,{abortSignal:AbortSignal.timeout(10000),...auth});
  }
}
if(process.argv[2]==='--child') {
  createRateLimit({isPlatform:true,windowMs:Number(process.argv[3]),deadlineMs:15000})({headers:{'x-vercel-forwarded-for':ip}})
    .then(result=>console.log(JSON.stringify(result)))
    .catch(error=>{console.error(error.name);process.exitCode=1;});
}
module.exports={verify};
