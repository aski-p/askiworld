(() => {
  'use strict';

  const SOURCES = {
    village: './assets/village.png?v=12',
    villageHD: './assets/village-hd.webp?v=12',
    villageUHD: './assets/village-uhd.webp?v=12',
    characterBack: './assets/character-back.png?v=12',
    characterFront: './assets/character-front.png?v=12',
    characterSide: './assets/character-side.png?v=12',
  };
  const VILLAGES = {
    day: {
      base: SOURCES.village,
      hd: SOURCES.villageHD,
      uhd: SOURCES.villageUHD,
    },
    night: {
      base: './assets/village-night.png?v=12',
      hd: './assets/village-night-hd.webp?v=12',
      uhd: './assets/village-night-uhd.webp?v=12',
    },
  };
  const SEOUL_OFFSET = 9 * 60 * 60 * 1000;
  const DAY_WIDTH = 1184;
  const DAY_HEIGHT = 532;

  const app = document.getElementById('app');
  const loading = document.getElementById('loading');
  const live = document.getElementById('live');
  const village = document.querySelector('[data-asset="village"]');
  const themeColor = document.querySelector('meta[name="theme-color"]');
  let activePeriod = '';
  let boundaryTimer = 0;
  let resizeFrame = 0;

  const say = (message) => {
    live.textContent = '';
    setTimeout(() => { live.textContent = message; }, 20);
  };

  function seoulClock(date = new Date()) {
    const shifted = new Date(date.getTime() + SEOUL_OFFSET);
    return {
      hour: shifted.getUTCHours(),
      minute: shifted.getUTCMinutes(),
      second: shifted.getUTCSeconds(),
      millisecond: shifted.getUTCMilliseconds(),
    };
  }

  function getPeriod(date = new Date()) {
    const { hour } = seoulClock(date);
    return hour >= 20 || hour < 7 ? 'night' : 'day';
  }

  function setVillageSizes() {
    const requiredWidth = Math.ceil(Math.max(
      document.documentElement.clientWidth,
      document.documentElement.clientHeight * DAY_WIDTH / DAY_HEIGHT,
    ));
    village.sizes = `${Math.max(DAY_WIDTH, requiredWidth)}px`;
  }

  function applyPeriod(force = false) {
    const period = getPeriod();
    setVillageSizes();
    if (!force && period === activePeriod) return false;

    const source = VILLAGES[period];
    village.srcset = `${source.base} 1184w, ${source.hd} 2368w, ${source.uhd} 4736w`;
    village.src = source.base;
    document.documentElement.dataset.period = period;
    themeColor.content = period === 'night' ? '#071a3a' : '#77bada';
    activePeriod = period;
    return true;
  }

  function millisecondsUntilBoundary(date = new Date()) {
    const clock = seoulClock(date);
    const elapsed = (((clock.hour * 60 + clock.minute) * 60 + clock.second) * 1000) + clock.millisecond;
    const next = clock.hour >= 20
      ? (24 + 7) * 60 * 60 * 1000
      : clock.hour < 7
        ? 7 * 60 * 60 * 1000
        : 20 * 60 * 60 * 1000;
    return Math.max(1000, next - elapsed + 120);
  }

  async function refreshPeriod() {
    const changed = applyPeriod();
    if (changed && !app.classList.contains('is-loading')) {
      try {
        await village.decode();
        say(activePeriod === 'night' ? 'ASKIWORLD에 밤이 찾아왔습니다.' : 'ASKIWORLD에 아침이 밝았습니다.');
      } catch (error) {
        console.error('ASKIWORLD period background failed to load.', error);
      }
    }
    scheduleBoundary();
  }

  function scheduleBoundary() {
    clearTimeout(boundaryTimer);
    boundaryTimer = setTimeout(refreshPeriod, millisecondsUntilBoundary());
  }

  function onResize() {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(setVillageSizes);
  }

  async function load() {
    applyPeriod(true);
    const movementSprites = [
      SOURCES.characterBack,
      SOURCES.characterFront,
      SOURCES.characterSide,
    ].map(async (source) => {
      const image = new Image();
      image.src = source;
      await image.decode();
    });

    document.querySelectorAll('[data-asset]').forEach((element) => {
      if (element === village) return;
      element.src = SOURCES[element.dataset.asset];
    });

    await Promise.all([
      ...movementSprites,
      ...[...document.querySelectorAll('[data-asset]')].map(async (image) => {
        if (image.decode) await image.decode();
      }),
    ]);

    app.classList.remove('is-loading');
    app.setAttribute('aria-busy', 'false');
    say(`ASKIWORLD ${activePeriod === 'night' ? '야간' : '낮'} 마을을 불러왔습니다.`);
    scheduleBoundary();
    return SOURCES;
  }

  addEventListener('resize', onResize, { passive: true });
  addEventListener('pageshow', refreshPeriod);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refreshPeriod();
  });

  window.ASKI_THEME = Object.freeze({
    getPeriod,
    refresh: refreshPeriod,
  });

  window.ASKI_READY = load().catch((error) => {
    console.error(error);
    loading.innerHTML = '<div><strong>ASKIWORLD</strong><span>마을을 불러오지 못했습니다.</span><button id="reload">다시 불러오기</button><a href="https://subagent-aski.vercel.app/">Agent Office 바로가기</a></div>';
    loading.querySelector('#reload').addEventListener('click', () => location.reload());
    app.setAttribute('aria-busy', 'false');
    say('마을을 불러오지 못했습니다.');
    throw error;
  });
})();
