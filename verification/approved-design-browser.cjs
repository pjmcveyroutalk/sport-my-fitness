/* Visitor-facing checks for the approved design. Does not submit inquiries,
 * complete bookings, or require production credentials. */
const {chromium, webkit} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = process.env.SMF_BASE_URL || 'http://127.0.0.1:8080';
const out = process.env.SMF_EVIDENCE_DIR || '/tmp/smf-design-evidence';
const routes = ['index', 'training', 'programs', 'yoshi', 'media', 'community', 'contact'];
const widths = [360, 390, 430, 768, 900, 901, 1334, 1920];
const heroReferences = new Map();
const report = {started: new Date().toISOString(), layouts: [], navigation: [], motion: [], locations: [], platformMarks: [], headers: [], connections: [], safeguards: [], failures: []};
fs.mkdirSync(out, {recursive: true});
function save() { fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(report, null, 2)); }
async function check(name, fn) {
  try { await fn(); console.log('PASS ' + name); }
  catch (error) { report.failures.push({name, error: error.stack}); console.error('FAIL ' + name + '\n' + error.stack); save(); throw error; }
}
async function load(page, route) {
  const response = await page.goto(`${base}/${route}.html`, {waitUntil: 'networkidle'});
  assert.equal(response.status(), 200);
  await page.evaluate(() => document.fonts.ready);
}
async function allPhotos(page) {
  for (const img of await page.locator('main img').all()) {
    await img.scrollIntoViewIfNeeded();
    await img.evaluate(i => i.decode());
  }
  return page.evaluate(() => [...document.querySelectorAll('main img,.site-header .brand-logo')].map(i => {
    const r = i.getBoundingClientRect(), style = getComputedStyle(i);
    return {src: i.getAttribute('src'), natural: [i.naturalWidth, i.naturalHeight], rendered: [r.width, r.height], fit: style.objectFit, mask: style.maskImage,
      valid: i.complete && i.naturalWidth > 0 && r.width > 0 && r.height > 0 && Math.abs((r.width / r.height) / (i.naturalWidth / i.naturalHeight) - 1) < .015};
  }));
}
async function mobileHeader(page, route, width, engine, withoutJS = false) {
  const call = page.getByRole('link', {name: 'Call Sport My Fitness at 414-791-4526', exact: true});
  if (width > 900) {
    assert.equal(await call.isVisible(), false, 'mobile call action changed the desktop header');
    return;
  }
  assert(await call.isVisible(), 'one-tap call action is missing');
  assert.equal(await call.getAttribute('href'), 'tel:+14147914526');
  assert.equal(await call.getAttribute('target'), null, 'phone link should hand off directly to the dialer');
  const menu = page.locator(withoutJS ? '.menu-fallback summary' : '.menu-toggle');
  const phoneBox = await call.boundingBox(), menuBox = await menu.boundingBox();
  assert(phoneBox.width >= 44 && phoneBox.height >= 44 && menuBox.width >= 44 && menuBox.height >= 44, 'header touch targets are too small');
  assert(menuBox.x - (phoneBox.x + phoneBox.width) >= 7, 'phone and navigation targets overlap');
  if (withoutJS) assert.equal((await menu.textContent()).trim(), 'Menu', 'native navigation lost its label');
  else assert.equal(await page.getByRole('button', {name: 'Menu', exact: true}).count(), 1, 'navigation lost its accessible label');
  const label = await menu.locator('.menu-label').boundingBox();
  assert(label.width <= 1 && label.height <= 1, 'visible Menu word remains beside the icons');
  if (!withoutJS && route === 'index' && [360, 390, 430].includes(width)) {
    await page.locator('.site-header').screenshot({path: path.join(out, `${engine}-header-${width}.png`)});
  }
  report.headers.push({route, width, engine, withoutJS, telephoneURI: 'tel:+14147914526', targets: {phoneBox, menuBox}, pass: true});
}
async function officialPlatformMarks(page, route, width, engine) {
  const expected = route === 'yoshi' ? [
    ['Instagram', 'https://www.instagram.com/yoshibarnes/', 'instagram.svg'],
    ['Facebook', 'https://www.facebook.com/yoshi.barnes/', 'facebook.svg'],
    ['YouTube', 'https://www.youtube.com/@yoshibarnes', 'youtube.svg']
  ] : [['All videos', 'https://www.youtube.com/@yoshibarnes/videos', 'youtube.svg']];
  assert.equal(await page.locator('.social-link').count(), expected.length, 'platform links were removed or duplicated');
  for (const [name, href, asset] of expected) {
    const link = page.getByRole('link', {name, exact: true});
    assert.equal(await link.count(), 1, 'readable platform link name is missing');
    assert.equal(await link.getAttribute('href'), href);
    const mark = link.locator('.platform-mark');
    assert.equal(await mark.count(), 1, 'official platform mark is missing');
    assert.equal(await mark.getAttribute('aria-hidden'), 'true');
    const image = mark.locator('img');
    assert.equal(await image.getAttribute('src'), 'assets/platforms/' + asset);
    assert.equal(await image.getAttribute('alt'), '');
    assert.equal(await mark.evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(244, 247, 247)', 'original black glyph lacks light clear space');
  }
  if (width === 390 || width === 1334) {
    await page.locator(route === 'yoshi' ? '.story-personal-links' : '.media-feature-copy').screenshot({path: path.join(out, `${engine}-${route}-platforms-${width}.png`)});
  }
  report.platformMarks.push({engine, route, width, links: expected.map(([name, href, asset]) => ({name, href, asset})), pass: true});
}
async function contactLocation(page, width, engine) {
  const location = page.locator('.contact-location');
  const map = location.locator('iframe');
  assert.equal(await map.count(), 1, 'location must have one map');
  assert.match(await map.getAttribute('src'), /^https:\/\/www\.google\.com\/maps\/embed\?pb=/);
  assert((await map.getAttribute('src')).includes('0x135b560b8b18b6b8'), 'map points to another business');
  assert.equal(await map.getAttribute('loading'), 'lazy');
  assert.match(await map.getAttribute('title'), /4722 W Vliet St/);
  assert.equal(await map.evaluate(el => getComputedStyle(el).filter), 'none', 'Google map colors or attribution were filtered');
  assert.equal(await page.locator('.contact-map').count(), 0, 'the old duplicate location link remains');
  const directions = location.getByRole('link', {name: 'Get directions'});
  assert.equal(await directions.count(), 1);
  assert((await directions.getAttribute('href')).includes('/maps/dir//Sportmyfitness,'));
  assert((await directions.getAttribute('href')).includes('0x135b560b8b18b6b8'));
  assert.match(await location.locator('address').innerText(), /4722 W Vliet St\s+Milwaukee, WI 53208/);
  const hours = location.locator('.location-hours');
  assert.equal(await hours.getAttribute('open'), null, 'hours should start collapsed');
  await hours.locator('summary').press('Enter');
  assert.notEqual(await hours.getAttribute('open'), null, 'hours do not expand with a keyboard');
  assert.deepEqual(await hours.locator('tr').allTextContents(), [
    'Monday7 AM–6 PM', 'Tuesday7 AM–7 PM', 'Wednesday9 AM–5 PM',
    'Thursday7 AM–7 PM', 'Friday6 AM–2 PM', 'Saturday10:30 AM–12:30 PM', 'SundayClosed'
  ], 'hours differ from the verified Google listing');
  await hours.locator('summary').press('Enter');
  assert.equal(await hours.getAttribute('open'), null);
  await map.scrollIntoViewIfNeeded();
  // Google's embed paints the business label inside its map. Its attribution
  // controls remain DOM text; the exact business identity is checked above.
  const nativeMap = page.frameLocator('iframe.studio-map');
  try {
    await nativeMap.getByText('Report a map error', {exact: true}).waitFor({state: 'visible', timeout: 25000});
  } catch (error) {
    console.error('MAP_FRAME_RESPONSE ' + await nativeMap.locator('body').innerText({timeout: 3000}).catch(() => 'frame unavailable'));
    await location.screenshot({path: path.join(out, `${engine}-location-failed-${width}.png`)});
    throw error;
  }
  await location.screenshot({path: path.join(out, `${engine}-location-${width}.png`)});
  report.locations.push({engine, width, googleMapRendered: true, correctPlace: true, singleDirectionsLink: true, keyboardHours: true, lazy: true});
  save();
}
async function storyConnectionLayout(page, width, engine) {
  const geometry = await page.locator('.story-connect-inner').evaluate(section => ({
    heading: section.querySelector('h2').getBoundingClientRect().toJSON(),
    links: [...section.querySelectorAll('.social-link')].map(link => ({...link.getBoundingClientRect().toJSON(), contentFits: link.scrollWidth <= link.clientWidth}))
  }));
  const [first, second, third] = geometry.links;
  assert.equal(geometry.links.length, 3, 'social links were removed or duplicated');
  assert(Math.abs(first.left - geometry.heading.left) < 1, 'heading and social links do not share a left edge');
  assert(geometry.links.every(link => link.contentFits), 'social link text or marks overflow');
  if (width > 800) {
    assert(first.top >= geometry.heading.bottom + 20 && first.top <= geometry.heading.bottom + 28, 'desktop social links are detached from their heading');
    assert(Math.abs(first.top - second.top) < 1 && Math.abs(first.top - third.top) < 1, 'desktop social links must form one compact row');
    assert(Math.abs(first.width - second.width) < 1 && Math.abs(first.width - third.width) < 1, 'social button widths differ');
  } else {
    assert(second.top >= first.bottom + 10 && third.top >= second.bottom + 10, 'mobile social links no longer stack with clear tap spacing');
  }
  await page.locator('.story-connect').screenshot({path: path.join(out, `${engine}-yoshi-connect-${width}.png`)});
  report.connections.push({engine, width, geometry, pass: true});
  save();
}
async function layout(page, route, width, engine) {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await load(page, route);
  const photos = await allPhotos(page);
  if (route === 'yoshi') await storyConnectionLayout(page, width, engine);
  await mobileHeader(page, route, width, engine);
  if (route === 'yoshi' || route === 'media') await officialPlatformMarks(page, route, width, engine);
  if (route === 'contact' && (width === 390 || width === 1334)) await contactLocation(page, width, engine);
  assert(photos.every(i => i.valid), 'image ratio/decode failure: ' + JSON.stringify(photos.filter(i => !i.valid)));
  assert(photos.every(i => i.mask === 'none'), 'an image is using a decorative alpha mask');
  assert.equal(await page.locator('.page-step,.footer-links,.footer-name').count(), 0, 'redundant page ending remains');
  if (route === 'index') {
    assert.equal(await page.locator('.training-section,.training-option').count(), 0, 'redundant landing-page training link group remains');
    assert.deepEqual(await page.locator('.hero-actions > a').evaluateAll(links => links.map(link => link.getAttribute('href'))), ['contact.html', 'training.html'], 'landing-page hero actions changed');
  }
  assert.equal(await page.locator('#primary-nav a').count(), 7);
  const current = page.locator('#primary-nav a[aria-current="page"]');
  assert.equal(await current.count(), 1);
  assert.equal(await current.getAttribute('href'), route + '.html');
  const geometry = await page.evaluate(() => {
    const hero = document.querySelector('main > section').getBoundingClientRect();
    const h1 = document.querySelector('h1');
    const headline = [...h1.children].map(el => { const r = document.createRange(); r.selectNodeContents(el); return r.getBoundingClientRect().toJSON(); });
    const subline = document.querySelector('.hero-subline').getBoundingClientRect();
    const overflow = [...document.querySelectorAll('main *')].map(el => ({tag: el.tagName, classes: el.className, rect: el.getBoundingClientRect().toJSON()})).filter(el => el.rect.width && (el.rect.right > innerWidth + 1 || el.rect.left < -1));
    const titleStyle = getComputedStyle(h1);
    const primary = document.querySelector('main > section .hero-actions .button');
    const buttonStyle = primary ? getComputedStyle(primary) : null;
    const heroStyle = {font: titleStyle.fontFamily, size: titleStyle.fontSize, line: titleStyle.lineHeight, weight: titleStyle.fontWeight, titleOffset: h1.getBoundingClientRect().top - hero.top, height: hero.height, texture: getComputedStyle(document.body).backgroundImage, overlay: !!document.querySelector('main > section > .hero-art'), button: buttonStyle ? {font: buttonStyle.fontSize, minHeight: buttonStyle.minHeight, radius: buttonStyle.borderRadius} : null};
    const copy = document.querySelector('.hero-copy,.page-hero-copy').getBoundingClientRect();
    const nextSection = document.querySelector('main > section + section');
    const nextContent = nextSection?.querySelector('.wrap');
    const transition = {afterCopy: hero.bottom - copy.bottom, nextContent: nextContent ? nextContent.getBoundingClientRect().top - copy.bottom : null};
    const sectionSurface = nextSection ? getComputedStyle(nextSection).backgroundImage : null;
    return {heroStyle, transition, sectionSurface, width: innerWidth, scrollWidth: document.documentElement.scrollWidth, overflow, headline, hero: hero.toJSON(), h1: h1.getBoundingClientRect().toJSON(), subline: subline.toJSON()};
  });
  const sharedKey = `${engine}-${width}`;
  const appearance = geometry.heroStyle;
  assert(appearance.overlay && appearance.texture.includes('url('), 'hero overlay or textured canvas is missing');
  if (route === 'index') heroReferences.set(sharedKey, appearance);
  else {
    const reference = heroReferences.get(sharedKey);
    assert(reference, 'Home hero reference has not been checked');
    for (const key of ['font', 'size', 'line', 'weight']) assert.equal(appearance[key], reference[key], `inconsistent hero ${key} on ${route} ${width}`);
    assert(Math.abs(appearance.titleOffset - reference.titleOffset) < 1, `hero title origin differs on ${route} ${width}`);
    if (width > 800) assert(Math.abs(appearance.height - reference.height) < 1, `hero canvas height differs on ${route} ${width}`);
    if (appearance.button) assert.deepEqual(appearance.button, reference.button, `hero action styling differs on ${route}`);
    if (width <= 800) {
      assert(geometry.transition.afterCopy >= 24 && geometry.transition.afterCopy <= 40, `empty mobile hero band on ${route} ${width}: ${JSON.stringify(geometry.transition)}`);
      assert(typeof geometry.transition.nextContent === 'number' && geometry.transition.nextContent <= 96, `next mobile section is separated by excess blank space on ${route} ${width}: ${JSON.stringify(geometry.transition)}`);
    }
  }
  assert(geometry.scrollWidth <= geometry.width, 'horizontal overflow: ' + JSON.stringify(geometry));
  assert(geometry.headline.every(r => r.left >= geometry.hero.left - 2 && r.right <= geometry.hero.right - 6), 'headline clipped at viewport edge: ' + JSON.stringify(geometry));
  assert(geometry.h1.bottom <= geometry.subline.top + 2, 'headline overlaps supporting copy');
  if (route === 'index' && width >= 1200) {
    const actions = await page.locator('.hero-actions > a').evaluateAll(links => links.map(link => link.getBoundingClientRect().toJSON()));
    assert(Math.abs(actions[0].top - actions[1].top) < 1, 'desktop hero actions must share a row, as in the approved reference');
    assert(Math.abs(actions[0].width - actions[1].width) < 1, 'desktop hero actions must have equal widths');
  }
  if (route === 'index' && width <= 430) {
    const composition = await page.evaluate(() => {
      const rect = selector => document.querySelector(selector).getBoundingClientRect().toJSON();
      return {header: rect('.site-header'), photo: rect('.yoshi-hero'), heading: rect('h1'), actions: rect('.hero-actions'), mission: rect('.mission-strip')};
    });
    await page.evaluate(() => scrollTo({top: 0, behavior: 'instant'}));
    await page.screenshot({path: path.join(out, `${engine}-${route}-${width}.png`), fullPage: true});
    assert(composition.header.height <= 90, 'mobile header is taller than the approved composition');
    assert(composition.heading.top < composition.photo.bottom - 70, 'mobile headline has been stacked below the photograph');
    assert(composition.heading.height < width * .48, 'mobile title is oversized against the reference');
    assert(composition.mission.top - composition.header.bottom < width * 1.75, 'mobile hero is too tall against the approved reference');
    assert(composition.photo.bottom >= composition.actions.bottom - 10, 'waterfront does not fill the hero behind the actions: ' + JSON.stringify(composition));
    report.safeguards.push({test: 'approved-mobile-composition', width, composition, pass: true});
  }
  assert.deepEqual(errors, []);
  await page.evaluate(() => scrollTo({top: 0, behavior: 'instant'}));
  if (width === 390 || width === 1334) await page.screenshot({path: path.join(out, `${engine}-${route}-${width}.png`), fullPage: true});
  report.layouts.push({engine, route, width, photos, geometry, consoleErrors: errors});
  save();
}
async function navigation(page, route, width) {
  await load(page, route);
  await page.evaluate(() => {
    window.menuEvents = [];
    for (const type of ['pointerdown', 'pointerup', 'click', 'cancel', 'close']) document.addEventListener(type, event => {
      const panel = document.getElementById('site-menu');
      window.menuEvents.push({type, target: event.target.tagName, id: event.target.id, classes: event.target.className, x: event.clientX, y: event.clientY, open: panel.open, rect: panel.getBoundingClientRect().toJSON()});
    }, true);
  });
  const trigger = page.locator('.menu-toggle');
  const initial = await page.locator('h1').boundingBox();
  await trigger.click();
  assert.equal(await trigger.getAttribute('aria-expanded'), 'true');
  assert(await page.locator('#site-menu').isVisible());
  assert.equal(await page.locator('#site-menu #primary-nav a:visible').count(), 7);
  const menuBox = await page.locator('#site-menu').boundingBox();
  assert(Math.abs(menuBox.y - (width > 900 ? 14 : 12)) < 10, 'menu is not anchored near the top');
  if (width > 900) assert(Math.abs(menuBox.x - 90) < 1, 'desktop menu is not anchored beside the rail');
  const during = await page.locator('h1').boundingBox();
  assert(Math.abs(initial.x - during.x) < 1 && Math.abs(initial.width - during.width) < 1, 'menu changes page geometry');
  for (const key of ['Tab', 'Shift+Tab']) for (let i = 0; i < 12; i++) {
    await page.keyboard.press(key);
    assert(await page.evaluate(() => document.querySelector('#site-menu').contains(document.activeElement)), 'modal focus escaped after ' + key + ' ' + i);
  }
  if (route === 'index') await page.screenshot({path: path.join(out, `menu-${width}.png`)});
  await page.keyboard.press('Escape');
  assert.equal(await trigger.getAttribute('aria-expanded'), 'false');
  assert(await trigger.evaluate(el => el === document.activeElement), 'Escape did not restore focus');
  await trigger.click();
  await page.locator('.menu-close').click();
  assert.equal(await trigger.getAttribute('aria-expanded'), 'false');
  await trigger.click();
  // scrollbar-gutter reserves a strip outside the document's painted area.
  // Tap the actual backdrop, rather than the non-interactive scrollbar gutter.
  const backdropPoint = await page.evaluate(() => ({x: document.documentElement.clientWidth - 4, y: innerHeight - 4}));
  await page.mouse.click(backdropPoint.x, backdropPoint.y);
  if (await trigger.getAttribute('aria-expanded') !== 'false') {
    const trace = await page.evaluate(point => ({point, client: [document.documentElement.clientWidth, document.documentElement.clientHeight], hit: document.elementFromPoint(point.x, point.y)?.outerHTML.slice(0, 200), events: window.menuEvents}), backdropPoint);
    console.log('MENU_EVENT_TRACE ' + JSON.stringify(trace));
    await page.screenshot({path: path.join(out, `menu-backdrop-failure-${width}.png`)});
  }
  assert.equal(await trigger.getAttribute('aria-expanded'), 'false', 'backdrop did not close');
  await page.evaluate(() => scrollTo({top: document.body.scrollHeight, behavior: 'instant'}));
  await trigger.click();
  assert(await page.locator('#site-menu').isVisible(), 'menu unavailable at bottom of page');
  await page.keyboard.press('Escape');
  const next = routes[(routes.indexOf(route) + 1) % routes.length];
  await trigger.click();
  const destination = page.waitForURL(url => url.pathname.endsWith('/' + next + '.html'));
  const destinationLink = page.locator(`#primary-nav a[href="${next}.html"]`);
  if (route === 'index' && width === 390) { await destinationLink.focus(); await destinationLink.press('Enter'); }
  else await destinationLink.click();
  await destination;
  assert.equal(await page.locator('h1').count(), 1, 'menu destination did not load');
  report.navigation.push({route, width, sevenDestinations: true, keyboard: true, close: true, stablePage: true, bottomAccess: true, navigatedTo: next});
}
async function motion(browser, route, width, record) {
  const context = await browser.newContext({viewport: {width, height: 900}, reducedMotion: 'no-preference', ...(record ? {recordVideo: {dir: path.join(out, 'motion'), size: {width, height: 900}}} : {})});
  const page = await context.newPage();
  await page.addInitScript(() => {
    window.motionCalls = [];
    const animate = Element.prototype.animate;
    Element.prototype.animate = function(frames, options) {
      window.motionCalls.push({tag: this.tagName, classes: this.className, parent: this.parentElement?.id, frames, options});
      return animate.call(this, frames, options);
    };
  });
  await load(page, route);
  await page.waitForFunction(() => document.documentElement.dataset.smfMotionState === 'complete', {timeout: 7000});
  const calls = await page.evaluate(() => window.motionCalls);
  const photo = calls.find(c => c.options.duration === 1367);
  const headline = calls.filter(c => c.parent === 'hero-heading');
  assert(photo, 'original photo choreography did not run');
  assert.equal(photo.frames[0].opacity, 1, 'photo becomes transparent during its entrance');
  assert(headline.length >= 2 && headline.every(c => c.options.duration === 967), 'original headline curves missing');
  if (route === 'index') {
    assert(parseFloat(photo.frames[0].translate) < 0, 'Home photo did not enter from the left');
    assert(headline.every(c => parseFloat(c.frames[0].translate.split(' ')[1]) < 0), 'Home headline did not drop from above');
    assert(headline[0].options.delay > photo.options.delay + photo.options.duration, 'headline starts before photo settles');
  } else {
    assert.equal(headline[0].options.delay, 80);
    assert(parseFloat(photo.frames[0].translate) > 0, 'original inner-page photo direction changed');
  }
  report.motion.push({route, width, photo: photo.options, photoFirstFrame: photo.frames[0], headlines: headline.map(c => c.options), final: 'complete'});
  const video = record ? page.video() : null;
  await context.close();
  if (video) fs.renameSync(await video.path(), path.join(out, 'motion', `${route}-${width}.webm`));
  save();
}
(async () => {
  const browser = await chromium.launch({...(process.env.CHROME_PATH ? {executablePath: process.env.CHROME_PATH} : {}), args: ['--no-sandbox', '--disable-dev-shm-usage']});
  report.chromiumVersion = browser.version();
  try {
    for (const route of routes) for (const width of [390, 1334]) await check(`navigation ${route} ${width}`, async () => {
      const page = await browser.newPage({viewport: {width, height: 900}, reducedMotion: 'reduce'});
      try { await navigation(page, route, width); } finally { await page.close(); }
    });
    for (const route of routes) for (const width of widths) await check(`layout ${route} ${width}`, async () => {
      const page = await browser.newPage({viewport: {width, height: 900}, reducedMotion: 'reduce'});
      try { await layout(page, route, width, 'chromium'); } finally { await page.close(); }
    });
    for (const width of [800, 801, 1024, 1280, 1366, 1440]) await check(`About social spacing ${width}`, async () => {
      const page = await browser.newPage({viewport: {width, height: 900}, reducedMotion: 'reduce'});
      try { await load(page, 'yoshi'); await storyConnectionLayout(page, width, 'chromium'); } finally { await page.close(); }
    });
    for (const route of routes) for (const width of [390, 1334]) await check(`motion ${route} ${width}`, () => motion(browser, route, width, width === 390 || route === 'index'));
    for (const route of routes) await check(`native menu without JS ${route}`, async () => {
      const context = await browser.newContext({viewport: {width: 390, height: 900}, javaScriptEnabled: false});
      const page = await context.newPage(); await load(page, route);
      await mobileHeader(page, route, 390, 'chromium', true);
      await page.locator('.menu-fallback summary').click();
      assert.equal(await page.locator('.menu-fallback nav a:visible').count(), 7);
      assert(await page.locator('h1').isVisible());
      await page.locator('.menu-fallback a[href="contact.html"]').click();
      assert(new URL(page.url()).pathname.endsWith('/contact.html'));
      report.safeguards.push({test: 'no-js', route, pass: true}); await context.close();
    });
    await check('menu script failure', async () => {
      const page = await browser.newPage({viewport: {width: 390, height: 900}, reducedMotion: 'reduce'});
      await page.route('**/site-menu.js*', r => r.abort()); await load(page, 'index');
      await page.locator('.menu-fallback summary').click();
      assert.equal(await page.locator('.menu-fallback nav a:visible').count(), 7);
      report.safeguards.push({test: 'blocked-menu-js', pass: true}); await page.close();
    });
    await check('resize boundary', async () => {
      const page = await browser.newPage({viewport: {width: 900, height: 900}, reducedMotion: 'reduce'});
      await load(page, 'training'); await page.locator('.menu-toggle').click();
      await page.setViewportSize({width: 901, height: 900});
      await page.waitForFunction(() => !document.querySelector('#site-menu').open);
      await page.setViewportSize({width: 900, height: 900});
      await page.locator('.menu-toggle').click(); assert(await page.locator('#site-menu').isVisible());
      report.safeguards.push({test: '900-901-900', pass: true}); await page.close();
    });
    for (const [name, setup] of [
      ['motion-unavailable', page => page.route('**/smf-motion-curves.json', r => r.abort())],
      ['deep-link', async () => {}],
      ['interrupted', async () => {}],
      ['preference-change', async () => {}]
    ]) await check(name, async () => {
      const page = await browser.newPage({viewport: {width: 390, height: 900}, reducedMotion: 'no-preference'});
      await setup(page);
      if (name === 'deep-link') await page.goto(`${base}/programs.html#online-coaching`);
      else {
        await page.goto(`${base}/index.html`);
        if (name === 'interrupted') await page.keyboard.press('ArrowDown');
        if (name === 'preference-change') await page.emulateMedia({reducedMotion: 'reduce'});
      }
      await page.waitForFunction(() => !document.documentElement.classList.contains('smf-motion-boot'));
      await page.waitForTimeout(100);
      assert.equal(await page.locator('h1').evaluate(el => getComputedStyle(el).opacity), '1');
      assert(await page.locator('.menu-toggle').isVisible());
      report.safeguards.push({test: name, pass: true}); await page.close();
    });
    await check('form validation, no external submission', async () => {
      const page = await browser.newPage({viewport: {width: 390, height: 900}, reducedMotion: 'reduce'});
      let submissions = 0;
      await page.route('https://formsubmit.co/**', r => { submissions++; return r.abort(); });
      await load(page, 'contact'); await page.locator('.form-button').click();
      assert.equal(await page.locator('#inquiry-form').evaluate(f => f.checkValidity()), false);
      await page.locator('#inquiry-name').fill('   '); await page.locator('#inquiry-email').fill('test@example.invalid');
      await page.locator('#inquiry-goals').fill('   '); await page.locator('.form-button').click();
      assert.equal(await page.locator('#inquiry-name').evaluate(i => i.validity.customError), true);
      assert.equal(submissions, 0);
      report.safeguards.push({test: 'empty-and-whitespace-form', externalPosts: submissions, pass: true}); await page.close();
    });
    await check('returning visitor with the legacy service worker', async () => {
      const context = await browser.newContext({viewport: {width: 390, height: 900}, reducedMotion: 'reduce'});
      const page = await context.newPage();
      await load(page, 'index');
      await page.evaluate(async () => {
        await navigator.serviceWorker.register('/service-worker.js');
        await navigator.serviceWorker.ready;
        const cache = await caches.open('smf-v1-runtime');
        await cache.put('/contact.js', new Response('window.legacyMenuScriptWasUsed = true;', {headers: {'content-type': 'application/javascript'}}));
        await cache.put('/contact.html', new Response('<!doctype html><html><body>OLD CONTACT PAGE</body></html>', {headers: {'content-type': 'text/html'}}));
      });
      await page.waitForFunction(() => navigator.serviceWorker.controller);
      await load(page, 'contact');
      assert.equal(await page.locator('#primary-nav a').count(), 7);
      assert((await page.locator('body').evaluate(el => getComputedStyle(el).backgroundImage)).includes('athletic-grain.svg'), 'returning visitor did not load the current textured theme');
      assert.equal(await page.evaluate(() => !!window.legacyMenuScriptWasUsed), false, 'stale unversioned menu code was used');
      await page.locator('.menu-toggle').click(); await page.locator('.menu-close').click();
      assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
      await page.locator('#inquiry-name').fill('   '); await page.locator('#inquiry-email').fill('test@example.invalid');
      await page.locator('#inquiry-goals').fill('   '); await page.locator('.form-button').click();
      assert.equal(await page.locator('#inquiry-name').evaluate(i => i.validity.customError), true);
      report.safeguards.push({test: 'legacy-worker-stale-contact-html-and-js', pass: true}); await context.close();
    });
    await check('map unavailable keeps location and directions usable', async () => {
      const page = await browser.newPage({viewport: {width: 390, height: 900}, reducedMotion: 'reduce'});
      await page.route(/^https:\/\/www\.google\.com\/maps\/embed\?/, route => route.abort());
      await load(page, 'contact');
      await page.locator('.contact-location').scrollIntoViewIfNeeded();
      assert(await page.locator('.contact-location address').isVisible());
      assert(await page.getByRole('link', {name: 'Get directions'}).isVisible());
      await page.locator('.location-hours summary').click();
      assert.equal(await page.locator('.location-hours tr:visible').count(), 7);
      assert.equal(await page.locator('.contact-phone').getAttribute('href'), 'tel:+14147914526');
      report.safeguards.push({test: 'blocked-map-address-directions-hours-available', pass: true});
      await page.close();
    });
    await check('late motion data stays static', async () => {
      const page = await browser.newPage({viewport: {width: 390, height: 900}, reducedMotion: 'no-preference'});
      await page.route('**/smf-motion-curves.json', async route => {
        await new Promise(resolve => setTimeout(resolve, 2600));
        await route.fulfill({path: path.join(process.cwd(), 'assets/smf-motion-curves.json'), contentType: 'application/json'}).catch(() => {});
      });
      await page.goto(`${base}/index.html`);
      await page.waitForTimeout(3000);
      assert.equal(await page.evaluate(() => document.documentElement.dataset.smfMotionState), 'static');
      assert.equal(await page.locator('h1').evaluate(el => getComputedStyle(el).opacity), '1');
      assert.equal(await page.evaluate(() => document.documentElement.classList.contains('smf-motion-boot')), false);
      report.safeguards.push({test: 'late-motion-data-no-replay', pass: true}); await page.close();
    });
    await check('history return keeps content stable', async () => {
      const page = await browser.newPage({viewport: {width: 390, height: 900}, reducedMotion: 'no-preference'});
      await load(page, 'training'); await page.waitForFunction(() => document.documentElement.dataset.smfMotionState === 'complete');
      await load(page, 'programs'); await page.goBack({waitUntil: 'networkidle'});
      await page.waitForFunction(() => document.documentElement.dataset.smfMotionState === 'static');
      assert.equal(await page.locator('h1').evaluate(el => getComputedStyle(el).opacity), '1');
      report.safeguards.push({test: 'history-return-no-replay', pass: true}); await page.close();
    });
  } finally { await browser.close(); save(); }
  const safari = await webkit.launch(); report.webkitVersion = safari.version();
  try {
    for (const route of routes) for (const width of [390, 1334]) await check(`WebKit layout ${route} ${width}`, async () => {
      const page = await safari.newPage({viewport: {width, height: 900}, reducedMotion: 'reduce'});
      try { await layout(page, route, width, 'webkit'); await navigation(page, route, width); } finally { await page.close(); }
    });
  } finally { await safari.close(); }
  report.completed = new Date().toISOString(); save();
  console.log(JSON.stringify({layouts: report.layouts.length, navigation: report.navigation.length, motion: report.motion.length, locations: report.locations.length, safeguards: report.safeguards.length, failures: report.failures.length, chromium: report.chromiumVersion, webkit: report.webkitVersion}));
})().catch(error => { save(); console.error(error.stack); process.exit(1); });
