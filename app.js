(() => {
  'use strict';

  const PORTAL = Object.freeze({
    id: 'agent-office',
    name: 'Agent Office',
    url: 'https://agent-office.askipgh.chatgpt.site/'
  });

  const app = document.getElementById('app');
  const scene = document.getElementById('scene');
  const world = document.getElementById('world');
  const hero = document.getElementById('hero');
  const door = document.getElementById('agentDoor');
  const building = document.getElementById('agentBuilding');
  const enterButton = document.getElementById('enterButton');
  const previewButton = document.getElementById('previewButton');
  const shutter = document.getElementById('shutter');
  const enterLabel = document.getElementById('enterLabel');
  const infoCard = document.getElementById('infoCard');
  const toast = document.getElementById('toast');
  const liveStatus = document.getElementById('liveStatus');
  const futureBuildings = [...document.querySelectorAll('[data-future-name]')];
  const mobileQuery = window.matchMedia('(max-width: 720px)');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const timers = new Set();
  let toastTimer = 0;
  let busy = false;

  const schedule = (callback, delay) => {
    const timer = window.setTimeout(() => {
      timers.delete(timer);
      callback();
    }, delay);
    timers.add(timer);
    return timer;
  };

  const clearSequenceTimers = () => {
    timers.forEach((timer) => window.clearTimeout(timer));
    timers.clear();
  };

  const announce = (message) => {
    liveStatus.textContent = '';
    window.requestAnimationFrame(() => {
      liveStatus.textContent = message;
    });
  };

  const showToast = (message) => {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2800);
  };

  const updateSceneViewport = () => {
    scene.setAttribute('viewBox', mobileQuery.matches ? '700 0 540 900' : '0 0 1600 900');
  };

  const setBusy = (value) => {
    busy = value;
    app.classList.toggle('is-busy', value);
    app.setAttribute('aria-busy', String(value));
    enterButton.disabled = value;
    previewButton.disabled = value;
  };

  const reset = () => {
    clearSequenceTimers();
    world.classList.remove('entering');
    hero.classList.remove('walking');
    door.classList.remove('open');
    shutter.classList.remove('on');
    enterLabel.classList.remove('on');
    infoCard.classList.remove('is-dimmed');
    setBusy(false);
  };

  const navigateToPortal = () => {
    announce(`${PORTAL.name} 페이지로 이동합니다.`);
    window.location.assign(PORTAL.url);
  };

  const finishPreview = () => {
    reset();
    showToast('연출 미리보기 완료 · 실제 이동은 하지 않았어요.');
    announce('포털 입장 연출 미리보기가 끝났습니다.');
  };

  const playEntrance = ({ navigate }) => {
    if (busy) return;

    setBusy(true);
    infoCard.classList.add('is-dimmed');
    announce(`${PORTAL.name} 포털 입장 연출을 시작합니다.`);

    if (reducedMotionQuery.matches) {
      door.classList.add('open');
      world.classList.add('entering');
      shutter.classList.add('on');
      enterLabel.classList.add('on');
      schedule(navigate ? navigateToPortal : finishPreview, navigate ? 650 : 900);
      return;
    }

    hero.classList.add('walking');
    schedule(() => door.classList.add('open'), 2020);
    schedule(() => {
      world.classList.add('entering');
      shutter.classList.add('on');
      enterLabel.classList.add('on');
    }, 2440);
    schedule(navigate ? navigateToPortal : finishPreview, 3900);
  };

  const activateWithKeyboard = (event, callback) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  };

  enterButton.addEventListener('click', () => playEntrance({ navigate: true }));
  previewButton.addEventListener('click', () => playEntrance({ navigate: false }));
  building.addEventListener('click', () => playEntrance({ navigate: true }));
  building.addEventListener('keydown', (event) => activateWithKeyboard(event, () => playEntrance({ navigate: true })));

  futureBuildings.forEach((futureBuilding) => {
    const notifyLocked = () => {
      const name = futureBuilding.dataset.futureName || '새 건물';
      showToast(`${name} 포털은 아직 준비 중이에요.`);
      announce(`${name} 포털은 아직 준비 중입니다.`);
    };
    futureBuilding.addEventListener('click', notifyLocked);
    futureBuilding.addEventListener('keydown', (event) => activateWithKeyboard(event, notifyLocked));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && busy) {
      reset();
      showToast('포털 이동을 취소했어요.');
      announce('포털 이동을 취소했습니다.');
    }
  });

  mobileQuery.addEventListener?.('change', updateSceneViewport);
  window.addEventListener('pageshow', reset);
  updateSceneViewport();
})();
