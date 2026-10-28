import { HUB_LINKS } from './hub-links.js';
export const NPCS = Object.freeze([
 {id:'atlas',label:'Atlas',intro:'어서 와요! Aski Studio와 Agent Office를 안내할게요.',destinationIds:['aski-dev','aski-prd','office']},
 {id:'forge',label:'Forge',intro:'반가워요. H3 Studio와 FingerForest를 안내할게요.',destinationIds:['h3-dev','h3-prd','fingerforest-app','fingerforest-download']},
 {id:'sentinel',label:'Sentinel',intro:'안녕하세요. MuseMoa 작업 공간을 소개할게요.',destinationIds:['muse-dev','muse-prd']},
]);
export function resolveNpcDestinations(id) { const npc=NPCS.find(n=>n.id===id); return npc ? npc.destinationIds.map(key=>HUB_LINKS.find(link=>link.id===key)).filter(Boolean) : []; }
