import test from 'node:test';
import assert from 'node:assert/strict';
import {approvedApparelItems, apparelPriceLabel} from '../apparel-catalog.mjs';

const approved = {
  id: 'owner-approved-shirt', name: 'Owner-supplied name', approved: true, available: true,
  photos: [{src: 'assets/apparel/products/approved-front.webp', alt: 'Owner-approved front photograph', label: 'Front'}]
};
const catalogue = items => ({version: 1, items});

test('a new collection remains empty until owner-approved available products are supplied', () => {
  assert.deepEqual(approvedApparelItems(catalogue([])), []);
  assert.deepEqual(approvedApparelItems(catalogue([
    {...approved, approved: false}, {...approved, approved: undefined}, {...approved, available: false}
  ])), []);
  assert.equal(approvedApparelItems(catalogue([approved])).length, 1);
});

test('items without a usable approved photograph cannot enter the gallery', () => {
  for (const photos of [[], [{src: 'javascript:alert(1)', alt: 'Photo'}], [{src: 'assets/apparel/../private.jpg', alt: 'Photo'}], [{src: 'https://elsewhere.example/photo.jpg', alt: 'Photo'}], [{src: 'assets/apparel/photo.webp'}]]) {
    assert.deepEqual(approvedApparelItems(catalogue([{...approved, photos}])), []);
  }
});

test('unconfirmed prices stay unknown; an explicitly supplied zero is preserved', () => {
  const variants = [undefined, null, -1, '20', Number.NaN, Number.POSITIVE_INFINITY];
  for (const price of variants) {
    const [item] = approvedApparelItems(catalogue([{...approved, price, currency: 'USD'}]));
    assert.equal(item.price, null);
    assert.equal(apparelPriceLabel(item), 'Ask Yoshi for pricing');
  }
  const [free] = approvedApparelItems(catalogue([{...approved, price: 0, currency: 'USD'}]));
  assert.equal(apparelPriceLabel(free), '$0.00');
});

test('only supplied product facts and photographs appear in the normalized result', () => {
  const [item] = approvedApparelItems(catalogue([{...approved, colors: ['Turquoise'], sizes: ['M'], category: 'Owner category', price: 28, currency: 'USD'}]));
  assert.deepEqual(item.colors, ['Turquoise']);
  assert.deepEqual(item.sizes, ['M']);
  assert.equal(item.photos[0].label, 'Front');
  assert.equal(apparelPriceLabel(item), '$28.00');
  assert.equal(item.description, '');
  const [minimal] = approvedApparelItems(catalogue([approved]));
  assert.deepEqual(minimal.colors, []);
  assert.deepEqual(minimal.sizes, []);
});

test('invalid schema, missing names and duplicate identifiers do not create duplicate products', () => {
  assert.deepEqual(approvedApparelItems({version: 2, items: [approved]}), []);
  assert.deepEqual(approvedApparelItems(catalogue([{...approved, name: ''}, {...approved, id: '<bad>'} ])), []);
  assert.equal(approvedApparelItems(catalogue([approved, approved])).length, 1);
});
