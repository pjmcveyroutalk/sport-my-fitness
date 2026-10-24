'use strict';

const {createHmac} = require('node:crypto');
const {isIP} = require('node:net');
const WINDOW_MS = 600000;
const LIMIT = 6;
const MAX_KEYS = 512;
const MAX_STATE_BYTES = 65536;

class CounterConflict extends Error {}

function validateState(value) {
  if (!value || value.version !== 1 || !Number.isSafeInteger(value.window) || value.window < 0 ||
      !value.counters || typeof value.counters !== 'object' || Array.isArray(value.counters) ||
      Object.keys(value).sort().join(',') !== 'counters,version,window') throw Error('Invalid counter state');
  const entries = Object.entries(value.counters);
  if (entries.length > MAX_KEYS || entries.some(([key,count]) =>
    !/^[a-f0-9]{64}$/.test(key) || !Number.isInteger(count) || count < 1 || count > LIMIT)) {
    throw Error('Invalid counter state');
  }
  return value;
}

function createBlobCounterStore(options = {}) {
  const sdk = options.sdk || require('@vercel/blob');
  const storeId = options.storeId || process.env.SMF_CONTACT_BLOB_STORE_ID;
  const pathname = options.pathname || process.env.SMF_CONTACT_COUNTER_PATH;
  const token = options.token || process.env.SMF_CONTACT_BLOB_TOKEN;
  if (!/^store_[a-zA-Z0-9]+$/.test(storeId || '') ||
      !/^contact-rates\/[a-z0-9/-]+\.json$/.test(pathname || '') || pathname.length > 140 || pathname.includes('..')) {
    throw Error('Counter storage is not configured');
  }
  const auth = token ? {token} : {storeId};
  return {
    async read(signal) {
      const result = await sdk.get(pathname, {access:'private', useCache:false, abortSignal:signal, ...auth});
      if (!result || result.statusCode !== 200 || !result.blob?.etag || result.blob.size > MAX_STATE_BYTES) {
        throw Error('Counter storage is unavailable');
      }
      const chunks = [];
      let size = 0;
      for await (const chunk of result.stream) {
        size += chunk.byteLength;
        if (size > MAX_STATE_BYTES) throw Error('Counter state exceeds its limit');
        chunks.push(Buffer.from(chunk));
      }
      return {value:validateState(JSON.parse(Buffer.concat(chunks).toString('utf8'))), etag:result.blob.etag};
    },
    async write(value, etag, signal) {
      try {
        const result = await sdk.put(pathname, JSON.stringify(value), {access:'private',
          addRandomSuffix:false, allowOverwrite:true, ifMatch:etag,
          contentType:'application/json', abortSignal:signal, ...auth});
        if (!result.etag) throw Error('Counter update was not confirmed');
      } catch (error) {
        if (error instanceof sdk.BlobPreconditionFailedError) throw new CounterConflict();
        throw error;
      }
    }
  };
}

function clientAddress(req) {
  // Vercel supplies this header. Do not accept arbitrary forwarded lists,
  // visitor-selected keys, cookies or email addresses as the rate identity.
  const ip = req.headers['x-vercel-forwarded-for'];
  const family = typeof ip === 'string' && isIP(ip);
  if (!family) throw Error('Verified client address is unavailable');
  return family === 6 ? new URL('http://[' + ip + ']/').hostname.slice(1,-1) : ip;
}

function createRateLimit(options = {}) {
  const secret = options.secret || process.env.RATE_LIMIT_SECRET;
  const now = options.now || Date.now;
  const windowMs = options.windowMs || WINDOW_MS;
  const deadlineMs = options.deadlineMs || 4500;
  const isPlatform = options.isPlatform ?? (process.env.VERCEL === '1');
  let store = options.store;
  return async function rateLimit(req) {
    if (!isPlatform || typeof secret !== 'string' || secret.length < 32) throw Error('Rate protection is unavailable');
    const ip = clientAddress(req);
    store ||= createBlobCounterStore();
    const controller = new AbortController();
    let timer;
    try {
      return await Promise.race([
        (async () => {
          for (let attempt = 0; attempt < 8; attempt++) {
            controller.signal.throwIfAborted();
            const {value, etag} = await store.read(controller.signal);
            controller.signal.throwIfAborted();
            validateState(value);
            const instant = now();
            const window = Math.floor(instant / windowMs);
            if (value.window > window) throw Error('Counter clock is ahead');
            const counters = value.window === window ? {...value.counters} : {};
            const key = createHmac('sha256',secret).update(window + '\0' + ip).digest('hex');
            const count = counters[key] || 0;
            const retryAfter = Math.max(1,Math.ceil(((window + 1) * windowMs - instant) / 1000));
            if (count >= LIMIT) return {rateLimited:true, retryAfter};
            if (!count && Object.keys(counters).length >= MAX_KEYS) throw Error('Counter capacity reached');
            counters[key] = count + 1;
            try {
              // The service compares ETags atomically. A stale reader cannot
              // overwrite another server's increment or grant an extra send.
              await store.write({version:1, window, counters},etag,controller.signal);
              return {rateLimited:false};
            } catch (error) {
              if (!(error instanceof CounterConflict)) throw error;
            }
          }
          throw Error('Counter contention');
        })(),
        new Promise((_,reject) => {timer = setTimeout(() => {
          controller.abort(); reject(Error('Counter deadline exceeded'));
        },deadlineMs);})
      ]);
    } finally {clearTimeout(timer); controller.abort();}
  };
}

module.exports = {createRateLimit, createBlobCounterStore, validateState, CounterConflict, WINDOW_MS, LIMIT, MAX_KEYS};
