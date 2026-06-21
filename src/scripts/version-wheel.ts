/**
 * Version wheel — CSS 3D cylinder for switching project doc versions
 * Supports: mouse wheel, mouse drag, touch drag, click, keyboard
 */

export function initVersionWheel(): void {
  const wheels = document.querySelectorAll('.doc-version-wheel');
  if (wheels.length === 0) return;

  for (const wheel of wheels) {
    if ((wheel as HTMLElement).dataset.init) continue;
    (wheel as HTMLElement).dataset.init = '1';

    const viewport = wheel.querySelector('.doc-version-wheel-viewport') as HTMLElement;
    const track = wheel.querySelector('.doc-version-wheel-track') as HTMLElement;
    const items = wheel.querySelectorAll('.doc-version-wheel-item') as NodeListOf<HTMLElement>;
    if (!viewport || !track || items.length === 0) continue;

    const project = (wheel as HTMLElement).dataset.project!;
    const current = (wheel as HTMLElement).dataset.current!;
    const currentDir = `v${current.split('.')[0]}`;
    const prefix = (wheel as HTMLElement).dataset.prefix || '';

    const itemH = 34;
    const vpCenter = viewport.offsetHeight / 2;
    let activeIdx = 0;
    items.forEach((item, i) => { if (item.dataset.version === currentDir) activeIdx = i; });
    let lastIdx = activeIdx;

    // ── Position track ──
    function positionAt(idx: number, smooth: boolean) {
      const offset = vpCenter - (idx * itemH) - (itemH / 2);
      track.style.transition = smooth ? 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)' : 'none';
      track.style.transform = `translateY(${offset}px)`;
      applyPerspective(idx);
    }

    // ── 3D cylinder ──
    function applyPerspective(center: number) {
      items.forEach((item, i) => {
        const d = i - center;
        const a = Math.abs(d);
        if (a === 0) {
          item.style.transform = 'rotateX(0) scale(1)';
          item.style.opacity = '1';
        } else if (a === 1) {
          item.style.transform = `rotateX(${d > 0 ? -40 : 40}deg) scale(0.82)`;
          item.style.opacity = '0.35';
        } else if (a === 2) {
          item.style.transform = `rotateX(${d > 0 ? -65 : 65}deg) scale(0.65)`;
          item.style.opacity = '0.12';
        } else {
          item.style.transform = `rotateX(${d > 0 ? -80 : 80}deg) scale(0.5)`;
          item.style.opacity = '0.03';
        }
      });
    }

    // ── Navigate ──
    function goTo(idx: number) {
      const c = Math.max(0, Math.min(items.length - 1, idx));
      if (c === lastIdx) return;
      lastIdx = c;
      positionAt(c, true);
      const dv = items[c].dataset.version!;
      const isLatest = dv === currentDir;
      const path = window.location.pathname;
      const ep = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const es = project.replace(/[.*+?^${}()|[\]\\]/g, '\\$\\$');
      const re = new RegExp(`^${ep}/projects/${es}/(?:v[^/]+/)?(.+?)/?$`);
      const m = path.match(re);
      const page = m?.[1] ?? '';
      const seg = isLatest ? '' : `${dv}/`;
      window.location.href = `${prefix}/projects/${project}/${seg}${page}`;
    }

    // ── Click ──
    items.forEach((item, i) => item.addEventListener('click', () => goTo(i)));

    // ── Mouse wheel ──
    wheel.addEventListener('wheel', (e: Event) => {
      (e as WheelEvent).preventDefault();
      goTo(lastIdx + ((e as WheelEvent).deltaY > 0 ? 1 : -1));
    }, { passive: false });

    // ── Mouse drag ──
    let dragging = false;
    let dragStartY = 0;
    let dragStartIdx = 0;

    viewport.addEventListener('mousedown', (e: Event) => {
      dragging = true;
      dragStartY = (e as MouseEvent).clientY;
      dragStartIdx = lastIdx;
      viewport.style.cursor = 'grabbing';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e: Event) => {
      if (!dragging) return;
      const dy = (e as MouseEvent).clientY - dragStartY;
      const delta = Math.round(-dy / itemH);
      const ni = Math.max(0, Math.min(items.length - 1, dragStartIdx + delta));
      if (ni !== lastIdx) {
        lastIdx = ni;
        positionAt(ni, false);
      }
    });

    window.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      viewport.style.cursor = 'grab';
      positionAt(lastIdx, true);
      goTo(lastIdx);
    });

    // ── Touch drag ──
    let touchY = 0;
    let touchIdx = 0;
    viewport.addEventListener('touchstart', (e: Event) => {
      touchY = (e as TouchEvent).touches[0].clientY;
      touchIdx = lastIdx;
    }, { passive: true });

    viewport.addEventListener('touchmove', (e: Event) => {
      const dy = (e as TouchEvent).touches[0].clientY - touchY;
      const ni = Math.max(0, Math.min(items.length - 1, touchIdx + Math.round(-dy / itemH)));
      if (ni !== lastIdx) { lastIdx = ni; positionAt(ni, false); }
    }, { passive: true });

    viewport.addEventListener('touchend', () => {
      positionAt(lastIdx, true);
      goTo(lastIdx);
    });

    // ── Keyboard ──
    wheel.setAttribute('tabindex', '0');
    wheel.addEventListener('keydown', (e: Event) => {
      const k = (e as KeyboardEvent).key;
      if (k === 'ArrowUp' || k === 'ArrowDown') {
        e.preventDefault();
        goTo(lastIdx + (k === 'ArrowDown' ? 1 : -1));
      }
    });

    // ── Init ──
    positionAt(activeIdx, false);
  }
}
