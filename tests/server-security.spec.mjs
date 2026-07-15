import { test, expect } from '@playwright/test';

test('server denies repository metadata and removed atlas chunks', async ({ request }) => {
  const gitConfig = await request.get('/.git/config');
  const removedAtlas = await request.get('/assets/atlas-00.txt');

  expect(gitConfig.status()).toBe(404);
  expect(removedAtlas.status()).toBe(404);
});

test('mutable application files require revalidation and assets have correct MIME types', async ({ request }) => {
  for (const path of ['/index.html', '/styles.css', '/app.js', '/atlas.js']) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    expect(response.headers()['cache-control'], path).not.toContain('immutable');
    expect(response.headers()['cache-control'], path).toMatch(/no-cache|max-age=0|must-revalidate/);
  }

  for (const path of ['/assets/village.png', '/assets/character-front.png', '/assets/character-side.png']) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    expect(response.headers()['content-type'], path).toBe('image/png');
  }
});

test('readiness loads every movement sprite before enabling the game', async ({ page }) => {
  const requestedAssets = new Set();
  page.on('request', (request) => {
    const name = new URL(request.url()).pathname.split('/').pop();
    if (name?.endsWith('.png')) requestedAssets.add(name);
  });

  await page.goto('/');
  await page.waitForFunction(() => document.querySelector('#app')?.getAttribute('aria-busy') === 'false');

  expect([...requestedAssets].sort()).toEqual([
    'character-back.png',
    'character-front.png',
    'character-side.png',
    'village.png',
  ]);
});
