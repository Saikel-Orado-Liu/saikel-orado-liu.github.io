export function initLightbox() {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.85);cursor:zoom-out;justify-content:center;align-items:center;';
  const img = document.createElement('img');
  img.style.cssText = 'max-width:90vw;max-height:90vh;object-fit:contain;border-radius:8px;box-shadow:0 8px 40px rgba(0,0,0,.5);';
  overlay.appendChild(img);
  overlay.addEventListener('click', () => overlay.style.display = 'none');
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') overlay.style.display = 'none'; });
  document.body.appendChild(overlay);

  document.querySelectorAll<HTMLImageElement>('.article-content img').forEach(el => {
    el.style.cursor = 'zoom-in';
    el.addEventListener('click', () => {
      const src = el.getAttribute('src');
      if (src) { img.src = src; overlay.style.display = 'flex'; }
    });
  });
}
