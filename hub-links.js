const host = 'https://thinkstationpgx-11d3.tailccac79.ts.net:';
export const HUB_LINKS = Object.freeze([
  { id:'aski-dev', label:'Aski Studio 아스키 스튜디오', category:'aski-studio', environment:'dev', url:host+'8443/', access:'vpn' },
  { id:'aski-prd', label:'Aski Studio 아스키 스튜디오', category:'aski-studio', environment:'prd', url:'https://reelradar-5.vercel.app/', access:'public' },
  { id:'h3-dev', label:'H3 Studio H3 스튜디오', category:'h3-studio', environment:'dev', url:host+'8447/', access:'vpn' },
  { id:'h3-prd', label:'H3 Studio H3 스튜디오', category:'h3-studio', environment:'prd', url:'https://h3-video-web.vercel.app/', access:'public' },
  { id:'muse-dev', label:'MuseMoa 뮤즈모아', category:'musemoa', environment:'dev', url:host+'8446/', access:'vpn' },
  { id:'muse-prd', label:'MuseMoa 뮤즈모아', category:'musemoa', environment:'prd', url:'https://musemoa-prd.vercel.app/', access:'public' },
  { id:'office', label:'Agent Office 에이전트 오피스', category:'agent-office', environment:'office', url:'https://subagent-aski.vercel.app/', access:'public' },
]);
export function filterHubLinks(query, category) {
  const needle = query.trim().toLocaleLowerCase();
  return HUB_LINKS.filter(link => (category === 'all' || link.category === category) && [link.label, link.category, link.environment].some(value => value.toLocaleLowerCase().includes(needle)));
}
