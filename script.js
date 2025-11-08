
/* Restored script: preserves original behavior and re-adds particles + typewriter if missing,
   also applies unified hover behavior to all cards and adds theme toggle handling.
*/

// --- Preserve existing skill-card behavior if present ---
try {
  document.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('mouseenter', () => { card.style.boxShadow = '0 0 20px #00ffcc'; });
    card.addEventListener('mouseleave', () => { card.style.boxShadow = 'none'; });
  });
} catch(e){ console.warn(e); }

// --- Apply unified hover effect for various card types via JS (in case CSS can't target inline styles) ---
['card','skill-card','project-card','timeline-card','tile'].forEach(cls => {
  document.querySelectorAll('.' + cls).forEach(el => {
    el.addEventListener('mouseenter', () => {
      el.style.boxShadow = '0 0 20px #00ffcc';
      el.style.transform = 'scale(1.05)';
      el.style.background = '#00ffcc';
      el.style.color = '#000';
      el.style.borderColor = '#00ffcc';
    });
    el.addEventListener('mouseleave', () => {
      el.style.boxShadow = '';
      el.style.transform = '';
      el.style.background = '';
      el.style.color = '';
      el.style.borderColor = '';
    });
  });
});

// --- Theme toggle: create button if not present ---
(function(){
  let toggle = document.getElementById('theme-toggle');
  if(!toggle){
    // try to find nav to attach toggle
    const nav = document.querySelector('nav') || document.querySelector('header') || document.body;
    toggle = document.createElement('button');
    toggle.id = 'theme-toggle';
    toggle.textContent = '☀️';
    toggle.style.marginLeft = '12px';
    if(nav && nav.appendChild) nav.appendChild(toggle);
  }
  toggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    if (document.body.classList.contains('light-mode')) {
      toggle.textContent = '🌙';
    } else {
      toggle.textContent = '☀️';
    }
  });
})();

// --- Typewriter restore: if missing, add to header h1 ---
(function(){
  function initTypewriter(el, arr){
    let i=0,j=0,forward=true;
    function step(){
      const cur = arr[i];
      if(forward){ j++; el.textContent = cur.slice(0,j); if(j===cur.length){ forward=false; setTimeout(step,1200); return; } }
      else { j--; el.textContent = cur.slice(0,j); if(j===0){ forward=true; i=(i+1)%arr.length; } }
      setTimeout(step,60);
    }
    step();
  }

  let tw = document.getElementById('typewriter');
  if(!tw){
    // find header h1 and create a twin typewriter span below it
    const header = document.getElementById('hero') || document.querySelector('header');
    if(header){
      const h1 = header.querySelector('h1');
      if(h1){
        tw = document.createElement('div');
        tw.id = 'typewriter';
        tw.setAttribute('aria-hidden','false');
        tw.style.marginTop = '12px';
        // prepare texts: use existing h1 text as first item, and a fallback list
        const t1 = h1.textContent.trim();
        const arr = [t1, 'DevOps · Cloud · DevSecOps · AI', 'Engineering the Future: Where Cloud Meets Intelligence'];
        // empty h1 (keep original visible) and insert typewriter after it
        // Do not modify original h1 text content (preserve), just place typewriter
        h1.insertAdjacentElement('afterend', tw);
        initTypewriter(tw, arr);
      }
    }
  } else {
    // if exists and has data-text attribute, use it
    const data = tw.getAttribute('data-text');
    if(data){
      try{
        const arr = JSON.parse(data);
        initTypewriter(tw, arr);
      }catch(e){ console.warn('typewriter data-text parse failed',e); }
    }
  }
})();

// --- Particle / fireflies background in header overlay ---
(function(){
  const header = document.getElementById('hero') || document.querySelector('header');
  if(!header) return;
  let overlay = header.querySelector('.overlay');
  if(!overlay){
    overlay = document.createElement('div');
    overlay.className = 'overlay';
    header.prepend(overlay);
  }
  // create canvas
  let canvas = overlay.querySelector('canvas#particle-canvas');
  if(!canvas){
    canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.zIndex = '0';
    overlay.appendChild(canvas);
  }
  const ctx = canvas.getContext('2d');
  let w = canvas.width = overlay.clientWidth || header.clientWidth || window.innerWidth;
  let h = canvas.height = overlay.clientHeight || header.clientHeight || 400;
  const particles = [];
  const colors = ['#00ffcc','#66fcf1','#7a00ff'];
  function rand(a,b){return Math.random()*(b-a)+a;}
  for(let i=0;i<60;i++){
    particles.push({x:rand(0,w), y:rand(0,h), r:rand(0.6,2.6), dx:rand(-0.3,0.3), dy:rand(-0.2,0.2), col: colors[Math.floor(Math.random()*colors.length)]});
  }
  function resize(){ w = canvas.width = overlay.clientWidth || window.innerWidth; h = canvas.height = overlay.clientHeight || window.innerHeight; }
  window.addEventListener('resize', resize);
  function draw(){
    ctx.clearRect(0,0,w,h);
    particles.forEach(p=>{
      p.x += p.dx; p.y += p.dy;
      if(p.x > w) p.x = 0;
      if(p.x < 0) p.x = w;
      if(p.y > h) p.y = 0;
      if(p.y < 0) p.y = h;
      ctx.beginPath();
      ctx.fillStyle = p.col;
      ctx.globalAlpha = 0.9;
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = p.col;
      ctx.globalAlpha = 0.06;
      ctx.arc(p.x,p.y,p.r*8,0,Math.PI*2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });
    requestAnimationFrame(draw);
  }
  draw();
})();
