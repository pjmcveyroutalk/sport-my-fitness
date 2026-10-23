'use strict';

const RATE_LIMIT_ID = 'smf-contact-submit';
const MAX_BYTES = 16384;
const FIELDS = new Set(['name', 'email', 'interest', 'goals', '_honey']);
const INTERESTS = new Set(['Help me choose', 'Personal training', 'Semi-private or group training',
  'Online coaching', 'Summer group class', 'Kids’ camp', 'R&B stretching', 'Life coaching',
  'Functional movement & rehab', 'Mental performance course', 'Packages']);
const ORIGINS = new Set(['https://sportmyfitness.com', 'https://www.sportmyfitness.com',
  'https://sport-my-fitness.vercel.app', 'https://sport-my-fitness-routalk-builder.vercel.app',
  'https://sport-my-fitness-coming-soon.vercel.app']);
if (/^[a-z0-9-]+\.vercel\.app$/.test(process.env.VERCEL_URL || '')) ORIGINS.add('https://' + process.env.VERCEL_URL);
const DESTINATION = 'https://formsubmit.co/ajax/Yoshi_barnes@outlook.com';
const SUBJECT = 'Sport My Fitness — new website message';

function json(res, status, code, message) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('CDN-Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.end(JSON.stringify({ok:status === 200, code, message}));
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    const timer = setTimeout(() => finish(Object.assign(new Error('timeout'), {status:408})), 5000);
    function finish(error, body) {
      clearTimeout(timer);
      req.removeListener('data', data); req.removeListener('end', end);
      req.removeListener('error', fail); req.removeListener('aborted', fail);
      if (error) { req.resume(); reject(error); } else resolve(body);
    }
    function data(chunk) {
      const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      size += bytes.length;
      if (size > MAX_BYTES) return finish(Object.assign(new Error('size'), {status:413}));
      chunks.push(bytes);
    }
    function end() { finish(null, Buffer.concat(chunks).toString('utf8')); }
    function fail() { finish(Object.assign(new Error('request'), {status:400})); }
    req.on('data', data); req.on('end', end); req.on('error', fail); req.on('aborted', fail);
  });
}
function fields(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body) ||
      Object.keys(body).some(key => !FIELDS.has(key)) ||
      Object.keys(body).length !== FIELDS.size ||
      [...FIELDS].some(key => typeof body[key] !== 'string')) return null;
  const value = Object.fromEntries([...FIELDS].map(key => [key, body[key].trim()]));
  // Text remains data. Preserve names, punctuation and Unicode; reject control
  // characters in single-line fields instead of trying to blacklist HTML/SQL.
  if (!value.name || value.name.length > 100 || /[\x00-\x1f\x7f]/.test(value.name) ||
      !value.email || value.email.length > 254 || /[\s\x00-\x1f\x7f]/.test(value.email) ||
      !/^[^@]+@[^@]+\.[^@]+$/.test(value.email) ||
      !INTERESTS.has(value.interest) || !value.goals || value.goals.length > 1500 ||
      /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value.goals) || body._honey !== '') return null;
  return value;
}
async function verifyBot(req) {
  const {checkBotId} = require('botid/server');
  let timer;
  try {
    return await Promise.race([
      checkBotId({developmentOptions:{isDevelopment:false}, advancedOptions:{checkLevel:'basic', headers:req.headers}}),
      new Promise((_,reject) => {timer = setTimeout(() => reject(new Error('verification timeout')), 4000);})
    ]);
  } finally {clearTimeout(timer);}
}
async function limit(req) {
  if ((process.env.RATE_LIMIT_SECRET || '').length < 32) throw new Error('rate signing unavailable');
  const {checkRateLimit} = require('@vercel/firewall');
  return checkRateLimit(RATE_LIMIT_ID, {headers:req.headers, timeout:2000});
}
function createDelivery(sendRequest = fetch) {
  return async function deliver(value) {
    // Construct all service controls on the server. Never forward arbitrary
    // fields, cookies, visitor headers, recipients, subjects or redirect URLs.
    const response = await sendRequest(DESTINATION, {method:'POST', redirect:'error',
      signal:AbortSignal.timeout(8000),
      headers:{'Content-Type':'application/json', Accept:'application/json'},
      body:JSON.stringify({name:value.name, email:value.email, interest:value.interest,
        goals:value.goals, _subject:SUBJECT, _template:'table', _captcha:'false'})});
    const receipt = await response.json();
    return response.ok && (receipt.success === true || receipt.success === 'true');
  };
}
function createContactHandler(options = {}) {
  const check = options.verifyBot || verifyBot;
  const rate = options.rateLimit || limit;
  const send = options.deliver || createDelivery();
  const origins = options.origins || ORIGINS;
  const platform = options.isPlatform ?? (process.env.VERCEL === '1');
  return async function contact(req, res) {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return json(res, 405, 'method', 'Please send your message using the contact form.');
    }
    let origin;
    try { origin = new URL(req.headers.origin).origin; } catch {}
    if (!origin || origin !== req.headers.origin || !origins.has(origin) ||
        new URL(origin).host !== req.headers.host ||
        (req.headers['sec-fetch-site'] && req.headers['sec-fetch-site'] !== 'same-origin')) {
      return json(res, 403, 'origin', 'Please open the contact page and try again.');
    }
    if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(req.headers['content-type'] || '')) {
      return json(res, 415, 'format', 'Please send your message using the contact form.');
    }
    const length = req.headers['content-length'];
    if (length && (!/^\d+$/.test(length) || Number(length) > MAX_BYTES)) {
      return json(res, 413, 'size', 'Please keep your message within the form’s limits.');
    }
    // Local SDK defaults and provider failures never grant permission to send.
    if (!platform) return json(res, 503, 'unavailable', 'The form is temporarily unavailable. Please call or email Yoshi.');
    try {
      const result = await rate(req);
      if (result?.rateLimited === true) {
        res.setHeader('Retry-After', '600');
        return json(res, 429, 'rate', 'Too many attempts. Please wait ten minutes before trying again.');
      }
      if (result?.error || result?.rateLimited !== false) throw new Error('rate unavailable');
      const bot = await check(req);
      if (bot?.isBot !== false || bot?.isHuman !== true || bot?.bypassed || bot?.isVerifiedBot) {
        return json(res, 403, 'verification', 'We could not verify this attempt. Please reload the contact page and try again, or call Yoshi.');
      }
    } catch {
      return json(res, 503, 'unavailable', 'The form is temporarily unavailable. Please call or email Yoshi.');
    }
    let value;
    try { value = fields(JSON.parse(await readBody(req))); }
    catch (error) {
      return json(res, error.status || 400, 'invalid', 'Please check your message and try again.');
    }
    if (!value) return json(res, 400, 'invalid', 'Please check your name, email, selected interest and message, then try again.');
    try {
      if (!await send(value)) throw new Error('provider did not accept');
      // Acceptance by the delivery provider is not proof of inbox delivery.
      return json(res, 200, 'accepted', 'Your message has been accepted for delivery to Yoshi.');
    } catch {
      return json(res, 502, 'delivery', 'We could not confirm your message was accepted. Please call or email Yoshi before trying again.');
    }
  };
}
module.exports = {createContactHandler, createDelivery, RATE_LIMIT_ID, MAX_BYTES, INTERESTS};
