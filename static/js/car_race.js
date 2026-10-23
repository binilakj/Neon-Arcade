(() => {
  const canvas = document.getElementById('race-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('race-score');
  const bestEl = document.getElementById('race-best');
  const speedEl = document.getElementById('race-speed');
  const overlay = document.getElementById('race-overlay');
  const startBtn = document.getElementById('race-start');
  const message = document.getElementById('race-message');
  const W = canvas.width, H = canvas.height;
  const road = { left: 54, right: W - 54 };
  const laneW = (road.right - road.left) / 3;
  let player, traffic, running = false, ended = false, score = 0, best = 0, speed = 3, spawn = 0, stripeOffset = 0, lastTime = 0, raf = 0;
  const keys = { left: false, right: false };
  function reset() { player = { x: W / 2 - 17, y: H - 112, w: 34, h: 58, lane: 1 }; traffic = []; score = 0; speed = 3; spawn = 0; stripeOffset = 0; ended = false; scoreEl.textContent = '0'; speedEl.textContent = '1x'; bestEl.textContent = String(best); }
  function roundedRect(x,y,w,h,r,fill) { ctx.fillStyle=fill; ctx.beginPath(); ctx.roundRect(x,y,w,h,r); ctx.fill(); }
  function drawCar(x,y,w,h,color,isPlayer=false) {
    ctx.save(); ctx.shadowColor=color; ctx.shadowBlur=isPlayer?16:7; roundedRect(x,y,w,h,8,color); ctx.shadowBlur=0;
    roundedRect(x+5,y+8,w-10,15,isPlayer?4:3,'#182238');
    ctx.fillStyle='#b9f7ff'; ctx.fillRect(x+5,y+5,6,4); ctx.fillRect(x+w-11,y+5,6,4);
    ctx.fillStyle=isPlayer?'#ff4fca':'#ff5a65'; ctx.fillRect(x+4,y+h-7,6,3); ctx.fillRect(x+w-10,y+h-7,6,3);
    if(isPlayer){ctx.fillStyle='#d5e8ff';ctx.fillRect(x+7,y+27,w-14,4)} ctx.restore();
  }
  function drawRoad() {
    ctx.fillStyle='#090d18';ctx.fillRect(0,0,W,H);ctx.fillStyle='#10182a';ctx.fillRect(road.left,0,road.right-road.left,H);
    ctx.strokeStyle='#27d9ff';ctx.lineWidth=3;ctx.shadowColor='#27d9ff';ctx.shadowBlur=10;ctx.beginPath();ctx.moveTo(road.left,0);ctx.lineTo(road.left,H);ctx.moveTo(road.right,0);ctx.lineTo(road.right,H);ctx.stroke();ctx.shadowBlur=0;
    ctx.strokeStyle='rgba(177,190,255,.55)';ctx.lineWidth=3;ctx.setLineDash([32,25]);ctx.lineDashOffset=-stripeOffset;
    for(let i=1;i<3;i++){let x=road.left+laneW*i;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}ctx.setLineDash([]);
    for(let y=-30;y<H;y+=58){let yy=(y+stripeOffset*1.6+H)%(H+58)-29;ctx.fillStyle='#ff4fc8';ctx.fillRect(road.left-13,yy,5,20);ctx.fillStyle='#7c65ff';ctx.fillRect(road.right+8,yy,5,20)}
  }
  function draw() { drawRoad(); traffic.forEach(c=>drawCar(c.x,c.y,c.w,c.h,c.color)); drawCar(player.x,player.y,player.w,player.h,'#7665ff',true); }
  function overlaps(a,b){return a.x+5<b.x+b.w-5&&a.x+a.w-5>b.x+5&&a.y+7<b.y+b.h-7&&a.y+a.h-5>b.y+5}
  function frame(time) { if(!running)return; const dt=Math.min((time-lastTime)/16.67||1,2);lastTime=time; stripeOffset=(stripeOffset+speed*dt)%83; speed=Math.min(8,3+score/350); spawn+=dt; if(spawn>Math.max(24,58-score/35)){spawn=0;const lane=Math.floor(Math.random()*3);traffic.push({x:road.left+lane*laneW+laneW/2-16,y:-70,w:32,h:54,color:['#ff4f91','#ff9f43','#4ee4d2','#a78bfa'][Math.floor(Math.random()*4)]})}
    traffic.forEach(c=>c.y+=speed*dt); traffic=traffic.filter(c=>c.y<H+80); score+=dt*.45; const points=Math.floor(score);scoreEl.textContent=String(points);speedEl.textContent=(speed/3).toFixed(1)+'x';
    if(traffic.some(c=>overlaps(player,c))){finish();return} draw();raf=requestAnimationFrame(frame);
  }
  async function saveScore(points){ const token=document.querySelector('input[name=csrfmiddlewaretoken]')?.value; if(!token)return; try{const body=new URLSearchParams({points:String(points),game_slug:'car-race'});const response=await fetch('/scores/save/',{method:'POST',headers:{'X-CSRFToken':token,'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body,credentials:'same-origin'});if(response.ok){message.textContent='Score saved to your profile!'}else if(response.status===403){message.textContent='Score not saved. Please log in and play again.'}else{message.textContent='Race finished. Log in to save your score.'}}catch(e){message.textContent='Race finished. Sign in to save scores.'}}
  function finish(){running=false;ended=true;cancelAnimationFrame(raf);const points=Math.floor(score);best=Math.max(best,points);bestEl.textContent=String(best);overlay.classList.remove('hidden');overlay.querySelector('h2').textContent='Race over!';overlay.querySelector('p').textContent=`You travelled ${points} points. Best this session: ${best}.`;startBtn.textContent='Race again ↗';message.textContent='Saving your score…';saveScore(points)}
  function start(){reset();running=true;overlay.classList.add('hidden');message.textContent='Use ← → or A / D to steer. Avoid the traffic!';lastTime=performance.now();draw();raf=requestAnimationFrame(frame)}
  function move(dir){if(!running)return;player.lane=Math.max(0,Math.min(2,player.lane+dir));player.x=road.left+player.lane*laneW+laneW/2-player.w/2}
  window.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','a','A','d','D',' '].includes(e.key))e.preventDefault();if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')move(-1);if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')move(1);if(e.key===' '&&!running)start()});
  document.getElementById('race-left').addEventListener('click',()=>move(-1));document.getElementById('race-right').addEventListener('click',()=>move(1));startBtn.addEventListener('click',start);reset();draw();
})();
