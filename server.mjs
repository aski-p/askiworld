import { createReadStream, promises as fs } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)));
const PORT = Number.parseInt(process.env.PORT || '8080', 10);

const MIME_TYPES = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.webp', 'image/webp'],
  ['.txt', 'text/plain; charset=utf-8'],
]);

function safePathname(urlString) {
  const pathname = decodeURIComponent(new URL(urlString, 'http://localhost').pathname);
  const requested = pathname === '/' ? '/index.html' : pathname;
  const normalized = normalize(requested).replace(/^([/\\])+/, '');
  const absolute = resolve(join(ROOT, normalized));
  return absolute === ROOT || absolute.startsWith(`${ROOT}${sep}`) ? absolute : null;
}

function securityHeaders() {
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "img-src 'self' data: blob:",
      "style-src 'self'",
      "script-src 'self'",
      "connect-src 'self'",
      "base-uri 'none'",
      "form-action 'none'",
      "frame-ancestors 'none'",
    ].join('; '),
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };
}

const server = createServer(async (request, response) => {
  const headers = securityHeaders();

  if (request.url === '/healthz') {
    response.writeHead(200, { ...headers, 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ ok: true, service: 'askiworld' }));
    return;
  }

  if (!['GET', 'HEAD'].includes(request.method || 'GET')) {
    response.writeHead(405, { ...headers, Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Method Not Allowed');
    return;
  }

  const filePath = safePathname(request.url || '/');
  if (!filePath) {
    response.writeHead(403, { ...headers, 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Forbidden');
    return;
  }

  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) throw new Error('Not a file');

    const contentType = MIME_TYPES.get(extname(filePath).toLowerCase()) || 'application/octet-stream';
    const cacheControl = filePath.endsWith('index.html') || filePath.includes('atlas-')
      ? 'no-cache'
      : 'public, max-age=604800, immutable';

    response.writeHead(200, {
      ...headers,
      'Content-Type': contentType,
      'Content-Length': stat.size,
      'Cache-Control': cacheControl,
    });

    if (request.method === 'HEAD') {
      response.end();
      return;
    }

    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, { ...headers, 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not Found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`ASKIWORLD is running on http://0.0.0.0:${PORT}`);
});
