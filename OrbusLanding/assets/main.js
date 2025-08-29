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
});
