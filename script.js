// script.js — fixed stable world build
// Typewriter
(function(){
  const el = document.getElementById('typewriter'); if(!el) return;
  const raw = JSON.parse(el.getAttribute('data-text'));
  let idx=0,ch=0,forward=true;
  const interval = 95;
  function step(){
    const cur = raw[idx];
    if(forward){ ch++; if(ch>cur.length){ forward=false; setTimeout(step,1200); return; } } else { ch--; if(ch===0){ forward=true; idx=(idx+1)%raw.length; } }
    let out='';
    if(idx===0){
      let used=false;
      for(let i=0;i<ch;i++){ const c = cur[i]; if(c==='X' && !used){ out += '<span class="neon-pink">X</span>'; used=true; } else out += c.replace(/</g,'&lt;'); }
    } else if(idx===2){
      const parts = cur.split('|'); const left = parts[0], right = parts[1] || '';
      if(ch <= left.length) out = left.slice(0,ch).replace(/</g,'&lt;');
      else out = '<span class="neon-orange">'+left+'</span>' + right.slice(0,ch-left.length).replace(/</g,'&lt;');
    } else {
      out = cur.slice(0,ch).replace(/</g,'&lt;');
    }
    el.innerHTML = out;
    setTimeout(step, interval);
  }
  step();
})();

