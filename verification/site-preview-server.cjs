/* Local verification server: applies the static site's declared redirects and
 * rewrites, so browser checks exercise the same public page URLs as production. */
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.woff':'font/woff','.woff2':'font/woff2','.mp4':'video/mp4','.ico':'image/x-icon','.xml':'application/xml','.txt':'text/plain; charset=utf-8'};
function createPreviewServer(root = path.resolve(__dirname, '..')) {
  const config = require(path.join(root, 'vercel.json'));
  return http.createServer(async (req, res) => {
    try {
      const decoded = decodeURIComponent(req.url.split('?')[0]);
      if (!decoded.startsWith('/') || decoded.includes('\\') || decoded.includes('\0') || decoded.split('/').some(part => part === '..' || part.startsWith('.'))) {
        res.writeHead(400); return res.end('Invalid path');
      }
      const url = new URL(req.url, 'http://preview.invalid');
      for (const rule of config.headers || []) {
        // Only the universal and exact header sources used by this project.
        if (rule.source === '/(.*)' || rule.source === url.pathname) {
          for (const header of rule.headers) res.setHeader(header.key, header.value);
        }
      }
      if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405); return res.end(); }
      const rule = (config.redirects || []).find(item => item.source === url.pathname);
      if (rule) {
        const target = new URL(rule.destination, url);
        target.search = url.search;
        res.writeHead(rule.permanent ? 308 : 307, {Location: target.pathname + target.search + target.hash}); return res.end();
      }
      if (config.trailingSlash && url.pathname !== '/' && !url.pathname.endsWith('/') && !path.extname(url.pathname)) {
        res.writeHead(308, {Location: url.pathname + '/' + url.search}); return res.end();
      }
      const rewrite = (config.rewrites || []).find(item => item.source === url.pathname);
      const relative = (rewrite ? rewrite.destination : url.pathname === '/' ? '/index.html' : url.pathname).slice(1);
      const file = path.resolve(root, relative);
      if (!file.startsWith(root + path.sep)) { res.writeHead(404); return res.end(); }
      const body = await fs.readFile(file);
      res.writeHead(200, {'Content-Type': types[path.extname(file)] || 'application/octet-stream'});
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch (error) {
      res.writeHead(error.code === 'ENOENT' || error.code === 'EISDIR' ? 404 : 400); res.end();
    }
  });
}
module.exports = {createPreviewServer};
if (require.main === module) createPreviewServer().listen(Number(process.env.PORT || 8080), '127.0.0.1');
