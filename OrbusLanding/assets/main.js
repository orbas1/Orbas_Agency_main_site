document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if(menuBtn && mobileMenu){
    menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
    });
  }

  const toggle = document.getElementById('theme-toggle');
  const html = document.documentElement;
  if(localStorage.getItem('theme') === 'dark') html.classList.add('dark');
  toggle && toggle.addEventListener('click', () => {
    html.classList.toggle('dark');
    localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
  });

  if(!localStorage.getItem('cookie-consent')){
    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.className = 'fixed bottom-0 inset-x-0 bg-gray-800 text-white p-4 flex flex-col sm:flex-row items-center justify-between z-50';
    banner.innerHTML = '<p class="mb-2 sm:mb-0 text-sm">We use cookies to improve your experience. See our <a href="/cookies" class="underline">Cookie Policy</a>.</p><button id="accept-cookies" class="mt-2 sm:mt-0 bg-orbas-blue hover:bg-orbas-dark-blue text-white px-4 py-2 rounded">Accept</button>';
    document.body.appendChild(banner);
    document.getElementById('accept-cookies').addEventListener('click', () => {
      localStorage.setItem('cookie-consent','true');
      banner.remove();
    });
  }

  document.querySelectorAll('.countdown').forEach(el => {
    const end = new Date(el.dataset.end);
    const update = () => {
      const now = new Date();
      let diff = end - now;
      if(diff <= 0){
        el.textContent = 'Out Now!';
        return;
      }
      const pad = n => String(n).padStart(2, '0');
      const days = Math.floor(diff/86400000);
      diff %= 86400000;
      const hours = Math.floor(diff/3600000);
      diff %= 3600000;
      const mins = Math.floor(diff/60000);
      diff %= 60000;
      const secs = Math.floor(diff/1000);
      el.innerHTML = `${days}d<span class="mx-1 animate-pulse">:</span>${pad(hours)}h<span class="mx-1 animate-pulse">:</span>${pad(mins)}m<span class="mx-1 animate-pulse">:</span>${pad(secs)}s`;
    };
    update();
    setInterval(update, 1000);
  });

  document.querySelectorAll('[data-track]').forEach(el => {
    el.addEventListener('click', () => {
      console.log('track', el.dataset.track);
    });
  });

  const form = document.getElementById('lead-form');
  if(form){
    const submitBtn = document.getElementById('submit-btn');
    const messageEl = document.getElementById('form-message');
    const required = form.querySelectorAll('[required]');
    const privacy = document.getElementById('privacy');
    const csrf = document.createElement('input');
    csrf.type = 'hidden';
    csrf.name = 'csrf_token';
    csrf.value = Math.random().toString(36).substring(2);
    form.appendChild(csrf);
    const honeypot = document.createElement('input');
    honeypot.type = 'text';
    honeypot.name = 'website';
    honeypot.classList.add('hidden');
    form.appendChild(honeypot);

    const validate = () => {
      let valid = true;
      required.forEach(f => { if(!f.value.trim()) valid = false; });
      if(!privacy.checked) valid = false;
      submitBtn.disabled = !valid;
    };
    form.addEventListener('input', validate);
    privacy.addEventListener('change', validate);
    form.addEventListener('submit', e => {
      if(honeypot.value){ e.preventDefault(); return; }
      messageEl.textContent = 'Submitting...';
      messageEl.classList.remove('hidden');
    });
  }

  // Animated node background for hero sections
  document.querySelectorAll('.hero-network').forEach(canvas => {
    const ctx = canvas.getContext('2d');
    const color = canvas.dataset.color || '#ffffff';
    const count = parseInt(canvas.dataset.count || '40', 10);
    let w, h;
    const particles = [];

    const resize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for(let i=0;i<count;i++){
      particles.push({
        x: Math.random()*w,
        y: Math.random()*h,
        vx: (Math.random()-0.5)*0.5,
        vy: (Math.random()-0.5)*0.5
      });
    }

    const draw = () => {
      ctx.clearRect(0,0,w,h);
      for(let i=0;i<particles.length;i++){
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if(p.x<0 || p.x>w) p.vx*=-1;
        if(p.y<0 || p.y>h) p.vy*=-1;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI*2);
        ctx.fill();

        for(let j=i+1;j<particles.length;j++){
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if(dist < 100){
            ctx.strokeStyle = color;
            ctx.globalAlpha = 0.2;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }
      requestAnimationFrame(draw);
    };
    draw();
  });
});
