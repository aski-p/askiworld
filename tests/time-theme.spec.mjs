import { test, expect } from '@playwright/test';

const cases = [
  ['2026-07-16T10:59:00.000Z', 'day'],
  ['2026-07-16T11:00:00.000Z', 'night'],
  ['2026-07-16T21:59:00.000Z', 'night'],
  ['2026-07-16T22:00:00.000Z', 'day'],
];

for (const [time, expectedPeriod] of cases) {
  test(`Seoul ${time} resolves to ${expectedPeriod}`, async ({ page }) => {
    await page.clock.install({ time: new Date(time) });
    await page.setViewportSize({ width: 1184, height: 532 });
    await page.goto('/');
    await page.evaluate(() => window.ASKI_READY);
    const selected = await page.locator('[data-asset="village"]').evaluate((element) => ({
      path: new URL(element.currentSrc).pathname,
      period: document.documentElement.dataset.period,
    }));
    expect(selected.period).toBe(expectedPeriod);
    expect(selected.path).toBe(expectedPeriod === 'night' ? '/assets/village-night.png' : '/assets/village.png');
  });
}
