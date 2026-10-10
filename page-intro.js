/* Blender-authored, sampled entrance. All page artwork and text remain live. */
(() => {
  'use strict';
  const root = document.documentElement;
  const main = document.querySelector('.smf-inner-page');
  if (!main) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  root.dataset.smfPageMotion = 'static';
  const navigation = performance.getEntriesByType('navigation')[0];
  if (reduce.matches || navigation?.type === 'back_forward' ||
      (location.hash && location.hash !== '#top')) return;

  const heading = main.querySelector('#hero-heading');
  const hero = heading?.closest('section');
  const mission = main.querySelector('.mission-strip');
  const photo = hero?.querySelector('.training-hero-art,.contact-hero-art,.yoshi-portrait-wrap,.media-hero-moment');
  const header = document.querySelector('.site-header');
  if (!heading || !hero || !mission || !photo) return;

  let finished = false, playing = false, frameId = 0, timer = 0;
  let startedAt = 0, initialWidth = innerWidth, initialScroll = scrollY;
  const saved = new Map();
  const controller = new AbortController();
  const inputEvents = ['pointerdown','touchstart','keydown','wheel','pagehide','hashchange'];

  function set(el, value) {
    if (!saved.has(el)) saved.set(el, [el.style.getPropertyValue('translate'), el.style.getPropertyPriority('translate')]);
    el.style.setProperty('translate', value);
  }
  function finish(reason = 'interrupted') {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(frameId);
    clearTimeout(timer);
    controller.abort();
    saved.forEach(([value, priority], el) => {
      if (value) el.style.setProperty('translate', value, priority);
      else el.style.removeProperty('translate');
    });
    root.classList.remove('smf-inner-blender-playing');
    root.dataset.smfPageMotion = reason === 'complete' ? 'complete' : 'static';
    root.dataset.smfPageMotionReason = typeof reason === 'string' ? reason : reason.type;
    inputEvents.forEach(type => window.removeEventListener(type, finish, true));
    window.removeEventListener('resize', resized);
    window.removeEventListener('scroll', scrolled);
    document.removeEventListener('visibilitychange', visibilityChanged);
    reduce.removeEventListener('change', reducedChanged);
  }
  function resized() {
    // Mobile browser chrome changes height while scrolling. Only a changed
    // layout width invalidates the cached entrance distances.
    if (playing && Math.abs(innerWidth - initialWidth) > 1) finish('width-change');
  }
  function scrolled() {
    if (!playing || Math.abs(scrollY - initialScroll) <= 4) return;
    if (location.hash === '#top' && performance.now() - startedAt < 1000 &&
        scrollY <= (header?.offsetHeight || 0) + 24) { initialScroll = scrollY; return; }
    finish('scroll');
  }
  function visibilityChanged() { if (playing && document.hidden) finish('hidden'); }
  function reducedChanged(event) { if (event.matches) finish('reduced-motion'); }
  inputEvents.forEach(type => window.addEventListener(type, finish, {capture:true, passive:true}));
  window.addEventListener('resize', resized, {passive:true});
  window.addEventListener('scroll', scrolled, {passive:true});
  document.addEventListener('visibilitychange', visibilityChanged);
  reduce.addEventListener('change', reducedChanged);

  async function start() {
    if (finished) return;
    root.dataset.smfPageMotion = 'loading';
    // Establish the offscreen entrance before fonts/images settle, so the
    // finished artwork never flashes and then jumps back to its start.
    const initialDrop = Math.max(innerHeight, heading.getBoundingClientRect().height + 24);
    root.classList.add('smf-inner-blender-playing');
    set(heading, `0px ${-initialDrop}px`);
    set(mission, `${-innerWidth}px 0px`);
    set(photo, `${innerWidth}px 0px`);
    timer = setTimeout(() => finish('setup-timeout'), 6000);
    try {
      const [timeline] = await Promise.all([
        fetch('assets/smf-page-blender-timeline.json', {signal:controller.signal}).then(response => {
          if (!response.ok) throw Error('Blender timing unavailable');
          return response.json();
        }),
        document.fonts?.ready || Promise.resolve(),
        ...[...hero.querySelectorAll('img')].map(image => image.decode().catch(() => {}))
      ]);
      if (finished) return;
      if (reduce.matches) { finish('reduced-motion'); return; }
      if (document.hidden) { finish('hidden'); return; }
      if (timeline.version !== 1 || timeline.fps !== 30 || timeline.frames !== 108 ||
          !['headline','mission','photo'].every(name =>
            Array.isArray(timeline.layers?.[name]) && timeline.layers[name].length === 108 &&
            timeline.layers[name].every(row => row.length === 2 && row.every(Number.isFinite)))) {
        throw Error('Unexpected Blender timeline');
      }
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      if (finished) return;
      if (scrollY > (header?.offsetHeight || 0) + 24) { finish('scrolled-on-load'); return; }
      initialWidth = innerWidth;
      initialScroll = scrollY;
      const headerBottom = header?.getBoundingClientRect().bottom || 0;
      const headingRect = heading.getBoundingClientRect();
      const dropDistance = Math.max(headingRect.height + 24,
                                    headingRect.bottom + initialDrop - headerBottom + 24);
      const bindings = [['headline',heading,dropDistance], ['mission',mission,initialWidth], ['photo',photo,initialWidth]];
      function paint(time) {
        const position = Math.max(0, Math.min(107, time * timeline.fps));
        const a = Math.floor(position), b = Math.min(a + 1, 107), mix = position - a;
        bindings.forEach(([name, el, distance]) => {
          const from = timeline.layers[name][a], to = timeline.layers[name][b];
          const x = (from[0] + (to[0] - from[0]) * mix) * (name === 'headline' ? 0 : distance);
          const y = (from[1] + (to[1] - from[1]) * mix) * (name === 'headline' ? distance : 0);
          // Keep the established stretched italic transform and image masks.
          set(el, `${x}px ${y}px`);
        });
      }
      clearTimeout(timer);
      paint(0);
      root.classList.add('smf-inner-blender-playing');
      playing = true;
      startedAt = performance.now();
      root.dataset.smfPageMotion = 'playing';
      timer = setTimeout(() => finish('complete'), 4000);
      function tick(now) {
        if (finished) return;
        const time = (now - startedAt) / 1000;
        if (time >= timeline.frames / timeline.fps) { finish('complete'); return; }
        paint(time);
        frameId = requestAnimationFrame(tick);
      }
      frameId = requestAnimationFrame(tick);
    } catch {
      if (!finished) finish('setup-fallback');
    }
  }

  // Background tabs wait until visible; every visible page gets its entrance.
  if (document.hidden) {
    const visible = () => {
      if (!document.hidden) {
        document.removeEventListener('visibilitychange', visible);
        start();
      }
    };
    document.addEventListener('visibilitychange', visible, {signal:controller.signal});
  } else start();
})();
