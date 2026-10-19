'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const crypto = require('node:crypto');
const path = require('node:path');
const { createGateway } = require(path.join(process.env.SMF_GATEWAY_ROOT || path.join(__dirname, '../prelaunch/coming-soon'), 'api/gateway.js'));
const password = 'local-test-password-' + crypto.randomBytes(12).toString('hex');
const salt = crypto.randomBytes(16).toString('hex');
const passwordHash = salt + ':' + crypto.scryptSync(password, salt, 64).toString('hex');
const sessionKey = crypto.randomBytes(32).toString('hex');
const bypassSecret = crypto.randomBytes(24).toString('hex');
async function listen(handler) {
  const server = http.createServer(handler);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return { server, url: 'http://127.0.0.1:' + server.address().port };
}
async function close(server) {
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}
test('password-only private review boundary', async t => {
  let clock = 1800000000;
  const calls = [];
  const upstream = await listen((req, res) => {
    calls.push({ path: req.url, bypass: req.headers['x-vercel-protection-bypass'], cookie: req.headers.cookie });
    if (req.url === '/redirect.html') { res.writeHead(307, { Location: 'https://sport-my-fitness.vercel.app/yoshi.html' }); return res.end(); }
    if (req.url === '/external.html') { res.writeHead(307, { Location: 'https://example.com/' }); return res.end(); }
    if (req.url === '/unavailable.html') { res.writeHead(401); return res.end('Vercel sign in'); }
    if (req.url.endsWith('.css')) { res.setHeader('Content-Type', 'text/css'); return res.end('body {color: teal;}'); }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Set-Cookie', 'do-not-forward=1');
    res.end('<html><body><h1>Private Yoshi website</h1><a href="yoshi.html">About Yoshi</a></body></html>');
  });
  const opts = {
    passwordHash, sessionKey, bypassSecret, now: () => clock,
    readPublic: async name => Buffer.from(name === 'index.html' ? '<html>Coming Soon <a href="/admin">Admin Only</a></html>' : 'public-brand-file'),
    fetchUpstream: (url, init) => {
      assert.equal(new URL(url).origin, 'https://sport-my-fitness.vercel.app');
      return fetch(upstream.url + new URL(url).pathname + new URL(url).search, init);
    }
  };
  const app = await listen(createGateway(opts));
  const request = (route, options = {}) => fetch(app.url + route, { redirect: 'manual', ...options });
  const post = (body, extra = {}) => request('/admin', { method: 'POST', headers: { Origin: app.url, 'Content-Type': 'application/x-www-form-urlencoded', ...extra }, body });
  let cookie;
  try {
    await t.test('public page and login are available without exposing review pages', async () => {
      const home = await request('/');
      assert.equal(home.status, 200); assert.match(await home.text(), /Coming Soon/);
      const login = await request('/admin');
      assert.equal(login.status, 200); assert.match(await login.text(), /type="password"/);
      for (const route of ['/yoshi.html', '/contact.html', '/site-motion.js', '/assets/private-photo.jpg', '/api/gateway.js']) {
        const response = await request(route); assert.equal(response.status, 404, route);
      }
      assert.equal(calls.length, 0);
    });
    await t.test('invalid credentials and cross-site posts never open the full site', async () => {
      const wrong = await post('password=incorrect');
      assert.equal(wrong.status, 401); assert.equal(wrong.headers.get('set-cookie'), null);
      assert.doesNotMatch(await wrong.text(), /incorrect/);
      assert.equal((await post('password=' + encodeURIComponent(password), { Origin: 'https://elsewhere.example' })).status, 403);
      assert.equal((await post('password=a&password=b')).status, 401);
      assert.equal((await post('password=' + 'x'.repeat(2500))).status, 401);
      assert.equal(calls.length, 0);
    });
    await t.test('valid password creates a secure cookie and opens current pages and assets', async () => {
      const response = await post('password=' + encodeURIComponent(password));
      assert.equal(response.status, 303); assert.equal(response.headers.get('location'), '/');
      const setCookie = response.headers.get('set-cookie');
      for (const attribute of ['__Host-smf_admin=', 'HttpOnly', 'Secure', 'SameSite=Strict', 'Path=/', 'Max-Age=28800']) assert.ok(setCookie.includes(attribute));
      cookie = setCookie.split(';')[0];
      const home = await request('/', { headers: { Cookie: cookie } });
      assert.equal(home.status, 200);
      const body = await home.text();
      assert.match(body, /Private Yoshi website/); assert.match(body, /Private preview/);
      assert.ok(!body.includes(password) && !body.includes(bypassSecret));
      assert.equal(home.headers.get('set-cookie'), null);
      assert.equal(home.headers.get('cache-control'), 'private, no-store, max-age=0');
      assert.equal(home.headers.get('vercel-cdn-cache-control'), 'no-store');
      assert.equal(home.headers.get('vary'), 'Cookie');
      const inner = await request('/yoshi.html', { headers: { Cookie: cookie } }); assert.equal(inner.status, 200);
      const css = await request('/site-design.css', { headers: { Cookie: cookie } }); assert.equal(await css.text(), 'body {color: teal;}');
      assert.ok(calls.every(call => call.bypass === bypassSecret && call.cookie === undefined));
    });
    await t.test('tampered, duplicated and expired sessions fail closed', async () => {
      const tampered = cookie.slice(0, -3) + (cookie.endsWith('abc') ? 'def' : 'abc');
      assert.equal((await request('/yoshi.html', { headers: { Cookie: tampered } })).status, 404);
      assert.equal((await request('/yoshi.html', { headers: { Cookie: cookie + '; ' + cookie } })).status, 404);
      clock += 8 * 60 * 60;
      assert.equal((await request('/yoshi.html', { headers: { Cookie: cookie } })).status, 404);
      clock -= 8 * 60 * 60;
    });
    await t.test('private responses preserve redirects but block source, APIs and offline caching', async () => {
      const headers = { Cookie: cookie };
      const redirect = await request('/redirect.html', { headers });
      assert.equal(redirect.status, 307); assert.equal(redirect.headers.get('location'), '/yoshi.html');
      assert.equal((await request('/external.html', { headers })).status, 502);
      assert.equal((await request('/unavailable.html', { headers })).status, 503);
      for (const route of ['/service-worker.js', '/pwa-register.js', '/api/inquiry', '/docs/README.md', '/design-tools/test.js']) assert.equal((await request(route, { headers })).status, 404, route);
      assert.equal((await request('/assets/%2e%2e%2fsecret', { headers })).status, 400);
      assert.equal((await request('/yoshi.html', { method: 'POST', headers })).status, 405);
    });
    await t.test('logout and return to public page are available', async () => {
      const publicPage = await request('/?public=1', { headers: { Cookie: cookie } });
      assert.match(await publicPage.text(), /Coming Soon/);
      const panel = await request('/admin', { headers: { Cookie: cookie } });
      assert.match(await panel.text(), /Log out/);
      const logout = await request('/admin/logout', { method: 'POST', headers: { Origin: app.url, Cookie: cookie } });
      assert.equal(logout.status, 303); assert.match(logout.headers.get('set-cookie'), /Max-Age=0/);
      assert.equal((await request('/yoshi.html')).status, 404);
    });
    await t.test('repeated wrong passwords are limited', async () => {
      for (let i = 0; i < 10; i++) assert.equal((await post('password=wrong')).status, 401);
      const limited = await post('password=wrong'); assert.equal(limited.status, 429); assert.equal(limited.headers.get('retry-after'), '900');
    });
    await t.test('missing secrets and password rotation invalidate access', async () => {
      const missing = await listen(createGateway({ ...opts, passwordHash: '', sessionKey: '', bypassSecret: '' }));
      const rotated = await listen(createGateway({ ...opts, passwordHash: salt + ':' + crypto.scryptSync('replacement', salt, 64).toString('hex') }));
      try {
        assert.equal((await fetch(missing.url + '/admin')).status, 503);
        assert.equal((await fetch(missing.url + '/yoshi.html', { headers: { Cookie: cookie } })).status, 404);
        assert.equal((await fetch(rotated.url + '/yoshi.html', { headers: { Cookie: cookie } })).status, 404);
      } finally { await close(missing.server); await close(rotated.server); }
    });
  } finally { await close(app.server); await close(upstream.server); }
});
