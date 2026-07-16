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
    'assets/dragon-flight.webp',
    'assets/roof-fire.webp',
    'assets/village-hd.webp',
    'assets/village-night-hd.webp',
    'assets/village-night-uhd.webp',
    'assets/village-night.png',
    'assets/village-uhd.webp',
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
  expect(vercel.headers).toEqual([
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
        },
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    },
  ]);
});
