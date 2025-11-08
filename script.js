// Clean stable script for portfolio
// Typewriter (slower, neon X for first line, neon-orange for Engineering phrase)
(function(){
  const el = document.getElementById('typewriter'); if(!el) return;
  const raw = JSON.parse(el.getAttribute('data-text'));
  let idx=0, ch=0, forward=true;
  const interval = 90; // slightly slower
  function step(){
    const cur = raw[idx];
    if(forward){ ch++; if(ch>cur.length){ forward=false; setTimeout(step,1200); return; } }
    else { ch--; if(ch===0){ forward=true; idx=(idx+1)%raw.length; } }
    let out = '';
    if(idx===0){
      // highlight first X only
      let used=false;
      for(let i=0;i<ch;i++){
        const c = cur[i];
        if(c==='X' && !used){ out += '<span class="neon-pink">X</span>'; used=true; }
        else out += c.replace(/</g,'&lt;');
      }
    } else if(idx===2){
      // third line split using '|'
      const parts = cur.split('|');
      const left = parts[0], right = parts[1] || '';
      if(ch <= left.length){
        out = left.slice(0,ch).replace(/</g,'&lt;');
      } else {
        out = '<span class="neon-orange">'+ left +'</span>' + right.slice(0, ch - left.length).replace(/</g,'&lt;');
      }
    } else {
      out = cur.slice(0,ch).replace(/</g,'&lt;');
    }
    el.innerHTML = out;
    setTimeout(step, interval);
  }
  step();
})();

