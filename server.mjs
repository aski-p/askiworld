import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)));
const port = Number.parseInt(process.env.PORT ?? '8080', 10);

const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml; charset=utf-8'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.ico', 'image/x-icon']
]);

const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY'
};

const send = (response, status, headers, body = '') => {
  response.writeHead(status, { ...securityHeaders, ...headers });
  response.end(body);
};

const server = http.createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);

    if (requestUrl.pathname === '/healthz') {
      send(response, 200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, JSON.stringify({ ok: true }));
      return;
    }

    const decodedPath = decodeURIComponent(requestUrl.pathname);
    const relativePath = decodedPath === '/' ? 'index.html' : decodedPath.replace(/^\/+/, '');
    const filePath = normalize(join(root, relativePath));
    const relativeToRoot = relative(root, filePath);

    if (relativeToRoot.startsWith(`..${sep}`) || relativeToRoot === '..') {
      send(response, 403, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Forbidden');
      return;
    }

    const fileStats = await stat(filePath);
    if (!fileStats.isFile()) throw new Error('Not a file');

    const body = await readFile(filePath);
    const extension = extname(filePath).toLowerCase();
    const cacheControl = extension === '.html' ? 'no-cache' : 'public, max-age=3600';
    const headers = {
      'Content-Type': mimeTypes.get(extension) ?? 'application/octet-stream',
      'Content-Length': body.byteLength,
      'Cache-Control': cacheControl
    };

    if (request.method === 'HEAD') {
      send(response, 200, headers);
      return;
    }

    if (request.method !== 'GET') {
      send(response, 405, { 'Content-Type': 'text/plain; charset=utf-8', Allow: 'GET, HEAD' }, 'Method Not Allowed');
      return;
    }

    send(response, 200, headers, body);
  } catch {
    send(response, 404, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }, 'Not Found');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`ASKIWORLD is running on http://0.0.0.0:${port}`);
});
