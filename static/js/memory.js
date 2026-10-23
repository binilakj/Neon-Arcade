(() => {
 const board=document.getElementById("memory-board"); if(!board)return;
 const symbols=["✦","★","◆","●","▲","♥","☀","♫"];
 const movesEl=document.getElementById("memory-moves"), pairsEl=document.getElementById("memory-pairs"), stateEl=document.getElementById("memory-state");
 const startBtn=document.getElementById("memory-start"), restartBtn=document.getElementById("memory-restart"), saveBtn=document.getElementById("memory-save"), statusEl=document.getElementById("memory-status");
 const csrf=document.querySelector('meta[name="csrf-token"]')?.content||"";
 let cards=[],first=null,lock=false,moves=0,pairs=0,active=false,score=0;
 function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 function setup(){cards=shuffle([...symbols,...symbols]);board.innerHTML="";first=null;lock=false;moves=0;pairs=0;active=true;score=0;movesEl.textContent="000";pairsEl.textContent="0 / 8";stateEl.textContent="PLAYING";if(saveBtn)saveBtn.disabled=true;if(statusEl)statusEl.textContent="";
 cards.forEach((symbol,i)=>{const b=document.createElement("button");b.className="memory-card";b.type="button";b.textContent="?";b.dataset.symbol=symbol;b.dataset.index=i;b.setAttribute("aria-label","Hidden card");b.addEventListener("click",()=>flip(b));board.appendChild(b);});}
 function flip(b){if(!active||lock||b.classList.contains("matched")||b===first)return;b.textContent=b.dataset.symbol;b.classList.add("revealed");if(!first){first=b;return;}moves++;movesEl.textContent=String(moves).padStart(3,"0");if(first.dataset.symbol===b.dataset.symbol){first.classList.add("matched");b.classList.add("matched");first=null;pairs++;pairsEl.textContent=`${pairs} / 8`;if(pairs===8){active=false;score=Math.max(10,1000-moves*40);stateEl.textContent="COMPLETE";if(saveBtn)saveBtn.disabled=false;if(statusEl)statusEl.textContent=`Finished! Score: ${score}`;}}else{lock=true;const old=first;first=null;setTimeout(()=>{old.textContent="?";b.textContent="?";old.classList.remove("revealed");b.classList.remove("revealed");lock=false;},650);}}
 async function save(){if(!saveBtn)return;saveBtn.disabled=true;statusEl.textContent="Saving…";try{const r=await fetch("/scores/save/",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded","X-CSRFToken":csrf},body:new URLSearchParams({points:String(score),game_slug:"memory-match"})});const d=await r.json();if(!r.ok||!d.ok)throw Error();statusEl.textContent=`Saved ${d.points} points!`;}catch(e){statusEl.textContent="Could not save score. Please log in again.";saveBtn.disabled=false;}}
 startBtn.addEventListener("click",setup);restartBtn.addEventListener("click",setup);if(saveBtn)saveBtn.addEventListener("click",save);setup();active=false;stateEl.textContent="READY";
})();
