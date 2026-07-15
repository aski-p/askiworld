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

  for (const [path, mime] of [
    ['/assets/village.png', 'image/png'],
    ['/assets/village-hd.webp', 'image/webp'],
    ['/assets/village-uhd.webp', 'image/webp'],
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

test('readiness resolves only after every movement sprite decodes', async ({ page }) => {
  const requestedAssets = new Set();
  page.on('request', (request) => {
    const name = new URL(request.url()).pathname.split('/').pop();
    if (/\.(png|webp)$/.test(name || '')) requestedAssets.add(name);
  });

  await page.goto('/');
  const sources = await page.evaluate(() => window.ASKI_READY);

  expect(Object.keys(sources).sort()).toEqual([
    'characterBack',
    'characterFront',
    'characterSide',
    'village',
    'villageHD',
    'villageUHD',
  ]);
  const requested = [...requestedAssets].sort();
  expect(requested).toEqual(expect.arrayContaining([
    'character-back.png',
    'character-front.png',
    'character-side.png',
  ]));
  const requestedVillages = requested.filter((name) => name.startsWith('village'));
  expect(requestedVillages).toHaveLength(1);
  expect(['village.png', 'village-hd.webp', 'village-uhd.webp']).toContain(requestedVillages[0]);
  await expect(page.locator('#app')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('#app')).not.toHaveClass(/is-loading/);
});

test('HD village failure keeps large-screen gameplay disabled', async ({ browser }) => {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:4187',
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();
  let intercepted = false;
  await page.route('**/village-hd.webp', (route) => {
    intercepted = true;
    return route.abort('failed');
  });
  await page.goto('/');
  await page.waitForFunction(() => document.querySelector('#app')?.getAttribute('aria-busy') === 'false');
  const state = await page.evaluate(async () => {
    let resolved = true;
    try { await window.ASKI_READY; } catch { resolved = false; }
    return {
      resolved,
      stillLoading: document.querySelector('#app').classList.contains('is-loading'),
      recoveryText: document.querySelector('#loading').textContent,
    };
  });
  expect(intercepted).toBeTruthy();
  expect(state.resolved).toBeFalsy();
  expect(state.stillLoading).toBeTruthy();
  expect(state.recoveryText).toContain('마을을 불러오지 못했습니다');
  await context.close();
});

test('each required image failure keeps the game disabled and shows recovery UI', async ({ browser }) => {
  for (const asset of [
    'village.png',
    'character-back.png',
    'character-front.png',
    'character-side.png',
  ]) {
    const page = await browser.newPage({
      baseURL: 'http://127.0.0.1:4187',
      viewport: { width: 600, height: 800 },
    });
    await page.route(`**/${asset}`, (route) => route.abort('failed'));
    await page.goto('/');
    await page.waitForFunction(() => document.querySelector('#app')?.getAttribute('aria-busy') === 'false');

    const state = await page.evaluate(async () => {
      let resolved = true;
      try { await window.ASKI_READY; } catch { resolved = false; }
      return {
        resolved,
        stillLoading: document.querySelector('#app').classList.contains('is-loading'),
        recoveryText: document.querySelector('#loading').textContent,
      };
    });

    expect(state.resolved, asset).toBeFalsy();
    expect(state.stillLoading, asset).toBeTruthy();
    expect(state.recoveryText, asset).toContain('마을을 불러오지 못했습니다');
    expect(state.recoveryText, asset).toContain('다시 불러오기');
    await page.close();
  }
});
