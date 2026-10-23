(() => {
 const start=document.getElementById("click-start"),target=document.getElementById("click-target"),countEl=document.getElementById("click-count"),scoreEl=document.getElementById("click-score"),timerEl=document.getElementById("click-timer"),stateEl=document.getElementById("click-state"),saveBtn=document.getElementById("click-save"),statusEl=document.getElementById("click-status");
 if(!start||!target)return;const csrf=document.querySelector('meta[name="csrf-token"]')?.content||"";let clicks=0,remaining=10,active=false,interval=null;
 function finish(){active=false;clearInterval(interval);target.disabled=true;target.textContent="TIME UP";stateEl.textContent="FINISHED";if(saveBtn)saveBtn.disabled=false;}
 function begin(){clearInterval(interval);clicks=0;remaining=10;active=true;target.disabled=false;target.textContent="CLICK!";countEl.textContent="0";scoreEl.textContent="000";timerEl.textContent="10.0 seconds";stateEl.textContent="PLAYING";if(saveBtn)saveBtn.disabled=true;if(statusEl)statusEl.textContent="";interval=setInterval(()=>{remaining=Math.max(0,remaining-.1);timerEl.textContent=remaining.toFixed(1)+" seconds";if(remaining<=0)finish();},100);}
 target.addEventListener("click",()=>{if(!active)return;clicks++;countEl.textContent=String(clicks);scoreEl.textContent=String(clicks).padStart(3,"0");});
 start.addEventListener("click",begin);
 if(saveBtn)saveBtn.addEventListener("click",async()=>{saveBtn.disabled=true;statusEl.textContent="Saving…";try{const r=await fetch("/scores/save/",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded","X-CSRFToken":csrf},body:new URLSearchParams({points:String(clicks),game_slug:"click-rush"})});const d=await r.json();if(!r.ok||!d.ok)throw Error();statusEl.textContent=`Saved ${d.points} points!`;}catch(e){statusEl.textContent="Could not save score. Please log in again.";saveBtn.disabled=false;}});
 target.disabled=true;
})();
