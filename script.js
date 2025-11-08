// ========== TYPEWRITER ==========
(function(){
  const el = document.getElementById('typewriter');
  if(!el) return;
  const lines = JSON.parse(el.getAttribute('data-text'));
  let i=0, j=0, forward=true;
  function step(){
    const text = lines[i];
    if(forward){ j++; if(j>text.length){ forward=false; setTimeout(step,1000); return; }}
    else { j--; if(j===0){ forward=true; i=(i+1)%lines.length; }}
    let out=text.slice(0,j);
    if(i===0) out=out.replace('X','<span class="neon-pink">X</span>');
    if(i===2){ const parts=text.split('|'); out=`<span class='neon-orange'>${parts[0]}</span>${parts[1].slice(0,Math.max(0,j-parts[0].length))}`;}
    el.innerHTML=out;
    setTimeout(step,90);
  }
  step();
})();

// ========== PARTICLES ==========
(function(){
  const c=document.getElementById('particle-canvas');if(!c)return;
  const x=c.getContext('2d');let w,h;function r(){w=c.width=innerWidth;h=c.height=innerHeight;}r();addEventListener('resize',r);
  const parts=Array.from({length:80},()=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*2+1,vx:(Math.random()-.5),vy:(Math.random()-.5),c:'#00ffcc'}));
  const mouse={x:-999,y:-999};addEventListener('mousemove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;});
  addEventListener('mouseleave',()=>{mouse.x=-999;mouse.y=-999;});
  function loop(){
    x.clearRect(0,0,w,h);
    for(const p of parts){
      const dx=mouse.x-p.x,dy=mouse.y-p.y,d=Math.hypot(dx,dy);
      if(d<120){const f=(120-d)/120;p.vx-=dx/d*f*0.05;p.vy-=dy/d*f*0.05;}
      p.x+=p.vx;p.y+=p.vy;p.vx*=0.98;p.vy*=0.98;
      if(p.x<0)p.x=w;if(p.x>w)p.x=0;if(p.y<0)p.y=h;if(p.y>h)p.y=0;
      x.beginPath();x.fillStyle=p.c;x.arc(p.x,p.y,p.r,0,Math.PI*2);x.fill();
    }
    requestAnimationFrame(loop);
  }
  loop();
})();

// ========== MIST CANVAS ==========
(function(){
  const c=document.getElementById('mist-canvas');if(!c)return;
  const x=c.getContext('2d');let w,h;function r(){w=c.width=innerWidth;h=c.height=innerHeight;}r();addEventListener('resize',r);
  const mist=Array.from({length:12},()=>({x:Math.random()*w,y:Math.random()*h*0.2+0.7*h,w:200+Math.random()*300,h:60+Math.random()*40,s:0.1+Math.random()*0.3,a:0.05+Math.random()*0.1}));
  function loop(){
    x.clearRect(0,0,w,h);
    for(const m of mist){
      m.x+=m.s;if(m.x> w+200)m.x=-300;
      const grad=x.createLinearGradient(m.x,m.y,m.x+m.w,m.y);
      grad.addColorStop(0,`rgba(255,255,255,0)`);
      grad.addColorStop(0.5,`rgba(255,255,255,${m.a})`);
      grad.addColorStop(1,`rgba(255,255,255,0)`);
      x.fillStyle=grad;x.fillRect(m.x,m.y,m.w,m.h);
    }
    requestAnimationFrame(loop);
  }
  loop();
})();

// ========== THEME TOGGLE ==========
(function(){
  const btn=document.getElementById('theme-toggle');
  btn.addEventListener('click',()=>{
    const d=document.body.classList.toggle('day-mode');
    btn.textContent=d?'🌙':'☀️';
  });
})();

// ========== FETCH GITHUB PROJECTS ==========
(function(){
  const list=document.getElementById('projects-list');
  const refresh=document.getElementById('refresh-repos-section');
  refresh.addEventListener('click',async()=>{
    refresh.textContent='Loading...';
    const r=await fetch('https://api.github.com/users/i-damale/repos');
    const data=await r.json();
    list.innerHTML='';
    data.sort((a,b)=>new Date(b.pushed_at)-new Date(a.pushed_at));
    data.forEach(repo=>{
      const a=document.createElement('a');
      a.href=repo.html_url;a.target='_blank';a.className='card';
      a.textContent=repo.name;
      list.appendChild(a);
    });
    refresh.textContent='🔁 Refresh Projects';
  });
})();

// ========== GAME MODAL ==========
(function(){
  const btn=document.getElementById('game-button');
  const modal=document.getElementById('game-modal');
  const close=document.getElementById('game-close');
  btn.addEventListener('click',async()=>{
    modal.classList.add('show');
    if(typeof startMarioGame!=='function'){
      await new Promise(res=>{
        const s=document.createElement('script');
        s.src='assets/game/game.js';
        s.onload=res;
        document.body.appendChild(s);
      });
    }
    if(typeof startMarioGame==='function') startMarioGame();
  });
  close.addEventListener('click',()=>modal.classList.remove('show'));
})();
