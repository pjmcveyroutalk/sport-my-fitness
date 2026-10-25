'use strict';
const crypto = require('node:crypto');
const { promisify } = require('node:util');
const { readFile } = require('node:fs/promises');
const path = require('node:path');
const { Readable } = require('node:stream');
const scrypt = promisify(crypto.scrypt);
const COOKIE = '__Host-smf_admin';
const LIFETIME = 8 * 60 * 60;
const UPSTREAM = 'https://sport-my-fitness.vercel.app';
// One-day fair publication, in Milwaukee time. Requests become private again
// at midnight without a scheduled deployment or a credential change.
const FAIR_FROM = Date.parse('2026-10-25T05:00:00Z') / 1000;
const FAIR_UNTIL = Date.parse('2026-10-26T05:00:00Z') / 1000;
const PAGE_ROUTES = new Set(['/home/', '/apparel/', '/yoshis-book/', '/training/', '/programs/', '/media/', '/community/', '/contact/', '/privacy/', '/terms/', '/shipping-returns/', '/fitness-disclaimer/']);
const PAGE_ALIASES = new Map([
  ['/', '/home/'], ['/index', '/home/'], ['/index/', '/home/'], ['/index.html', '/home/'],
  ...[...PAGE_ROUTES].flatMap(route => [[route.slice(0, -1), route], ...(route === '/home/' ? [] : [[route.slice(0, -1) + '.html', route]])]),
  ...[['book', '/contact/'], ['training-options', '/programs/'], ['yoshi', '/training/'], ['apparel-collection', '/apparel/#collection']]
    .flatMap(([name, route]) => [['/' + name, route], ['/' + name + '/', route], ['/' + name + '.html', route]])
]);
const PUBLIC_FILES = {
  '/favicon.ico': ['assets/brand/site-icons/favicon.ico', 'image/x-icon'],
  '/assets/brand/site-icons/icon-16.png': ['assets/brand/site-icons/icon-16.png', 'image/png'],
  '/assets/brand/site-icons/icon-32.png': ['assets/brand/site-icons/icon-32.png', 'image/png'],
  '/assets/brand/site-icons/icon-48.png': ['assets/brand/site-icons/icon-48.png', 'image/png'],
  '/assets/brand/site-icons/apple-touch-icon.png': ['assets/brand/site-icons/apple-touch-icon.png', 'image/png'],
  '/assets/brand/site-icons/icon-192.png': ['assets/brand/site-icons/icon-192.png', 'image/png'],
  '/assets/brand/site-icons/icon-512.png': ['assets/brand/site-icons/icon-512.png', 'image/png'],

  '/assets/brand/sport-my-fitness-header.svg': ['assets/brand/sport-my-fitness-header.svg', 'image/svg+xml'],
  '/assets/brand/sport-my-fitness-original-lockup.png': ['assets/brand/sport-my-fitness-original-lockup.png', 'image/png'],
  '/assets/athletic-grain.svg': ['assets/athletic-grain.svg', 'image/svg+xml'],
  '/assets/barlow-condensed-900-italic.woff': ['assets/barlow-condensed-900-italic.woff', 'font/woff'],
  '/assets/font-4.woff': ['assets/font-4.woff', 'font/woff'],
  '/robots.txt': ['robots.txt', 'text/plain; charset=utf-8']
};
function equal(a, b) {
  const aa = Buffer.from(a), bb = Buffer.from(b);
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}
function createGateway(options = {}) {
  const passwordHash = options.passwordHash ?? process.env.SMF_REVIEW_PASSWORD_HASH ?? '';
  const sessionKey = options.sessionKey ?? process.env.SMF_REVIEW_SESSION_KEY ?? '';
  const bypassSecret = options.bypassSecret ?? process.env.SMF_REVIEW_UPSTREAM_SECRET ?? '';
  const fetchUpstream = options.fetchUpstream ?? fetch;
  const readPublic = options.readPublic ?? (name => readFile(path.join(process.cwd(), name)));
  const now = options.now ?? (() => Math.floor(Date.now() / 1000));
  const publicFrom = options.publicFrom ?? FAIR_FROM;
  const publicUntil = options.publicUntil ?? FAIR_UNTIL;
  const attempts = new Map();
  const ready = /^[a-f0-9]{32}:[a-f0-9]{128}$/.test(passwordHash) && sessionKey.length >= 64 && bypassSecret.length >= 16;
  const version = crypto.createHash('sha256').update(passwordHash).digest('hex').slice(0, 24);
  const sign = text => crypto.createHmac('sha256', sessionKey).update(text).digest('base64url');
  function session(req) {
    if (!ready) return false;
    const parts = String(req.headers.cookie || '').split(';').map(p => p.trim()).filter(p => p.startsWith(COOKIE + '='));
    if (parts.length !== 1) return false;
    const token = parts[0].slice(COOKIE.length + 1);
    if (token.length > 1024) return false;
    const pair = token.split('.');
    if (pair.length !== 2 || !equal(sign(pair[0]), pair[1])) return false;
    try {
      const data = JSON.parse(Buffer.from(pair[0], 'base64url').toString('utf8'));
      return data.v === version && Number.isInteger(data.iat) && Number.isInteger(data.exp) &&
        data.iat <= now() + 30 && data.exp > now() && data.exp - data.iat === LIFETIME;
    } catch { return false; }
  }
  function cookie(value, age) {
    return COOKIE + '=' + value + '; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=' + age;
  }
  function headers(res) {
    res.setHeader('Cache-Control', 'private, no-store, max-age=0');
    res.setHeader('CDN-Cache-Control', 'no-store');
    res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
    res.setHeader('Vary', 'Cookie');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('X-Frame-Options', 'DENY');
  }
  function html(res, status, body, head = false) {
    res.statusCode = status;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self'; font-src 'self'; style-src 'self' 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'");
    res.end(head ? undefined : body);
  }
  function text(res, status, message) {
    res.statusCode = status;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end(message);
  }
  function redirect(res, location) {
    res.statusCode = 303;
    res.setHeader('Location', location);
    res.end();
  }
  function canonicalRedirect(res, url, destination) {
    const target = new URL(destination, 'http://preview.invalid');
    target.search = url.search;
    res.statusCode = 308;
    res.setHeader('Location', target.pathname + target.search + target.hash);
    res.end();
  }
  function originMatches(req) {
    try { return new URL(String(req.headers.origin || '')).host === req.headers.host; }
    catch { return false; }
  }
  function adminPage(error, signedIn) {
    const panel = signedIn
      ? '<p>You are signed in to the private website preview.</p><a class="primary" href="/home/">View website</a><form action="/admin/logout" method="post"><button class="secondary" type="submit">Log out</button></form>'
      : '<p>Enter the shared password to view the website.</p>' +
        (error ? '<p class="error" role="alert">' + error + '</p>' : '') +
        '<form action="/admin" method="post"><label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required maxlength="256" autofocus><button class="primary" type="submit">View website</button></form>';
    return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Admin Only | Sport My Fitness</title><link rel="icon" href="/favicon.ico?v=current-brand-20261022" type="image/x-icon" sizes="16x16 32x32 48x48"><link rel="icon" href="/assets/brand/site-icons/icon-32.png?v=current-brand-20261022" type="image/png" sizes="32x32"><link rel="apple-touch-icon" href="/assets/brand/site-icons/apple-touch-icon.png?v=current-brand-20261022" sizes="180x180"><style>' +
      '*{box-sizing:border-box}body{margin:0;min-height:100svh;display:grid;place-items:center;padding:24px;background:radial-gradient(ellipse at top right,#16636d80,transparent 65%),#101a21;color:#f4f7f7;font:17px/1.6 Arial,sans-serif}main{width:100%;max-width:460px;border:1px solid #527680;border-radius:16px;overflow:hidden;background:#0b1b22}.brand{padding:14px 24px;background:#000;border-bottom:1px solid #294149}.logo{display:block;width:220px;max-width:100%;height:auto;margin-inline:auto}.panel{padding:28px}h1{margin:0;font-size:30px}p{color:#b5c3c6;margin:16px 0}label{display:block;margin:20px 0 6px;font-weight:700}input{width:100%;min-height:48px;padding:10px 12px;background:#071014;color:#fff;border:1px solid #527680;border-radius:8px;font:inherit}.primary,.secondary{display:block;width:100%;min-height:48px;margin-top:16px;padding:12px;border:1px solid #03d6df;border-radius:8px;text-align:center;font:700 16px Arial,sans-serif;text-decoration:none;cursor:pointer}.primary{background:#03d6df;color:#021114}.secondary{background:transparent;color:#f4f7f7}.back{display:inline-block;margin-top:22px;color:#b5c3c6;font-size:14px}.error{color:#ffd3c9}a:focus-visible,button:focus-visible,input:focus-visible{outline:3px solid #03d6df;outline-offset:4px}</style></head><body><main><div class="brand"><img class="logo" src="/assets/brand/sport-my-fitness-header.svg?v=horizontal-original-20261022" width="366" height="100" alt="Sport My Fitness"></div><div class="panel"><h1>Admin Only</h1>' + panel + '<a class="back" href="/?public=1">Back to Coming Soon</a></div></main></body></html>';
  }
  async function passwordBody(req) {
    if (!String(req.headers['content-type'] || '').startsWith('application/x-www-form-urlencoded')) return null;
    if (Number(req.headers['content-length'] || 0) > 2048) return null;
    let body = req.body;
    if (body === undefined) {
      const chunks = []; let size = 0;
      for await (const chunk of req) { size += chunk.length; if (size > 2048) return null; chunks.push(chunk); }
      body = Buffer.concat(chunks).toString('utf8');
    }
    if (Buffer.isBuffer(body)) body = body.toString('utf8');
    if (typeof body === 'string') {
      if (Buffer.byteLength(body) > 2048) return null;
      const values = new URLSearchParams(body);
      if (values.getAll('password').length !== 1 || [...values.keys()].some(k => k !== 'password')) return null;
      body = { password: values.get('password') };
    }
    if (!body || Object.keys(body).length !== 1 || typeof body.password !== 'string' || body.password.length > 256) return null;
    return body.password;
  }
  async function login(req, res) {
    if (!originMatches(req)) return text(res, 403, 'Please open the login page and try again.');
    if (!ready) return text(res, 503, 'Private preview is being prepared.');
    const ip = String(req.headers['x-vercel-forwarded-for'] || req.socket?.remoteAddress || 'unknown').slice(0, 128);
    for (const [key, entry] of attempts) if (entry.until <= now()) attempts.delete(key);
    const entry = attempts.get(ip) || { count: 0, until: now() + 900 };
    if (entry.count >= 10 || attempts.size >= 4096) {
      res.setHeader('Retry-After', '900');
      return html(res, 429, adminPage('Too many attempts. Please try again in 15 minutes.', false));
    }
    entry.count++; attempts.set(ip, entry);
    const password = await passwordBody(req);
    const [salt, expected] = passwordHash.split(':');
    const actual = password === null ? null : await scrypt(password, salt, 64);
    if (!actual || !equal(actual, Buffer.from(expected, 'hex'))) {
      return html(res, 401, adminPage('That password was not recognized. Please try again.', false));
    }
    attempts.delete(ip);
    const data = Buffer.from(JSON.stringify({ iat: now(), exp: now() + LIFETIME, v: version, n: crypto.randomBytes(16).toString('hex') })).toString('base64url');
    res.setHeader('Set-Cookie', cookie(data + '.' + sign(data), LIFETIME));
    return redirect(res, '/home/');
  }
  async function privatePage(req, res, url, publicView = false) {
    const pathname = url.pathname;
    if (pathname === '/service-worker.js' || pathname === '/pwa-register.js' ||
        pathname.startsWith('/api/') ||
        !(PAGE_ROUTES.has(pathname) || /^\/(?:[a-z0-9._-]+\.(?:html|css|js|webmanifest))?$/i.test(pathname) ||
          /^\/(?:assets|brand)\//.test(pathname))) return text(res, 404, 'Not found.');
    const upstream = new URL(url.pathname + url.search, UPSTREAM);
    for (const key of [...upstream.searchParams.keys()]) if (/bypass|authorization|token/i.test(key)) upstream.searchParams.delete(key);
    const requestHeaders = { 'x-vercel-protection-bypass': bypassSecret, 'accept-encoding': 'identity' };
    if (req.headers.range && /^bytes=\d*-\d*$/.test(req.headers.range)) requestHeaders.range = req.headers.range;
    const response = await fetchUpstream(upstream.href, { method: req.method, headers: requestHeaders, redirect: 'manual', cache: 'no-store', signal: AbortSignal.timeout(15000) });
    if ([401, 403].includes(response.status)) return text(res, 503, 'This page is temporarily unavailable. Please try again shortly.');
    if (response.status >= 300 && response.status < 400) {
      const target = new URL(response.headers.get('location') || '/', UPSTREAM);
      if (target.origin !== UPSTREAM) return text(res, 502, 'Preview destination unavailable.');
      res.statusCode = response.status; res.setHeader('Location', target.pathname + target.search + target.hash); return res.end();
    }
    res.statusCode = response.status;
    for (const key of ['content-type', 'accept-ranges', 'content-range']) {
      const value = response.headers.get(key); if (value) res.setHeader(key, value);
    }
    // Retain the trusted site's script/form restrictions in private review too.
    // The local fallback preserves protection if an older upstream lacks CSP.
    res.setHeader('Content-Security-Policy', response.headers.get('content-security-policy') || "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; worker-src 'none'");
    const permissions = response.headers.get('permissions-policy');
    if (permissions) res.setHeader('Permissions-Policy', permissions);
    if (req.method === 'HEAD') return res.end();
    if ((response.headers.get('content-type') || '').includes('text/html') && response.status === 200) {
      const body = await response.text();
      if (publicView) return res.end(body);
      const control = '<a href="/admin" aria-label="Private preview controls" style="position:fixed;right:16px;bottom:16px;z-index:2147483000;padding:9px 14px;border:1px solid #03d6df;border-radius:8px;background:#071014;color:#f4f7f7;font:600 13px/1.4 Arial,sans-serif;text-decoration:none">Private preview · Admin</a>';
      return res.end(body.includes('</body>') ? body.replace('</body>', control + '</body>') : body + control);
    }
    if (!response.body) return res.end();
    await new Promise((resolve, reject) => { const stream = Readable.fromWeb(response.body); stream.on('error', reject); res.on('error', reject); res.on('finish', resolve); stream.pipe(res); });
  }
  return async function gateway(req, res) {
    headers(res);
    try {
      const raw = String(req.url || '/');
      const decoded = decodeURIComponent(raw.split('?')[0]);
      if (!raw.startsWith('/') || raw.startsWith('//') || decoded.includes('\\') || decoded.includes('\0') ||
          decoded.split('/').some(segment => segment === '..' || segment === '.')) return text(res, 400, 'Invalid request.');
      const url = new URL(raw, 'http://preview.invalid');
      const method = req.method || 'GET';
      const publicView = Number.isFinite(publicFrom) && Number.isFinite(publicUntil) &&
        now() >= publicFrom && now() < publicUntil;
      if (url.pathname === '/admin' && method === 'POST') return await login(req, res);
      if (url.pathname === '/admin/logout' && method === 'POST') {
        if (!originMatches(req)) return text(res, 403, 'Please open the login page and try again.');
        res.setHeader('Set-Cookie', cookie('', 0)); return redirect(res, '/');
      }
      if (!['GET', 'HEAD'].includes(method)) { res.setHeader('Allow', 'GET, HEAD'); return text(res, 405, 'Method not allowed.'); }
      if (url.pathname === '/admin') {
        if (!ready) return text(res, 503, 'Private preview is being prepared.');
        if (publicView) return redirect(res, '/home/');
        return html(res, 200, adminPage('', session(req)), method === 'HEAD');
      }
      if (url.pathname === '/admin/logout') return redirect(res, '/admin');
      if (PUBLIC_FILES[url.pathname]) {
        const [name, type] = PUBLIC_FILES[url.pathname];
        res.statusCode = 200; res.setHeader('Content-Type', type);
        return res.end(method === 'HEAD' ? undefined : await readPublic(name));
      }
      if (publicView) {
        if (!ready) return text(res, 503, 'This page is temporarily unavailable. Please try again shortly.');
        if (PAGE_ALIASES.has(url.pathname)) return canonicalRedirect(res, url, PAGE_ALIASES.get(url.pathname));
        return await privatePage(req, res, url, true);
      }
      if (session(req) && url.searchParams.get('public') !== '1') {
        if (PAGE_ALIASES.has(url.pathname)) return canonicalRedirect(res, url, PAGE_ALIASES.get(url.pathname));
        return await privatePage(req, res, url);
      }
      if (['/index.html', '/index', '/index/', '/home'].includes(url.pathname)) return canonicalRedirect(res, url, '/home/');
      if (url.pathname === '/' || url.pathname === '/home/') return html(res, 200, (await readPublic('index.html')).toString('utf8'), method === 'HEAD');
      return text(res, 404, 'Not found.');
    } catch {
      if (!res.headersSent) return text(res, 503, 'This page is temporarily unavailable. Please try again shortly.');
      res.destroy();
    }
  };
}
module.exports = createGateway();
module.exports.createGateway = createGateway;
