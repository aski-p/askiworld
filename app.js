(() => {
  'use strict';
  const URL='https://agent-office.askipgh.chatgpt.site/', W=1184,H=532,SPEED=168;
  const START={x:577,y:516},TARGET={x:770,y:456},ZONE={x1:738,x2:798,y1:420,y2:468};
  const world=document.getElementById('world'),player=document.getElementById('player'),sprite=document.getElementById('sprite');
  const office=document.getElementById('office'),side=document.getElementById('sidebarLink'),enter=document.getElementById('enter');
  const toast=document.getElementById('toast'),live=document.getElementById('live'),pad=[...document.querySelectorAll('[data-move]')];
  const state={x:START.x,y:START.y,face:'up',keys:new Set,route:[],autoEnter:false,ready:false,walking:false,entering:false,last:performance.now(),timer:0};
  let sprites={};
  const say=m=>{live.textContent='';setTimeout(()=>live.textContent=m,20)};
  const note=(m,t=2200)=>{clearTimeout(state.timer);toast.textContent=m;toast.classList.add('show');state.timer=setTimeout(()=>toast.classList.remove('show'),t)};
  const near=(x,y)=>x>=ZONE.x1-45&&x<=ZONE.x2+45&&y>=ZONE.y1&&y<=ZONE.y2+42;
  const collision=(x,y)=>x>=ZONE.x1&&x<=ZONE.x2&&y>=ZONE.y1&&y<=ZONE.y2;
  function walkable(x,y){
    if(x<92||x>1094||y<330||y>521)return false;
    if(((x-357)**2)/(132**2)+((y-424)**2)/(78**2)<1)return false;
    const body=x>617&&x<1030&&y<447,corridor=x>724&&x<817&&y>404;
    if(body&&!corridor||x<205&&y<424||x>962&&y<470||y>500&&(x<175||x>1040))return false;return true;
  }
  function face(d){
    if(!d||d===state.face)return;player.classList.remove(`facing-${state.face}`);state.face=d;player.classList.add(`facing-${d}`);
    sprite.src=d==='up'?sprites.characterBack:d==='down'?sprites.characterFront:sprites.characterSide;
  }
  function render(){
    player.style.setProperty('--x',`${state.x/W*100}%`);player.style.setProperty('--y',`${state.y/H*100}%`);
    const n=near(state.x,state.y)&&!state.entering;enter.classList.toggle('show',n);
  }
  function move(dx,dy){
    if(walkable(state.x+dx,state.y))state.x+=dx;if(walkable(state.x,state.y+dy))state.y+=dy;
    if(collision(state.x,state.y))go();
  }
  const direction=(dx,dy)=>Math.abs(dx)>Math.abs(dy)?dx<0?'left':'right':dy<0?'up':'down';
  function clearRoute(){state.route=[];state.autoEnter=false;world.classList.remove('target')}
  function route(points,auto=false){if(!state.ready)return;state.route=points.map(p=>({...p}));state.autoEnter=auto;world.classList.toggle('target',auto);world.focus({preventScroll:true})}
  function routeStep(dt){
    if(!state.route.length)return false;const t=state.route[0],dx=t.x-state.x,dy=t.y-state.y,d=Math.hypot(dx,dy);
    if(d<4){state.x=t.x;state.y=t.y;state.route.shift();if(!state.route.length){world.classList.remove('target');if(state.autoEnter)go();state.autoEnter=false}return true}
    const s=Math.min(d,SPEED*dt),vx=dx/d*s,vy=dy/d*s;face(direction(vx,vy));move(vx,vy);return true;
  }
  function toOffice(){
    if(!state.ready||state.entering)return;note('캐릭터가 Agent Office로 이동합니다.');say('Agent Office 문 앞으로 이동합니다.');
    route([{x:Math.max(610,Math.min(state.x,700)),y:492},{x:708,y:478},TARGET],true);
  }
  function go(){
    if(!state.ready||state.entering)return;state.entering=true;state.keys.clear();state.route=[];state.x=TARGET.x;state.y=TARGET.y;face('up');render();
    world.classList.add('entering');player.classList.remove('walking');player.classList.add('going');enter.classList.remove('show');say('Agent Office 페이지로 이동합니다.');
    setTimeout(()=>location.assign(URL),matchMedia('(prefers-reduced-motion:reduce)').matches?180:1650);
  }
  function closest(x,y){
    const c={x:Math.max(95,Math.min(1090,x)),y:Math.max(335,Math.min(518,y))};if(walkable(c.x,c.y))return c;
    for(let r=12;r<=150;r+=12)for(let a=0;a<Math.PI*2;a+=Math.PI/10){const p={x:c.x+Math.cos(a)*r,y:c.y+Math.sin(a)*r};if(walkable(p.x,p.y))return p}return{x:state.x,y:state.y};
  }
  function frame(now){
    const dt=Math.min((now-state.last)/1000,.035);state.last=now;if(state.ready&&!state.entering){let dx=0,dy=0;
      if(state.keys.has('a')||state.keys.has('arrowleft')||state.keys.has('left'))dx--;if(state.keys.has('d')||state.keys.has('arrowright')||state.keys.has('right'))dx++;
      if(state.keys.has('w')||state.keys.has('arrowup')||state.keys.has('up'))dy--;if(state.keys.has('s')||state.keys.has('arrowdown')||state.keys.has('down'))dy++;
      let moving=false;if(dx||dy){clearRoute();const l=Math.hypot(dx,dy);dx=dx/l*SPEED*dt;dy=dy/l*SPEED*dt;face(direction(dx,dy));move(dx,dy);moving=true}else if(state.route.length)moving=routeStep(dt);
      player.classList.toggle('walking',moving);render();}requestAnimationFrame(frame);
  }
  addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['w','a','s','d','arrowleft','arrowright','arrowup','arrowdown'].includes(k)&&state.ready){e.preventDefault();state.keys.add(k);world.focus({preventScroll:true})}if((k==='e'||k==='enter')&&near(state.x,state.y)){e.preventDefault();go()}},{passive:false});
  addEventListener('keyup',e=>state.keys.delete(e.key.toLowerCase()));addEventListener('blur',()=>state.keys.clear());
  pad.forEach(b=>{const d=b.dataset.move,start=e=>{if(!state.ready)return;e.preventDefault();clearRoute();state.keys.add(d);b.setPointerCapture?.(e.pointerId)},stop=e=>{e.preventDefault();state.keys.delete(d)};b.onpointerdown=start;b.onpointerup=stop;b.onpointercancel=stop;b.onlostpointercapture=stop});
  document.querySelectorAll('.locked').forEach(b=>b.onclick=e=>{e.stopPropagation();note(`${b.dataset.name}는 아직 준비 중입니다.`)});
  world.onpointerdown=e=>{if(state.entering||!state.ready||e.target.closest('button'))return;const r=world.getBoundingClientRect();route([closest((e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H)])};
  office.onclick=e=>{e.stopPropagation();toOffice()};side.onclick=toOffice;enter.onclick=go;
  render();requestAnimationFrame(frame);window.ASKI_READY.then(a=>{sprites=a;state.ready=true;state.last=performance.now();sprite.src=a.characterBack;world.focus({preventScroll:true})}).catch(()=>{});
})();
