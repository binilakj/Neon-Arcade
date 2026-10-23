(() => {
  const canvas = document.getElementById("snake-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const cell = 20, cols = canvas.width / cell, rows = canvas.height / cell;
  const scoreEl = document.getElementById("current-score");
  const bestEl = document.getElementById("best-score");
  const stateEl = document.getElementById("game-state");
  const startBtn = document.getElementById("start-game");
  const pauseBtn = document.getElementById("pause-game");
  const restartBtn = document.getElementById("restart-game");
  const saveBtn = document.getElementById("save-score");
  const saveStatus = document.getElementById("save-status");
  const csrf = document.querySelector('meta[name="csrf-token"]')?.content || "";
  let snake, food, dir, nextDir, score, best = 0, timer = null, running = false, over = false;

  function randomFood() {
    let p;
    do { p = { x: Math.floor(Math.random()*cols), y: Math.floor(Math.random()*rows) }; }
    while (snake && snake.some(s => s.x === p.x && s.y === p.y));
    return p;
  }
  function reset() {
    stop(); snake = [{x: 7,y: 10},{x: 6,y: 10},{x: 5,y: 10}];
    dir = {x:1,y:0}; nextDir = {x:1,y:0}; score = 0; food = randomFood();
    over = false; running = false; scoreEl.textContent = "000";
    saveBtn && (saveBtn.disabled = true);
    if (saveStatus) saveStatus.textContent = "";
    stateEl.textContent = "READY"; draw();
  }
  function stop() { if (timer) clearInterval(timer); timer = null; }
  function start() {
    if (over) reset();
    if (running) return;
    running = true; stateEl.textContent = "PLAYING";
    timer = setInterval(tick, 105);
  }
  function pause() {
    if (!running) return;
    running = false; stop(); stateEl.textContent = "PAUSED";
  }
  function setDirection(name) {
    const map = {up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
    const d = map[name]; if (!d) return;
    if (d.x !== -dir.x || d.y !== -dir.y) nextDir = d;
  }
  function tick() {
    dir = nextDir;
    const head = {x:snake[0].x+dir.x, y:snake[0].y+dir.y};
    const eating = head.x === food.x && head.y === food.y;
    const body = eating ? snake : snake.slice(0,-1);
    if (head.x < 0 || head.y < 0 || head.x >= cols || head.y >= rows || body.some(s=>s.x===head.x&&s.y===head.y)) {
      gameOver(); return;
    }
    snake.unshift(head);
    if (eating) { score += 10; food = randomFood(); }
    else snake.pop();
    scoreEl.textContent = String(score).padStart(3,"0");
    if (score > best) { best = score; bestEl.textContent = String(best).padStart(3,"0"); }
    draw();
  }
  function gameOver() {
    stop(); running = false; over = true; stateEl.textContent = "GAME OVER";
    saveBtn && (saveBtn.disabled = false);
    draw();
    ctx.fillStyle = "rgba(5,8,18,.76)"; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.textAlign = "center"; ctx.fillStyle = "#fff"; ctx.font = "bold 30px Segoe UI, Arial";
    ctx.fillText("GAME OVER",canvas.width/2,canvas.height/2-6);
    ctx.font = "14px Segoe UI, Arial"; ctx.fillStyle = "#aab8ff";
    ctx.fillText(`Score: ${score}  ·  Press Restart to try again`,canvas.width/2,canvas.height/2+25);
  }
  function draw() {
    ctx.fillStyle = "#080d19"; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle = "rgba(100,130,210,.08)"; ctx.lineWidth = 1;
    for(let x=0;x<=cols;x++){ctx.beginPath();ctx.moveTo(x*cell,0);ctx.lineTo(x*cell,canvas.height);ctx.stroke();}
    for(let y=0;y<=rows;y++){ctx.beginPath();ctx.moveTo(0,y*cell);ctx.lineTo(canvas.width,y*cell);ctx.stroke();}
    if (!snake) return;
    ctx.shadowBlur = 15; ctx.shadowColor = "#7a6cff";
    snake.forEach((s,i)=>{ctx.fillStyle=i===0?"#a8f8ff":"#647dff";ctx.beginPath();ctx.roundRect(s.x*cell+2,s.y*cell+2,cell-4,cell-4,5);ctx.fill();});
    ctx.shadowColor="#ff6ef0";ctx.shadowBlur=18;ctx.fillStyle="#ff83e8";
    ctx.beginPath();ctx.arc(food.x*cell+cell/2,food.y*cell+cell/2,cell*.34,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=0;
  }
  document.addEventListener("keydown", e => {
    const keys = {ArrowUp:"up",w:"up",W:"up",ArrowDown:"down",s:"down",S:"down",ArrowLeft:"left",a:"left",A:"left",ArrowRight:"right",d:"right",D:"right"};
    if (keys[e.key]) { e.preventDefault(); setDirection(keys[e.key]); }
    if (e.key === " " && !running) { e.preventDefault(); start(); }
  });
  document.querySelectorAll("[data-dir]").forEach(btn=>btn.addEventListener("click",()=>setDirection(btn.dataset.dir)));
  startBtn.addEventListener("click",start);
  pauseBtn.addEventListener("click",pause);
  restartBtn.addEventListener("click",reset);
  if (saveBtn) saveBtn.addEventListener("click", async () => {
    saveBtn.disabled = true; saveStatus.textContent = "Saving score…";
    try {
      const response = await fetch("/scores/save/", {method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded","X-CSRFToken":csrf},body:new URLSearchParams({points:String(score)})});
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Unable to save");
      saveStatus.textContent = `Saved ${data.points} points to your profile.`;
    } catch (err) {
      saveStatus.textContent = "Could not save score. Please log in again and retry.";
      saveBtn.disabled = false;
    }
  });
  reset();
})(); 
