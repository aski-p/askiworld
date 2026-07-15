(() => {
  'use strict';

  const SOURCES = {
    village: './assets/village.png',
    characterBack: './assets/character-back.png',
    characterFront: './assets/character-front.png',
    characterSide: './assets/character-side.png',
  };

  const app = document.getElementById('app');
  const loading = document.getElementById('loading');
  const live = document.getElementById('live');

  const say = (message) => {
    live.textContent = '';
    setTimeout(() => { live.textContent = message; }, 20);
  };

  async function load() {
    await Promise.all(Object.values(SOURCES).map(async (source) => {
      const image = new Image();
      image.src = source;
      await image.decode();
    }));

    document.querySelectorAll('[data-asset]').forEach((element) => {
      element.src = SOURCES[element.dataset.asset];
    });

    await Promise.all([...document.querySelectorAll('[data-asset]')].map(async (image) => {
      if (image.decode) await image.decode();
    }));

    app.classList.remove('is-loading');
    app.setAttribute('aria-busy', 'false');
    say('ASKIWORLD 마을을 불러왔습니다.');
    return SOURCES;
  }

  window.ASKI_READY = load().catch((error) => {
    console.error(error);
    loading.innerHTML = '<div><strong>ASKIWORLD</strong><span>마을을 불러오지 못했습니다.</span><button id="reload">다시 불러오기</button><a href="https://subagent-aski.vercel.app/">Agent Office 바로가기</a></div>';
    loading.querySelector('#reload').addEventListener('click', () => location.reload());
    app.setAttribute('aria-busy', 'false');
    say('마을을 불러오지 못했습니다.');
    throw error;
  });
})();
