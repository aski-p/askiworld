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

  test('fills the viewport with only the playable village', async ({ page }) => {
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

    const before = await page.locator('#player').evaluate((element) => getComputedStyle(element).getPropertyValue('--x'));
    const right = page.locator('[data-move="right"]');
    const box = await right.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(500);
    await page.mouse.up();
    const after = await page.locator('#player').evaluate((element) => getComputedStyle(element).getPropertyValue('--x'));

    expect(after).not.toBe(before);
    expect(errors).toEqual([]);

    await page.route('https://subagent-aski.vercel.app/**', (route) => route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<title>Agent Office reached</title>',
    }));
    await page.locator('#office').evaluate((element) => element.click());
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
