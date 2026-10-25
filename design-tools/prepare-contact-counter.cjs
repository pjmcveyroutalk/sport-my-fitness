'use strict';
const sdk = require('@vercel/blob');
const fs = require('node:fs');
const {validateState,WINDOW_MS} = require('../infrastructure/contact-rate-limit.cjs');
let phase='configuration';
function receipt(data) {fs.writeFileSync('assets/contact/hosted-counter-check.json',JSON.stringify(data)+'\n');}
async function main() {
  const storeId=process.env.SMF_CONTACT_BLOB_STORE_ID;
  const pathname=process.env.SMF_CONTACT_COUNTER_PATH;
  if(!storeId || !pathname || (process.env.RATE_LIMIT_SECRET||'').length<32) {
    if(process.env.VERCEL_ENV==='production')throw Error('Contact counter configuration missing');
    console.log('CONTACT_COUNTER_NOT_CONFIGURED: contact submissions fail closed in this preview');return;
  }
  if(!/^contact-rates\/[a-z0-9/-]+\.json$/.test(pathname))throw Error('Invalid counter path');
  const auth=process.env.SMF_CONTACT_BLOB_TOKEN?{token:process.env.SMF_CONTACT_BLOB_TOKEN}:{storeId};
  const signal=AbortSignal.timeout(15000);
  phase='read';
  let existing=await sdk.get(pathname,{access:'private',useCache:false,abortSignal:signal,...auth});
  if(!existing) {
    // Initial setup happens before contact traffic is activated. Never
    // overwrite an existing counter when a deployment is rebuilt.
    phase='seed';
    await sdk.put(pathname,JSON.stringify({version:1,window:Math.floor(Date.now()/WINDOW_MS),counters:{}}),
      {access:'private',addRandomSuffix:false,allowOverwrite:false,contentType:'application/json',abortSignal:signal,...auth});
    existing=await sdk.get(pathname,{access:'private',useCache:false,abortSignal:signal,...auth});
  }
  if(!existing || existing.statusCode!==200 || !existing.blob.etag)throw Error('Counter initialization not confirmed');
  validateState(await new Response(existing.stream).json());
  console.log('CONTACT_COUNTER_READY: private hosted state confirmed; existing counts preserved');
  if(process.env.SMF_VERIFY_HOSTED_COUNTER==='1') {
    phase='verification';
    const result=await require('../verification/hosted-contact-counter.cjs').verify();
    receipt({status:'PASS',...result});
  }
}
main().catch(error=>{
  console.error('CONTACT_COUNTER_SETUP_FAILED:',error.name);
  if(process.env.VERCEL_ENV==='preview' && process.env.SMF_VERIFY_HOSTED_COUNTER==='1') {
    // Protected preview diagnostic only. Contact still fails closed.
    // Production setup failures always fail the build.
    receipt({status:'FAIL',phase,errorClass:error.name,
      httpStatus:(String(error.message).match(/\b(?:401|403|404|409|412|429|500|503)\b/)||[])[0]||null,
      hasOidc:!!process.env.VERCEL_OIDC_TOKEN,hasStoreId:!!process.env.SMF_CONTACT_BLOB_STORE_ID,
      hasSigningKey:(process.env.RATE_LIMIT_SECRET||'').length>=32});
  } else process.exitCode=1;
});
