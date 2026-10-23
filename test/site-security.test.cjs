const {test, before, after} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const http = require('node:http');
const {createPreviewServer} = require('../verification/site-preview-server.cjs');
const {createGateway} = require('../infrastructure/review-gateway/gateway.cjs');
const root = path.resolve(__dirname, '..');
let site, gateway, siteUrl, gatewayUrl, cookie;
const start = async server => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return 'http://127.0.0.1:' + server.address().port;
};
before(async () => {
  site = createPreviewServer(); siteUrl = await start(site);
  const password = 'security-fixture-only';
  const salt = '0123456789abcdef0123456789abcdef';
  gateway = http.createServer(createGateway({
    passwordHash: salt + ':' + crypto.scryptSync(password, salt, 64).toString('hex'),
    sessionKey: 'security-test-session-key-only-'.repeat(3),
    bypassSecret: 'security-test-upstream-key-only',
    readPublic: async () => Buffer.from('<h1>Coming Soon</h1>'),
    fetchUpstream: (target, options) => {
      const url = new URL(target);
      return fetch(siteUrl + url.pathname + url.search, options);
    }
  }));
  gatewayUrl = await start(gateway);
  const response = await fetch(gatewayUrl + '/admin', {method:'POST', redirect:'manual',
    headers:{Origin:gatewayUrl, 'Content-Type':'application/x-www-form-urlencoded'},
    body:new URLSearchParams({password})});
  assert.equal(response.status, 303);
  cookie = response.headers.get('set-cookie').split(';')[0];
});
after(async () => {
  for (const server of [site, gateway]) if (server) {
    server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
  }
});
test('every website page receives the script and submission restrictions, including through private review', async () => {
  const routes = require('../vercel.json').rewrites.map(rule => rule.source);
  for (const origin of [siteUrl, gatewayUrl]) for (const route of routes) {
    const response = await fetch(origin + route, {headers:{Cookie:cookie}});
    assert.equal(response.status, 200);
    const policy = response.headers.get('content-security-policy');
    assert(policy?.includes("script-src 'self' 'sha256-"), route + ': restrict scripts');
    assert(!/script-src[^;]*'unsafe-(?:inline|eval)'/.test(policy));
    for (const directive of ["script-src-attr 'none'", "base-uri 'none'", "object-src 'none'", "frame-ancestors 'none'", "form-action 'self'"]) assert(policy.includes(directive), directive);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response.headers.get('x-frame-options'), 'DENY');
  }
});
test('approved inline motion boot code is authorized by its exact hash', async () => {
  const policy = (await fetch(siteUrl + '/home/')).headers.get('content-security-policy') || '';
  for (const rule of require('../vercel.json').rewrites) {
    const html = fs.readFileSync(path.join(root, rule.destination), 'utf8');
    for (const [, attrs, body] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
      if (/\bsrc=|\btype=["']application\/ld\+json/.test(attrs) || !body.trim()) continue;
      const hash = crypto.createHash('sha256').update(body).digest('base64');
      assert(policy.includes("'sha256-" + hash + "'"), rule.source + ': approved script hash');
    }
  }
});
test('same-origin server submission, honeypot and message limits remain configured without service controls', () => {
  const html = fs.readFileSync(path.join(root, 'contact.html'), 'utf8');
  assert.match(html, /action="\/api\/contact\/"/);
  assert(!/name="_(?:captcha|subject|template|cc|next)"/.test(html));
  assert.match(html, /name="_honey"/);
  assert.match(html, /id="inquiry-goals" maxlength="1500"/);
  assert(!/type="file"|name="_autoresponse"|name="_cc"|name="_captcha"[^>]*value="false"/.test(html));
});
test('anonymous review visitors still cannot access the form or sitemap', async () => {
  for (const route of ['/contact/', '/sitemap.xml']) assert.equal((await fetch(gatewayUrl + route)).status, 404);
  const response = await fetch(gatewayUrl + '/admin');
  assert.equal(response.status, 200);
  assert(response.headers.get('content-security-policy').includes("form-action 'self'"));
  assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow');
});
