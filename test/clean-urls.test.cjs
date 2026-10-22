const {test, before, after} = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const {createPreviewServer} = require('../verification/site-preview-server.cjs');
const {createGateway} = require('../infrastructure/review-gateway/gateway.cjs');
const root = path.resolve(__dirname, '..');
const pages = {'/home/':'index.html','/apparel/':'apparel.html','/yoshis-book/':'yoshis-book.html','/training/':'training.html','/programs/':'programs.html','/media/':'media.html','/community/':'community.html','/contact/':'contact.html'};
const password = 'routing-fixture-only';
const salt = '0123456789abcdef0123456789abcdef';
let site, gateway, siteUrl, gatewayUrl, cookie;
const forwarded = [];
async function start(server) {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return 'http://127.0.0.1:' + server.address().port;
}
before(async () => {
  site = createPreviewServer(); siteUrl = await start(site);
  const handler = createGateway({
    passwordHash: salt + ':' + crypto.scryptSync(password, salt, 64).toString('hex'),
    sessionKey: 'routing-test-session-key-only-'.repeat(3),
    bypassSecret: 'routing-test-upstream-key-only',
    readPublic: async name => name === 'index.html' ? Buffer.from('<h1>Coming Soon</h1>') : fs.promises.readFile(path.join(root, name)),
    fetchUpstream: async (target, options) => {
      const url = new URL(target); forwarded.push({path:url.pathname, query:url.search, options});
      return fetch(siteUrl + url.pathname + url.search, options);
    }
  });
  gateway = http.createServer(handler); gatewayUrl = await start(gateway);
});
after(async () => {
  for (const server of [site, gateway]) if (server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});
async function login() {
  const res = await fetch(gatewayUrl + '/admin', {method:'POST', headers:{Origin:gatewayUrl,'Content-Type':'application/x-www-form-urlencoded'}, body:new URLSearchParams({password}), redirect:'manual'});
  cookie = res.headers.get('set-cookie').split(';')[0];
  return res;
}
test('successful login goes directly to the clean Home URL', async () => {
  const res = await login();
  assert.equal(res.status, 303);
  assert.equal(res.headers.get('location'), '/home/');
  const header = res.headers.get('set-cookie');
  for (const flag of ['HttpOnly','Secure','SameSite=Strict','Path=/','Max-Age=28800']) assert(header.includes(flag));
});
test('every clean page supports direct navigation and refresh with the same session', async () => {
  await login();
  for (const [route, file] of Object.entries(pages)) {
    for (let pass = 0; pass < 2; pass++) {
      const res = await fetch(gatewayUrl + route, {headers:{Cookie:cookie}});
      assert.equal(res.status, 200, route);
      const body = await res.text();
      const original = fs.readFileSync(path.join(root, file), 'utf8');
      assert(body.includes(original.slice(0, original.indexOf('</body>'))), route);
      assert.equal((body.match(/Private preview · Admin/g) || []).length, 1);
      assert.equal(new URL(res.url).pathname, route);
    }
  }
});
test('old HTML addresses and slashless addresses redirect with query strings intact', async () => {
  await login();
  const aliases = {'/':'/home/','/index.html':'/home/','/index':'/home/','/book':'/contact/','/book.html':'/contact/','/yoshi.html':'/training/','/training-options.html':'/programs/','/apparel-collection.html':'/apparel/#collection'};
  for (const [route, file] of Object.entries(pages)) { aliases['/' + file] = route; aliases[route.slice(0,-1)] = route; }
  for (const rule of require('../vercel.json').redirects) aliases[rule.source] = rule.destination;
  for (const [old, clean] of Object.entries(aliases)) {
    const expected = new URL(clean, gatewayUrl); expected.search = '?source=bookmark';
    for (const origin of [siteUrl, gatewayUrl]) {
      const res = await fetch(origin + old + '?source=bookmark', {headers:{Cookie:cookie},redirect:'manual'});
      assert.equal(res.status, 308, old);
      assert.equal(res.headers.get('location'), expected.pathname + expected.search + expected.hash, old);
      const destination = await fetch(origin + expected.pathname + expected.search, {headers:{Cookie:cookie},redirect:'manual'});
      assert.equal(destination.status, 200, 'redirect must finish in one hop: ' + old);
    }
  }
});
test('clean pages keep asset references at the site root and preserve local fragments', async () => {
  await login();
  const assets = new Set();
  for (const route of Object.keys(pages)) {
    const body = await (await fetch(gatewayUrl + route, {headers:{Cookie:cookie}})).text();
    assert(!/<base\b/i.test(body), 'fragment links must remain local');
    assert(body.includes('href="#main"'));
    for (const match of body.matchAll(/(?:src|href|poster)="([^"#]+)"/g)) {
      const value = match[1];
      if (/^(?:https?:|mailto:|tel:|data:)/.test(value)) continue;
      assert(value.startsWith('/'), route + ': ' + value);
      if (!value.endsWith('/') && !value.includes('#') && !value.startsWith('/admin')) assets.add(value);
    }
    for (const match of body.matchAll(/(?:srcset|imagesrcset)="([^"]+)"/g)) {
      for (const candidate of match[1].split(',')) {
        const value = candidate.trim().split(/\s+/)[0];
        assert(value.startsWith('/'), route + ': responsive asset ' + value); assets.add(value);
      }
    }
    for (const match of body.matchAll(/<a\b[^>]*href="(\/[^"]*)"/g)) {
      const target = new URL(match[1], gatewayUrl);
      if (target.pathname.startsWith('/admin')) continue;
      assert(pages[target.pathname], 'navigation must use a canonical page: ' + match[1]);
      if (target.hash) {
        const destination = fs.readFileSync(path.join(root, pages[target.pathname]), 'utf8');
        assert(destination.includes('id="' + target.hash.slice(1) + '"'), 'missing section: ' + match[1]);
      }
    }
  }
  for (const asset of assets) {
    const res = await fetch(gatewayUrl + asset, {headers:{Cookie:cookie}});
    assert.equal(res.status, 200, asset); await res.arrayBuffer();
  }
  assert(assets.size > 20);
});
test('a session issued before the routing change still opens clean pages', async () => {
  const passwordHash = salt + ':' + crypto.scryptSync(password, salt, 64).toString('hex');
  const issued = Math.floor(Date.now() / 1000) - 60;
  const payload = Buffer.from(JSON.stringify({iat:issued,exp:issued + 8 * 60 * 60,v:crypto.createHash('sha256').update(passwordHash).digest('hex').slice(0,24),n:'legacy-session-fixture'})).toString('base64url');
  const signature = crypto.createHmac('sha256','routing-test-session-key-only-'.repeat(3)).update(payload).digest('base64url');
  const res = await fetch(gatewayUrl + '/training/',{headers:{Cookie:'__Host-smf_admin=' + payload + '.' + signature}});
  assert.equal(res.status,200); assert((await res.text()).includes('TRAIN WITH'));
});
test('anonymous visitors still see Coming Soon and cannot open private clean routes', async () => {
  for (const route of ['/','/home/']) {
    const res = await fetch(gatewayUrl + route); assert.equal(res.status, 200); assert((await res.text()).includes('Coming Soon'));
  }
  const old = await fetch(gatewayUrl + '/index.html', {redirect:'manual'}); assert.equal(old.status,308); assert.equal(old.headers.get('location'),'/home/');
  for (const route of Object.keys(pages).filter(p => p !== '/home/')) {
    const res = await fetch(gatewayUrl + route); assert.equal(res.status,404,route); assert(!(await res.text()).includes('brand-logo'));
    const tampered = await fetch(gatewayUrl + route, {headers:{Cookie:'__Host-smf_admin=invalid.signature'}}); assert.equal(tampered.status,404);
  }
});
test('authentication, logout, HEAD and route exclusions remain enforced', async () => {
  const crossOrigin = await fetch(gatewayUrl + '/admin',{method:'POST',headers:{Origin:'https://outside.invalid','Content-Type':'application/x-www-form-urlencoded'},body:'password=invalid'}); assert.equal(crossOrigin.status,403);
  const wrong = await fetch(gatewayUrl + '/admin',{method:'POST',headers:{Origin:gatewayUrl,'Content-Type':'application/x-www-form-urlencoded'},body:'password=invalid'}); assert.equal(wrong.status,401);
  await login();
  for (const route of ['/api/health','/service-worker.js','/pwa-register.js','/unlisted/','/infrastructure/review-gateway/gateway.cjs']) {
    const res = await fetch(gatewayUrl + route,{headers:{Cookie:cookie}}); assert.equal(res.status,404,route);
  }
  const head = await fetch(gatewayUrl + '/apparel/',{method:'HEAD',headers:{Cookie:cookie}}); assert.equal(head.status,200); assert.equal(await head.text(),'');
  const clean = await fetch(gatewayUrl + '/home/?token=discard&source=keep',{headers:{Cookie:cookie}}); assert.equal(clean.status,200);
  assert.equal(forwarded.at(-1).query,'?source=keep');
  const logout = await fetch(gatewayUrl + '/admin/logout',{method:'POST',headers:{Origin:gatewayUrl,Cookie:cookie},redirect:'manual'}); assert.equal(logout.status,303); assert(logout.headers.get('set-cookie').includes('Max-Age=0'));
});
