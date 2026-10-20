/* Only owner-approved, available items with a real local photo enter the gallery. */
export function approvedApparelItems(catalog) {
  if (!catalog || catalog.version !== 1 || !Array.isArray(catalog.items)) return [];
  const usedIds = new Set();
  return catalog.items.flatMap(item => {
    if (!item || item.approved !== true || item.available !== true ||
        typeof item.id !== 'string' || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(item.id) ||
        usedIds.has(item.id) || typeof item.name !== 'string' || !item.name.trim() ||
        !Array.isArray(item.photos)) return [];
    const photos = item.photos.filter(photo => photo && typeof photo.src === 'string' &&
      /^assets\/(?:apparel|photos)\/[a-zA-Z0-9_./-]+\.(?:webp|png|jpe?g)$/i.test(photo.src) &&
      !photo.src.includes('..') && typeof photo.alt === 'string' && photo.alt.trim());
    if (!photos.length) return [];
    usedIds.add(item.id);
    const list = values => Array.isArray(values) ? values.filter(value => typeof value === 'string' && value.trim()) : [];
    return [{
      id: item.id,
      name: item.name.trim(),
      category: typeof item.category === 'string' && item.category.trim() ? item.category.trim() : 'Apparel',
      description: typeof item.description === 'string' ? item.description.trim() : '',
      photos: photos.map((photo, index) => ({src: photo.src, alt: photo.alt.trim(), label: typeof photo.label === 'string' && photo.label.trim() ? photo.label.trim() : `Photo ${index + 1}`})),
      colors: list(item.colors),
      sizes: list(item.sizes),
      price: typeof item.price === 'number' && Number.isFinite(item.price) && item.price >= 0 && item.currency === 'USD' ? item.price : null
    }];
  });
}

export function apparelPriceLabel(item) {
  return item.price === null ? 'Ask Yoshi for pricing' :
    new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 2}).format(item.price);
}
