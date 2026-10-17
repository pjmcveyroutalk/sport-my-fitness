/* Blender-authored choreography on live elements. No video, WebGL or router. */
(() => {
 'use strict';
 const root = document.documentElement;
 const preference = matchMedia('(prefers-reduced-motion: reduce)');
 const heading = document.getElementById('hero-heading');
 const hero = heading?.closest('section');
 const main = document.querySelector('main');
 const running = new Map();
 const entrance = new Set();
 const listeners = new AbortController();
 let observer;
 let curves;
 let stopped = false;
 let width = innerWidth;
 const isHome = main?.classList.contains('smf-home-page');
 function state(value, reason) {
  root.dataset.smfMotionState = value;
  root.dataset[isHome ? 'smfMotion' : 'smfPageMotion'] = value;
  if (reason) root.dataset.smfMotionReason = reason;
 }
 function clearBoot() {
  clearTimeout(window.smfMotionBootTimer);
  root.classList.remove('smf-motion-boot');
 }
 function cancelAll() {
  running.forEach(animation => animation.cancel());
  running.clear();
 }
 function finish(reason = 'complete') {
  if (stopped) return;
  stopped = true;
  clearBoot();
  root.classList.remove('smf-motion-playing');
  entrance.forEach(animation => animation.cancel());
  entrance.clear();
  listeners.abort();
  state(reason === 'complete' ? 'complete' : 'static', reason);
 }
 function animate(element, track, {x=0, y=0, scale=1, delay=0, intro=false}={}) {
  if (!element || preference.matches) return null;
  const source = curves.tracks[track];
  const keyframes = source.progress.map((progress, index) => ({
   offset:index/(source.progress.length-1),
   translate:`${x*(1-progress)}px ${y*(1-progress)}px`,
   ...(scale !== 1 ? {scale:1+(scale-1)*(1-progress)} : {}),
   // Move the source photograph as one opaque layer. Never fade a person's
   // interior into the background while the photo enters.
   opacity:track === 'photo' ? 1 : Math.min(1, progress*1.55),
  }));
  const animation = element.animate(keyframes, {duration:source.duration,delay,easing:'linear',fill:'both'});
  running.set(element, animation);
  if (intro) entrance.add(animation);
  animation.finished.then(() => {
   animation.cancel();
   if (running.get(element) === animation) running.delete(element);
   entrance.delete(animation);
  }).catch(() => {
   if (running.get(element) === animation) running.delete(element);
   entrance.delete(animation);
  });
  return animation;
 }
 function startReveals() {
  if (preference.matches || !('IntersectionObserver' in window)) return;
  const selectors = [
   '.training-section h2','.training-option','.trainer-section>.wrap>h2',
   '.trainer-main-photo','.trainer-story','.trainer-moments>figure',
   '.client-reviews h2','.client-review','.programs-section h2','.programs-intro',
   '.program-row','.programs-support','.programs-actions','.story-chapter',
   '.story-community-photo','.story-words','.story-connect','.media-feature-copy',
   '.media-feature-film','.media-video-row','.media-community-intro','.media-photo-pair>figure','.media-press',
   '.inquiry-guide','#inquiry-form','.contact-direct','.community-section-intro',
   '.community-program','.community-regular','.community-notices-inner',
  ];
  const candidates = [...main.querySelectorAll(selectors.join(','))];
  const targets = candidates.filter(el => !candidates.some(parent => parent !== el && parent.contains(el)));
  observer = new IntersectionObserver(entries => {
   let step = 0;
   entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    observer.unobserve(entry.target);
    if (entry.target.contains(document.activeElement)) return;
    // The default is always visible. Animate only when it enters the viewport.
    animate(entry.target,'reveal',{y:22,delay:Math.min(step++ * 55,165)});
   });
  }, {threshold:0,rootMargin:'0px 0px 0px 0px'});
  targets.forEach(el => {
   // Already visible content stays stable when an intro is skipped/interrupted.
   if (el.getBoundingClientRect().top >= innerHeight) observer.observe(el);
  });
 }
 async function start() {
  if (!hero || !main || !Element.prototype.animate || preference.matches ||
      (location.hash && location.hash !== '#top') || scrollY > 4 ||
      performance.getEntriesByType('navigation')[0]?.type === 'back_forward' || document.hidden) {
   clearBoot(); state('static','ineligible'); return;
  }
  state('loading');
  const fetchController = new AbortController();
  const timeout = setTimeout(() => fetchController.abort(), 1800);
  try {
   const response = await fetch('assets/smf-motion-curves.json', {signal:fetchController.signal});
   if (!response.ok) throw new Error('Motion curves unavailable');
   curves = await response.json();
   if (curves.version !== 1 || !['headline','photo','support','band','reveal'].every(name =>
       Array.isArray(curves.tracks?.[name]?.progress) && curves.tracks[name].progress.length > 1 &&
       curves.tracks[name].progress.every(Number.isFinite))) throw new Error('Invalid motion curves');
   clearTimeout(timeout);
   const images = [...hero.querySelectorAll('img')];
   await Promise.race([
    Promise.all([document.fonts.ready, ...images.map(img=>img.decode().catch(()=>{}))]),
    new Promise(resolve=>setTimeout(resolve,700)),
   ]);
   if (!root.classList.contains('smf-motion-boot') || preference.matches || scrollY > 4 || document.hidden) {
    finish('interrupted-before-start'); startReveals(); return;
   }
   ['pointerdown','wheel','touchstart','keydown'].forEach(event => {
    addEventListener(event,() => finish('interaction'),{once:true,passive:true,signal:listeners.signal});
   });
   addEventListener('scroll',()=>{if(scrollY>4)finish('scroll');},{passive:true,signal:listeners.signal});
   addEventListener('resize',()=>{if(Math.abs(innerWidth-width)>1)finish('resize');},{signal:listeners.signal});
   document.addEventListener('visibilitychange',()=>{if(document.hidden)finish('hidden');},{signal:listeners.signal});
   root.classList.add('smf-motion-playing');
   const photo = hero.querySelector('.yoshi-stage,.training-hero-art,.contact-hero-art,.yoshi-portrait-wrap,.media-hero-moment');
   const parts = [...heading.children];
   const list = [];
   const add = (el,track,settings)=>{const animation=animate(el,track,{...settings,intro:true}); if(animation)list.push(animation.finished.catch(()=>{}));};
   // Keep the original Blender curves on every page. Home's approved sequence
   // is photo from the left, settle, then headline lines dropping from above.
   // The other six pages retain their original entrance timing and direction.
   const photoDelay = 80;
   const textDelay = isHome ? photoDelay + curves.tracks.photo.duration + 70 : 80;
   add(photo,'photo',{x:(isHome ? -1 : 1)*Math.min(110,innerWidth*.13),scale:isHome ? 1 : 1.025,delay:photoDelay});
   add(hero.querySelector('.hero-eyebrow'),'support',{y:12,delay:isHome ? textDelay : 0});
   (parts.length ? parts : [heading]).forEach((el,i)=>add(el,'headline',{y:isHome ? -54 : 54,delay:textDelay+i*95}));
   add(hero.querySelector('.hero-subline'),'support',{y:20,delay:textDelay+310});
   add(hero.querySelector('.hero-description'),'support',{y:20,delay:textDelay+360});
   add(hero.querySelector('.hero-actions'),'support',{y:20,delay:textDelay+420});
   add(main.querySelector('.mission-strip'),'band',{x:-32,delay:textDelay+390});
   clearBoot(); state('playing');
   startReveals();
   await Promise.all(list);
   finish();
  } catch(error) {
   clearTimeout(timeout);
   finish('unavailable');
  }
 }
 // Focus and reduced-motion changes always bring content immediately to rest.
 document.addEventListener('focusin',event=>{
  for (const [element,animation] of running) if(element.contains(event.target)) {
   animation.cancel(); running.delete(element);
  }
 });
 preference.addEventListener('change',event=>{
  if(event.matches){finish('reduced-motion');cancelAll();observer?.disconnect();}
 });
 addEventListener('pagehide',()=>{finish('pagehide');cancelAll();observer?.disconnect();});
 addEventListener('pageshow',event=>{if(event.persisted){clearBoot();state('static','restored');}});
 start();
})();
