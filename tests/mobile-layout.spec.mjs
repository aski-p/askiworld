import { test, expect, devices } from '@playwright/test';

const { defaultBrowserType: _defaultBrowserType, ...iphone13 } = devices['iPhone 13'];

const ready = async (page) => {
  await page.goto('/');
  await page.waitForFunction(() => document.querySelector('#app')?.getAttribute('aria-busy') === 'false');
};

const fullscreenGeometry = () => {
  const world = document.querySelector('#world').getBoundingClientRect();
  const scene = document.querySelector('#scene').getBoundingClientRect();
  return {
    viewport: { width: innerWidth, height: innerHeight },
    document: {
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
    },
    world: { width: world.width, height: world.height },
    scene: { width: scene.width, height: scene.height },
    conceptNodes: document.querySelectorAll('.sidebar, .bottom, .mobile-info').length,
  };
};

test.describe('mobile fullscreen village', () => {
  test.use(iphone13);

  test('fills the viewport with only the playable village', async ({ page, context }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });

    await ready(page);
    const geometry = await page.evaluate(fullscreenGeometry);
    const controls = await page.locator('.pad button').evaluateAll((buttons) => buttons.map((button) => {
      const rect = button.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }));

    expect(Math.abs(geometry.world.width - geometry.viewport.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(geometry.world.height - geometry.viewport.height)).toBeLessThanOrEqual(1);
    expect(geometry.document.scrollWidth).toBe(geometry.viewport.width);
    expect(geometry.document.scrollHeight).toBe(geometry.viewport.height);
    expect(geometry.scene.width).toBeGreaterThanOrEqual(geometry.world.width);
    expect(geometry.scene.height).toBeGreaterThanOrEqual(geometry.world.height);
    expect(geometry.conceptNodes).toBe(0);
    expect(controls.every(({ width, height }) => width >= 48 && height >= 48)).toBeTruthy();

    const before = await page.evaluate(() => ({
      playerX: getComputedStyle(document.querySelector('#player')).getPropertyValue('--x'),
      camera: getComputedStyle(document.querySelector('#scene')).transform,
    }));
    const right = page.locator('[data-move="right"]');
    const box = await right.boundingBox();
    const touch = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    const cdp = await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [touch] });
    await page.waitForTimeout(500);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(100);
    const after = await page.evaluate(() => ({
      playerX: getComputedStyle(document.querySelector('#player')).getPropertyValue('--x'),
      camera: getComputedStyle(document.querySelector('#scene')).transform,
    }));

    expect(after.playerX).not.toBe(before.playerX);
    expect(after.camera).not.toBe(before.camera);
    expect(errors).toEqual([]);

    await page.route('https://subagent-aski.vercel.app/**', (route) => route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<title>Agent Office reached</title>',
    }));
    const officePoint = await page.locator('#office').evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const left = Math.max(1, rect.left);
      const right = Math.min(innerWidth - 1, rect.right);
      const top = Math.max(1, rect.top);
      const bottom = Math.min(innerHeight - 1, rect.bottom);
      return { x: (left + right) / 2, y: (top + bottom) / 2 };
    });
    await page.touchscreen.tap(officePoint.x, officePoint.y);
    await page.waitForURL('https://subagent-aski.vercel.app/**', { timeout: 10_000 });
  });
});

test('desktop also shows only a fullscreen playable village', async ({ page }) => {
  await page.setViewportSize({ width: 1365, height: 900 });
  await ready(page);

  const geometry = await page.evaluate(fullscreenGeometry);
  expect(Math.abs(geometry.world.width - geometry.viewport.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(geometry.world.height - geometry.viewport.height)).toBeLessThanOrEqual(1);
  expect(geometry.document.scrollWidth).toBe(geometry.viewport.width);
  expect(geometry.document.scrollHeight).toBe(geometry.viewport.height);
  expect(geometry.conceptNodes).toBe(0);
  await expect(page.locator('.pad')).toBeHidden();
});
