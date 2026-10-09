const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'home-intro.js'), 'utf8');

function visit(options = {}) {
  const classes = new Set();
  const timers = new Map();
  const frames = new Map();
  const saved = new Map(options.seen ? [['smf-home-intro-seen-v1', '1']] : []);
  const preference = new EventTarget();
  preference.matches = Boolean(options.reduced);
  const image = new EventTarget();
  image.complete = !options.imageLoading;
  let decode;
  image.decode = () => options.decodeLoading
    ? new Promise(resolve => { decode = resolve; }) : Promise.resolve();
  let fonts;
  const document = new EventTarget();
  document.hidden = Boolean(options.hidden);
  document.readyState = options.domLoading ? 'loading' : 'complete';
  document.fonts = { ready: options.fontsLoading
    ? new Promise(resolve => { fonts = resolve; }) : Promise.resolve() };
  document.querySelector = () => image;
  document.documentElement = {
    classList: {
      add: (...names) => names.forEach(name => classes.add(name)),
      remove: (...names) => names.forEach(name => classes.delete(name))
    }
  };
  const window = new EventTarget();
  window.location = { hash: options.hash || '' };
  window.scrollY = options.scrollY || 0;
  window.matchMedia = options.noMatchMedia ? undefined : () => preference;
  window.performance = { getEntriesByType: () => [{ type: options.navigation || 'navigate' }] };
  window.sessionStorage = {
    getItem: key => {
      if (options.blockedStorage) throw new Error('Storage unavailable');
      return saved.get(key) || null;
    },
    setItem: (key, value) => saved.set(key, value)
  };
  const navigator = { connection: { saveData: Boolean(options.saveData) } };
  let nextId = 0;
  let now = 0;
  const setTimeout = (fn, delay) => {
    const id = ++nextId;
    timers.set(id, { fn, at: now + delay });
    return id;
  };
  const clearTimeout = id => timers.delete(id);
  const requestAnimationFrame = fn => {
    const id = ++nextId;
    frames.set(id, fn);
    return id;
  };
  const cancelAnimationFrame = id => frames.delete(id);
  Object.assign(window, { setTimeout, clearTimeout, requestAnimationFrame, cancelAnimationFrame });
  vm.runInNewContext(source, {
    document, window, navigator, setTimeout, clearTimeout,
    requestAnimationFrame, cancelAnimationFrame
  });
  async function settle() {
    for (let i = 0; i < 16; i++) await Promise.resolve();
  }
  function paint() {
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach(fn => fn(now));
  }
  function tick(milliseconds) {
    const end = now + milliseconds;
    while (true) {
      const next = [...timers].filter(([, value]) => value.at <= end)
        .sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      now = next[1].at;
      timers.delete(next[0]);
      next[1].fn();
    }
    now = end;
  }
  return {
    classes, timers, frames, saved, image, document, window, preference,
    settle, paint, tick,
    playing: () => classes.has('smf-intro-playing'),
    pending: () => classes.has('smf-intro-pending'),
    async ready() { await settle(); paint(); paint(); await settle(); },
    domReady() {
      document.readyState = 'interactive';
      document.dispatchEvent(new Event('DOMContentLoaded'));
    },
    loadImage() { image.complete = true; image.dispatchEvent(new Event('load')); },
    decodeImage() { decode(); },
    loadFonts() { fonts(); },
    visible() { document.hidden = false; document.dispatchEvent(new Event('visibilitychange')); }
  };
}

test('an initially hidden tab plays its entrance when the user first sees it', async () => {
  const state = visit({ hidden: true });
  await state.ready();
  assert.equal(state.playing(), false);
  state.visible();
  await state.ready();
  assert.equal(state.playing(), true);
});

test('a reload replays even when the old session flag is already present', async () => {
  const state = visit({ seen: true });
  await state.ready();
  assert.equal(state.playing(), true);
});

test('CSS-only motion still runs with data saving enabled', async () => {
  const state = visit({ saveData: true });
  await state.ready();
  assert.equal(state.playing(), true);
});

