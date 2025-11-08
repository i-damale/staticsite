// ----------------- TYPEWRITER (robust) -----------------
(function(){
  const el = document.getElementById('typewriter');
  if(!el) return;
  const textsRaw = el.getAttribute('data-text');
  let texts;
  try { texts = JSON.parse(textsRaw); } catch(e){ texts = [textsRaw]; }
  let tIndex = 0, charIndex = 0, direction = 1; // direction 1 typing, -1 deleting
  const speed = 70; // base speed in ms
  function tick(){
    const cur = texts[tIndex];
    if(direction === 1){ // typing
      charIndex++;
      if(charIndex > cur.length){
        direction = -1;
        setTimeout(tick, 900);
        return;
      }
    } else { // deleting
      charIndex--;
      if(charIndex === 0){
        direction = 1;
        tIndex = (tIndex + 1) % texts.length;
      }
    }

    // render with special rules
    let display = cur.slice(0, charIndex);
    if(tIndex === 0){ // keep first 'X' neon pink if present and within typed chars
      if(display.includes('X')){
        display = display.replace('X', '<span class="neon-pink">X</span>');
      }
    }
    if(tIndex === 2){ // split at '|' to color left part neon-orange
      const parts = cur.split('|');
      const leftLen = parts[0].length;
      if(charIndex <= leftLen){
        display = '<span class="neon-orange">' + parts[0].slice(0, charIndex) + '</span>';
      } else {
        display = '<span class="neon-orange">' + parts[0] + '</span>' + parts[1].slice(0, charIndex - leftLen);
      }
    }
    el.innerHTML = display;
    setTimeout(tick, speed + (direction === -1 ? 20 : 0));
  }
  tick();
})();

