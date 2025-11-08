
// Typewriter (preserved)
(function typewriterInit(){
  const el = document.getElementById('typewriter');
  if(!el) return;
  const arr = JSON.parse(el.getAttribute('data-text'));
  let i=0,j=0,forward=true;
  function step(){
    const current = arr[i];
    if(forward){
      j++; el.textContent = current.slice(0,j);
      if(j===current.length){ forward=false; setTimeout(step,1200); return; }
    } else {
      j--; el.textContent = current.slice(0,j);
      if(j===0){ forward=true; i=(i+1)%arr.length; }
    }
    setTimeout(step,60);
  }
  step();
})();

// Particles with varied sizes and color adaptation
(function particlesInit(){
  const canvas = document.getElementById('particle-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = canvas.width = innerWidth;
  let h = canvas.height = innerHeight;
  window.addEventListener('resize', ()=>{ w=canvas.width=innerWidth; h=canvas.height=innerHeight; });
  const colorsDark = ['#00fff0','#8b00ff','#66fcf1','#b9a0ff'];
  const colorsLight = ['#0b3b6f','#1a237e','#004d40','#33691e'];
  let colors = colorsDark;
  const mouse = { x: w/2, y: h/2 };
  addEventListener('mousemove', (e)=>{ mouse.x=e.clientX; mouse.y=e.clientY; });

  const particles = [];
  for(let i=0;i<140;i++){
    const sizeClass = Math.random();
    let r = sizeClass < 0.6 ? (Math.random()*1.2+0.4) : sizeClass < 0.9 ? (Math.random()*2.4+1.2) : (Math.random()*3.8+2.6);
    particles.push({
      x: Math.random()*w,
      y: Math.random()*h,
      r: r,
      dx: (Math.random()-0.5)*0.6,
      dy: (Math.random()-0.5)*0.6,
      col: colors[Math.floor(Math.random()*colors.length)],
      baseR: r
    });
  }

  function draw(){
    ctx.clearRect(0,0,w,h);
    particles.forEach(p=>{
      const dx = mouse.x - p.x; const dy = mouse.y - p.y; const dist = Math.sqrt(dx*dx+dy*dy);
      if(dist < 180){ p.x += dx*0.015; p.y += dy*0.015; }
      else { p.x += p.dx; p.y += p.dy; }
      if(p.x < -20) p.x = w+20; if(p.x > w+20) p.x = -20; if(p.y < -20) p.y = h+20; if(p.y > h+20) p.y = -20;
      const tw = Math.sin((Date.now()/600)+p.baseR)*0.7 + 0.9;
      ctx.beginPath(); ctx.fillStyle = p.col; ctx.globalAlpha = 0.9*tw; ctx.arc(p.x,p.y,p.r*tw,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.globalAlpha = 0.06*tw; ctx.fillStyle = p.col; ctx.arc(p.x,p.y,(p.r*8)*tw,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
    });
    for(let a=0;a<particles.length;a++){
      for(let b=a+1;b<particles.length;b++){
        const pa = particles[a], pb = particles[b];
        const dx = pa.x - pb.x, dy = pa.y - pb.y; const d = Math.sqrt(dx*dx+dy*dy);
        if(d < 120){
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(160,255,230,' + (0.06*(1 - d/120)) + ')';
          ctx.lineWidth = 0.6;
          ctx.moveTo(pa.x,pa.y); ctx.lineTo(pb.x,pb.y); ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
  window.__setParticleMode = (mode)=>{
    colors = mode === 'light' ? colorsLight : colorsDark;
    particles.forEach(p=> p.col = colors[Math.floor(Math.random()*colors.length)]);
  };
})();

// Clouds and techno-lightning
(function cloudsInit(){
  const cloudLayer = document.getElementById('cloud-layer');
  if(!cloudLayer) return;
  function makeCloud(left, top, size, opacity){
    const d = document.createElement('div'); d.className='cloud';
    d.style.left = left + '%'; d.style.top = top + '%'; d.style.width = size + 'px'; d.style.height = (size*0.5)+'px'; d.style.opacity=opacity;
    cloudLayer.appendChild(d);
    d.animate([{transform:'translateX(0)'},{transform:'translateX(-20px)'}],{duration:180000,iterations:Infinity});
    return d;
  }
  makeCloud(10,10,900,0.65); makeCloud(70,5,700,0.5); makeCloud(40,18,500,0.45);
  const canvas = document.createElement('canvas'); canvas.style.position='absolute'; canvas.style.left='0'; canvas.style.top='0'; canvas.width=innerWidth; canvas.height=innerHeight; canvas.style.pointerEvents='none'; canvas.style.zIndex='50'; cloudLayer.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  function strike(){
    const sx = Math.random()*innerWidth; const sy = Math.random()*innerHeight*0.35;
    const branches = 6 + Math.floor(Math.random()*6);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let b=0;b<branches;b++){
      let x=sx, y=sy; ctx.beginPath(); ctx.moveTo(x,y);
      for(let i=0;i<12;i++){ x += (Math.random()-0.5)*40; y += 10 + Math.random()*40; ctx.lineTo(x,y); }
      ctx.strokeStyle = 'rgba(0,255,204,0.12)'; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x,y);
      for(let k=0;k<8;k++){ ctx.lineTo(x + (Math.random()-0.5)*200, y + (Math.random()-0.5)*200); }
      ctx.strokeStyle = 'rgba(160,255,230,0.06)'; ctx.lineWidth = 0.6; ctx.stroke();
    }
    setTimeout(()=>{ ctx.clearRect(0,0,canvas.width,canvas.height); }, 900);
  }
  setInterval(()=>{ if(Math.random() < 0.28) strike(); }, 4000);
})();

// Theme toggle (updates particle mode)
(function themeToggle(){
  const btn = document.getElementById('theme-toggle');
  if(!btn) return;
  btn.addEventListener('click', ()=>{
    document.body.classList.toggle('light-mode');
    const pressed = document.body.classList.contains('light-mode');
    btn.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    btn.textContent = pressed ? '🌙' : '☀️';
    if(window.__setParticleMode) window.__setParticleMode(pressed ? 'light' : 'dark');
  });
})();

// Ensure CTA clickable
(function ensureClickable(){
  const cta = document.getElementById('view-projects-cta');
  if(cta){ cta.addEventListener('click', ()=>{ document.getElementById('projects').scrollIntoView({behavior:'smooth'}); }); }
})();

// Typewriter hover interaction
(function typewriterHover(){
  const el = document.getElementById('typewriter');
  if(!el) return;
  el.addEventListener('mouseenter', ()=> el.classList.add('hovered'));
  el.addEventListener('mouseleave', ()=> el.classList.remove('hovered'));
})();

// Contact form demo
(function contactForm(){ const form = document.getElementById('contact-form'); if(!form) return; form.addEventListener('submit',(e)=>{ e.preventDefault(); const status=document.getElementById('contact-status'); status.textContent='Demo: form captured (configure backend to send)'; form.reset(); setTimeout(()=>status.textContent='',3500); }); })();

// GitHub fetch refresh for projects
(function githubRefresh(){
  const btn = document.getElementById('refresh-repos');
  const list = document.getElementById('projects-list');
  const username = 'i-damale';
  async function fetchRepos(){
    btn.disabled = true; btn.textContent = '🔁 Refreshing...';
    try{
      const res = await fetch('https://api.github.com/users/' + username + '/repos?per_page=100');
      if(!res.ok) throw new Error('GitHub API error ' + res.status);
      const repos = await res.json();
      repos.sort((a,b)=> new Date(b.pushed_at) - new Date(a.pushed_at));
      list.innerHTML = '';
      repos.forEach(r=>{
        const a = document.createElement('a');
        a.className = 'card project-card';
        a.href = r.html_url;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = r.name + (r.description ? ' — ' + r.description.slice(0,80) : '');
        list.appendChild(a);
      });
      btn.textContent = '🔁 Refreshed';
    }catch(err){
      console.error(err);
      btn.textContent = '🔁 Error';
    }finally{
      setTimeout(()=>{ btn.disabled=false; btn.textContent='🔁 Refresh Projects'; },1200);
    }
  }
  btn.addEventListener('click', fetchRepos);
})(); 
