// Test helpers retain historical page identifiers while navigating public URLs.
const pagePath = name => '/' + (name === 'index' ? 'home' : name) + '/';
module.exports = {pagePath};
