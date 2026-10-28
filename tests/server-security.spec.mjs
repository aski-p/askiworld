import { test, expect } from '@playwright/test';

test('server denies repository metadata and removed atlas chunks', async ({ request }) => {
  const gitConfig = await request.get('/.git/config');
  const removedAtlas = await request.get('/assets/atlas-00.txt');

  expect(gitConfig.status()).toBe(404);
  expect(removedAtlas.status()).toBe(404);
});

test('mutable application files require revalidation and assets have correct MIME types', async ({ request }) => {
  for (const path of ['/index.html', '/village.html', '/village.css', '/village.js', '/village-scene.js', '/village-dialogue.js']) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    expect(response.headers()['cache-control'], path).not.toContain('immutable');
    expect(response.headers()['cache-control'], path).toMatch(/no-cache|max-age=0|must-revalidate/);
  }

  for (const [path, mime] of [
    ['/assets/apps/fingerforest.png', 'image/png'],
    ['/assets/apps/h3-studio.svg', 'image/svg+xml'],
    ['/assets/dragon-breath.webp', 'image/webp'],
    ['/assets/dragon-flight.webp', 'image/webp'],
    ['/assets/house-flame.webp', 'image/webp'],
    ['/assets/roof-fire.webp', 'image/webp'],
    ['/assets/village.png', 'image/png'],
    ['/assets/village-hd.webp', 'image/webp'],
    ['/assets/village-uhd.webp', 'image/webp'],
    ['/assets/village-night.png', 'image/png'],
    ['/assets/village-night-hd.webp', 'image/webp'],
    ['/assets/village-night-uhd.webp', 'image/webp'],
    ['/assets/character-back.png', 'image/png'],
    ['/assets/character-front.png', 'image/png'],
    ['/assets/character-side.png', 'image/png'],
  ]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    expect(response.headers()['content-type'], path).toBe(mime);
    expect(response.headers()['cache-control'], path).not.toContain('immutable');
    expect(response.headers()['cache-control'], path).toMatch(/no-cache|max-age=0|must-revalidate/);
  }
});
