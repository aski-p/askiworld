import { test, expect } from '@playwright/test';
test.use({hasTouch:true});

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
    if(id==='forge') await page.getByRole('button',{name:'H3 Studio',exact:true}).click();
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

test('each guide presents independently verified destinations and Forge topics', async ({page}) => {
 await page.goto('/village.html');
 const expected={atlas:['https://thinkstationpgx-11d3.tailccac79.ts.net:8443/','https://reelradar-5.vercel.app/','https://subagent-aski.vercel.app/'],forge:['https://thinkstationpgx-11d3.tailccac79.ts.net:8447/','https://h3-video-web.vercel.app/','https://web-production-011c4.up.railway.app/','https://web-production-011c4.up.railway.app/install.html'],sentinel:['https://thinkstationpgx-11d3.tailccac79.ts.net:8446/','https://musemoa-prd.vercel.app/']};
 let vpn=0;
 for(const id of ['atlas','forge','sentinel']) {
  await page.locator(`.guide-list [data-npc=${id}]`).click(); await page.getByRole('button',{name:'목적지 보기'}).click();
  let actual=[];
  if(id==='forge') {
   for(const topic of ['H3 Studio','FingerForest']) { await page.getByRole('button',{name:topic,exact:true}).click(); const links=page.getByRole('dialog').locator('a'); actual.push(...await links.evaluateAll(xs=>xs.map(x=>x.href))); vpn+=await page.getByRole('dialog').getByText('VPN 필요',{exact:false}).count(); await page.getByRole('button',{name:'주제 선택으로'}).click(); }
  } else {const links=page.getByRole('dialog').locator('a');actual=await links.evaluateAll(xs=>xs.map(x=>x.href));vpn+=await page.getByRole('dialog').getByText('VPN 필요',{exact:false}).count();}
  expect(actual).toEqual(expected[id]); await page.getByRole('button',{name:'대화 닫기'}).click();
 }
 expect(vpn).toBe(3);
});

test('rendered geometry matches metrics and proportions', async ({page})=>{
 await page.goto('/village.html');
 const data=await page.evaluate(async()=>{const m=(await import('/village-scene.js')).WORLD_METRICS;return {m,player:document.querySelector('[data-player-figure]').getBBox().height,houses:[...document.querySelectorAll('.house')].map(x=>x.getBBox().height),doors:[...document.querySelectorAll('[data-door]')].map(x=>x.getBBox().height)};});
 expect(data.player).toBe(data.m.playerHeight);
 for(const h of data.houses){expect(h).toBe(data.m.houseHeight);expect(h/data.player).toBeGreaterThanOrEqual(2.5);expect(h/data.player).toBeLessThanOrEqual(3);}
 for(const d of data.doors){expect(d).toBe(data.m.doorHeight);expect(d/data.player).toBeGreaterThanOrEqual(.9);expect(d/data.player).toBeLessThanOrEqual(1.2);}
});

test('mobile camera follows walking to Forge and touch controls', async ({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/village.html');
 const world=page.locator('.world'), player=page.locator('[data-player]');await world.focus();
 for(let i=0;i<8;i++)await page.keyboard.press('ArrowRight');
 const bounds=async()=>page.evaluate(()=>{const w=document.querySelector('.world').getBoundingClientRect(),p=document.querySelector('[data-player]').getBoundingClientRect();return {left:w.left,right:w.right,pl:p.left,pr:p.right,scroll:document.querySelector('.world').scrollLeft};});
 let b=await bounds();expect(b.scroll).toBeGreaterThan(0);expect(b.pl).toBeGreaterThanOrEqual(b.left);expect(b.pr).toBeLessThanOrEqual(b.right);
 await page.keyboard.press('e');await expect(page.getByRole('dialog')).toContainText('Forge');await page.keyboard.press('Escape');
 const before=await player.getAttribute('transform');const right=page.getByRole('button',{name:'오른쪽으로 이동'});const box=await right.boundingBox();expect(box.width).toBeGreaterThanOrEqual(48);expect(box.height).toBeGreaterThanOrEqual(48);await right.tap();expect(await player.getAttribute('transform')).not.toBe(before);b=await bounds();expect(b.pr).toBeLessThanOrEqual(b.right);
});

test('scene activation and dialogue keyboard focus stay contained', async ({page})=>{
 await page.goto('/village.html');const atlas=page.locator('.npc[data-npc=atlas]');await atlas.click();await expect(page.getByRole('dialog')).toContainText('Atlas');await page.keyboard.press('Escape');await expect(atlas).toBeFocused();
 await page.keyboard.press('Enter');await expect(page.getByRole('dialog')).toBeVisible();
 const dialog=page.getByRole('dialog');const before=await page.locator('[data-player]').getAttribute('transform');await page.keyboard.press('w');await page.keyboard.press('Enter');expect(await page.locator('[data-player]').getAttribute('transform')).toBe(before);
 await dialog.getByRole('button',{name:'대화 닫기'}).focus();await page.keyboard.press('Shift+Tab');await expect(dialog.locator('button').last()).toBeFocused();await page.keyboard.press('Tab');await expect(dialog.getByRole('button',{name:'대화 닫기'})).toBeFocused();await page.keyboard.press('Escape');await expect(atlas).toBeFocused();
 await page.evaluate(()=>{for(const tag of ['input','textarea','select','button','a','div']){const el=document.createElement(tag);if(tag==='a')el.href='#';if(tag==='div')el.contentEditable='true';el.id='guard-'+tag;document.body.append(el);}});
 for(const tag of ['input','textarea','select','button','a','div']){await page.locator('#guard-'+tag).focus();await page.keyboard.press('w');await page.keyboard.press('Enter');expect(await page.locator('[data-player]').getAttribute('transform')).toBe(before);}
});

test('reduced motion and touch targets', async ({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/village.html');
 expect(await page.locator('.world').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
 for(const b of await page.locator('.guide-list button, .pad button').all()){const box=await b.boundingBox();expect(box.width).toBeGreaterThanOrEqual(48);expect(box.height).toBeGreaterThanOrEqual(48);}
 await page.locator('.guide-list [data-npc=forge]').tap();await page.getByRole('button',{name:'목적지 보기'}).tap();await page.getByRole('button',{name:'FingerForest',exact:true}).tap();await expect(page.getByRole('link',{name:/앱 다운로드/})).toHaveAttribute('href','https://web-production-011c4.up.railway.app/install.html');
});

test('sidebar remains usable when icon requests fail and FingerForest is searchable', async ({page})=>{
 await page.route('**/assets/apps/**',route=>route.abort());await page.goto('/');
 for(const label of ['Aski Studio','H3 Studio','MuseMoa','FingerForest','Agent Office'])await expect(page.getByRole('button',{name:label,exact:true})).toBeVisible();
 const button=page.getByRole('button',{name:'FingerForest',exact:true});await button.focus();await expect(button).toBeFocused();await page.keyboard.press('Enter');await expect(page.locator('[data-destination]')).toHaveCount(2);
 await page.getByRole('button',{name:'전체',exact:true}).click();await page.getByRole('searchbox').fill('Finger');await expect(page.locator('[data-destination]')).toHaveCount(2);
});
