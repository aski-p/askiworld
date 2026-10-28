import { test, expect } from '@playwright/test';

test('hub exposes seven exact destinations and VPN labels', async ({ page }) => {
  await page.goto('/');
  const links = page.locator('[data-destination]');
  await expect(links).toHaveCount(7);
  expect(await links.evaluateAll(xs => xs.map(x => x.href))).toEqual([
    'https://thinkstationpgx-11d3.tailccac79.ts.net:8443/', 'https://reelradar-5.vercel.app/',
    'https://thinkstationpgx-11d3.tailccac79.ts.net:8447/', 'https://h3-video-web.vercel.app/',
    'https://thinkstationpgx-11d3.tailccac79.ts.net:8446/', 'https://musemoa-prd.vercel.app/',
    'https://subagent-aski.vercel.app/'
  ]);
  await expect(page.getByText('VPN 필요')).toHaveCount(3);
  await expect(page.locator('script[src*="app.js"]')).toHaveCount(0);
});

test('search filters Korean and English and handles whitespace and no results', async ({ page }) => {
  await page.goto('/');
  const search = page.getByRole('searchbox');
  await search.fill('뮤즈'); await expect(page.locator('[data-destination]')).toHaveCount(2);
  await search.fill('H3'); await expect(page.locator('[data-destination]')).toHaveCount(2);
  await search.fill('   '); await expect(page.locator('[data-destination]')).toHaveCount(7);
  await search.fill('없는 검색어'); await expect(page.getByText('검색 결과가 없습니다')).toBeVisible();
});

test('role names and office destination remain visible', async ({ page }) => {
  await page.goto('/');
  for (const name of ['Atlas', 'Forge', 'Frame', 'Palette', 'Scout', 'Sentinel']) await expect(page.getByText(name, { exact: true })).toBeVisible();
  await expect(page.locator('[data-destination="office"]')).toHaveAttribute('href', 'https://subagent-aski.vercel.app/');
});

test('mobile menu restores focus and category selection, without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/');
  const menu = page.getByRole('button', { name: '메뉴 열기' });
  await menu.focus(); await page.keyboard.press('Enter'); await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape'); await expect(menu).toBeFocused();
  await menu.click(); await page.getByRole('button', { name: 'MuseMoa', exact: true }).click();
  await expect(menu).toBeFocused(); await expect(page.locator('[data-destination]')).toHaveCount(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test('village remains accessible with a return link', async ({ page }) => {
  await page.goto('/village.html'); await expect(page.locator('#world')).toBeVisible();
  await page.getByRole('link', { name: '허브로 돌아가기' }).click(); await expect(page).toHaveURL(/\/$/);
});
