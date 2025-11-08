// Typewriter: slower and neon pink only for first X between Devops and Cloud
(function typewriterInit(){
  const el = document.getElementById('typewriter');
  if(!el) return;
  const raw = JSON.parse(el.getAttribute('data-text'));
  let idx = 0, ch = 0, forward=true;
  // slower: base interval increased by 30% (60 -> 78ms)
  const interval = 78;
  function step(){
    const cur = raw[idx];
    if(forward){ ch++; if(ch>cur.length){ forward=false; setTimeout(step,1200); return; } }
    else { ch--; if(ch===0){ forward=true; idx=(idx+1)%raw.length; } }
    const slice = cur.slice(0,ch);
    // Only replace first 'X' occurrence in the first line with neon span; other 'X' or '.' should be plain
    let out = '';
    if(idx === 0){
      // in first line, highlight first 'X' only
      let used=false;
      for(let i=0;i<slice.length;i++){
        const c = slice[i];
        if(c==='X' && !used){ out += '<span class="neon-pink">X</span>'; used=true; }
        else { out += c.replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
      }
    } else {
      // other lines: no neon spans (reverted)
      out = slice.replace(/&/g,'&amp;').replace(/</g,'&lt;');
    }
    el.innerHTML = out;
    setTimeout(step, interval);
  }
  step();
})();

// Particles: full-screen and repulsion, color correction on theme toggle
(function particlesInit(){
  const canvas = document.getElementById('particle-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  function resize(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize(); window.addEventListener('resize', resize);
  const colorsDark = ['#00fff0','#8b00ff','#66fcf1','#b9a0ff'];
  const colorsLight = ['#004d40','#1a237e','#0b3b6f','#33691e']; // darker tones for visibility on light bg
  let colors = colorsDark;
  const mouse = { x:-9999,y:-9999 };
  window.addEventListener('mousemove', (e)=>{ mouse.x=e.clientX; mouse.y=e.clientY; });
  window.addEventListener('mouseleave', ()=>{ mouse.x=-9999; mouse.y=-9999; });

  const particles = [];
  for(let i=0;i<220;i++){
    const sizeClass = Math.random();
    let r = sizeClass < 0.6 ? (Math.random()*1.2+0.4) : sizeClass < 0.92 ? (Math.random()*2.4+1.2) : (Math.random()*4.4+3.0);
    particles.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, r:r, vx:(Math.random()-0.5)*0.4, vy:(Math.random()-0.5)*0.4, col: colors[Math.floor(Math.random()*colors.length)], baseR:r });
  }

  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let p of particles){
      const dx = p.x - mouse.x; const dy = p.y - mouse.y; const dist = Math.sqrt(dx*dx+dy*dy);
      if(mouse.x>-9999 && dist < 160){
        const force = (160 - dist)/160;
        const angle = Math.atan2(dy,dx);
        p.vx += Math.cos(angle) * (0.9 * force);
        p.vy += Math.sin(angle) * (0.9 * force);
      } else {
        p.vx += (Math.random()-0.5)*0.01; p.vy += (Math.random()-0.5)*0.01;
      }
      p.vx *= 0.985; p.vy *= 0.985;
      p.x += p.vx; p.y += p.vy;
      if(p.x < -40) p.x = canvas.width+40; if(p.x > canvas.width+40) p.x = -40;
      if(p.y < -40) p.y = canvas.height+40; if(p.y > canvas.height+40) p.y = -40;
      const tw = 0.9 + 0.4 * Math.sin((Date.now()/900) + p.baseR);
      ctx.beginPath(); ctx.fillStyle = p.col; ctx.globalAlpha = 0.95 * tw; ctx.arc(p.x,p.y,p.r * tw,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.globalAlpha = 0.05 * tw; ctx.fillStyle = p.col; ctx.arc(p.x,p.y,(p.r*8)*tw,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
    }
    // connections
    for(let a=0;a<particles.length;a++){
      for(let b=a+1;b<particles.length;b++){
        const pa = particles[a], pb = particles[b];
        const dx = pa.x - pb.x, dy = pa.y - pb.y; const d = Math.sqrt(dx*dx+dy*dy);
        if(d < 90){
          ctx.beginPath(); ctx.strokeStyle = 'rgba(160,255,230,' + (0.05*(1 - d/90)) + ')'; ctx.lineWidth = 0.5; ctx.moveTo(pa.x,pa.y); ctx.lineTo(pb.x,pb.y); ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
  window.__setParticleMode = (mode)=>{
    colors = mode === 'light' ? colorsLight : colorsDark;
    particles.forEach(p => p.col = colors[Math.floor(Math.random()*colors.length)]);
  };
})();

// Clouds: ensure visible and behind content gaps, moving opposite directions, lightning from clouds
(function cloudsAndLightning(){
  const cloudLayer = document.getElementById('cloud-layer');
  if(!cloudLayer) return;
  cloudLayer.style.zIndex = '60'; // behind content (z-index 60) but above canvas (particle canvas 50)
  const clouds = [];
  function makeCloud(leftPct, topPct, size, opacity, dir){
    const el = document.createElement('div'); el.className='cloud';
    el.style.left = leftPct + '%'; el.style.top = topPct + '%'; el.style.width = size + 'px'; el.style.height = (size*0.5) + 'px'; el.style.opacity = opacity;
    cloudLayer.appendChild(el);
    const distance = 120 + Math.random()*260; const dur = 60000 + Math.random()*90000; const from = dir === 'left' ? 0 : -distance; const to = dir === 'left' ? -distance : 0;
    el.animate([{transform:`translateX(${from}px)`},{transform:`translateX(${to}px)`}], {duration:dur, iterations:Infinity});
    clouds.push(el); return el;
  }
  makeCloud(5,12,900,0.18,'left'); makeCloud(85,8,700,0.16,'right'); makeCloud(45,20,600,0.14,'left');
  const canvas = document.createElement('canvas'); canvas.style.position='absolute'; canvas.style.left='0'; canvas.style.top='0'; canvas.width=innerWidth; canvas.height=innerHeight; canvas.style.pointerEvents='none'; canvas.style.zIndex='65'; cloudLayer.appendChild(canvas);
  const ctx = canvas.getContext('2d'); window.addEventListener('resize', ()=>{ canvas.width=innerWidth; canvas.height=innerHeight; });
  function lightningFromCloud(cloudEl){
    const rect = cloudEl.getBoundingClientRect(); const sx = rect.left + rect.width*(0.2+Math.random()*0.6); const sy = rect.top + rect.height*0.6;
    ctx.strokeStyle = 'white'; ctx.lineWidth = 1.6; ctx.shadowColor = 'rgba(0,186,255,0.95)'; ctx.shadowBlur = 20;
    for(let b=0;b<4 + Math.floor(Math.random()*5); b++){
      let x=sx,y=sy; ctx.beginPath(); ctx.moveTo(x,y);
      for(let i=0;i<10;i++){ x += (Math.random()-0.5)*40; y += 12 + Math.random()*40; ctx.lineTo(x,y); }
      ctx.stroke();
      ctx.beginPath(); for(let k=0;k<6;k++){ ctx.moveTo(x,y); ctx.lineTo(x + (Math.random()-0.5)*200, y + (Math.random()-0.5)*200); }
      ctx.strokeStyle = 'rgba(160,210,255,0.06)'; ctx.lineWidth = 0.6; ctx.stroke();
    }
    setTimeout(()=>{ ctx.clearRect(0,0,canvas.width,canvas.height); }, 900);
  }
  setInterval(()=>{ if(Math.random() < 0.45){ const c = clouds[Math.floor(Math.random()*clouds.length)]; if(c) lightningFromCloud(c); } }, 3500);
})();

// cursor trail preserved (keeps it)
(function cursorTrail(){
  const canvas = document.getElementById('trail-canvas'); if(!canvas) return; const ctx = canvas.getContext('2d'); let w = canvas.width = innerWidth, h = canvas.height = innerHeight; window.addEventListener('resize', ()=>{ w=canvas.width=innerWidth; h=canvas.height=innerHeight; }); const points=[]; if(/Mobi|Android/i.test(navigator.userAgent)) return; addEventListener('mousemove',(e)=>{ points.push({x:e.clientX,y:e.clientY,t:Date.now()}); }); function draw(){ ctx.clearRect(0,0,canvas.width,canvas.height); const now=Date.now(); for(let i=points.length-1;i>=0;i--){ const p=points[i]; const age=now-p.t; if(age>900){ points.splice(i,1); continue; } const alpha=1-age/900; ctx.beginPath(); ctx.fillStyle='rgba(0,255,204,'+(alpha*0.6)+')'; ctx.arc(p.x,p.y,6*(alpha*0.9),0,Math.PI*2); ctx.fill(); } requestAnimationFrame(draw); } draw(); })();

// Theme toggle: correct particle color post-toggle (uses __setParticleMode)
(function themeToggle(){
  const btn = document.getElementById('theme-toggle'); if(!btn) return;
  btn.addEventListener('click', ()=>{
    document.body.classList.toggle('light-mode');
    const pressed = document.body.classList.contains('light-mode');
    btn.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    btn.textContent = pressed ? '🌙' : '☀️';
    if(window.__setParticleMode) window.__setParticleMode(pressed ? 'light' : 'dark');
    // footer color handled by CSS (body.light-mode footer {color:black})
  });
})();

// GitHub refresh (unchanged)
(function githubRefresh(){
  const btn = document.getElementById('refresh-repos'); const list = document.getElementById('projects-list'); const username='i-damale';
  async function fetchRepos(){ btn.disabled=true; btn.textContent='🔁 Refreshing...'; try{ const res = await fetch('https://api.github.com/users/'+username+'/repos?per_page=100'); if(!res.ok) throw new Error('GitHub API error '+res.status); const repos = await res.json(); repos.sort((a,b)=> new Date(b.pushed_at)-new Date(a.pushed_at)); list.innerHTML=''; repos.forEach(r=>{ const a=document.createElement('a'); a.className='card project-card'; a.href=r.html_url; a.target='_blank'; a.rel='noopener'; a.textContent = r.name + (r.description ? ' — '+ r.description.slice(0,80) : ''); list.appendChild(a); }); btn.textContent='🔁 Refreshed'; }catch(err){ console.error(err); btn.textContent='🔁 Error'; }finally{ setTimeout(()=>{ btn.disabled=false; btn.textContent='🔁 Refresh Projects'; },1200); } }
  btn.addEventListener('click', fetchRepos);
})();