// Particles (full screen, repulsion)
(function(){
  const canvas = document.getElementById('particle-canvas'); if(!canvas) return;
  const ctx = canvas.getContext('2d');
  function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
  resize(); addEventListener('resize', resize);
  const colorsDark = ['#00fff0','#8b00ff','#66fcf1','#b9a0ff'];
  const colorsLight = ['#003f2f','#1a237e','#0b3b6f','#274e13'];
  let colors = colorsDark;
  const mouse = {x:-9999,y:-9999};
  addEventListener('mousemove',(e)=>{ mouse.x=e.clientX; mouse.y=e.clientY; });
  addEventListener('mouseleave',()=>{ mouse.x=-9999; mouse.y=-9999; });
  const parts = [];
  const N = Math.max(120, Math.floor((innerWidth*innerHeight)/7000));
  for(let i=0;i<N;i++){
    const sc = Math.random();
    const r = sc<0.6 ? (Math.random()*1.2+0.4) : sc<0.92 ? (Math.random()*2.4+1.2) : (Math.random()*4.4+3.0);
    parts.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, r, vx:(Math.random()-0.5)*0.6, vy:(Math.random()-0.5)*0.6, col: colors[Math.floor(Math.random()*colors.length)], baseR:r });
  }
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(const p of parts){
      const dx = p.x - mouse.x, dy = p.y - mouse.y, dist = Math.hypot(dx,dy);
      if(mouse.x>-9999 && dist < 160){
        const force = (160 - dist)/160;
        const angle = Math.atan2(dy,dx);
        p.vx += Math.cos(angle)*(0.9*force); p.vy += Math.sin(angle)*(0.9*force);
      } else {
        p.vx += (Math.random()-0.5)*0.01; p.vy += (Math.random()-0.5)*0.01;
      }
      p.vx *= 0.985; p.vy *= 0.985; p.x += p.vx; p.y += p.vy;
      if(p.x < -50) p.x = canvas.width + 50; if(p.x > canvas.width + 50) p.x = -50;
      if(p.y < -50) p.y = canvas.height + 50; if(p.y > canvas.height + 50) p.y = -50;
      const tw = 0.85 + 0.35 * Math.sin((Date.now()/900) + p.baseR);
      ctx.beginPath(); ctx.fillStyle = p.col; ctx.globalAlpha = 0.95 * tw; ctx.arc(p.x,p.y,p.r*tw,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.globalAlpha = 0.06 * tw; ctx.fillStyle = p.col; ctx.arc(p.x,p.y,(p.r*8)*tw,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
    }
    for(let i=0;i<parts.length;i++){
      for(let j=i+1;j<parts.length;j++){
        const a = parts[i], b = parts[j];
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
    const palette = mode === 'day' ? colorsLight : colorsDark;
    for(const p of parts) p.col = palette[Math.floor(Math.random()*palette.length)];
  };
})();

// Day scene (sun, moving clouds that can cover sun, hills, lake, birds, swans, kids)
(function(){
  const canvas = document.getElementById('day-canvas'); if(!canvas) return;
  const ctx = canvas.getContext('2d');
  function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
  resize(); addEventListener('resize', resize);

  // entities
  const clouds = [];
  const birds = [];
  const waterfowl = [];
  const kids = [];
  let t = 0;
  function initEntities(){
    clouds.length = 0; birds.length = 0; waterfowl.length = 0; kids.length = 0;
    for(let i=0;i<5;i++){
      clouds.push({x: Math.random()*innerWidth, y: 40 + Math.random()*120, w: 300 + Math.random()*500, dir: Math.random()>.5?1:-1, speed: 0.08 + Math.random()*0.14});
    }
    for(let i=0;i<6;i++){ birds.push({x: Math.random()*innerWidth*0.8, y: 40 + Math.random()*120, speed: 0.4 + Math.random()*0.9, phase: Math.random()*Math.PI*2}); }
    for(let i=0;i<4;i++){ waterfowl.push({x: innerWidth*0.45 + Math.random()*innerWidth*0.1, y: innerHeight*0.84 + Math.random()*6, vx: (Math.random()-0.5)*0.5, state:'calm', fleeTimer:0}); }
    for(let i=0;i<3;i++){ kids.push({x: innerWidth*(0.28 + i*0.12), y: innerHeight*0.78 + Math.random()*12, phase: Math.random()*Math.PI*2}); }
  }
  initEntities();

  // sun variables
  const sun = {x: innerWidth*0.82, y: innerHeight*0.18, r: 48, orbitT: 0};

  // draw loop
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(!document.body.classList.contains('day-mode')){ requestAnimationFrame(draw); t++; return; }

    const w = canvas.width, h = canvas.height;
    // sky gradient (painted anime-like)
    const g = ctx.createLinearGradient(0,0,0,h*0.6); g.addColorStop(0,'#9fd9ff'); g.addColorStop(1,'#fff5e6'); ctx.fillStyle = g; ctx.fillRect(0,0,w,h*0.6);

    // hills
    ctx.fillStyle = '#8fcf7a'; ctx.beginPath(); ctx.ellipse(w*0.22,h*0.75,w*0.6,h*0.35,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#7ac46a'; ctx.beginPath(); ctx.ellipse(w*0.72,h*0.78,w*0.5,h*0.28,0,0,Math.PI*2); ctx.fill();

    // lake
    ctx.fillStyle = '#6fc8ff'; ctx.beginPath(); ctx.ellipse(w*0.5,h*0.85,w*0.25,h*0.06,0,0,Math.PI*2); ctx.fill();

    // foreground grass
    ctx.fillStyle = '#4caf50'; ctx.fillRect(0,h*0.88,w,h*0.12);

    // sun movement (orbitT increases slowly); smooth day->night transitions use CSS opacity + we keep sun drawn while day-mode true
    sun.orbitT += 0.0009;
    sun.x = w*0.82 - ( (t/1000) % (w*0.5) );
    sun.y = h*0.18 + Math.sin(t/1200)*6;

    // draw sun
    ctx.beginPath(); ctx.fillStyle = 'rgba(255,200,80,0.98)'; ctx.arc(sun.x, sun.y, sun.r, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.fillStyle = 'rgba(255,220,140,0.06)'; ctx.arc(sun.x, sun.y, sun.r*3.8, 0, Math.PI*2); ctx.fill();

    // clouds that can hide the sun: draw clouds and compute overlap to slightly dim the sun via simple opacity
    let sunDim = 0;
    for(const c of clouds){
      c.x += c.dir * c.speed * (1 + Math.sin(t/800)*0.12);
      if(c.x > w + 150) c.x = -200 - Math.random()*200;
      if(c.x < -300) c.x = w + 100 + Math.random()*200;
      // draw cloud: layered ellipses
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.beginPath(); ctx.ellipse(c.x, c.y, c.w*0.55, c.w*0.26, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(c.x + c.w*0.22, c.y - 8, c.w*0.35, c.w*0.18, 0, 0, Math.PI*2); ctx.fill();
      // compute simple overlap with sun
      const dx = c.x - sun.x; const dy = c.y - sun.y; const dist = Math.hypot(dx, dy);
      const cover = Math.max(0, ( (sun.r + c.w*0.2) - dist ) / (sun.r + c.w*0.2) );
      sunDim = Math.max(sunDim, cover);
    }

    // apply slight dim over sun if clouds overlap
    if(sunDim > 0.02){
      ctx.beginPath(); ctx.fillStyle = 'rgba(0,0,0,' + (sunDim*0.12) + ')'; ctx.arc(sun.x, sun.y, sun.r*2.2, 0, Math.PI*2); ctx.fill();
    }

    // birds (animated across sky)
    for(const b of birds){
      b.x += b.speed; b.y += Math.sin((t + b.phase)/60)*6;
      if(b.x > w + 80) b.x = -80;
      ctx.strokeStyle = '#222'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.quadraticCurveTo(b.x+8,b.y-6,b.x+16,b.y); ctx.quadraticCurveTo(b.x+24,b.y-6,b.x+32,b.y); ctx.stroke();
    }

    // waterfowl in lake
    for(const f of waterfowl){
      if(f.state === 'flee'){ f.vx = (f.vx*0.9) + ((Math.random()*2-1)*2); f.x += f.vx; f.y -= 0.6; f.fleeTimer--; if(f.fleeTimer<=0) f.state='calm'; }
      else { f.x += f.vx; f.x += Math.sin(t/400 + f.x)*0.1; }
      if(f.x < w*0.35) f.x = w*0.75; if(f.x > w*0.75) f.x = w*0.35;
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(f.x, f.y, 10,6,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(f.x+6,f.y-2,2,0,Math.PI*2); ctx.fill();
    }

    // kids silhouettes
    for(const k of kids){
      k.phase += 0.06;
      const kx = k.x + Math.sin(t/300 + k.phase)*6; const ky = k.y + Math.sin(t/160 + k.phase)*3;
      ctx.fillStyle = '#262626'; ctx.beginPath(); ctx.arc(kx, ky-10, 8,0,Math.PI*2); ctx.fill(); ctx.fillRect(kx-6, ky-6, 12,14);
    }

    t++;
    requestAnimationFrame(draw);
  }

  draw();

  // on mouse move near waterfowl — trigger flee
  window.addEventListener('mousemove', e=>{
    const mx = e.clientX, my = e.clientY;
    for(const f of waterfowl){
      const d = Math.hypot(f.x - mx, f.y - my);
      if(d < 80){ f.state='flee'; f.fleeTimer = 120; f.vx = (f.x - mx)/20; }
    }
  });

  // re-init entities on resize to reposition them correctly
  addEventListener('resize', ()=>{
    initEntities();
  });

})();

// Cursor trail
(function(){
  const canvas = document.getElementById('trail-canvas'); if(!canvas) return;
  const ctx = canvas.getContext('2d');
  function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
  resize(); addEventListener('resize', resize);
  const points = [];
  if(/Mobi|Android/i.test(navigator.userAgent)) return;
  addEventListener('mousemove', e => { points.push({ x:e.clientX, y:e.clientY, t:Date.now() }); });
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

// Simple chirps & crickets (WebAudio) — soft, low-volume, toggleable
(function(){
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if(!AudioContext) return;
  const ac = new AudioContext();
  const master = ac.createGain(); master.gain.value = 0.0; master.connect(ac.destination); // start muted
  let enabled = false;
  const btn = document.getElementById('sound-toggle'); if(!btn) return;
  // chirp generator (bird)
  function birdChirp(time = 0){
    const o = ac.createOscillator(); o.type = 'sine';
    const g = ac.createGain(); g.gain.value = 0;
    o.frequency.setValueAtTime(1200, ac.currentTime + time);
    o.frequency.exponentialRampToValueAtTime(1800, ac.currentTime + 0.06 + time);
    o.connect(g); g.connect(master);
    g.gain.setValueAtTime(0.0001, ac.currentTime + time);
    g.gain.exponentialRampToValueAtTime(0.02, ac.currentTime + time + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + time + 0.28);
    o.start(ac.currentTime + time); o.stop(ac.currentTime + time + 0.32);
  }
  // cricket tick
  function cricketTick(time = 0){
    const o = ac.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(1400, ac.currentTime + time);
    const g = ac.createGain(); g.gain.value = 0;
    o.connect(g); g.connect(master);
    g.gain.setValueAtTime(0.0001, ac.currentTime + time);
    g.gain.exponentialRampToValueAtTime(0.007, ac.currentTime + time + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + time + 0.18);
    o.start(ac.currentTime + time); o.stop(ac.currentTime + time + 0.22);
  }

  // schedules: day => bird chirps occasional, night => cricket ticks random
  let dayInterval = null, nightInterval = null;
  function startDaySounds(){
    stopAll(); // clear both just in case
    dayInterval = setInterval(()=>{
      if(!enabled) return;
      birdChirp();
    }, 2500 + Math.random()*2600);
  }
  function startNightSounds(){
    stopAll();
    nightInterval = setInterval(()=>{
      if(!enabled) return;
      cricketTick();
    }, 900 + Math.random()*1600);
  }
  function stopAll(){ if(dayInterval){ clearInterval(dayInterval); dayInterval=null; } if(nightInterval){ clearInterval(nightInterval); nightInterval=null; } }

  // toggle button handler
  btn.addEventListener('click', async ()=>{
    if(ac.state === 'suspended') await ac.resume();
    enabled = !enabled;
    master.gain.linearRampToValueAtTime(enabled ? 1 : 0, ac.currentTime + 0.2);
    btn.textContent = enabled ? '🔊' : '🔈';
    const isDay = document.body.classList.contains('day-mode');
    if(enabled){ if(isDay) startDaySounds(); else startNightSounds(); }
    else stopAll();
  });

  // observe theme changes: switch day/night chirps smoothly if enabled
  const obs = new MutationObserver(()=> {
    const isDay = document.body.classList.contains('day-mode');
    if(!enabled) return;
    if(isDay){ startDaySounds(); } else { startNightSounds(); }
  });
  obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
})();

// Theme toggle smooth transition
(function(){
  const btn = document.getElementById('theme-toggle'); if(!btn) return;
  btn.addEventListener('click', ()=>{
    const isDay = document.body.classList.toggle('day-mode');
    btn.setAttribute('aria-pressed', isDay ? 'true' : 'false');
    btn.textContent = isDay ? '🌙' : '☀️';
    if(window.__setParticleMode) window.__setParticleMode(isDay ? 'day' : 'dark');
    // crossfade handled by CSS opacity transition for #day-canvas
  });
})();

// Game (Color Flood) — responsive canvas, animation, win chime
(function(){
  const btn = document.getElementById('game-button'); const modal = document.getElementById('game-modal');
  const canvas = document.getElementById('game-canvas'); const ctx = canvas.getContext('2d');
  const movesEl = document.getElementById('game-moves'); const controls = document.getElementById('game-controls');
  const restartBtn = document.getElementById('game-restart'); const closeBtn = document.getElementById('game-close');
  const COLORS = ['#f28b82','#fbbc04','#fff475','#ccff90','#a7ffeb','#aecbfa'];
  const SIZE = 10;
  let grid = [], moves = 0, animating=false;

  function initGrid(){
    grid = [];
    for(let y=0;y<SIZE;y++){ const row=[]; for(let x=0;x<SIZE;x++) row.push(Math.floor(Math.random()*COLORS.length)); grid.push(row); }
    moves = 0; movesEl.textContent = moves; drawGrid();
  }
  function resizeCanvas(){
    const target = Math.min(600, Math.floor(window.innerWidth * 0.86));
    canvas.width = target; canvas.height = target;
    drawGrid();
  }
  window.addEventListener('resize', resizeCanvas);

  function drawGrid(){
    const cw = canvas.width, ch = canvas.height;
    const cellW = cw/SIZE, cellH = ch/SIZE;
    for(let y=0;y<SIZE;y++){
      for(let x=0;x<SIZE;x++){
        ctx.fillStyle = COLORS[grid[y][x]];
        ctx.fillRect(x*cellW, y*cellH, cellW, cellH);
        ctx.strokeStyle = 'rgba(0,0,0,0.06)'; ctx.strokeRect(x*cellW, y*cellH, cellW, cellH);
      }
    }
  }

  // flood: BFS selection then animate a few steps
  function flood(target){
    if(animating) return;
    const start = grid[0][0]; if(start === target) return;
    const h = SIZE, w = SIZE;
    const visited = Array.from({length:h}, ()=> Array(w).fill(false));
    const stack = [[0,0]]; visited[0][0] = true;
    while(stack.length){
      const [sx,sy] = stack.pop();
      [[1,0],[-1,0],[0,1],[0,-1]].forEach(d=>{
        const nx = sx + d[0], ny = sy + d[1];
        if(nx>=0 && ny>=0 && nx<w && ny<h && !visited[ny][nx]){
          if(grid[ny][nx] === start){ visited[ny][nx] = true; stack.push([nx,ny]); }
        }
      });
    }
    const cells = [];
    for(let y=0;y<h;y++) for(let x=0;x<w;x++) if(visited[y][x]) cells.push([x,y]);
    animating = true;
    const steps = 8; let step = 0;
    const anim = setInterval(()=>{
      step++;
      for(const [x,y] of cells){
        if(step >= steps) grid[y][x] = target;
        else if(Math.random() < step/steps) grid[y][x] = target;
      }
      drawGrid();
      if(step >= steps){ clearInterval(anim); animating=false; moves++; movesEl.textContent = moves; checkWin(); }
    }, 60);
  }

  function checkWin(){
    const first = grid[0][0];
    for(let y=0;y<SIZE;y++) for(let x=0;x<SIZE;x++) if(grid[y][x] !== first) return false;
    // win: chime
    playWinChime();
    setTimeout(()=> alert('You won in '+moves+' moves — nice! 🎉'), 300);
    return true;
  }

  // win chime
  function playWinChime(){
    try{
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ac = new AudioContext();
      const o = ac.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(800, ac.currentTime);
      const g = ac.createGain(); g.gain.value = 0;
      o.connect(g); g.connect(ac.destination);
      g.gain.setValueAtTime(0.0001, ac.currentTime); g.gain.linearRampToValueAtTime(0.03, ac.currentTime + 0.02);
      o.frequency.exponentialRampToValueAtTime(1200, ac.currentTime + 0.22);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.9);
      o.start(); o.stop(ac.currentTime + 1.0);
    }catch(e){ /* ignore */ }
  }

  // build control buttons
  COLORS.forEach((c,idx)=>{
    const b = document.createElement('button');
    b.style.background = c; b.style.border = 'none'; b.style.width='36px'; b.style.height='36px'; b.style.margin='6px'; b.style.borderRadius='8px';
    b.title = 'Use color';
    b.addEventListener('click', ()=> flood(idx) );
    controls.appendChild(b);
  });

  restartBtn.addEventListener('click', ()=> initGrid());
  closeBtn.addEventListener('click', ()=> { modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); });
  btn.addEventListener('click', ()=> { modal.classList.add('show'); modal.setAttribute('aria-hidden','false'); initGrid(); resizeCanvas(); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape'){ modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); } });

  // initial canvas sizing
  resizeCanvas();
  initGrid();
})();

// Game-button bounce near bottom
(function(){
  const btn = document.getElementById('game-button'); if(!btn) return;
  let ticking=false;
  window.addEventListener('scroll', ()=>{
    if(ticking) return; ticking=true;
    requestAnimationFrame(()=>{
      const sc = window.scrollY + window.innerHeight; const h = document.documentElement.scrollHeight;
      if(sc >= h - 120){ btn.classList.add('bounce'); setTimeout(()=> btn.classList.remove('bounce'), 900); }
      ticking=false;
    });
  });
})();

// GitHub refresh
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
        const a = document.createElement('a'); a.className = 'card project-card'; a.href = r.html_url; a.target = '_blank'; a.rel='noopener';
        a.textContent = r.name + (r.description ? ' — ' + r.description.slice(0,80) : '');
        list.appendChild(a);
      });
      btn.textContent = '🔁';
    }catch(e){ console.error(e); btn.textContent = 'Err'; setTimeout(()=> btn.textContent='🔁', 1200); }
    finally{ btn.disabled=false; }
  }
  btn.addEventListener('click', fetchRepos);
})();

// View projects CTA scroll
(function(){ const cta = document.getElementById('view-projects-cta'); if(cta) cta.addEventListener('click', ()=>{ document.getElementById('projects').scrollIntoView({behavior:'smooth'}); }); })();
