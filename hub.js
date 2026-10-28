import { filterHubLinks } from './hub-links.js';
const categories = {
  'aski-studio': ['Aski Studio', '아스키 스튜디오 작업 공간'],
  'h3-studio': ['H3 Studio', '영상 작업을 위한 공간'],
  'musemoa': ['MuseMoa', '뮤즈모아 작업 공간'],
  'fingerforest': ['FingerForest', '핑거포레스트 앱과 설치 안내'],
  'agent-office': ['Agent Office', '에이전트 업무를 확인하는 공간'],
};
const search = document.querySelector('#search');
const directory = document.querySelector('#directory');
const sidebar = document.querySelector('#sidebar');
const toggle = document.querySelector('#menu-toggle');
let selected = 'all';
function render() {
  const links = filterHubLinks(search.value, selected);
  directory.replaceChildren();
  document.querySelector('#result-count').textContent = `${links.length}개 공간`;
  if (!links.length) { const empty = document.createElement('p'); empty.className = 'empty'; empty.textContent = '검색 결과가 없습니다'; directory.append(empty); return; }
  for (const [id, [title, description]] of Object.entries(categories)) {
    const entries = links.filter(link => link.category === id);
    if (!entries.length) continue;
    const section = document.createElement('section'); section.className = 'directory-row';
    const heading = document.createElement('div'); heading.className = 'row-heading';
    const h = document.createElement('h3'); h.textContent = title;
    const p = document.createElement('p'); p.textContent = description; heading.append(h, p);
    const actions = document.createElement('div'); actions.className = 'row-actions';
    for (const entry of entries) {
      const a = document.createElement('a'); a.href = entry.url; a.dataset.destination = entry.id; a.className = 'destination';
      const label = document.createElement('span'); label.textContent = entry.environment === 'office' ? 'Office 열기' : entry.environment === 'app' ? '앱 열기' : entry.environment === 'download' ? '앱 다운로드' : entry.environment.toUpperCase(); a.append(label);
      if (entry.access === 'vpn') { const badge = document.createElement('small'); badge.textContent = 'VPN 필요'; a.append(badge); }
      const arrow = document.createElement('span'); arrow.className = 'arrow'; arrow.setAttribute('aria-hidden','true'); arrow.textContent = '↗'; a.append(arrow); actions.append(a);
    }
    section.append(heading, actions); directory.append(section);
  }
}
function closeMenu(restore = true) { sidebar.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); if (restore) toggle.focus(); }
toggle.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') === 'true'; if (open) closeMenu(); else { sidebar.classList.add('open'); toggle.setAttribute('aria-expanded','true'); sidebar.querySelector('[aria-current]').focus(); } });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') closeMenu(); });
sidebar.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => {
  selected = button.dataset.category; sidebar.querySelectorAll('[data-category]').forEach(item => item.removeAttribute('aria-current')); button.setAttribute('aria-current','page');
  document.querySelector('#page-title').textContent = selected === 'all' ? '모든 공간' : categories[selected][0];
  document.querySelector('#page-intro').textContent = selected === 'all' ? '필요한 작업 공간을 찾아 바로 이동하세요.' : categories[selected][1];
  render(); if (toggle.getAttribute('aria-expanded') === 'true') closeMenu();
}));
search.addEventListener('input', render); render();
