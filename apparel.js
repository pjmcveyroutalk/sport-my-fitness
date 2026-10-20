import {approvedApparelItems, apparelPriceLabel} from './apparel-catalog.mjs?v=apparel-20261020';

/* Native scrolling stays usable without JavaScript; controls enhance it. */
const track = document.getElementById('apparel-look-track');
if (track) {
  const cards = [...track.children];
  const previous = document.querySelector('[data-carousel-prev]');
  const next = document.querySelector('[data-carousel-next]');
  const position = document.querySelector('[data-carousel-position]');
  const controls = document.querySelector('[data-carousel-controls]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let lastPosition = -1;
  function updateCarousel() {
    frame = 0;
    const max = Math.max(0, track.scrollWidth - track.clientWidth);
    const firstWidth = cards[0]?.getBoundingClientRect().width || 1;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const index = Math.min(cards.length - 1, Math.max(0, Math.round(track.scrollLeft / (firstWidth + gap))));
    previous.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max - 2;
    controls.hidden = max < 3;
    if (lastPosition !== index) { position.textContent = `Look ${index + 1} of ${cards.length}`; lastPosition = index; }
  }
  function move(direction) {
    const width = cards[0]?.getBoundingClientRect().width || track.clientWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({left: direction * (width + gap), behavior: reducedMotion.matches ? 'auto' : 'smooth'});
  }
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  track.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(updateCarousel); }, {passive: true});
  if ('ResizeObserver' in window) new ResizeObserver(updateCarousel).observe(track);
  else addEventListener('resize', updateCarousel);
  updateCarousel();
}

const catalogRoot = document.querySelector('[data-catalog]');
if (catalogRoot) {
  const grid = catalogRoot.querySelector('[data-product-grid]');
  const empty = catalogRoot.querySelector('[data-catalog-empty]');
  const errorNotice = catalogRoot.querySelector('[data-catalog-error]');
  const count = catalogRoot.querySelector('[data-item-count]');
  const filters = catalogRoot.querySelector('[data-category-filters]');
  const dialog = document.getElementById('apparel-product-dialog');
  let items = [];
  let selectedCategory = 'All';
  let opener = null;
  let beforeDialogOverflow = '';

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function closeProduct() {
    if (!dialog.open) return;
    dialog.close();
    document.body.style.overflow = beforeDialogOverflow;
    opener?.focus({preventScroll: true});
  }
  dialog.querySelector('[data-product-close]').addEventListener('click', closeProduct);
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeProduct(); });
  dialog.addEventListener('close', () => { document.body.style.overflow = beforeDialogOverflow; });
  addEventListener('pagehide', closeProduct);
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeProduct();
  });

  function showItem(item, trigger) {
    const photo = dialog.querySelector('[data-detail-photo]');
    const choices = dialog.querySelector('[data-photo-choices]');
    choices.replaceChildren();
    function selectPhoto(index) {
      photo.src = item.photos[index].src;
      photo.alt = item.photos[index].alt;
      choices.querySelectorAll('button').forEach((button, buttonIndex) => button.setAttribute('aria-pressed', String(buttonIndex === index)));
    }
    item.photos.forEach((image, index) => {
      const button = element('button', 'apparel-photo-choice', image.label);
      button.type = 'button';
      button.setAttribute('aria-pressed', String(index === 0));
      button.addEventListener('click', () => selectPhoto(index));
      choices.append(button);
    });
    choices.hidden = item.photos.length < 2;
    selectPhoto(0);
    dialog.querySelector('[data-detail-category]').textContent = item.category;
    dialog.querySelector('#apparel-product-title').textContent = item.name;
    const description = dialog.querySelector('[data-detail-description]');
    description.textContent = item.description;
    description.hidden = !item.description;
    dialog.querySelector('[data-detail-price]').textContent = apparelPriceLabel(item);
    const specs = dialog.querySelector('[data-detail-specs]');
    specs.replaceChildren();
    [['Colors', item.colors], ['Sizes', item.sizes]].forEach(([label, values]) => {
      if (!values.length) return;
      const row = element('div');
      row.append(element('dt', '', label), element('dd', '', values.join(', ')));
      specs.append(row);
    });
    opener = trigger;
    beforeDialogOverflow = document.body.style.overflow;
    if (typeof dialog.showModal !== 'function') { location.href = 'contact.html#inquiry'; return; }
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    dialog.querySelector('[data-product-close]').focus({preventScroll: true});
  }

  function renderItems() {
    const visible = selectedCategory === 'All' ? items : items.filter(item => item.category === selectedCategory);
    grid.replaceChildren();
    visible.forEach(item => {
      const row = element('li', 'apparel-product-card');
      const button = element('button', 'apparel-product-trigger');
      button.type = 'button';
      button.setAttribute('aria-haspopup', 'dialog');
      button.setAttribute('aria-controls', 'apparel-product-dialog');
      const image = element('img', 'apparel-catalog-photo');
      image.src = item.photos[0].src;
      image.alt = item.photos[0].alt;
      image.width = 900;
      image.height = 1100;
      image.loading = 'lazy';
      image.decoding = 'async';
      const copy = element('span', 'apparel-product-card-copy');
      copy.append(element('span', 'apparel-product-category', item.category), element('strong', '', item.name), element('span', 'apparel-product-price', apparelPriceLabel(item)), element('span', 'apparel-card-action', 'View details →'));
      button.append(image, copy);
      button.addEventListener('click', () => showItem(item, button));
      row.append(button);
      grid.append(row);
    });
    grid.hidden = !visible.length;
    empty.hidden = items.length > 0;
    count.hidden = !items.length;
    count.textContent = `${visible.length} ${visible.length === 1 ? 'item' : 'items'}`;
    filters.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === selectedCategory)));
  }

  async function loadCollection() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch('assets/apparel/catalog.json?v=apparel-20261020', {signal: controller.signal});
      if (!response.ok) throw new Error('Collection unavailable');
      const catalog = await response.json();
      if (catalog.version !== 1 || !Array.isArray(catalog.items)) throw new Error('Invalid collection');
      items = approvedApparelItems(catalog);
      const categories = [...new Set(items.map(item => item.category))];
      if (categories.length > 1) {
        ['All', ...categories].forEach(category => {
          const button = element('button', 'apparel-filter', category);
          button.type = 'button';
          button.dataset.category = category;
          button.setAttribute('aria-pressed', String(category === selectedCategory));
          button.addEventListener('click', () => { selectedCategory = category; renderItems(); });
          filters.append(button);
        });
        filters.hidden = false;
      }
      renderItems();
    } catch (_) {
      errorNotice.hidden = false;
      empty.hidden = false;
    } finally { clearTimeout(timeout); }
  }
  loadCollection();
}
