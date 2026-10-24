'use strict';
const sdk = require('@vercel/blob');
const {validateState,WINDOW_MS} = require('../infrastructure/contact-rate-limit.cjs');
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
  let existing=await sdk.get(pathname,{access:'private',useCache:false,abortSignal:signal,...auth});
  if(!existing) {
    // Initial setup happens before contact traffic is activated. Never
    // overwrite an existing counter when a deployment is rebuilt.
    await sdk.put(pathname,JSON.stringify({version:1,window:Math.floor(Date.now()/WINDOW_MS),counters:{}}),
      {access:'private',addRandomSuffix:false,allowOverwrite:false,contentType:'application/json',abortSignal:signal,...auth});
    existing=await sdk.get(pathname,{access:'private',useCache:false,abortSignal:signal,...auth});
  }
  if(!existing || existing.statusCode!==200 || !existing.blob.etag)throw Error('Counter initialization not confirmed');
  validateState(await new Response(existing.stream).json());
  console.log('CONTACT_COUNTER_READY: private hosted state confirmed; existing counts preserved');
  if(process.env.SMF_VERIFY_HOSTED_COUNTER==='1')await require('../verification/hosted-contact-counter.cjs').verify();
}
main().catch(error=>{console.error('CONTACT_COUNTER_SETUP_FAILED:',error.name);process.exitCode=1;});
