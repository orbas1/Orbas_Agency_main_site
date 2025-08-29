async function loadLayout(){
  try {
    const headerHtml = await fetch('/header.html').then(r => r.text());
    document.getElementById('header').innerHTML = headerHtml;
    const footerHtml = await fetch('/footer.html').then(r => r.text());
    document.getElementById('footer').innerHTML = footerHtml;
  } catch(err) {
    console.error('Layout load failed', err);
  }
}
loadLayout();
