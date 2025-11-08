
// Main script for Somnath portfolio world v1
// Typewriter (slower, neon X and neon-orange part)
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
      for(let i=0;i<ch;i++){ const c = cur[i]; if(c==='X' && !used){ out += '<span class=\"neon-pink\">X</span>'; used=true; } else out += c.replace(/</g,'&lt;'); }
    } else if(idx===2){
      const parts = cur.split('|'); const left=parts[0], right=parts[1]||'';
      if(ch<=left.length) out = left.slice(0,ch).replace(/</g,'&lt;');
      else out = '<span class=\"neon-orange\">'+left+'</span>' + right.slice(0,ch-left.length).replace(/</g,'&lt;');
    } else out = cur.slice(0,ch).replace(/</g,'&lt;');
    el.innerHTML = out;
    setTimeout(step, interval);
  }
  step();
})();

// Particles full-screen, repulsion
(function(){
  const canvas = document.getElementById('particle-canvas'); if(!canvas) return;
  const ctx = canvas.getContext('2d');
  function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
  resize(); addEventListener('resize', resize);
  const colorsDark = ['#00fff0','#8b00ff','#66fcf1','#b9a0ff'];
  const colorsLight = ['#003f2f','#1a237e','#0b3b6f','#274e13'];
  let colors = colorsDark;
  const mouse={x:-9999,y:-9999}; addEventListener('mousemove', e=>{ mouse.x=e.clientX; mouse.y=e.clientY; }); addEventListener('mouseleave', ()=>{ mouse.x=-9999; mouse.y=-9999; });
  const particles=[]; const N = Math.max(140, Math.floor((innerWidth*innerHeight)/7000));
  for(let i=0;i<N;i++){ const sc=Math.random(); const r = sc<0.6 ? (Math.random()*1.2+0.4) : sc<0.92 ? (Math.random()*2.4+1.2) : (Math.random()*4.4+3.0); particles.push({x:Math.random()*canvas.width, y:Math.random()*canvas.height, r, vx:(Math.random()-0.5)*0.6, vy:(Math.random()-0.5)*0.6, col: colors[Math.floor(Math.random()*colors.length)], baseR:r}); }
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(const p of particles){
      const dx=p.x-mouse.x, dy=p.y-mouse.y, dist=Math.hypot(dx,dy);
      if(mouse.x>-9999 && dist<160){
        const force=(160-dist)/160; const angle=Math.atan2(dy,dx);
        p.vx += Math.cos(angle)*(0.9*force); p.vy += Math.sin(angle)*(0.9*force);
      } else { p.vx += (Math.random()-0.5)*0.01; p.vy += (Math.random()-0.5)*0.01; }
      p.vx*=0.985; p.vy*=0.985; p.x+=p.vx; p.y+=p.vy;
      if(p.x<-50) p.x=canvas.width+50; if(p.x>canvas.width+50) p.x=-50; if(p.y<-50) p.y=canvas.height+50; if(p.y>canvas.height+50) p.y=-50;
      const tw=0.85 + 0.35*Math.sin((Date.now()/900)+p.baseR);
      ctx.beginPath(); ctx.fillStyle=p.col; ctx.globalAlpha=0.95*tw; ctx.arc(p.x,p.y,p.r*tw,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.globalAlpha=0.06*tw; ctx.fillStyle=p.col; ctx.arc(p.x,p.y,(p.r*8)*tw,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha=1;
    }
    for(let i=0;i<particles.length;i++){ for(let j=i+1;j<particles.length;j++){ const a=particles[i], b=particles[j]; const d=Math.hypot(a.x-b.x,a.y-b.y); if(d<90){ ctx.beginPath(); ctx.strokeStyle='rgba(160,255,230,'+(0.05*(1-d/90))+')'; ctx.lineWidth=0.5; ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); } } }
    requestAnimationFrame(draw);
  }
  draw();
  window.__setParticleMode = mode => {
    const colorsDark = ['#00fff0','#8b00ff','#66fcf1','#b9a0ff'];
    const colorsLight = ['#003f2f','#1a237e','#0b3b6f','#274e13'];
    const c = mode==='day' ? colorsLight : colorsDark;
    for(const p of particles) p.col = c[Math.floor(Math.random()*c.length)];
  };
})();

