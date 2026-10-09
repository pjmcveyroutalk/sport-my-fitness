const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const handler = require("../api/pilot-verify-production");
const verifier = handler._test;

assert.equal(verifier.validSha("a".repeat(40)), true);
assert.equal(verifier.validSha("abc"), false);

// Exercise the public handler. Only external JWKS/health I/O is replaced;
// no credentials, live host, protected deployment or business message is used.
const {publicKey, privateKey} = crypto.generateKeyPairSync("rsa", {modulusLength:2048});
const jwk = {...publicKey.export({format:"jwk"}),kid:"local-test-key"};
const now = Math.floor(Date.now()/1000);
const claims = {
  iss:"https://oidc.vercel.com/routalk-builder",
  aud:"https://vercel.com/routalk-builder",
  owner_id:"team_jC9jlJ9GZ9GSjrbYoD0pin3U",
  project_id:"prj_TFPz6WWm29FNKxK4kRZdTMKH2PBi",
  environment:"production",iat:now,exp:now+300,
};
function token(payload=claims,header={alg:"RS256",kid:jwk.kid}) {
  const input = [header,payload].map(v=>Buffer.from(JSON.stringify(v)).toString("base64url")).join(".");
  return input+"."+crypto.sign("RSA-SHA256",Buffer.from(input),privateKey).toString("base64url");
}
async function call({method="GET",revision="b".repeat(40),bearer="",host="sport-my-fitness.vercel.app"}={}) {
  const headers = {};
  const response = {
    setHeader:(key,value)=>{headers[key]=value;},
    status(code){this.statusCode=code;return this;},
    json(body){this.body=body;return this;},
  };
  await handler({method,query:{expected_revision:revision},headers:{
    authorization:bearer?"Bearer "+bearer:"",
    "x-forwarded-host":host,"x-forwarded-proto":"https",
  }},response);
  assert.equal(headers["Cache-Control"],"no-store, max-age=0");
  assert.equal(headers["X-Content-Type-Options"],"nosniff");
  assert.equal(headers["X-Frame-Options"],"DENY");
  assert.equal(response.body.request_id,headers["X-Pilot-Request-Id"]);
  return {response,headers};
}
async function run() {
  const originalFetch = global.fetch;
  const originalRevision = process.env.VERCEL_GIT_COMMIT_SHA;
  const calls = [];
  let healthOkay = true;
  global.fetch = async url=>{
    calls.push(String(url));
    if(String(url)==="https://oidc.vercel.com/routalk-builder/.well-known/jwks") {
      return {ok:true,json:async()=>({keys:[jwk]})};
    }
    assert.equal(String(url),"https://sport-my-fitness.vercel.app/");
    return {ok:healthOkay,text:async()=>healthOkay?"<title>Sport My Fitness</title>":"Unavailable"};
  };
  try {
    assert.equal((await call({method:"POST"})).response.statusCode,405);
    assert.equal((await call({method:"POST"})).headers.Allow,"GET");
    assert.equal((await call({revision:"abc"})).response.statusCode,400);
    assert.equal((await call()).response.statusCode,401);
    assert.equal((await call({bearer:"malformed"})).response.statusCode,401);
    assert.equal(calls.length,0,"invalid or unauthenticated requests must not fetch");
    for(const changes of [{exp:now-1},{project_id:"another-project"},{owner_id:"another-owner"},{environment:"preview"}]) {
      assert.equal((await call({bearer:token({...claims,...changes})})).response.statusCode,401);
    }
    assert.equal((await call({bearer:token(claims,{alg:"none",kid:jwk.kid})})).response.statusCode,401);
    const signed = token();
    const parts = signed.split(".");
    const signature = Buffer.from(parts[2],"base64url");signature[0]^=1;
    assert.equal((await call({bearer:parts.slice(0,2).join(".")+"."+signature.toString("base64url")})).response.statusCode,401);
    assert.ok(calls.every(url=>url.endsWith("/.well-known/jwks")),"failed identity must never reach health fetch");
    process.env.VERCEL_GIT_COMMIT_SHA="b".repeat(40);
    const ready = (await call({bearer:signed,host:"sport-my-fitness.vercel.app, ignored.example"})).response;
    assert.equal(ready.statusCode,200);
    assert.equal(ready.body.state,"READY");
    assert.equal(ready.body.observed_revision,"b".repeat(40));
    assert.equal(ready.body.revision_match,true);
    assert.equal(ready.body.health_ready,true);
    process.env.VERCEL_GIT_COMMIT_SHA="c".repeat(40);
    const mismatch = (await call({bearer:signed})).response;
    assert.equal(mismatch.body.state,"WAITING_FOR_REVISION");
    assert.equal(mismatch.body.revision_match,false);
    process.env.VERCEL_GIT_COMMIT_SHA="not-a-sha";
    assert.equal((await call({bearer:signed})).response.body.observed_revision,null);
    const invalidHost = (await call({bearer:signed,host:"https://untrusted.example/path"})).response;
    assert.equal(invalidHost.statusCode,503);
    assert.equal(invalidHost.body.health_ready,false);
    healthOkay=false;
    const unavailable = (await call({bearer:signed})).response;
    assert.equal(unavailable.statusCode,503);
    assert.equal(unavailable.body.health_ready,false);
    console.log("production verifier handler contract passed (offline JWKS/health boundaries)");
  } finally {
    global.fetch=originalFetch;
    if(originalRevision==null)delete process.env.VERCEL_GIT_COMMIT_SHA;
    else process.env.VERCEL_GIT_COMMIT_SHA=originalRevision;
  }
}
run().catch(error=>{console.error(error);process.exitCode=1;});
