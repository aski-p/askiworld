(() => {
  'use strict';
  const scene = document.getElementById('scene');
  const parts = window.ASKI_SCENE_PARTS;
  if (!scene || !Array.isArray(parts)) {
    throw new Error('ASKIWORLD scene data could not be loaded.');
  }
  scene.innerHTML = parts.join('');
  delete window.ASKI_SCENE_PARTS;
})();
