// === Typewriter ===
(function(){
  const el=document.getElementById('typewriter');
  if(!el)return;
  const lines=JSON.parse(el.dataset.text);
  let i=0,j=0,forward=true;
  function step(){
    const text=lines[i];
    if(forward){j++;if(j>text.length){forward=false;setTimeout(step,1000);return;}}
    else{j--;if(j===0){forward=true;i=(i+1)%lines.length;}}
    let out=text.slice(0,j);
    if(i===0)out=out.replace('X','<span class="neon-pink">X</span>');
    if(i===2){const parts=text.split('|');
      out=`<span class='neon-orange'>${parts[0]}</span>${parts[1].slice(0,Math.max(0,j-parts[0].length))}`;}
    el.innerHTML=out;
    setTimeout(step,90);
  }
  step();
})();

// === Particles ===
(function(){
  const c=document.getElementById('particle-canvas'); if(!c)return;
  const x=c.getContext('2d'); let w,h;
  function resize(){w=c.width=innerWidth;h=c.height=innerHeight;} resize(); addEventListener('resize',resize);
  const p=Array.from({length:100},()=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*2+1,
    vx:(Math.random()-.5)*.6,vy:(Math.random()-.5)*.6,c:'#00ffcc'}));
  const mouse={x:-999,y:-999};
  addEventListener('mousemove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;});
  addEventListener('mouseleave',()=>{mouse.x=-999;mouse.y=-999;});
  function loop(){
    x.clearRect(0,0,w,h);
    for(const pt of p){
      const dx=mouse.x-pt.x,dy=mouse.y-pt.y,d=Math.hypot(dx,dy);
      if(d<150){pt.vx-=dx/d*0.03;pt.vy-=dy/d*0.03;}
      pt.x+=pt.vx;pt.y+=pt.vy;pt.vx*=0.98;pt.vy*=0.98;
      if(pt.x<0)pt.x=w;if(pt.x>w)pt.x=0;if(pt.y<0)pt.y=h;if(pt.y>h)pt.y=0;
      x.beginPath();x.fillStyle=pt.c;x.arc(pt.x,pt.y,pt.r,0,Math.PI*2);x.fill();
    }
    requestAnimationFrame(loop);
  }
  loop();
})();

// === Day Scene (Sun + Clouds + Birds) ===
(function(){
  const c=document.getElementById('scene-canvas'); if(!c)return;
  const ctx=c.getContext('2d'); let w,h; function resize(){w=c.width=innerWidth;h=c.height=innerHeight;} resize();
  addEventListener('resize',resize);
  let t=0;
  function loop(){
    ctx.clearRect(0,0,w,h);
    if(document.body.classList.contains('day-mode')){
      const grd=ctx.createLinearGradient(0,0,0,h);
      grd.addColorStop(0,'#a8d8ff'); grd.addColorStop(1,'#fff5e6'); ctx.fillStyle=grd; ctx.fillRect(0,0,w,h);
      // Sun
      const sunY=100+Math.sin(t/200)*10;
      const sunX=w*0.8;
      ctx.beginPath();ctx.arc(sunX,sunY,60,0,Math.PI*2);
      ctx.fillStyle='#ffeb3b';ctx.shadowBlur=40;ctx.shadowColor='rgba(255,230,100,0.6)';ctx.fill();ctx.shadowBlur=0;
      // Clouds
      for(let i=0;i<6;i++){
        const cx=(t*0.2+i*250)% (w+200)-200;
        const cy=80+i*20;
        ctx.fillStyle='rgba(255,255,255,0.8)';
        ctx.beginPath();ctx.ellipse(cx,cy,60,25,0,0,Math.PI*2);ctx.fill();
      }
      // Hills and ground
      ctx.fillStyle='#88c86f';
      ctx.beginPath();ctx.ellipse(w*0.3,h-20,250,100,0,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.ellipse(w*0.7,h,300,120,0,0,Math.PI*2);ctx.fill();
      // Lake
      ctx.fillStyle='#6cc1ff';ctx.beginPath();ctx.ellipse(w*0.5,h-40,200,40,0,0,Math.PI*2);ctx.fill();
      // Birds
      ctx.strokeStyle='#333';ctx.lineWidth=2;
      for(let i=0;i<4;i++){const bx=(t*0.6+i*180)%w;const by=100+Math.sin(t/50+i)*10;
        ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx+10,by-4);ctx.moveTo(bx,by);ctx.lineTo(bx-10,by-4);ctx.stroke();}
    }
    t++;
    requestAnimationFrame(loop);
  }
  loop();
})();

// === Theme + Buttons + GitHub Fetch ===
(function(){
  const theme=document.getElementById('theme-toggle');
  const view=document.getElementById('view-projects-cta');
  const section=document.getElementById('projects');
  if(view&&section){view.addEventListener('click',()=>section.scrollIntoView({behavior:'smooth'}));}
  if(theme){theme.addEventListener('click',()=>{
    const d=document.body.classList.toggle('day-mode');
    theme.textContent=d?'🌙':'☀️';
  });}

  const refresh=document.getElementById('refresh-repos');
  const list=document.getElementById('projects-list');
  if(refresh&&list){
    refresh.addEventListener('click',async()=>{
      refresh.textContent='Loading...';
      try{
        const res=await fetch('https://api.github.com/users/i-damale/repos');
        const data=await res.json();
        list.innerHTML='';
        data.sort((a,b)=>new Date(b.pushed_at)-new Date(a.pushed_at));
        data.forEach(r=>{
          const a=document.createElement('a');
          a.href=r.html_url;a.target='_blank';a.className='card';a.textContent=r.name;
          list.appendChild(a);
        });
      }catch{list.innerHTML='<p>Failed to load projects.</p>';}
      refresh.textContent='🔁 Refresh Projects';
    });
  }
})();
