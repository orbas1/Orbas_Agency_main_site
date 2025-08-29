function initHeroNodes(id, opts = {}) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const config = Object.assign({
    nodeColor: '#ffffff',
    lineColor: 'rgba(255,255,255,0.2)',
    nodeCount: 40,
    maxVelocity: 0.4,
    connectionDistance: 120
  }, opts);
  let nodes = [];

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    nodes = Array.from({ length: config.nodeCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * config.maxVelocity,
      vy: (Math.random() - 0.5) * config.maxVelocity
    }));
  }

  window.addEventListener('resize', resize);
  resize();

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x <= 0 || n.x >= canvas.width) n.vx *= -1;
      if (n.y <= 0 || n.y >= canvas.height) n.vy *= -1;

      ctx.beginPath();
      ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = config.nodeColor;
      ctx.fill();
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < config.connectionDistance) {
          ctx.strokeStyle = config.lineColor;
          ctx.lineWidth = 0.5;
          ctx.globalAlpha = 1 - dist / config.connectionDistance;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }

    requestAnimationFrame(draw);
  }

  draw();
}
