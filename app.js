(() => {
  'use strict';

  const URL = 'https://subagent-aski.vercel.app/';
  const W = 1184;
  const H = 532;
  const SPEED = 168;
  const START = { x: 577, y: 516 };
  const TARGET = { x: 770, y: 456 };
  const ZONE = { x1: 738, x2: 798, y1: 420, y2: 468 };
  const world = document.getElementById('world');
  const scene = document.getElementById('scene');
  const player = document.getElementById('player');
  const sprite = document.getElementById('sprite');
  const office = document.getElementById('office');
  const enter = document.getElementById('enter');
  const toast = document.getElementById('toast');
  const live = document.getElementById('live');
  const pad = [...document.querySelectorAll('[data-move]')];

  const state = {
    x: START.x,
    y: START.y,
    face: 'up',
    keys: new Set(),
    route: [],
    autoEnter: false,
    ready: false,
    entering: false,
    last: performance.now(),
    timer: 0,
  };

  let sprites = {};

  const say = (message) => {
    live.textContent = '';
    setTimeout(() => { live.textContent = message; }, 20);
  };

  const note = (message, timeout = 2200) => {
    clearTimeout(state.timer);
    toast.textContent = message;
    toast.classList.add('show');
    state.timer = setTimeout(() => toast.classList.remove('show'), timeout);
  };

  const near = (x, y) => x >= ZONE.x1 - 45 && x <= ZONE.x2 + 45 && y >= ZONE.y1 && y <= ZONE.y2 + 42;
  const collision = (x, y) => x >= ZONE.x1 && x <= ZONE.x2 && y >= ZONE.y1 && y <= ZONE.y2;

  function walkable(x, y) {
    if (x < 92 || x > 1094 || y < 330 || y > 521) return false;
    if (((x - 357) ** 2) / (132 ** 2) + ((y - 424) ** 2) / (78 ** 2) < 1) return false;
    const body = x > 617 && x < 1030 && y < 447;
    const corridor = x > 724 && x < 817 && y > 404;
    if ((body && !corridor) || (x < 205 && y < 424) || (x > 962 && y < 470) || (y > 500 && (x < 175 || x > 1040))) return false;
    return true;
  }

  function face(direction) {
    if (!direction || direction === state.face) return;
    player.classList.remove(`facing-${state.face}`);
    state.face = direction;
    player.classList.add(`facing-${direction}`);
    sprite.src = direction === 'up'
      ? sprites.characterBack
      : direction === 'down'
        ? sprites.characterFront
        : sprites.characterSide;
  }

  function renderCamera() {
    const worldWidth = world.clientWidth;
    const worldHeight = world.clientHeight;
    if (!worldWidth || !worldHeight) return;

    const scale = Math.max(worldWidth / W, worldHeight / H);
    const sceneWidth = W * scale;
    const sceneHeight = H * scale;
    scene.style.width = `${sceneWidth}px`;
    scene.style.height = `${sceneHeight}px`;

    const playerX = state.x / W * sceneWidth;
    const playerY = state.y / H * sceneHeight;
    const desiredX = worldWidth * .5;
    const desiredY = worldHeight * .76;
    const cameraX = Math.min(0, Math.max(worldWidth - sceneWidth, desiredX - playerX));
    const cameraY = Math.min(0, Math.max(worldHeight - sceneHeight, desiredY - playerY));
    scene.style.setProperty('--camera-x', `${cameraX}px`);
    scene.style.setProperty('--camera-y', `${cameraY}px`);
  }

  function render() {
    player.style.setProperty('--x', `${state.x / W * 100}%`);
    player.style.setProperty('--y', `${state.y / H * 100}%`);
    enter.classList.toggle('show', near(state.x, state.y) && !state.entering);
    renderCamera();
  }

  function go() {
    if (!state.ready || state.entering) return;
    state.entering = true;
    state.keys.clear();
    state.route = [];
    state.x = TARGET.x;
    state.y = TARGET.y;
    face('up');
    render();
    world.classList.add('entering');
    player.classList.remove('walking');
    player.classList.add('going');
    enter.classList.remove('show');
    say('Agent Office 페이지로 이동합니다.');
    const delay = matchMedia('(prefers-reduced-motion: reduce)').matches ? 180 : 1650;
    setTimeout(() => location.assign(URL), delay);
  }

  function move(dx, dy) {
    if (walkable(state.x + dx, state.y)) state.x += dx;
    if (walkable(state.x, state.y + dy)) state.y += dy;
    if (collision(state.x, state.y)) go();
  }

  const direction = (dx, dy) => Math.abs(dx) > Math.abs(dy)
    ? dx < 0 ? 'left' : 'right'
    : dy < 0 ? 'up' : 'down';

  function clearRoute() {
    state.route = [];
    state.autoEnter = false;
    world.classList.remove('target');
  }

  function route(points, autoEnter = false) {
    if (!state.ready) return;
    state.route = points.map((point) => ({ ...point }));
    state.autoEnter = autoEnter;
    world.classList.toggle('target', autoEnter);
    world.focus({ preventScroll: true });
  }

  function routeStep(delta) {
    if (!state.route.length) return false;
    const target = state.route[0];
    const dx = target.x - state.x;
    const dy = target.y - state.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 4) {
      state.x = target.x;
      state.y = target.y;
      state.route.shift();
      if (!state.route.length) {
        world.classList.remove('target');
        if (state.autoEnter) go();
        state.autoEnter = false;
      }
      return true;
    }
    const step = Math.min(distance, SPEED * delta);
    const vx = dx / distance * step;
    const vy = dy / distance * step;
    face(direction(vx, vy));
    move(vx, vy);
    return true;
  }

  function toOffice() {
    if (!state.ready || state.entering) return;
    note('캐릭터가 Agent Office로 이동합니다.');
    say('Agent Office 문 앞으로 이동합니다.');
    route([
      { x: Math.max(610, Math.min(state.x, 700)), y: 492 },
      { x: 708, y: 478 },
      TARGET,
    ], true);
  }

  function closest(x, y) {
    const candidate = { x: Math.max(95, Math.min(1090, x)), y: Math.max(335, Math.min(518, y)) };
    if (walkable(candidate.x, candidate.y)) return candidate;
    for (let radius = 12; radius <= 150; radius += 12) {
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 10) {
        const point = { x: candidate.x + Math.cos(angle) * radius, y: candidate.y + Math.sin(angle) * radius };
        if (walkable(point.x, point.y)) return point;
      }
    }
    return { x: state.x, y: state.y };
  }

  function frame(now) {
    const delta = Math.min((now - state.last) / 1000, .035);
    state.last = now;
    if (state.ready && !state.entering) {
      let dx = 0;
      let dy = 0;
      if (state.keys.has('a') || state.keys.has('arrowleft') || state.keys.has('left')) dx -= 1;
      if (state.keys.has('d') || state.keys.has('arrowright') || state.keys.has('right')) dx += 1;
      if (state.keys.has('w') || state.keys.has('arrowup') || state.keys.has('up')) dy -= 1;
      if (state.keys.has('s') || state.keys.has('arrowdown') || state.keys.has('down')) dy += 1;
      let moving = false;
      if (dx || dy) {
        clearRoute();
        const length = Math.hypot(dx, dy);
        dx = dx / length * SPEED * delta;
        dy = dy / length * SPEED * delta;
        face(direction(dx, dy));
        move(dx, dy);
        moving = true;
      } else if (state.route.length) {
        moving = routeStep(delta);
      }
      player.classList.toggle('walking', moving);
      render();
    }
    requestAnimationFrame(frame);
  }

  addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (['w', 'a', 's', 'd', 'arrowleft', 'arrowright', 'arrowup', 'arrowdown'].includes(key) && state.ready) {
      event.preventDefault();
      state.keys.add(key);
      world.focus({ preventScroll: true });
    }
    if ((key === 'e' || key === 'enter') && near(state.x, state.y)) {
      event.preventDefault();
      go();
    }
  }, { passive: false });
  addEventListener('keyup', (event) => state.keys.delete(event.key.toLowerCase()));
  addEventListener('blur', () => state.keys.clear());
  addEventListener('resize', render);

  pad.forEach((button) => {
    const moveKey = button.dataset.move;
    const start = (event) => {
      if (!state.ready) return;
      event.preventDefault();
      clearRoute();
      state.keys.add(moveKey);
      try { button.setPointerCapture?.(event.pointerId); } catch { /* Pointer remains usable without capture. */ }
    };
    const stop = (event) => {
      event.preventDefault();
      state.keys.delete(moveKey);
    };
    button.addEventListener('pointerdown', start);
    button.addEventListener('pointerup', stop);
    button.addEventListener('pointercancel', stop);
    button.addEventListener('lostpointercapture', stop);
  });

  document.querySelectorAll('.locked').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      note(`${button.dataset.name}는 아직 준비 중입니다.`);
    });
  });

  world.addEventListener('pointerdown', (event) => {
    if (state.entering || !state.ready || event.target.closest('button')) return;
    const rect = scene.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width * W;
    const y = (event.clientY - rect.top) / rect.height * H;
    route([closest(x, y)]);
  });

  office.addEventListener('click', (event) => { event.stopPropagation(); toOffice(); });
  enter.addEventListener('click', go);

  render();
  requestAnimationFrame(frame);
  window.ASKI_READY.then((assets) => {
    sprites = assets;
    state.ready = true;
    state.last = performance.now();
    sprite.src = assets.characterBack;
    render();
    world.focus({ preventScroll: true });
  }).catch((error) => {
    console.error('ASKIWORLD interaction disabled because assets failed to load.', error);
    note('마을을 불러오지 못했어요. 페이지를 새로고침해 주세요.', 6000);
  });
})();
