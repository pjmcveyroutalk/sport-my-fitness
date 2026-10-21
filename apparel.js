import {approvedApparelItems, apparelPriceLabel} from './apparel-catalog.js?v=apparel-integration-20261020';

/* One page, ordinary anchors and native horizontal scrolling. Sample markup
   stays useful if JavaScript, the catalogue or the network is unavailable. */
const root = document.querySelector('[data-apparel-catalog]');
if (root) {
  const track = root.querySelector('#apparel-look-track');
  const products = root.querySelector('[data-apparel-products]');
  const controls = root.querySelector('[data-carousel-controls]');
  const previous = root.querySelector('[data-carousel-prev]');
  const next = root.querySelector('[data-carousel-next]');
  const position = root.querySelector('[data-carousel-position]');
  const progress = root.querySelector('[data-carousel-progress]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;

  function updateCarousel() {
    frame = 0;
    const max = Math.max(0, track.scrollWidth - track.clientWidth);
    const offset = Math.max(0, Math.min(max, track.scrollLeft));
    const bounds = track.getBoundingClientRect();
    const cards = [...track.children];
    const visible = cards.flatMap((card, index) => {
      const box = card.getBoundingClientRect();
      return Math.min(bounds.right, box.right) - Math.max(bounds.left, box.left) >= box.width * .4 ? [index + 1] : [];
    });
    previous.disabled = offset <= 2;
    next.disabled = offset >= max - 2;
    controls.hidden = max < 3;
    const first = visible[0] || 1;
    const last = visible.at(-1) || first;
    const label = `${first === last ? first : `${first}–${last}`} of ${cards.length}`;
    if (position.textContent !== label) position.textContent = label;
    const thumb = Math.min(100, track.clientWidth / Math.max(track.scrollWidth, 1) * 100);
    progress.style.width = `${thumb}%`;
    progress.style.left = `${max ? offset / max * (100 - thumb) : 0}%`;
  }
  function queueUpdate() {
    if (!frame) frame = requestAnimationFrame(updateCarousel);
  }
  function move(direction) {
    const width = track.firstElementChild?.getBoundingClientRect().width || track.clientWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({left: direction * (width + gap), behavior: reducedMotion.matches ? 'auto' : 'smooth'});
  }
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  track.addEventListener('scroll', queueUpdate, {passive: true});
  track.addEventListener('keydown', event => {
    if (event.target !== track) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      track.scrollTo({left: event.key === 'Home' ? 0 : track.scrollWidth, behavior: reducedMotion.matches ? 'auto' : 'smooth'});
    }
  });
  if ('ResizeObserver' in window) new ResizeObserver(queueUpdate).observe(track);
  else addEventListener('resize', queueUpdate);

  function markSelection() {
    track.querySelectorAll('a').forEach(link => {
      if (link.hash === location.hash) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  addEventListener('hashchange', markSelection);
  markSelection();
  updateCarousel();

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
    const specs = element('dl', 'apparel-item-specifications');
    [['Colors', item.colors], ['Sizes', item.sizes]].forEach(([label, values]) => {
      const row = element('div');
      row.append(element('dt', '', label), element('dd', '', values.length ? values.join(', ') : 'To be confirmed'));
      specs.append(row);
    });
    const inquiry = element('a', 'button', 'Ask about this item');
    inquiry.href = 'contact.html#inquiry';
    const arrow = element('span', '', '→');
    arrow.setAttribute('aria-hidden', 'true');
    inquiry.append(arrow);
    const back = element('a', 'apparel-back-link', '↑ Back to apparel');
    back.href = '#collection';
    copy.append(specs, inquiry, back);
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
    markSelection();
    updateCarousel();
    // An incoming product fragment may precede the asynchronous catalogue.
    const target = [...products.children].find(card => `#${card.id}` === location.hash);
    if (target) requestAnimationFrame(() => target.scrollIntoView({behavior: 'instant', block: 'start'}));
  }
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
