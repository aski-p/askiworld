import { test, expect } from '@playwright/test';

const ready = async (page) => {
  await page.goto('/');
  await page.evaluate(() => window.ASKI_READY);
  await page.waitForFunction(() => document.querySelector('#app')?.getAttribute('aria-busy') === 'false');
};

const transparent = 'rgba(0, 0, 0, 0)';

test('Library fire contains no geometric overlay artifacts', async ({ page }) => {
  await ready(page);
  for (const selector of [
    '.facade-heat',
    '.door-heat',
    '.roof-char',
    '.window-lower-left',
    '.window-lower-right',
  ]) {
    await expect(page.locator(selector), selector).toHaveCount(0);
  }
  const windowFlameContent = await page.locator('.window-blaze').first()
    .evaluate((element) => getComputedStyle(element, '::after').content);
  expect(windowFlameContent).toBe('none');
});

test('fountain shimmer follows the three painted water streams exactly', async ({ page }) => {
  await page.setViewportSize({ width: 1184, height: 532 });
  await ready(page);

  const fountain = page.locator('.fountain-water');
  await expect(fountain).toHaveCount(1);
  await expect(fountain.locator('.water-glint')).toHaveCount(3);
  await expect(fountain.locator('.water-splash')).toHaveCount(3);
  await expect(fountain.locator('.water-ripple, .water-channels, .water-stream')).toHaveCount(0);

  const effect = await fountain.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const svg = element.querySelector('svg');
    const viewBox = svg.viewBox.baseVal;
    const toScene = (point) => ({
      x: rect.left + ((point.x - viewBox.x) / viewBox.width) * rect.width,
      y: rect.top + ((point.y - viewBox.y) / viewBox.height) * rect.height,
    });
    const paths = [...element.querySelectorAll('.water-glint')].map((path) => ({
      start: toScene(path.getPointAtLength(0)),
      end: toScene(path.getPointAtLength(path.getTotalLength())),
    }));
    const glint = getComputedStyle(element.querySelector('.water-glint'));
    const splashSizes = [...element.querySelectorAll('.water-splash')]
      .map((ellipse) => Number(ellipse.getAttribute('rx')));
    return {
      paths,
      splashSizes,
      pointerEvents: getComputedStyle(element).pointerEvents,
      filter: getComputedStyle(element).filter,
      animation: glint.animationName,
      opacity: Number(glint.opacity),
      strokeWidth: Number.parseFloat(glint.strokeWidth),
    };
  });

  const expected = [
    { start: { x: 330, y: 390 }, end: { x: 314, y: 438 } },
    { start: { x: 358, y: 415 }, end: { x: 347, y: 454 } },
    { start: { x: 399, y: 390 }, end: { x: 420, y: 438 } },
  ];
  for (let index = 0; index < expected.length; index += 1) {
    for (const edge of ['start', 'end']) {
      expect(effect.paths[index][edge].x, `${index} ${edge} x`).toBeCloseTo(expected[index][edge].x, 0);
      expect(effect.paths[index][edge].y, `${index} ${edge} y`).toBeCloseTo(expected[index][edge].y, 0);
    }
  }
  expect(effect.pointerEvents).toBe('none');
  expect(effect.filter).toBe('none');
  expect(effect.animation).toContain('fountainGlint');
  expect(effect.opacity).toBeLessThanOrEqual(0.5);
  expect(effect.strokeWidth).toBeLessThanOrEqual(1);
  expect(Math.max(...effect.splashSizes)).toBeLessThanOrEqual(10);
});

test('locked building labels never draw giant hover rectangles', async ({ page }) => {
  await page.setViewportSize({ width: 1184, height: 532 });
  await ready(page);
  for (const selector of ['.studio', '.library', '.windmill']) {
    await page.locator(selector).hover();
    await page.waitForTimeout(250);
    const visual = await page.locator(selector).evaluate((element) => {
      const highlight = getComputedStyle(element, '::before');
      const label = getComputedStyle(element, '::after');
      return {
        border: highlight.borderColor,
        background: highlight.backgroundColor,
        shadow: highlight.boxShadow,
        labelFilter: label.filter,
      };
    });
    expect(visual.border, selector).toBe(transparent);
    expect(visual.background, selector).toBe(transparent);
    expect(visual.shadow, selector).toBe('none');
    expect(visual.labelFilter, selector).not.toBe('none');
  }
});

test('fountain respects reduced-motion preference', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page);
  const animations = await page.locator('.fountain-water').evaluate((element) => ({
    glint: getComputedStyle(element.querySelector('.water-glint')).animationName,
    droplet: getComputedStyle(element.querySelector('.water-droplet')).animationName,
    splash: getComputedStyle(element.querySelector('.water-splash')).animationName,
  }));
  expect(animations).toEqual({ glint: 'none', droplet: 'none', splash: 'none' });
});