// Clouds (visible, moving) and lightning subtle
(function(){
  const layer = document.getElementById('cloud-layer'); if(!layer) return;
  layer.style.zIndex = 250;
  function makeCloud(l,t,w,opacity,dir){
    const el = document.createElement('div'); el.className='cloud'; el.style.left = l + '%'; el.style.top = t + '%'; el.style.width = w + 'px'; el.style.height = (w*0.45)+'px'; el.style.opacity = opacity; el.style.background = 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.14), rgba(255,255,255,0.04))'; el.style.borderRadius='50%'; el.style.filter='blur(18px)';
    layer.appendChild(el);
    const dist = 120 + Math.random()*260; const dur = 60000 + Math.random()*70000; const from = dir==='left'?0:-dist; const to = dir==='left'?-dist:0;
    el.animate([{transform:`translateX(${from}px)`},{transform:`translateX(${to}px)`}], {duration: dur, iterations: Infinity});
    return el;
  }
  makeCloud(6,12,900,0.24,'left'); makeCloud(82,6,700,0.22,'right'); makeCloud(46,18,600,0.2,'left');
})();

// Day scene: sky, sun, clouds that can cover sun, hills, lake, birds, ducks/swans reacting, kids silhouettes
(function(){
  const canvas = document.getElementById('day-canvas'); if(!canvas) return;
  const ctx = canvas.getContext('2d'); function resize(){ canvas.width=innerWidth; canvas.height=innerHeight; } resize(); addEventListener('resize', resize);
  let t=0;
  // entities
  const birds = [];
  for(let i=0;i<6;i++){ birds.push({x:Math.random()*innerWidth, y:40 + Math.random()*140, speed:1+Math.random()*1.6, phase:Math.random()*Math.PI*2}); }
  const waterfowl = []; // ducks/swans in lake
  for(let i=0;i<4;i++){ waterfowl.push({x:innerWidth*0.4 + Math.random()*innerWidth*0.2, y:innerHeight*0.84 + Math.random()*10, vx:(Math.random()-0.5)*0.4, vy:0, state:'calm', fleeTimer:0}); }
  const kids = [];
  for(let i=0;i<3;i++){ kids.push({x:innerWidth*(0.3 + i*0.12), y:innerHeight*0.78 + Math.random()*20, phase:Math.random()*Math.PI*2}); }
  const sun = {x: innerWidth*0.82, y: innerHeight*0.18, r:48, angle:0.55}; // angle 0..1
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(!document.body.classList.contains('day-mode')){ requestAnimationFrame(draw); t++; return; }
    const w=canvas.width, h=canvas.height;
    // sky gradient
    const g = ctx.createLinearGradient(0,0,0,h*0.6); g.addColorStop(0,'#9fd9ff'); g.addColorStop(1,'#fff5e6'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h*0.6);
    // hills
    ctx.fillStyle = '#8fcf7a'; ctx.beginPath(); ctx.ellipse(w*0.22,h*0.75,w*0.6,h*0.35,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#7ac46a'; ctx.beginPath(); ctx.ellipse(w*0.72,h*0.78,w*0.5,h*0.28,0,0,Math.PI*2); ctx.fill();
    // lake (reflective)
    ctx.fillStyle = '#6fc8ff'; ctx.beginPath(); ctx.ellipse(w*0.5,h*0.85,w*0.25,h*0.06,0,0,Math.PI*2); ctx.fill();
    // grass foreground
    ctx.fillStyle = '#4caf50'; ctx.fillRect(0,h*0.88,w,h*0.12);
    // sun moves slowly across sky based on t (t/10000)
    const sunX = w*0.82 - (t/1500)% (w*0.5); const sunY = h*0.18 + Math.sin(t/1200)*6;
    sun.x = sunX; sun.y = sunY;
    // draw sun
    ctx.beginPath(); ctx.fillStyle = 'rgba(255,200,80,0.95)'; ctx.arc(sun.x, sun.y, sun.r, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.fillStyle = 'rgba(255,220,140,0.06)'; ctx.arc(sun.x, sun.y, sun.r*3.8, 0, Math.PI*2); ctx.fill();
    // moving birds across sky
    for(const b of birds){
      b.x += b.speed; b.y += Math.sin((t+b.phase)/60)*6;
      if(b.x > w + 80) b.x = -80;
      ctx.strokeStyle = '#222'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.quadraticCurveTo(b.x+8,b.y-6,b.x+16,b.y); ctx.quadraticCurveTo(b.x+24,b.y-6,b.x+32,b.y); ctx.stroke();
    }
    // waterfowl in lake with simple flocking and flee behavior
    for(const f of waterfowl){
      if(f.state === 'flee'){ f.vx = (f.vx*0.9) + ((Math.random()*2-1)*2); f.x += f.vx; f.y -= 0.6; f.fleeTimer--; if(f.fleeTimer<=0) f.state='calm'; }
      else { f.x += f.vx; f.x += Math.sin(t/400 + f.x)*0.1; }
      // wrap
      if(f.x < w*0.35) f.x = w*0.75; if(f.x > w*0.75) f.x = w*0.35;
      // draw simple duck/swans shapes
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(f.x, f.y, 10,6,0,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(f.x+6,f.y-2,2,0,Math.PI*2); ctx.fill();
    }
    // kids silhouettes on hills (animated)
    for(const k of kids){
      k.phase += 0.06;
      const kx = k.x + Math.sin(t/300 + k.phase)*6; const ky = k.y + Math.sin(t/160 + k.phase)*3;
      ctx.fillStyle = '#262626'; ctx.beginPath(); ctx.arc(kx, ky-10, 8,0,Math.PI*2); ctx.fill(); ctx.fillRect(kx-6, ky-6, 12,14);
    }
    t++;
    requestAnimationFrame(draw);
  }
  draw();

  // duck flee on mouse near
  window.addEventListener('mousemove', e=>{
    const mx = e.clientX, my = e.clientY;
    for(const f of waterfowl){
      const d = Math.hypot(f.x - mx, f.y - my);
      if(d < 80){ f.state='flee'; f.fleeTimer = 140; f.vx = (f.x - mx)/20; }
    }
  });
})();

// Ambient sound using Web Audio API (synth hum at night, birds + wind at day), with mute toggle
(function(){
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if(!AudioContext) return;
  const ac = new AudioContext();
  let masterGain = ac.createGain(); masterGain.gain.value = 0; masterGain.connect(ac.destination); // start muted
  // create night synth hum (sine + lowpass)
  const synth = ac.createOscillator(); synth.type = 'sine'; synth.frequency.value = 110; const synthGain = ac.createGain(); synthGain.gain.value = 0.02; const lp = ac.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value = 600; synth.connect(synthGain); synthGain.connect(lp); lp.connect(masterGain); synth.start();
  // birds/wind: noise + filters for day ambience (we'll trigger via scheduled gain)
  const bufferSize = 2*ac.sampleRate; const noiseBuffer = ac.createBuffer(1, bufferSize, ac.sampleRate); const data = noiseBuffer.getChannelData(0); for(let i=0;i<bufferSize;i++) data[i] = (Math.random()*2-1)*0.2;
  const noiseSource = ac.createBufferSource(); noiseSource.buffer = noiseBuffer; noiseSource.loop = true;
  const noiseFilter = ac.createBiquadFilter(); noiseFilter.type='bandpass'; noiseFilter.frequency.value = 1000; const noiseGain = ac.createGain(); noiseGain.gain.value = 0.0; noiseSource.connect(noiseFilter); noiseFilter.connect(noiseGain); noiseGain.connect(masterGain); noiseSource.start();
  // helpers to set day/night volumes
  function setDay(on){
    if(on){ // day: birds/wind audible, synth low
      synthGain.gain.linearRampToValueAtTime(0.002, ac.currentTime+1.2);
      noiseGain.gain.linearRampToValueAtTime(0.035, ac.currentTime+1.2);
    } else {
      synthGain.gain.linearRampToValueAtTime(0.02, ac.currentTime+1.2);
      noiseGain.gain.linearRampToValueAtTime(0.0, ac.currentTime+1.2);
    }
  }
  // master mute toggle button
  const btn = document.getElementById('sound-toggle'); if(!btn) return;
  let enabled = false; // start muted
  btn.addEventListener('click', async ()=>{
    if(ac.state === 'suspended') await ac.resume();
    enabled = !enabled;
    masterGain.gain.linearRampToValueAtTime(enabled?1:0, ac.currentTime+0.3);
    btn.textContent = enabled? '🔊' : '🔈';
    // when enabling, set current mode volumes appropriately
    const isDay = document.body.classList.contains('day-mode');
    setDay(isDay && enabled);
  });
  // listen to theme changes
  const observer = new MutationObserver(()=>{
    const isDay = document.body.classList.contains('day-mode');
    setDay(isDay && enabled);
  });
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
})();

// Theme toggle: smooth transition and update particles mode; trigger sun animation handled in day canvas
(function(){
  const btn = document.getElementById('theme-toggle'); if(!btn) return;
  btn.addEventListener('click', ()=>{
    const isDay = document.body.classList.toggle('day-mode');
    btn.setAttribute('aria-pressed', isDay ? 'true' : 'false');
    btn.textContent = isDay ? '🌙' : '☀️';
    if(window.__setParticleMode) window.__setParticleMode(isDay ? 'day' : 'dark');
    // small crossfade by toggling display handled by canvases
  });
})();

// Game: animated Color Flood (enhanced)
(function(){
  const btn = document.getElementById('game-button'); const modal = document.getElementById('game-modal'); const canvas = document.getElementById('game-canvas'); const ctx = canvas.getContext('2d');
  const movesEl = document.getElementById('game-moves'); const controls = document.getElementById('game-controls'); const restartBtn = document.getElementById('game-restart'); const closeBtn = document.getElementById('game-close');
  const COLORS = ['#f28b82','#fbbc04','#fff475','#ccff90','#a7ffeb','#aecbfa']; // pastel
  const SIZE = 10;
  let grid = []; let moves = 0; let animating=false;
  function initGrid(){
    grid = []; for(let y=0;y<SIZE;y++){ const row=[]; for(let x=0;x<SIZE;x++){ row.push(Math.floor(Math.random()*COLORS.length)); } grid.push(row); } moves=0; movesEl.textContent = moves; drawGrid(); }
  function drawGrid(){
    const cw = canvas.width, ch = canvas.height; const cellW = cw/SIZE, cellH = ch/SIZE;
    for(let y=0;y<SIZE;y++){ for(let x=0;x<SIZE;x++){ ctx.fillStyle = COLORS[grid[y][x]]; ctx.fillRect(x*cellW,y*cellH,cellW,cellH); ctx.strokeStyle='rgba(0,0,0,0.06)'; ctx.strokeRect(x*cellW,y*cellH,cellW,cellH); } }
  }
  function flood(targetColor){
    if(animating) return;
    const startColor = grid[0][0]; if(startColor === targetColor) return;
    const w = SIZE, h = SIZE;
    const visited = Array.from({length:h},()=>Array(w).fill(false));
    const toVisit = [[0,0]]; visited[0][0]=true;
    while(toVisit.length){
      const [sx,sy] = toVisit.pop();
      const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
      for(const d of dirs){ const nx = sx + d[0], ny = sy + d[1]; if(nx>=0 && ny>=0 && nx<w && ny<h && !visited[ny][nx]){ if(grid[ny][nx]===startColor){ visited[ny][nx]=true; toVisit.push([nx,ny]); } } }
    }
    // now change all visited to targetColor with animation
    animating=true;
    const cells = []; for(let yy=0;yy<h;yy++){ for(let xx=0;xx<w;xx++){ if(visited[yy][xx]) cells.push([xx,yy]); } }
    const steps = 8; let step=0;
    const original = cells.map(([x,y])=>grid[y][x]);
    const anim = setInterval(()=>{
      step++;
      for(let i=0;i<cells.length;i++){
        const [x,y] = cells[i];
        if(step>=steps) grid[y][x]=targetColor;
        else {
          // interpolate color by blending towards target (quick approach: no color math - just occasional fill)
          if(Math.random() < step/steps) grid[y][x]=targetColor;
        }
      }
      drawGrid();
      if(step>=steps){ clearInterval(anim); animating=false; moves++; movesEl.textContent = moves; checkWin(); }
    }, 60);
  }
  function checkWin(){
    const first = grid[0][0]; for(let y=0;y<SIZE;y++) for(let x=0;x<SIZE;x++) if(grid[y][x]!==first) return false;
    // win
    setTimeout(()=>{ alert('You won in '+moves+' moves — nice! 🎉'); }, 200);
    return true;
  }
  // build color buttons
  COLORS.forEach((c,idx)=>{ const b = document.createElement('button'); b.style.background=c; b.style.border='none'; b.style.width='36px'; b.style.height='36px'; b.style.margin='6px'; b.style.borderRadius='8px'; b.title='Use color'; b.addEventListener('click', ()=> flood(idx)); controls.appendChild(b); });
  restartBtn.addEventListener('click', ()=> initGrid());
  closeBtn.addEventListener('click', ()=> { modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); });
  btn.addEventListener('click', ()=>{ modal.classList.add('show'); modal.setAttribute('aria-hidden','false'); initGrid(); });
  // keyboard close
  document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); } });
  // responsive canvas sizing
  function resizeCanvas(){ const box = canvas.getBoundingClientRect(); canvas.width = Math.min(600, window.innerWidth*0.8); canvas.height = canvas.width; drawGrid(); }
  window.addEventListener('resize', resizeCanvas); resizeCanvas();
  initGrid();
})();

// game-button bounce when user scrolls past bottom (near bottom)
(function(){
  const btn = document.getElementById('game-button'); if(!btn) return;
  let ticking=false;
  window.addEventListener('scroll', ()=>{
    if(ticking) return; ticking=true; requestAnimationFrame(()=>{
      const sc = window.scrollY + window.innerHeight; const h = document.documentElement.scrollHeight;
      if(sc >= h - 120){ btn.classList.add('bounce'); setTimeout(()=> btn.classList.remove('bounce'), 900); }
      ticking=false;
    });
  });
})();

// GitHub refresh (unchanged)
(function(){
  const btn = document.getElementById('refresh-repos'); const list = document.getElementById('projects-list'); const user = 'i-damale';
  async function fetchRepos(){
    btn.disabled=true; btn.textContent='...';
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
      console.error(e); btn.textContent = 'Err'; setTimeout(()=> btn.textContent='🔁', 1200);
    }finally{ btn.disabled=false; }
  }
  btn.addEventListener('click', fetchRepos);
})();

// view projects CTA scroll
(function(){ const cta = document.getElementById('view-projects-cta'); if(cta) cta.addEventListener('click', ()=>{ document.getElementById('projects').scrollIntoView({behavior:'smooth'}); }); })();
