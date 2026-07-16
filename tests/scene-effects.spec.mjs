import { test, expect } from '@playwright/test';

const ready = async (page) => {
  await page.goto('/');
  await page.evaluate(() => window.ASKI_READY);
  await page.waitForFunction(() => document.querySelector('#app')?.getAttribute('aria-busy') === 'false');
};

test('Library fire has no leaking facade glow and fountain water flows over the painted streams', async ({ page }) => {
  await page.setViewportSize({ width: 1184, height: 532 });
  await ready(page);

  await expect(page.locator('.facade-heat')).toHaveCount(0);
  await expect(page.locator('.door-heat')).toHaveCount(0);
  await expect(page.locator('.window-lower-left, .window-lower-right')).toHaveCount(0);
  const windowFlameContent = await page.locator('.window-blaze').first().evaluate((element) => getComputedStyle(element, '::after').content);
  expect(windowFlameContent).toBe('none');
  const fountain = page.locator('.fountain-water');
  await expect(fountain).toHaveCount(1);
  await expect(fountain.locator('.water-stream')).toHaveCount(3);
  await expect(fountain.locator('.water-ripple')).toHaveCount(2);

  const effect = await fountain.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const stream = getComputedStyle(element.querySelector('.water-stream'));
    const ripple = getComputedStyle(element.querySelector('.water-ripple'));
    const own = getComputedStyle(element);
    return {
      rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      pointerEvents: own.pointerEvents,
      streamAnimation: stream.animationName,
      streamOpacity: Number(stream.opacity),
      streamWidth: Number.parseFloat(stream.strokeWidth),
      rippleAnimation: ripple.animationName,
    };
  });

  expect(effect.pointerEvents).toBe('none');
  expect(effect.streamAnimation).toContain('fountainFlow');
  expect(effect.streamOpacity).toBeLessThanOrEqual(0.68);
  expect(effect.streamWidth).toBeLessThanOrEqual(1.6);
  expect(effect.rippleAnimation).toContain('fountainRipple');
  expect(effect.rect.left).toBeGreaterThan(230);
  expect(effect.rect.left).toBeLessThan(300);
  expect(effect.rect.top).toBeGreaterThan(320);
  expect(effect.rect.top).toBeLessThan(370);

  await page.locator('.library').hover();
  await page.waitForTimeout(250);
  const libraryHighlight = await page.locator('.library').evaluate((element) => {
    const highlight = getComputedStyle(element, '::before');
    const label = getComputedStyle(element, '::after');
    return {
      borderColor: highlight.borderColor,
      backgroundColor: highlight.backgroundColor,
      boxShadow: highlight.boxShadow,
      labelFilter: label.filter,
    };
  });
  expect(libraryHighlight.borderColor).toBe('rgba(0, 0, 0, 0)');
  expect(libraryHighlight.backgroundColor).toBe('rgba(0, 0, 0, 0)');
  expect(libraryHighlight.boxShadow).toBe('none');
  expect(libraryHighlight.labelFilter).not.toBe('none');
});

test('fountain respects reduced-motion preference', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page);
  const animations = await page.locator('.fountain-water').evaluate((element) => ({
    stream: getComputedStyle(element.querySelector('.water-stream')).animationName,
    ripple: getComputedStyle(element.querySelector('.water-ripple')).animationName,
  }));
  expect(animations).toEqual({ stream: 'none', ripple: 'none' });
});
