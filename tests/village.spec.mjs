import { test, expect } from '@playwright/test';

test('village guides expose all destinations through dialogue', async ({ page }) => {
  await page.goto('/village.html');
  const metrics = await page.evaluate(async () => (await import('/village-scene.js')).WORLD_METRICS);
  expect(metrics.doorHeight / metrics.playerHeight).toBeGreaterThanOrEqual(.9);
  expect(metrics.doorHeight / metrics.playerHeight).toBeLessThanOrEqual(1.2);
  expect(metrics.houseHeight / metrics.playerHeight).toBeGreaterThanOrEqual(2.5);
  expect(metrics.houseHeight / metrics.playerHeight).toBeLessThanOrEqual(3);
  for (const id of ['atlas','forge','sentinel']) {
    const trigger = page.locator(`.guide-list [data-npc=${id}]`);
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: '목적지 보기' }).click();
    await expect(page.getByRole('dialog').locator('a')).not.toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
  }
  const resolved = await page.evaluate(async () => {
    const {NPCS, resolveNpcDestinations} = await import('/village-dialogue.js');
    return NPCS.flatMap(n => resolveNpcDestinations(n.id));
  });
  expect(resolved).toHaveLength(9);
  expect(resolved.filter(x => x.access === 'vpn')).toHaveLength(3);
});

test('movement is guarded during dialogue and viewport remains usable', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/village.html');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  const player = page.locator('[data-player]');
  const before = await player.getAttribute('transform');
  await page.locator('.world').focus();
  await page.keyboard.press('ArrowRight');
  expect(await player.getAttribute('transform')).not.toBe(before);
  await page.locator('.guide-list [data-npc=atlas]').click();
  const during = await player.getAttribute('transform');
  await page.keyboard.press('w');
  expect(await player.getAttribute('transform')).toBe(during);
  await expect(page.getByRole('button', {name:'목적지 보기'})).toBeVisible();
});
test('FingerForest links and five sidebar icons are available', async ({page}) => {
 await page.goto('/');
 await expect(page.locator('[data-destination="fingerforest-app"]')).toHaveAttribute('href','https://web-production-011c4.up.railway.app/');
 await expect(page.locator('[data-destination="fingerforest-download"]')).toHaveAttribute('href','https://web-production-011c4.up.railway.app/install.html');
 await expect(page.locator('nav img[aria-hidden="true"]')).toHaveCount(5);
});

test('guide branches, destination links and touch controls remain usable', async ({page}) => {
 await page.setViewportSize({width:390,height:844});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/village.html');
 for (const id of ['atlas','forge','sentinel']) {
  const trigger=page.locator(`.guide-list [data-npc=${id}]`);
  const box=await trigger.boundingBox(); expect(box.width).toBeGreaterThanOrEqual(48); expect(box.height).toBeGreaterThanOrEqual(48);
  await trigger.click(); await page.getByRole('button',{name:'목적지 보기'}).click();
  const actual=await page.getByRole('dialog').locator('a').evaluateAll(xs=>xs.map(x=>x.href));
  const expected=await page.evaluate(async id=>(await import('/village-dialogue.js')).resolveNpcDestinations(id).map(x=>x.url),id);
  expect(actual).toEqual(expected);
  await page.getByRole('button',{name:'처음으로'}).click();
  await page.getByRole('button',{name:'다른 안내자 만나기'}).click();
  await expect(page.getByRole('dialog').getByRole('button',{name:id==='atlas'?'Forge':'Atlas'})).toBeVisible();
  await page.getByRole('button',{name:'대화 닫기'}).click(); await expect(trigger).toBeFocused();
 }
 for(const b of await page.locator('.pad button').all()){const box=await b.boundingBox();expect(box.width).toBeGreaterThanOrEqual(48);expect(box.height).toBeGreaterThanOrEqual(48);}
});
