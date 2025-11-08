
// --- Typewriter (preserved behavior) ---
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

// --- Particle / fireflies with interactivity ---
(function particlesInit(){
  const canvas = document.getElementById('particle-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = canvas.width = innerWidth;
  let h = canvas.height = innerHeight;
  window.addEventListener('resize', ()=>{ w=canvas.width=innerWidth; h=canvas.height=innerHeight; });
  const colors = ['#00fff0','#8b00ff','#66fcf1','#b9a0ff'];
  const mouse = { x: w/2, y: h/2, down:false };
  addEventListener('mousemove', (e)=>{ mouse.x=e.clientX; mouse.y=e.clientY; });
  addEventListener('mousedown', ()=>{ mouse.down=true; });
  addEventListener('mouseup', ()=>{ mouse.down=false; });

  const particles = [];
  for(let i=0;i<120;i++){
    particles.push({
      x: Math.random()*w,
      y: Math.random()*h,
      r: Math.random()*2.2+0.6,
      dx: (Math.random()-0.5)*0.5,
      dy: (Math.random()-0.5)*0.5,
      col: colors[Math.floor(Math.random()*colors.length)],
      baseR: Math.random()*2+0.6
    });
  }

  function draw(){
    ctx.clearRect(0,0,w,h);
    // subtle starlines grid
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#000';
    ctx.fillRect(0,0,w,h);

    // particles
    particles.forEach(p=>{
      // attraction to mouse when nearby
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if(dist < 160){
        p.x += dx * 0.02;
        p.y += dy * 0.02;
      } else {
        p.x += p.dx;
        p.y += p.dy;
      }
      // wrap
      if(p.x < -10) p.x = w+10;
      if(p.x > w+10) p.x = -10;
      if(p.y < -10) p.y = h+10;
      if(p.y > h+10) p.y = -10;

      // twinkle
      const tw = Math.sin((Date.now()/600) + p.r)*0.6 + 0.6;
      ctx.beginPath();
      ctx.fillStyle = p.col;
      ctx.globalAlpha = 0.9*tw;
      ctx.arc(p.x,p.y,p.r*tw,0,Math.PI*2);
      ctx.fill();
      // glow
      ctx.beginPath();
      ctx.globalAlpha = 0.06*tw;
      ctx.fillStyle = p.col;
      ctx.arc(p.x,p.y,(p.r*10)*tw,0,Math.PI*2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // connecting lines for close particles (galaxy feel)
    for(let a=0;a<particles.length;a++){
      for(let b=a+1;b<particles.length;b++){
        const pa = particles[a], pb = particles[b];
        const dx = pa.x - pb.x, dy = pa.y - pb.y;
        const d = Math.sqrt(dx*dx+dy*dy);
        if(d < 120){
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(160,255,230,' + (0.08*(1 - d/120)) + ')';
          ctx.lineWidth = 0.7;
          ctx.moveTo(pa.x, pa.y);
          ctx.lineTo(pb.x, pb.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }
  draw();
})();

// --- Theme toggle ---
(function themeToggle(){
  const btn = document.getElementById('theme-toggle');
  if(!btn) return;
  btn.addEventListener('click', ()=>{
    document.body.classList.toggle('light-mode');
    const pressed = document.body.classList.contains('light-mode');
    btn.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    btn.textContent = pressed ? '🌙' : '☀️';
  });
})();

// --- Ensure CTA buttons clickable (fix overlay issues) ---
(function ensureClickable(){
  // make sure interactive controls are above canvas
  const cta = document.getElementById('view-projects-cta');
  if(cta){
    cta.addEventListener('click', ()=>{
      const el = document.getElementById('projects');
      if(el) el.scrollIntoView({behavior:'smooth'});
    });
  }
  // LinkedIn link pointer events ensured via CSS; nothing else required.
})();

// --- Typewriter hover interactivity (pause/resume) ---
(function typewriterHover(){
  const el = document.getElementById('typewriter');
  if(!el) return;
  let paused = false;
  el.addEventListener('mouseenter', ()=>{
    el.classList.add('hovered');
  });
  el.addEventListener('mouseleave', ()=>{
    el.classList.remove('hovered');
  });
})();

// --- Contact form (no backend here) ---
(function contactForm(){
  const form = document.getElementById('contact-form');
  if(!form) return;
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const status = document.getElementById('contact-status');
    status.textContent = 'Demo: form would be sent to backend (configure API_BASE in production).';
    form.reset();
    setTimeout(()=> status.textContent = '', 4000);
  });
})();
