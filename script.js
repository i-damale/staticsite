// Typewriter
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
    if(i===2){const parts=text.split('|');out=`<span class='neon-orange'>${parts[0]}</span>${parts[1].slice(0,Math.max(0,j-parts[0].length))}`;}
    el.innerHTML=out;
    setTimeout(step,90);
  }
  step();
})();

// Particle Animation
(function(){
  const c=document.getElementById('particle-canvas');
  if(!c)return;
  const x=c.getContext('2d');
  let w,h;
  function r(){w=c.width=innerWidth;h=c.height=innerHeight;}
  r();addEventListener('resize',r);
  const parts=Array.from({length:80},()=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*2+1,vx:(Math.random()-.5),vy:(Math.random()-.5),c:'#00ffcc'}));
  const mouse={x:-999,y:-999};
  addEventListener('mousemove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;});
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

// Smooth Scroll + Theme Toggle
(function(){
  const viewBtn=document.getElementById('view-projects-cta');
  const projects=document.getElementById('projects');
  const theme=document.getElementById('theme-toggle');
  viewBtn.addEventListener('click',()=>projects.scrollIntoView({behavior:'smooth'}));
  theme.addEventListener('click',()=>{
    const day=document.body.classList.toggle('day-mode');
    theme.textContent=day?'🌙':'☀️';
  });
})();

// Fetch GitHub Projects
(function(){
  const refresh=document.getElementById('refresh-repos');
  const list=document.getElementById('projects-list');
  refresh.addEventListener('click',async()=>{
    refresh.textContent='Loading...';
    const res=await fetch('https://api.github.com/users/i-damale/repos');
    const data=await res.json();
    list.innerHTML='';
    data.sort((a,b)=>new Date(b.pushed_at)-new Date(a.pushed_at));
    data.forEach(repo=>{
      const a=document.createElement('a');
      a.href=repo.html_url;a.target='_blank';a.className='card';a.textContent=repo.name;
      list.appendChild(a);
    });
    refresh.textContent='🔁 Refresh Projects';
  });
})();
