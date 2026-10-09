const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'home-intro.js'), 'utf8');

function visit(options = {}) {
  const classes = new Set();
  const timers = new Map();
  const saved = new Map(options.seen ? [['smf-home-intro-seen-v1', '1']] : []);
  const preference = new EventTarget();
  preference.matches = Boolean(options.reduced);
  const document = new EventTarget();
  document.hidden = Boolean(options.hidden);
  document.documentElement = {
    classList: { add: name => classes.add(name), remove: name => classes.delete(name) }
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
    setItem: (key, value) => {
      if (options.blockedStorage) throw new Error('Storage unavailable');
      saved.set(key, value);
    }
  };
  const navigator = { connection: { saveData: Boolean(options.saveData) } };
  let nextTimer = 0;
  vm.runInNewContext(source, {
    document, window, navigator,
    setTimeout: (fn, delay) => { const id = ++nextTimer; timers.set(id, { fn, delay }); return id; },
    clearTimeout: id => timers.delete(id)
  });
  return {
    classes, timers, saved, document, window, preference,
    playing: () => classes.has('smf-intro-playing'),
    finishTime: () => { for (const timer of [...timers.values()]) timer.fn(); }
  };
}

test('a first home visit receives a finite entrance and returns to the normal page', () => {
  const state = visit();
  assert.equal(state.playing(), true);
  assert.equal(state.saved.get('smf-home-intro-seen-v1'), '1');
  assert.equal(state.timers.size, 1);
  assert.ok([...state.timers.values()][0].delay <= 3800);
  state.finishTime();
  assert.equal(state.playing(), false);
  assert.equal(state.timers.size, 0);
});

for (const [label, options] of [
  ['reduced motion', { reduced: true }],
  ['data saving', { saveData: true }],
  ['a repeat visit in the same tab', { seen: true }],
  ['back/forward navigation', { navigation: 'back_forward' }],
  ['a restored scroll position', { scrollY: 200 }],
  ['a background tab', { hidden: true }],
  ['a direct section link', { hash: '#training' }],
  ['a browser without the motion preference API', { noMatchMedia: true }]
]) {
  test(`${label} shows the existing page immediately`, () => {
    const state = visit(options);
    assert.equal(state.playing(), false);
    assert.equal(state.timers.size, 0);
  });
}

test('the home top link remains eligible', () => {
  assert.equal(visit({ hash: '#top' }).playing(), true);
});

for (const [target, type] of [
  ['document', 'pointerdown'], ['document', 'keydown'], ['document', 'focusin'],
  ['window', 'wheel'], ['window', 'touchstart'], ['window', 'scroll'],
  ['window', 'hashchange'], ['window', 'pagehide']
]) {
  test(`${type} ends the entrance without cancelling the user's action`, () => {
    const state = visit();
    const event = new Event(type, { cancelable: true });
    state[target].dispatchEvent(event);
    assert.equal(state.playing(), false);
    assert.equal(state.timers.size, 0);
    assert.equal(event.defaultPrevented, false);
  });
}

test('enabling reduced motion while the entrance runs ends it immediately', () => {
  const state = visit();
  state.preference.matches = true;
  const change = new Event('change');
  Object.defineProperty(change, 'matches', { value: true });
  state.preference.dispatchEvent(change);
  assert.equal(state.playing(), false);
});

test('hiding the tab ends the entrance and clears its timer', () => {
  const state = visit();
  state.document.hidden = true;
  state.document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(state.playing(), false);
  assert.equal(state.timers.size, 0);
});

test('blocked session storage still leaves a finite, usable page', () => {
  const state = visit({ blockedStorage: true });
  assert.equal(state.playing(), true);
  state.finishTime();
  assert.equal(state.playing(), false);
});