// Particles (full-screen repulsion)
(function(){
  const canvas = document.getElementById('particle-canvas'); if(!canvas) return;
  const ctx = canvas.getContext('2d');
  function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
  resize(); addEventListener('resize', resize);
  const colorsDark = ['#00fff0','#8b00ff','#66fcf1','#b9a0ff'];
  const colorsLight = ['#003f2f','#1a237e','#0b3b6f','#274e13'];
  let colors = colorsDark;
  const mouse = {x:-9999,y:-9999};
  addEventListener('mousemove', e=>{ mouse.x=e.clientX; mouse.y=e.clientY; });
  addEventListener('mouseleave', ()=>{ mouse.x=-9999; mouse.y=-9999; });
  const particles = [];
  const N = Math.max(120, Math.floor((innerWidth*innerHeight)/6000));
  for(let i=0;i<N;i++){
    const sc = Math.random();
    const r = sc<0.6 ? (Math.random()*1.2+0.4) : sc<0.92 ? (Math.random()*2.4+1.2) : (Math.random()*4.4+3.0);
    particles.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, r, vx:(Math.random()-0.5)*0.6, vy:(Math.random()-0.5)*0.6, col: colors[Math.floor(Math.random()*colors.length)], baseR:r });
  }
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(const p of particles){
      const dx = p.x - mouse.x, dy = p.y - mouse.y, dist = Math.hypot(dx,dy);
      if(mouse.x>-9999 && dist < 160){
        const force = (160 - dist) / 160;
        const angle = Math.atan2(dy, dx);
        p.vx += Math.cos(angle) * (0.9 * force);
        p.vy += Math.sin(angle) * (0.9 * force);
      } else {
        p.vx += (Math.random()-0.5)*0.02;
        p.vy += (Math.random()-0.5)*0.02;
      }
      p.vx *= 0.98; p.vy *= 0.98;
      p.x += p.vx; p.y += p.vy;
      if(p.x < -50) p.x = canvas.width + 50; if(p.x > canvas.width + 50) p.x = -50;
      if(p.y < -50) p.y = canvas.height + 50; if(p.y > canvas.height + 50) p.y = -50;
      const tw = 0.85 + 0.35 * Math.sin((Date.now()/900) + p.baseR);
      ctx.beginPath(); ctx.fillStyle = p.col; ctx.globalAlpha = 0.95 * tw; ctx.arc(p.x,p.y,p.r*tw,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.globalAlpha = 0.06 * tw; ctx.fillStyle = p.col; ctx.arc(p.x,p.y,(p.r*8)*tw,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
    }
    // lines for close particles
    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length;j++){
        const a = particles[i], b = particles[j];
        const d = Math.hypot(a.x-b.x, a.y-b.y);
        if(d < 90){
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(160,255,230,' + (0.05*(1 - d/90)) + ')';
          ctx.lineWidth = 0.5;
          ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
  window.__setParticleMode = mode => {
    colors = mode === 'day' ? colorsLight : colorsDark;
    for(const p of particles) p.col = colors[Math.floor(Math.random()*colors.length)];
  };
})();

// Clouds: visible and behind hero content but above cosmic
(function(){
  const layer = document.getElementById('cloud-layer'); if(!layer) return;
  layer.style.zIndex = 250;
  function makeCloud(leftPct, topPct, w, o, dir){
    const el = document.createElement('div'); el.className='cloud';
    el.style.left = leftPct + '%'; el.style.top = topPct + '%'; el.style.width = w + 'px'; el.style.height = (w*0.45) + 'px'; el.style.opacity = o;
    el.style.filter = 'blur(18px)';
    layer.appendChild(el);
    const dist = 120 + Math.random()*260;
    const dur = 60000 + Math.random()*70000;
    const from = dir === 'left' ? 0 : -dist;
    const to = dir === 'left' ? -dist : 0;
    el.animate([{ transform: `translateX(${from}px)` },{ transform: `translateX(${to}px)` }], { duration: dur, iterations: Infinity });
    return el;
  }
  makeCloud(6,12,900,0.24,'left'); makeCloud(82,6,700,0.22,'right'); makeCloud(46,18,600,0.2,'left');
})();

// Lightning: subtle strikes from clouds (drawn on separate canvas on each strike)
(function(){
  const cloudLayer = document.getElementById('cloud-layer'); if(!cloudLayer) return;
  const canvas = document.createElement('canvas'); canvas.style.position='absolute'; canvas.style.left='0'; canvas.style.top='0'; canvas.width = innerWidth; canvas.height = innerHeight; canvas.style.pointerEvents='none'; canvas.style.zIndex = 260; cloudLayer.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  addEventListener('resize', ()=>{ canvas.width = innerWidth; canvas.height = innerHeight; });
  function strike(x,y){
    ctx.strokeStyle = 'white'; ctx.lineWidth = 1.6; ctx.shadowColor = 'rgba(0,186,255,0.9)'; ctx.shadowBlur = 18;
    for(let b=0;b<3+Math.floor(Math.random()*4); b++){
      let px = x, py = y; ctx.beginPath(); ctx.moveTo(px,py);
      for(let i=0;i<8;i++){ px += (Math.random()-0.5)*36; py += 10 + Math.random()*30; ctx.lineTo(px,py); }
      ctx.stroke();
    }
    setTimeout(()=> ctx.clearRect(0,0,canvas.width,canvas.height), 800);
  }
  setInterval(()=>{ if(Math.random() < 0.35){ strike(Math.random()*innerWidth, Math.random()*innerHeight*0.35); } }, 4000);
})();

// Cursor trail (kept)
(function(){
  const canvas = document.getElementById('trail-canvas'); if(!canvas) return;
  const ctx = canvas.getContext('2d');
  function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
  resize(); addEventListener('resize', resize);
  const points = [];
  if(/Mobi|Android/i.test(navigator.userAgent)) return;
  addEventListener('mousemove', e=>{ points.push({ x:e.clientX, y:e.clientY, t:Date.now() }); });
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const now = Date.now();
    for(let i=points.length-1;i>=0;i--){
      const p = points[i]; const age = now - p.t;
      if(age > 900){ points.splice(i,1); continue; }
      const alpha = 1 - age/900;
      ctx.beginPath(); ctx.fillStyle = 'rgba(0,255,204,' + (alpha*0.6) + ')'; ctx.arc(p.x,p.y,6*(alpha*0.9),0,Math.PI*2); ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// Day scene (rendered only when day-mode active)
(function(){
  const canvas = document.getElementById('day-canvas'); if(!canvas) return;
  const ctx = canvas.getContext('2d');
  function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
  resize(); addEventListener('resize', resize);
  let t = 0;
  function render(){
    if(!document.body.classList.contains('day-mode')){ requestAnimationFrame(render); t++; return; }
    const w = canvas.width, h = canvas.height;
    // sky
    const g = ctx.createLinearGradient(0,0,0,h*0.6); g.addColorStop(0,'#9fd9ff'); g.addColorStop(1,'#fff5e6'); ctx.fillStyle = g; ctx.fillRect(0,0,w,h*0.6);
    // hills
    ctx.fillStyle = '#8fcf7a'; ctx.beginPath(); ctx.ellipse(w*0.22,h*0.75,w*0.6,h*0.35,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#7ac46a'; ctx.beginPath(); ctx.ellipse(w*0.72,h*0.78,w*0.5,h*0.28,0,0,Math.PI*2); ctx.fill();
    // lake
    ctx.fillStyle = '#6fc8ff'; ctx.beginPath(); ctx.ellipse(w*0.5,h*0.85,w*0.25,h*0.06,0,0,Math.PI*2); ctx.fill();
    // grass
    ctx.fillStyle = '#4caf50'; ctx.fillRect(0,h*0.88,w,h*0.12);
    // birds simple
    for(let i=0;i<5;i++){
      const bx = (t*0.5 + i*180) % (w+200) - 100;
      const by = 80 + (i%2)*18 + Math.sin((t+i*8)/60)*10;
      ctx.strokeStyle = '#222'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx,by); ctx.quadraticCurveTo(bx+8,by-6,bx+16,by); ctx.quadraticCurveTo(bx+24,by-6,bx+32,by); ctx.stroke();
    }
    // bench + programmer (simple)
    const benchX = w*0.18, benchY = h*0.85;
    ctx.fillStyle = '#8b5a2b'; ctx.fillRect(benchX,benchY-12,160,12); ctx.fillRect(benchX+10,benchY-40,16,40); ctx.fillRect(benchX+134,benchY-40,16,40);
    ctx.fillStyle = '#263238'; ctx.beginPath(); ctx.arc(benchX+80,benchY-48,14,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#455a64'; ctx.fillRect(benchX+68,benchY-40,24,30);
    ctx.fillStyle = '#1b1f23'; ctx.fillRect(benchX+86,benchY-28,44,6); ctx.fillRect(benchX+96,benchY-48,28,20);
    ctx.fillStyle = '#6b3e26'; ctx.fillRect(benchX+50,benchY-30,8,10);
    t++; requestAnimationFrame(render);
  }
  render();
})();

// Theme toggle: switch classes and adjust particles
(function(){
  const btn = document.getElementById('theme-toggle'); if(!btn) return;
  btn.addEventListener('click', ()=>{
    const isDay = document.body.classList.toggle('day-mode');
    btn.setAttribute('aria-pressed', isDay ? 'true' : 'false');
    btn.textContent = isDay ? '🌙' : '☀️';
    if(window.__setParticleMode) window.__setParticleMode(isDay ? 'day' : 'dark');
  });
})();

// GitHub refresh: fills projects list with public repos (i-damale)
(function(){
  const btn = document.getElementById('refresh-repos'); const list = document.getElementById('projects-list'); const user = 'i-damale';
  async function fetchRepos(){
    btn.disabled = true; btn.textContent = '...';
    try{
      const res = await fetch('https://api.github.com/users/' + user + '/repos?per_page=100');
      if(!res.ok) throw new Error('GitHub API ' + res.status);
      const repos = await res.json();
      repos.sort((a,b)=> new Date(b.pushed_at) - new Date(a.pushed_at));
      list.innerHTML = '';
      repos.forEach(r => {
        const a = document.createElement('a'); a.className = 'card project-card'; a.href = r.html_url; a.target = '_blank'; a.rel='noopener'; a.textContent = r.name + (r.description ? ' — ' + r.description.slice(0,80) : '');
        list.appendChild(a);
      });
      btn.textContent = '🔁';
    }catch(e){
      console.error(e); btn.textContent = 'Err';
      setTimeout(()=> btn.textContent='🔁', 1200);
    }finally{ btn.disabled=false; }
  }
  btn.addEventListener('click', fetchRepos);
})();

// Ensure view projects CTA scrolls
(function(){ const cta = document.getElementById('view-projects-cta'); if(cta) cta.addEventListener('click', ()=>{ document.getElementById('projects').scrollIntoView({behavior:'smooth'}); }); })();
