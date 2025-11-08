
// Simple particle system for canvas (cyberpunk feel)
const canvas = document.getElementById('particle-canvas');
if(canvas){
  const ctx = canvas.getContext('2d');
  let w = canvas.width = innerWidth;
  let h = canvas.height = innerHeight;
  let particles = [];
  const colors = ['#00fff0','#8b00ff','#66fcf1'];
  function rand(min,max){return Math.random()*(max-min)+min;}
  for(let i=0;i<80;i++){
    particles.push({
      x: Math.random()*w,
      y: Math.random()*h,
      r: rand(0.6,2.6),
      dx: rand(-0.2,0.6),
      dy: rand(-0.1,0.3),
      col: colors[Math.floor(Math.random()*colors.length)]
    });
  }
  function resize(){w=canvas.width=innerWidth;h=canvas.height=innerHeight}
  addEventListener('resize',resize);

  function draw(){
    ctx.clearRect(0,0,w,h);
    // subtle grid
    ctx.strokeStyle = 'rgba(100,120,140,0.035)';
    ctx.lineWidth=1;
    for(let x=0;x<w;x+=120){
      ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();
    }
    for(let y=0;y<h;y+=120){
      ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();
    }

    particles.forEach(p=>{
      p.x += p.dx; p.y += p.dy;
      if(p.x>w) p.x=0;
      if(p.x<0) p.x=w;
      if(p.y>h) p.y=0;
      ctx.beginPath();
      ctx.fillStyle = p.col;
      ctx.globalAlpha = 0.9;
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fill();
      // glow
      ctx.beginPath();
      ctx.fillStyle = p.col;
      ctx.globalAlpha = 0.06;
      ctx.arc(p.x,p.y,p.r*8,0,Math.PI*2);
      ctx.fill();
      ctx.globalAlpha=1;
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// Typewriter effect for header
function typeWriterInit(){
  const el = document.getElementById('typewriter');
  if(!el) return;
  const arr = JSON.parse(el.getAttribute('data-text'));
  let i=0, j=0, forward=true;
  function step(){
    const current = arr[i];
    if(forward){
      j++;
      el.textContent = current.slice(0,j);
      if(j===current.length){forward=false; setTimeout(step,1200); return;}
    } else {
      j--;
      el.textContent = current.slice(0,j);
      if(j===0){ forward=true; i=(i+1)%arr.length;}
    }
    setTimeout(step, 60);
  }
  step();
}
document.addEventListener('DOMContentLoaded', typeWriterInit);

// theme toggle (simple)
const themeBtn = document.getElementById('themeBtn');
if(themeBtn){
  themeBtn.addEventListener('click', ()=>{
    document.body.classList.toggle('theme-bright');
    themeBtn.textContent = document.body.classList.contains('theme-bright') ? '☀️' : '🌙';
  });
}