// ----------------- PARTICLES (repel, variable sizes) -----------------
(function(){
  const canvas = document.getElementById('particle-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  function resize(){ W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
  resize(); addEventListener('resize', resize);

  const particles = [];
  const N = Math.max(90, Math.floor((innerWidth*innerHeight)/9000));
  for(let i=0;i<N;i++){
    const size = (Math.random() < 0.7) ? (Math.random()*1.2 + 0.6) : (Math.random()*3 + 1.4);
    particles.push({
      x: Math.random()*W,
      y: Math.random()*H,
      r: size,
      vx: (Math.random()-0.5)*0.6,
      vy: (Math.random()-0.5)*0.6,
      baseR: size,
      col: (Math.random() < 0.5) ? '#00fff0' : (Math.random() < 0.5 ? '#8b00ff' : '#66fcf1')
    });
  }

  const mouse = { x: -9999, y: -9999 };
  addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  addEventListener('mouseleave', ()=> { mouse.x = -9999; mouse.y = -9999; });

  function step(){
    ctx.clearRect(0,0,W,H);
    for(const p of particles){
      // repulsion from mouse
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const dist = Math.hypot(dx,dy);
      if(mouse.x > -9998 && dist < 160){
        const force = (160 - dist)/160;
        const ang = Math.atan2(dy,dx);
        p.vx += Math.cos(ang) * (0.9 * force);
        p.vy += Math.sin(ang) * (0.9 * force);
      } else {
        p.vx += (Math.random()-0.5) * 0.01;
        p.vy += (Math.random()-0.5) * 0.01;
      }
      p.vx *= 0.985; p.vy *= 0.985;
      p.x += p.vx; p.y += p.vy;

      // wrap
      if(p.x < -50) p.x = W + 50;
      if(p.x > W + 50) p.x = -50;
      if(p.y < -50) p.y = H + 50;
      if(p.y > H + 50) p.y = -50;

      const tw = 0.85 + 0.35 * Math.sin((Date.now()/900) + p.baseR);
      ctx.beginPath(); ctx.fillStyle = p.col; ctx.globalAlpha = 0.96 * tw; ctx.arc(p.x,p.y,p.r*tw,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.globalAlpha = 0.06 * tw; ctx.fillStyle = p.col; ctx.arc(p.x,p.y,(p.r*8)*tw,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
    }
    requestAnimationFrame(step);
  }
  step();

})();

// ----------------- SCENE (day: sun, clouds, hills, lake, birds) -----------------
(function(){
  const canvas = document.getElementById('scene-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  function resize(){ W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
  resize(); addEventListener('resize', resize);

  let t = 0;
  // cloud definitions
  const clouds = Array.from({length:5}, (_,i)=>({
    x: Math.random()*innerWidth,
    y: 50 + Math.random()*130,
    w: 260 + Math.random()*420,
    dir: Math.random()>.5 ? 1 : -1,
    speed: 0.06 + Math.random()*0.12
  }));

  function draw(){
    ctx.clearRect(0,0,W,H);
    if(document.body.classList.contains('day-mode')){
      // sky
      const g = ctx.createLinearGradient(0,0,0,H*0.7); g.addColorStop(0,'#9fd9ff'); g.addColorStop(1,'#fff5e6');
      ctx.fillStyle = g; ctx.fillRect(0,0,W,H*0.7);

      // sun
      const sunX = W * 0.82;
      const sunY = 110 + Math.sin(t/1200)*6;
      ctx.beginPath(); ctx.fillStyle = 'rgba(255,200,80,0.98)'; ctx.shadowBlur = 40; ctx.shadowColor = 'rgba(255,200,80,0.22)'; ctx.arc(sunX,sunY,52,0,Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;

      // clouds (move & possibly dim the sun lightly when overlapping)
      let sunDim = 0;
      clouds.forEach((c,i)=>{
        c.x += c.dir * c.speed * (1 + Math.sin(t/800)*0.08);
        if(c.x > W + 200) c.x = -300 - Math.random()*100;
        if(c.x < -400) c.x = W + 100 + Math.random()*100;
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.beginPath(); ctx.ellipse(c.x, c.y, c.w*0.55, c.w*0.26, 0, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(c.x + c.w*0.22, c.y - 8, c.w*0.35, c.w*0.18, 0, 0, Math.PI*2); ctx.fill();

        // overlap with sun
        const dx = c.x - sunX, dy = c.y - sunY, dist = Math.hypot(dx,dy);
        const cover = Math.max(0, ((52 + c.w*0.2) - dist) / (52 + c.w*0.2));
        sunDim = Math.max(sunDim, cover);
      });

      if(sunDim > 0.02){
        ctx.beginPath(); ctx.fillStyle = 'rgba(0,0,0,' + (sunDim*0.08) + ')'; ctx.arc(sunX,sunY,52*2.2,0,Math.PI*2); ctx.fill();
      }

      // hills
      ctx.fillStyle = '#8fcf7a'; ctx.beginPath(); ctx.ellipse(W*0.22,H*0.75,W*0.6,H*0.35,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#7ac46a'; ctx.beginPath(); ctx.ellipse(W*0.72,H*0.78,W*0.5,H*0.28,0,0,Math.PI*2); ctx.fill();

      // lake
      ctx.fillStyle = '#6fc8ff'; ctx.beginPath(); ctx.ellipse(W*0.5,H*0.85,W*0.25,H*0.06,0,0,Math.PI*2); ctx.fill();

      // foreground grass
      ctx.fillStyle = '#4caf50'; ctx.fillRect(0,H*0.88,W,H*0.12);

      // birds - simple shapes moving
      ctx.strokeStyle = '#222'; ctx.lineWidth = 1.5;
      for(let i=0;i<5;i++){
        const bx = (t*0.6 + i*180) % (W + 160) - 80;
        const by = 90 + Math.sin((t/80) + i) * 8;
        ctx.beginPath(); ctx.moveTo(bx,by); ctx.quadraticCurveTo(bx+8,by-6,bx+16,by); ctx.quadraticCurveTo(bx+24,by-6,bx+32,by); ctx.stroke();
      }
    }
    t++;
    requestAnimationFrame(draw);
  }
  draw();
})();

// ----------------- SKILLS (fill from resume-like list) -----------------
(function(){
  const skills = [
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform",
    "Ansible", "Jenkins", "CI/CD", "Git", "Linux", "Python",
    "Bash/Shell", "SQL", "Prometheus", "Grafana", "Monitoring", "DevSecOps"
  ];
  const container = document.getElementById('skills-list');
  if(!container) return;
  container.innerHTML = '';
  skills.forEach(s => {
    const d = document.createElement('div'); d.className = 'card'; d.textContent = s;
    container.appendChild(d);
  });
})();

// ----------------- THEME, VIEW PROJECTS, REFRESH PROJECTS -----------------
(function(){
  const themeBtn = document.getElementById('theme-toggle');
  const viewBtn = document.getElementById('view-projects-cta');
  const projectsSection = document.getElementById('projects');
  const refreshBtn = document.getElementById('refresh-repos');
  const projectsList = document.getElementById('projects-list');

  // theme toggle
  if(themeBtn){
    themeBtn.addEventListener('click', ()=>{
      const isDay = document.body.classList.toggle('day-mode');
      themeBtn.textContent = isDay ? '🌙' : '☀️';
    });
  }

  // view projects — scroll with offset to account for fixed header
  if(viewBtn && projectsSection){
    viewBtn.addEventListener('click', ()=>{
      const headerOffset = document.getElementById('top-nav')?.offsetHeight || 78;
      const elementPosition = projectsSection.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerOffset - 10; // small extra padding
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    });
  }

  // refresh projects (fetch from GitHub) — button is in projects-header; ensure clickable
  if(refreshBtn && projectsList){
    refreshBtn.addEventListener('click', async ()=>{
      refreshBtn.disabled = true;
      const old = refreshBtn.textContent;
      refreshBtn.textContent = 'Loading...';
      try{
        const res = await fetch('https://api.github.com/users/i-damale/repos?per_page=100');
        if(!res.ok) throw new Error('GitHub error ' + res.status);
        const data = await res.json();
        data.sort((a,b)=> new Date(b.pushed_at) - new Date(a.pushed_at));
        projectsList.innerHTML = '';
        data.forEach(r => {
          const a = document.createElement('a');
          a.className = 'card project-card';
          a.href = r.html_url;
          a.target = '_blank';
          a.rel = 'noopener';
          a.textContent = r.name + (r.description ? ' — ' + r.description.slice(0,80) : '');
          projectsList.appendChild(a);
        });
      }catch(e){
        projectsList.innerHTML = '<p style="color:#ff9999">Failed to fetch repositories. Please try again later.</p>';
        console.error(e);
      } finally {
        refreshBtn.disabled = false;
        refreshBtn.textContent = old;
      }
    });
  }

})();