test('the clock waits for the DOM, photo decode, fonts and a painted page', async () => {
  const state = visit({ domLoading: true, imageLoading: true, decodeLoading: true, fontsLoading: true });
  assert.equal(state.playing(), false);
  state.domReady();
  await state.ready();
  assert.equal(state.playing(), false);
  state.loadImage();
  await state.ready();
  assert.equal(state.playing(), false);
  state.decodeImage();
  await state.ready();
  assert.equal(state.playing(), false);
  state.loadFonts();
  await state.settle();
  assert.equal(state.playing(), false);
  state.paint();
  assert.equal(state.playing(), false);
  state.paint();
  assert.equal(state.playing(), true);
  state.tick(3799);
  assert.equal(state.playing(), true);
  state.tick(1);
  assert.equal(state.playing(), false);
  assert.equal(state.classes.size, 0);
});

test('initial focus and a zero-position scroll event do not consume the entrance', async () => {
  const state = visit();
  await state.ready();
  state.document.dispatchEvent(new Event('focusin'));
  state.window.dispatchEvent(new Event('scroll'));
  assert.equal(state.playing(), true);
});

test('a slow asset cannot leave the entrance content hidden indefinitely', async () => {
  const state = visit({ imageLoading: true, fontsLoading: true });
  await state.settle();
  assert.equal(state.pending(), true);
  state.tick(2000);
  state.paint();
  state.paint();
  assert.equal(state.playing(), true);
  state.tick(3800);
  assert.equal(state.classes.size, 0);
  state.loadImage();
  state.loadFonts();
  await state.ready();
  assert.equal(state.classes.size, 0);
});

for (const [label, options] of [
  ['reduced motion', { reduced: true }],
  ['back/forward navigation', { navigation: 'back_forward' }],
  ['a restored scroll position', { scrollY: 200 }],
  ['a direct section link', { hash: '#training' }],
  ['a browser without the motion preference API', { noMatchMedia: true }]
]) {
  test(label + ' shows the existing page immediately', async () => {
    const state = visit(options);
    await state.ready();
    assert.equal(state.classes.size, 0);
    assert.equal(state.timers.size, 0);
    assert.equal(state.frames.size, 0);
  });
}

for (const [label, options] of [
  ['the home top link', { hash: '#top' }],
  ['blocked session storage', { blockedStorage: true }]
]) {
  test(label + ' remains eligible', async () => {
    const state = visit(options);
    await state.ready();
    assert.equal(state.playing(), true);
    state.tick(3800);
    assert.equal(state.classes.size, 0);
    assert.equal(state.timers.size, 0);
  });
}

for (const [target, type] of [
  ['document', 'pointerdown'], ['document', 'keydown'],
  ['window', 'wheel'], ['window', 'touchstart'],
  ['window', 'hashchange'], ['window', 'pagehide']
]) {
  test(type + " restores the page without cancelling the user's action", async () => {
    const state = visit();
    await state.ready();
    const event = new Event(type, { cancelable: true });
    state[target].dispatchEvent(event);
    assert.equal(state.classes.size, 0);
    assert.equal(state.timers.size, 0);
    assert.equal(event.defaultPrevented, false);
  });
}

test('actual scrolling ends the entrance', async () => {
  const state = visit();
  await state.ready();
  state.window.scrollY = 10;
  state.window.dispatchEvent(new Event('scroll'));
  assert.equal(state.classes.size, 0);
});

test('input while loading restores the page and prevents a late replay', async () => {
  const state = visit({ imageLoading: true });
  state.document.dispatchEvent(new Event('keydown'));
  state.loadImage();
  await state.ready();
  assert.equal(state.classes.size, 0);
  assert.equal(state.timers.size, 0);
  assert.equal(state.frames.size, 0);
});

test('enabling reduced motion while waiting or playing restores the page', async () => {
  for (const options of [{ imageLoading: true }, {}]) {
    const state = visit(options);
    await state.ready();
    state.preference.matches = true;
    const change = new Event('change');
    Object.defineProperty(change, 'matches', { value: true });
    state.preference.dispatchEvent(change);
    assert.equal(state.classes.size, 0);
    assert.equal(state.timers.size, 0);
    assert.equal(state.frames.size, 0);
  }
});

test('assets ready in a hidden tab cannot start the animation clock', async () => {
  const state = visit({ imageLoading: true });
  state.document.hidden = true;
  state.document.dispatchEvent(new Event('visibilitychange'));
  state.loadImage();
  await state.ready();
  state.tick(10000);
  assert.equal(state.playing(), false);
  state.visible();
  await state.ready();
  assert.equal(state.playing(), true);
});

test('hiding a playing tab ends it and clears the clock', async () => {
  const state = visit();
  await state.ready();
  state.document.hidden = true;
  state.document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(state.classes.size, 0);
  assert.equal(state.timers.size, 0);
});
