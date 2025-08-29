async function loadLayout(){
  try {
    const headerHtml = await fetch('/header.html').then(r => r.text());
    document.getElementById('header').innerHTML = headerHtml;
    const footerHtml = await fetch('/footer.html').then(r => r.text());
    document.getElementById('footer').innerHTML = footerHtml;
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if(menuBtn && mobileMenu){
      menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
      });
    }
  } catch(err) {
    console.error('Layout load failed', err);
  }
}
loadLayout();
