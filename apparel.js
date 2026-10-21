import {approvedApparelItems, apparelPriceLabel} from './apparel-catalog.js?v=apparel-integration-20261020';

/* A centered carousel with one replaceable detail card, on the same page.
   Static anchors and all sample details remain usable without JavaScript. */
const root = document.querySelector('[data-apparel-catalog]');
if (root) {
  const track = root.querySelector('#apparel-look-track');
  const products = root.querySelector('[data-apparel-products]');
  const carousel = root.querySelector('.apparel-carousel');
  const previous = carousel.querySelector('[data-carousel-previous]');
  const next = carousel.querySelector('[data-carousel-next]');
  const caption = carousel.querySelector('[data-carousel-caption]');
  let entries = [];
  let current = 0;
  let selected = '';
  let gesture = null;
  let ignoreClickUntil = 0;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let imageObserver;

  function updateCarousel(animate = true) {
    const count = entries.length;
    // Read the current composed frame before any writes. Interrupted arrow
    // clicks continue from that frame instead of restarting from a stale pose.
    const frames = entries.map(entry => {
      const style = getComputedStyle(entry.row);
      return {transform: style.transform, opacity: Number(style.opacity), position: entry.row.dataset.position};
    });
    const positions = [];
    entries.forEach((entry, index) => {
      const position = index === current ? 'current' :
        index === (current + 1) % count ? 'next' :
        count > 2 && index === (current + count - 1) % count ? 'previous' : '';
      const active = Boolean(position);
      entry.animation?.cancel();
      entry.animation = null;
      delete entry.row.dataset.carouselAnimating;
      // Keep the outgoing/incoming cutouts painted. display:none cancels
      // their exit/entry animation and was the source of the visible popping.
      entry.row.hidden = false;
      entry.row.inert = !active;
      if (active) entry.row.removeAttribute('aria-hidden');
      else entry.row.setAttribute('aria-hidden', 'true');
      const target = position || (frames[index].position?.includes('previous') ? 'offstage-previous' : 'offstage-next');
      entry.row.dataset.position = target;
      positions.push(target);
      entry.link.tabIndex = position === 'current' ? 0 : -1;
      entry.link.setAttribute('aria-expanded', String(selected === entry.card.id));
      if (selected === entry.card.id) entry.link.setAttribute('aria-current', 'true');
      else entry.link.removeAttribute('aria-current');
    });
    // Batch the target-style reads too. Only transform/opacity animate;
    // garment sizing and the detail-card layout do not animate every frame.
    const targets = entries.map(entry => {
      const style = getComputedStyle(entry.row);
      return {transform: style.transform, opacity: Number(style.opacity)};
    });
    if (animate && !reducedMotion.matches) entries.forEach((entry, index) => {
      if (!entry.row.animate) return;
      const from = frames[index];
      const to = targets[index];
      if (from.opacity < .001 && to.opacity > 0) {
        from.transform = positions[index] === 'previous' ? 'translate3d(-200%, 0, 0) scale(.5)' : 'translate3d(100%, 0, 0) scale(.5)';
      }
      if (from.transform === to.transform && from.opacity === to.opacity) return;
      entry.row.dataset.carouselAnimating = 'true';
      const animation = entry.row.animate([
        {transform: from.transform, opacity: from.opacity}, to
      ], {duration: 460, easing: 'cubic-bezier(.2,.7,.2,1)'});
      entry.animation = animation;
      animation.addEventListener('finish', () => {
        if (entry.animation !== animation) return;
        entry.animation = null;
        delete entry.row.dataset.carouselAnimating;
      }, {once: true});
    });
    const entry = entries[current];
    caption.querySelector('[data-carousel-name]').textContent = entry.name + (selected === entry.card.id ? ' · Selected' : '');
    caption.querySelector('[data-carousel-note]').textContent = root.dataset.apparelState === 'samples' ? 'DESIGN SAMPLE' : 'Select to see details';
    previous.hidden = next.hidden = count < 2;
  }
  function select(index, {remember = true, focus = false, animate = true} = {}) {
    current = index;
    const card = entries[index].card;
    selected = card.id;
    if (products.firstElementChild !== card) products.replaceChildren(card);
    if (remember && location.hash !== `#${card.id}`) history.pushState(null, '', `#${card.id}`);
    updateCarousel(animate);
    if (focus) card.focus({preventScroll: true});
  }
  function browse(index) {
    current = (index + entries.length) % entries.length;
    if (selected) select(current);
    else updateCarousel();
  }
  function syncFragment(scroll = false) {
    const index = entries.findIndex(entry => `#${entry.card.id}` === location.hash);
    if (index >= 0) {
      select(index, {remember: false, animate: false});
      if (scroll) {
        const card = entries[index].card;
        const hash = location.hash;
        const ready = document.readyState === 'complete' ? Promise.resolve() :
          new Promise(resolve => addEventListener('load', resolve, {once: true}));
        // Native reload restoration and web fonts can finish after the first
        // frame. Position a saved selection after that layout has settled.
        ready.then(() => document.fonts?.ready).then(() => requestAnimationFrame(() => {
          if (selected === card.id && location.hash === hash && products.firstElementChild === card) {
            card.scrollIntoView({behavior: 'instant', block: 'start'});
          }
        }));
      }
    } else {
      selected = '';
      products.replaceChildren();
      updateCarousel(false);
    }
  }
  function initializeCarousel() {
    imageObserver?.disconnect();
    entries.forEach(entry => entry.animation?.cancel());
    const cards = new Map([...products.children].map(card => [card.id, card]));
    entries = [...track.children].map(row => {
      const link = row.querySelector('a');
      return {row, link, card: cards.get(link.hash.slice(1)), name: link.querySelector('.apparel-look-name').textContent.trim()};
    });
    if (!entries.length || entries.some(entry => !entry.card)) return;
    current = 0;
    selected = '';
    products.replaceChildren();
    entries.forEach(entry => {
      entry.link.setAttribute('aria-label', `View ${entry.name} details`);
      entry.link.setAttribute('aria-controls', 'apparel-product-details');
    });
    carousel.dataset.carouselReady = 'true';
    caption.hidden = false;
    syncFragment(true);
    const warmImages = () => entries.forEach(entry => {
      const photo = entry.link.querySelector('img');
      photo.loading = 'eager';
      photo.decode?.().catch(() => {});
    });
    if ('IntersectionObserver' in window) {
      imageObserver = new IntersectionObserver(records => {
        if (!records.some(record => record.isIntersecting)) return;
        warmImages(); imageObserver.disconnect();
      }, {rootMargin: '400px'});
      imageObserver.observe(carousel);
    } else warmImages();
  }
  reducedMotion.addEventListener('change', () => updateCarousel(false));
  previous.addEventListener('click', () => browse(current - 1));
  next.addEventListener('click', () => browse(current + 1));
  track.addEventListener('click', event => {
    const link = event.target.closest('.apparel-look-link');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (performance.now() < ignoreClickUntil) return;
    const index = entries.findIndex(entry => entry.link === link);
    if (index >= 0) select(index, {focus: event.detail === 0});
  });
  track.addEventListener('keydown', event => {
    const index = event.key === 'Home' ? 0 : event.key === 'End' ? entries.length - 1 :
      event.key === 'ArrowLeft' ? current - 1 : event.key === 'ArrowRight' ? current + 1 : null;
    if (index !== null) {
      event.preventDefault();
      browse(index);
      if (event.target !== track) entries[current].link.focus({preventScroll: true});
    } else if (event.target === track && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault(); select(current, {focus: true});
    }
  });
  track.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' || !event.isPrimary) return;
    gesture = {id: event.pointerId, x: event.clientX, y: event.clientY};
  });
  track.addEventListener('pointerup', event => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    gesture = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      ignoreClickUntil = performance.now() + 400;
      browse(current + (dx < 0 ? 1 : -1));
    }
  });
  track.addEventListener('pointercancel', () => { gesture = null; });
  addEventListener('popstate', () => syncFragment());
  addEventListener('hashchange', () => syncFragment(true));

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function image(photo, className) {
    const node = element('img', className);
    node.src = photo.src;
    node.alt = photo.alt;
    node.width = 900;
    node.height = 1100;
    node.loading = 'lazy';
    node.decoding = 'async';
    return node;
  }
  const swatches = {charcoal: '#343b3d', black: '#14191b', grey: '#9a9d9d', gray: '#9a9d9d', white: '#f6f7f3', cream: '#eee4ce', turquoise: '#0695a5', teal: '#078896'};
  function specifications(colors, sizes, sample = false) {
    const specs = element('dl', 'apparel-item-specifications');
    [['Color', colors], ['Size', sizes]].forEach(([label, values]) => {
      const row = element('div');
      const detail = element('dd');
      row.append(element('dt', '', label + (sample ? ' examples' : '')), detail);
      if (!values.length) detail.textContent = 'To be confirmed';
      else {
        const choices = element('div', 'apparel-option-list');
        choices.setAttribute('role', 'group');
        choices.setAttribute('aria-label', (sample ? 'Sample ' : '') + label.toLowerCase());
        const selection = element('span', 'apparel-option-selection', values[0]);
        values.forEach((value, index) => {
          const button = element('button', 'apparel-option');
          button.type = 'button';
          button.setAttribute('aria-pressed', String(index === 0));
          button.setAttribute('aria-label', `${label}: ${value}`);
          const color = label === 'Color' && swatches[value.toLowerCase()];
          if (color) {
            button.classList.add('apparel-color-option');
            button.style.setProperty('--option-color', color);
            button.append(element('span', 'sr-only', value));
          } else button.textContent = value;
          button.addEventListener('click', () => {
            choices.querySelectorAll('button').forEach(choice => choice.setAttribute('aria-pressed', String(choice === button)));
            selection.textContent = value;
          });
          choices.append(button);
        });
        detail.append(choices);
        if (label === 'Color') detail.append(selection);
      }
      specs.append(row);
    });
    return specs;
  }
  function productCard(item) {
    const id = `apparel-${item.id}`;
    const article = element('article', 'apparel-product-card');
    article.id = id;
    article.tabIndex = -1;
    article.setAttribute('aria-labelledby', `${id}-title`);
    const heading = element('header', 'apparel-product-heading');
    const title = element('h3', '', item.name);
    title.id = `${id}-title`;
    heading.append(element('p', 'eyebrow apparel-eyebrow', item.category), title);
    const photos = element('div', 'apparel-product-photos');
    const photo = image(item.photos[0], 'apparel-detail-photo');
    photos.append(photo);
    if (item.photos.length > 1) {
      const choices = element('div', 'apparel-photo-choices');
      choices.setAttribute('role', 'group');
      choices.setAttribute('aria-label', `${item.name} photographs`);
      item.photos.forEach((view, index) => {
        const button = element('button', 'apparel-photo-choice');
        button.type = 'button';
        button.setAttribute('aria-label', view.label);
        button.setAttribute('aria-pressed', String(index === 0));
        const thumb = image({...view, alt: ''}, '');
        button.append(thumb, element('span', '', view.label));
        button.addEventListener('click', () => {
          photo.src = view.src;
          photo.alt = view.alt;
          choices.querySelectorAll('button').forEach((choice, choiceIndex) => choice.setAttribute('aria-pressed', String(choiceIndex === index)));
        });
        choices.append(button);
      });
      photos.append(choices);
    }
    const copy = element('div', 'apparel-product-description');
    copy.append(element('p', 'apparel-detail-description', item.description || 'Product description coming soon.'));
    copy.append(element('p', 'apparel-detail-price', apparelPriceLabel(item)));
    const specs = specifications(item.colors, item.sizes);
    const inquiry = element('a', 'apparel-inquiry-link', 'Ask Yoshi');
    inquiry.href = 'contact.html#inquiry';
    const arrow = element('span', '', '→');
    arrow.setAttribute('aria-hidden', 'true');
    inquiry.append(arrow);
    copy.append(specs, inquiry);
    article.append(heading, photos, copy);
    return article;
  }
  function renderCollection(items) {
    const rail = document.createDocumentFragment();
    const details = document.createDocumentFragment();
    items.forEach(item => {
      const row = element('li', 'apparel-look-item');
      const link = element('a', 'apparel-look-link');
      link.href = `#apparel-${item.id}`;
      link.append(image(item.photos[0], 'apparel-floating-photo'), element('span', 'apparel-look-name', item.name));
      row.append(link);
      rail.append(row);
      details.append(productCard(item));
    });
    track.replaceChildren(rail);
    products.replaceChildren(details);
    root.dataset.apparelState = 'approved';
    root.querySelector('[data-apparel-pending]').hidden = true;
    initializeCarousel();
  }
  // Examples demonstrate the approved control design, never actual stock.
  [...products.children].forEach(card => {
    const color = card.id.includes('tee') ? 'Grey' : card.id.includes('jacket') ? 'Turquoise' : card.id.includes('pants') ? 'Black' : 'Charcoal';
    const copy = card.querySelector('.apparel-product-description');
    copy.querySelector('.apparel-item-specifications').replaceWith(specifications([color, 'Cream', color === 'Turquoise' ? 'Black' : 'Turquoise'], ['S', 'M', 'L', 'XL'], true));
    copy.querySelector('.apparel-detail-price').textContent = 'Price coming soon';
    const inquiry = copy.querySelector('.button');
    inquiry.className = 'apparel-inquiry-link';
    inquiry.firstChild.textContent = 'Ask Yoshi ';
    copy.querySelector('.apparel-back-link').remove();
    copy.append(element('p', 'apparel-options-note', 'Illustrative sizes and colors · Yoshi to confirm.'));
  });
  initializeCarousel();
  async function loadCollection() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch('assets/apparel/catalog.json?v=floating-apparel-20261021', {signal: controller.signal});
      if (!response.ok) throw new Error('Collection unavailable');
      const catalog = await response.json();
      if (catalog.version !== 1 || !Array.isArray(catalog.items)) throw new Error('Invalid collection');
      const items = approvedApparelItems(catalog);
      if (items.length) renderCollection(items);
    } catch (_) {
      root.querySelector('[data-catalog-error]').hidden = false;
    } finally { clearTimeout(timeout); }
  }
  loadCollection();
}
