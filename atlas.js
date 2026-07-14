(() => {
  'use strict';
  const COUNT = 10;
  const CROPS = {
    sidebar:[0,0,352,532], village:[352,0,1184,532], interaction:[0,532,1016,367],
    mood:[0,899,1016,125], detail:[1016,532,520,428],
    characterBack:[0,1024,95,160], characterFront:[95,1024,95,160], characterSide:[190,1024,95,160]
  };
  const urls=[];
  const app=document.getElementById('app'), loading=document.getElementById('loading'), live=document.getElementById('live');
  const say=m=>{live.textContent='';setTimeout(()=>live.textContent=m,20)};
  async function chunk(i){
    const r=await fetch(`./assets/atlas-${String(i).padStart(2,'0')}.txt`,{cache:'force-cache'});
    if(!r.ok) throw Error(`아트 에셋 ${i+1}/${COUNT} 로드 실패`);
    return r.text();
  }
  function bytes(s){
    const b=atob(s.replace(/\s/g,'')),u=new Uint8Array(b.length);
    for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i); return u;
  }
  function image(url){return new Promise((ok,no)=>{const i=new Image;i.onload=()=>ok(i);i.onerror=no;i.src=url})}
  function crop(img,r,key){
    const [x,y,w,h]=r,c=document.createElement('canvas');c.width=w;c.height=h;
    c.getContext('2d').drawImage(img,x,y,w,h,0,0,w,h);
    return new Promise((ok,no)=>c.toBlob(b=>{
      if(!b)return no(Error(`이미지 변환 실패: ${key}`));const u=URL.createObjectURL(b);urls.push(u);ok(u);
    },'image/png'));
  }
  async function load(){
    const joined=(await Promise.all(Array.from({length:COUNT},(_,i)=>chunk(i)))).join('');
    const atlas=URL.createObjectURL(new Blob([bytes(joined)],{type:'image/avif'}));urls.push(atlas);
    const img=await image(atlas), entries=await Promise.all(Object.entries(CROPS).map(async([k,r])=>[k,await crop(img,r,k)]));
    const assets=Object.fromEntries(entries);
    document.querySelectorAll('[data-asset]').forEach(el=>el.src=assets[el.dataset.asset]);
    await Promise.all([...document.querySelectorAll('[data-asset]')].map(i=>i.decode?.().catch(()=>{})||Promise.resolve()));
    app.classList.remove('is-loading');app.setAttribute('aria-busy','false');say('ASKIWORLD 마을을 불러왔습니다.');return assets;
  }
  window.ASKI_READY=load().catch(e=>{
    console.error(e);loading.innerHTML=`<div><strong>ASKIWORLD</strong><span>마을을 불러오지 못했습니다.</span><button onclick="location.reload()">다시 불러오기</button><a href="https://agent-office.askipgh.chatgpt.site/">Agent Office 바로가기</a></div>`;
    app.setAttribute('aria-busy','false');say('마을을 불러오지 못했습니다.');throw e;
  });
  addEventListener('pagehide',()=>urls.forEach(URL.revokeObjectURL),{once:true});
})();
