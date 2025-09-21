function initDataOrb(id, opts = {}) {
  const canvas = document.getElementById(id);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const config = Object.assign({
    nodeColor: '#60a5fa',
    lineColor: '#3b82f6',
    nodeCount: 140,
    nodeSize: 3,
    lineWidth: 1,
    connectionDistance: 0.58,
    rotationSpeedX: 0.00018,
    rotationSpeedY: 0.00042,
    rotationSpeedZ: 0.00012,
    sphereScale: 0.8,
    cameraDistance: 3.6,
    depthScale: 1,
    glowStrength: 18,
    initialRotationX: -0.35,
    initialRotationY: 0.7,
    initialRotationZ: 0.15
  }, opts);

  const dpr = window.devicePixelRatio || 1;
  const connectionLimit = Math.max(0.1, config.connectionDistance);
  let width = 0;
  let height = 0;
  let radius = 0;
  let rotationX = config.initialRotationX;
  let rotationY = config.initialRotationY;
  let rotationZ = config.initialRotationZ;
  let lastTime = performance.now();

  const baseNodeColor = parseColor(config.nodeColor);
  const baseLineColor = parseColor(config.lineColor);
  const nodes = createNodes(config.nodeCount);

  function createNodes(count) {
    const nodesArr = [];
    const offset = 2 / count;
    const increment = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = i * offset - 1 + offset / 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const phi = i * increment;
      const x = Math.cos(phi) * r;
      const z = Math.sin(phi) * r;
      nodesArr.push({
        x,
        y,
        z,
        wobbleOffset: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.5 + Math.random() * 0.9,
        wobbleMagnitude: 0.015 + Math.random() * 0.025
      });
    }
    return nodesArr;
  }

  function parseColor(value) {
    if (!value) return { r: 255, g: 255, b: 255, a: 1 };
    if (value.startsWith('#')) {
      let hex = value.slice(1);
      if (hex.length === 3) {
        hex = hex.split('').map((c) => c + c).join('');
      }
      const num = parseInt(hex, 16);
      return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
        a: 1
      };
    }
    const match = value.match(/rgba?\(([^)]+)\)/i);
    if (match) {
      const parts = match[1].split(',').map((part) => part.trim());
      const r = parseFloat(parts[0]);
      const g = parseFloat(parts[1]);
      const b = parseFloat(parts[2]);
      const a = parts[3] !== undefined ? parseFloat(parts[3]) : 1;
      return { r, g, b, a: isNaN(a) ? 1 : a };
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  }

  function colorWithAlpha(color, alpha) {
    const safeAlpha = Math.min(1, Math.max(0, alpha));
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${safeAlpha * (color.a !== undefined ? color.a : 1)})`;
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return;
    }
    width = rect.width;
    height = rect.height;
    radius = Math.min(width, height) / 2 * config.sphereScale;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 200));
  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
  }
  setTimeout(resize, 120);

  function transformNode(node, timeSeconds) {
    const wobble = Math.sin(timeSeconds * node.wobbleSpeed + node.wobbleOffset) * node.wobbleMagnitude;
    const scale = 1 + wobble;

    let x = node.x * scale;
    let y = node.y * scale;
    let z = node.z * scale;

    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    let dx = x * cosY - z * sinY;
    let dz = x * sinY + z * cosY;

    const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);
    let dy = y * cosX - dz * sinX;
    dz = y * sinX + dz * cosX;

    const cosZ = Math.cos(rotationZ);
    const sinZ = Math.sin(rotationZ);
    const rx = dx * cosZ - dy * sinZ;
    const ry = dx * sinZ + dy * cosZ;
    const rz = dz;

    const depth = config.cameraDistance / (config.cameraDistance - rz * config.depthScale);
    const screenX = rx * radius * depth + width / 2;
    const screenY = ry * radius * depth + height / 2;

    return {
      screenX,
      screenY,
      rotatedX: rx,
      rotatedY: ry,
      rotatedZ: rz,
      depth
    };
  }

  function render(time) {
    let delta = time - lastTime;
    if (!isFinite(delta) || delta <= 0) {
      delta = 16;
    } else {
      delta = Math.min(32, delta);
    }
    lastTime = time;
    rotationX += config.rotationSpeedX * delta;
    rotationY += config.rotationSpeedY * delta;
    rotationZ += config.rotationSpeedZ * delta;

    if (!width || !height) {
      requestAnimationFrame(render);
      return;
    }

    ctx.clearRect(0, 0, width, height);

    const timeSeconds = time * 0.001;
    const transformed = nodes.map((node) => transformNode(node, timeSeconds));

    for (let i = 0; i < transformed.length; i++) {
      for (let j = i + 1; j < transformed.length; j++) {
        const a = transformed[i];
        const b = transformed[j];
        const dx = a.rotatedX - b.rotatedX;
        const dy = a.rotatedY - b.rotatedY;
        const dz = a.rotatedZ - b.rotatedZ;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (distance < connectionLimit) {
          const intensity = 1 - distance / connectionLimit;
          const depthBoost = (a.depth + b.depth) * 0.5 - 1;
          const alpha = Math.min(1, 0.1 + intensity * 0.85 + depthBoost * 0.25);
          ctx.strokeStyle = colorWithAlpha(baseLineColor, alpha);
          ctx.lineWidth = config.lineWidth * (0.7 + intensity * 0.6);
          ctx.beginPath();
          ctx.moveTo(a.screenX, a.screenY);
          ctx.lineTo(b.screenX, b.screenY);
          ctx.stroke();
        }
      }
    }

    const sorted = transformed.slice().sort((a, b) => a.rotatedZ - b.rotatedZ);
    for (const node of sorted) {
      const depthNormal = (node.rotatedZ + 1) / 2;
      const radiusScale = Math.max(0.5, Math.min(1.5, node.depth));
      const nodeRadius = config.nodeSize * radiusScale;
      const glow = Math.max(0, (node.depth - 1) * config.glowStrength);
      const alpha = 0.35 + depthNormal * 0.55;

      ctx.save();
      ctx.shadowBlur = glow;
      ctx.shadowColor = colorWithAlpha(baseNodeColor, 0.6);
      ctx.fillStyle = colorWithAlpha(baseNodeColor, alpha);
      ctx.beginPath();
      ctx.arc(node.screenX, node.screenY, nodeRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.strokeStyle = colorWithAlpha(baseNodeColor, Math.min(0.45, alpha));
      ctx.lineWidth = 0.6;
      ctx.arc(node.screenX, node.screenY, nodeRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.fillStyle = colorWithAlpha(baseNodeColor, Math.min(1, alpha + 0.2));
      ctx.arc(node.screenX, node.screenY, nodeRadius * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}
