// assets/game/game.js
// Smooth cartoon-style Mario-like platformer (10 stages)

(function() {
  const modal = document.getElementById('game-modal');
  const wrapper = document.getElementById('game-wrapper');
  const closeBtn = document.getElementById('game-close');
  let canvas, ctx, keys = {}, player, level = 1, platforms, coins, enemies, flag, confetti = [], gameOver = false, won = false;

  // Settings
  const GRAVITY = 0.7;
  const JUMP = -13;
  const SPEED = 4;

  // Utility
  function rand(min, max) { return Math.random() * (max - min) + min; }

  function initCanvas() {
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');
    wrapper.innerHTML = '';
    wrapper.appendChild(canvas);
    resize();
    window.addEventListener('resize', resize);
  }

  function resize() {
    canvas.width = wrapper.clientWidth;
    canvas.height = wrapper.clientHeight;
  }

  // Level generator
  function createLevel() {
    platforms = [];
    coins = [];
    enemies = [];
    confetti = [];
    gameOver = false;
    won = false;

    const w = canvas.width;
    const h = canvas.height;
    const groundY = h - 50;

    // Platforms
    platforms.push({ x: 0, y: groundY, w: w, h: 50, color: '#4caf50' });
    for (let i = 1; i < 10; i++) {
      platforms.push({
        x: rand(100, w - 120),
        y: rand(150, groundY - 80),
        w: rand(100, 200),
        h: 20,
        color: '#8bc34a'
      });
    }

    // Coins
    for (let i = 0; i < 12; i++) {
      coins.push({
        x: rand(50, w - 50),
        y: rand(80, groundY - 80),
        r: 8,
        taken: false
      });
    }

    // Enemies
    for (let i = 0; i < 5; i++) {
      enemies.push({
        x: rand(50, w - 50),
        y: groundY - 30,
        w: 28,
        h: 28,
        vx: rand(-1, 1) > 0 ? 1 : -1
      });
    }

    // Flag
    flag = { x: w - 80, y: groundY - 100, h: 100 };

    // Player
    player = { x: 60, y: groundY - 40, w: 30, h: 40, vx: 0, vy: 0, onGround: false, score: 0 };
  }

  // Confetti system
  function spawnConfetti() {
    for (let i = 0; i < 200; i++) {
      confetti.push({
        x: rand(0, canvas.width),
        y: rand(-50, canvas.height),
        r: rand(2, 6),
        color: `hsl(${Math.floor(rand(0,360))},100%,60%)`,
        vy: rand(1, 4),
        vx: rand(-1.5, 1.5)
      });
    }
  }

  function updateConfetti() {
    for (const c of confetti) {
      c.x += c.vx;
      c.y += c.vy;
      if (c.y > canvas.height + 20) {
        c.y = -10;
        c.x = rand(0, canvas.width);
      }
    }
  }

  function drawConfetti() {
    for (const c of confetti) {
      ctx.beginPath();
      ctx.fillStyle = c.color;
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Input
  window.addEventListener('keydown', e => { keys[e.code] = true; });
  window.addEventListener('keyup', e => { keys[e.code] = false; });

  // Game loop
  function update() {
    if (gameOver) return;
    if (!player || !ctx) return;

    player.vx = 0;
    if (keys['ArrowLeft']) player.vx = -SPEED;
    if (keys['ArrowRight']) player.vx = SPEED;

    player.vy += GRAVITY;
    player.x += player.vx;
    player.y += player.vy;

    if (player.x < 0) player.x = 0;
    if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;

    player.onGround = false;
    for (const p of platforms) {
      if (player.x < p.x + p.w && player.x + player.w > p.x &&
          player.y + player.h > p.y && player.y + player.h < p.y + 20 &&
          player.vy >= 0) {
        player.y = p.y - player.h;
        player.vy = 0;
        player.onGround = true;
      }
    }

    if (keys['Space'] && player.onGround) {
      player.vy = JUMP;
      player.onGround = false;
    }

    // Coins
    for (const c of coins) {
      if (!c.taken && Math.hypot(player.x - c.x, player.y - c.y) < 30) {
        c.taken = true;
        player.score++;
      }
    }

    // Enemies
    for (const e of enemies) {
      e.x += e.vx;
      if (e.x < 0 || e.x + e.w > canvas.width) e.vx *= -1;
      if (player.x < e.x + e.w && player.x + player.w > e.x &&
          player.y < e.y + e.h && player.y + player.h > e.y) {
        gameOver = true;
        setTimeout(() => alert('Game Over! Restarting level...'), 200);
        setTimeout(createLevel, 1000);
      }
    }

    // Win condition
    if (player.x + player.w > flag.x && player.y + player.h > flag.y) {
      won = true;
      spawnConfetti();
      setTimeout(() => {
        level++;
        if (level > 10) {
          alert('🎊 Congratulations! You beat all 10 stages!');
          level = 1;
        }
        createLevel();
      }, 2500);
    }

    updateConfetti();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    const grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grd.addColorStop(0, '#87ceeb');
    grd.addColorStop(1, '#fff');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Hills
    ctx.fillStyle = '#8bc34a';
    ctx.beginPath();
    ctx.ellipse(canvas.width*0.3, canvas.height*0.9, 200, 80, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(canvas.width*0.7, canvas.height*0.95, 250, 100, 0, 0, Math.PI*2);
    ctx.fill();

    // Platforms
    for (const p of platforms) {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.w, p.h);
    }

    // Coins
    for (const c of coins) {
      if (c.taken) continue;
      ctx.beginPath();
      ctx.fillStyle = '#ffeb3b';
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Enemies
    for (const e of enemies) {
      ctx.fillStyle = '#e91e63';
      ctx.fillRect(e.x, e.y, e.w, e.h);
      ctx.fillStyle = '#fff';
      ctx.fillRect(e.x + 4, e.y + 8, 6, 6);
      ctx.fillRect(e.x + 16, e.y + 8, 6, 6);
    }

    // Flag
    ctx.fillStyle = '#9e9e9e';
    ctx.fillRect(flag.x, flag.y, 5, flag.h);
    ctx.fillStyle = '#f44336';
    ctx.beginPath();
    ctx.moveTo(flag.x + 5, flag.y);
    ctx.lineTo(flag.x + 45, flag.y + 15);
    ctx.lineTo(flag.x + 5, flag.y + 30);
    ctx.closePath();
    ctx.fill();

    // Player
    ctx.fillStyle = '#2196f3';
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.fillStyle = '#fff';
    ctx.fillRect(player.x + 6, player.y + 8, 6, 6);
    ctx.fillRect(player.x + 18, player.y + 8, 6, 6);

    // Score
    ctx.fillStyle = '#000';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(`Level: ${level}  Score: ${player.score}`, 20, 28);

    if (won) drawConfetti();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  // Public API
  window.startMarioGame = function() {
    initCanvas();
    createLevel();
    loop();
  };

  // Close & Quit
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('show');
    window.cancelAnimationFrame(loop);
  });
})();
