import { test, expect } from '@playwright/test';
import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

test('production build emits only the fullscreen static application', async () => {
  await execFileAsync('npm', ['run', 'build'], { cwd: process.cwd() });

  const expected = [
    'app.js',
    'assets/character-back.png',
    'assets/character-front.png',
    'assets/character-side.png',
    'assets/village.png',
    'atlas.js',
    'favicon.svg',
    'index.html',
    'styles.css',
  ];

  async function files(directory, prefix = '') {
    const result = [];
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) result.push(...await files(`${directory}/${entry.name}`, relative));
      else result.push(relative);
    }
    return result;
  }

  expect((await files('dist')).sort()).toEqual(expected);
  const html = await fs.readFile('dist/index.html', 'utf8');
  expect(html).not.toMatch(/컨셉 아트|sidebar|mobile-info|class="bottom"/);

  const vercel = JSON.parse(await fs.readFile('vercel.json', 'utf8'));
  const headers = Object.fromEntries(vercel.headers?.[0]?.headers?.map(({ key, value }) => [key, value]) || []);
  expect(vercel.headers?.[0]?.source).toBe('/(.*)');
  expect(headers).toMatchObject({
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  });
  expect(headers['Content-Security-Policy']).toContain("default-src 'self'");
  expect(headers['Content-Security-Policy']).toContain("frame-ancestors 'none'");
});
