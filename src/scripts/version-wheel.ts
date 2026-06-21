/**
 * Version wheel control — CSS 3D cylinder wheel for switching project doc versions
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

    const itemHeight = 32;
    const viewportCenter = viewport.offsetHeight / 2;

    // ── Find active index ──
    let activeIndex = 0;
    items.forEach((item, i) => {
      if (item.dataset.version === currentDir) activeIndex = i;
    });

    // ── Position track to center active item ──
    function positionAt(index: number, smooth = true) {
      const offset = viewportCenter - (index * itemHeight) - (itemHeight / 2);
      track.style.transition = smooth ? 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)' : 'none';
      track.style.transform = `translateY(${offset}px)`;
      updatePerspective(index);
    }

    // ── 3D perspective ──
    function updatePerspective(centerIdx: number) {
      items.forEach((item, i) => {
        const dist = i - centerIdx;
        const absDist = Math.abs(dist);

        if (absDist === 0) {
          item.style.transform = 'rotateX(0deg) scale(1)';
          item.style.opacity = '1';
          item.style.filter = 'blur(0)';
        } else if (absDist === 1) {
          const angle = dist > 0 ? -35 : 35;
          item.style.transform = `rotateX(${angle}deg) scale(0.85)`;
          item.style.opacity = '0.45';
          item.style.filter = 'blur(1px)';
        } else if (absDist === 2) {
          const angle = dist > 0 ? -55 : 55;
          item.style.transform = `rotateX(${angle}deg) scale(0.7)`;
          item.style.opacity = '0.2';
          item.style.filter = 'blur(2px)';
        } else {
          const angle = dist > 0 ? -70 : 70;
          item.style.transform = `rotateX(${angle}deg) scale(0.55)`;
          item.style.opacity = '0.05';
          item.style.filter = 'blur(3px)';
        }
      });
    }

    // ── Switch to index ──
    let lastIndex = activeIndex;
    function switchTo(index: number) {
      const clamped = Math.max(0, Math.min(items.length - 1, index));
      if (clamped === lastIndex) return;
      lastIndex = clamped;
      positionAt(clamped, true);

      const dirVersion = items[clamped].dataset.version!;
      const isLatest = dirVersion === currentDir;
      navigateToVersion(project, dirVersion, isLatest, prefix);
    }

    // ── Click on items ──
    items.forEach((item, i) => {
      item.addEventListener('click', () => switchTo(i));
    });

    // ── Mouse wheel ──
    wheel.addEventListener('wheel', (e: Event) => {
      const we = e as WheelEvent;
      we.preventDefault();
      const direction = we.deltaY > 0 ? 1 : -1;
      switchTo(lastIndex + direction);
    }, { passive: false });

    // ── Touch drag ──
    let touchStartY = 0;
    let touchStartIndex = 0;
    wheel.addEventListener('touchstart', (e: Event) => {
      const te = e as TouchEvent;
      touchStartY = te.touches[0].clientY;
      touchStartIndex = lastIndex;
    }, { passive: true });

    wheel.addEventListener('touchmove', (e: Event) => {
      const te = e as TouchEvent;
      const deltaY = te.touches[0].clientY - touchStartY;
      const indexDelta = Math.round(-deltaY / itemHeight);
      const newIndex = Math.max(0, Math.min(items.length - 1, touchStartIndex + indexDelta));
      if (newIndex !== lastIndex) {
        lastIndex = newIndex;
        positionAt(newIndex, false);
      }
    }, { passive: true });

    wheel.addEventListener('touchend', () => {
      positionAt(lastIndex, true);
      const dirVersion = items[lastIndex].dataset.version!;
      const isLatest = dirVersion === currentDir;
      navigateToVersion(project, dirVersion, isLatest, prefix);
    });

    // ── Keyboard ──
    wheel.setAttribute('tabindex', '0');
    wheel.addEventListener('keydown', (e) => {
      const ev = e as KeyboardEvent;
      if (ev.key === 'ArrowUp' || ev.key === 'ArrowDown') {
        ev.preventDefault();
        switchTo(lastIndex + (ev.key === 'ArrowDown' ? 1 : -1));
      }
    });

    // ── Init ──
    positionAt(activeIndex, false);
  }
}

function navigateToVersion(
  projectSlug: string,
  dirVersion: string,
  isLatest: boolean,
  prefix: string,
): void {
  const path = window.location.pathname;
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedSlug = projectSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$\\$');
  const versionRe = new RegExp(`^${escapedPrefix}/projects/${escapedSlug}/(?:v[^/]+/)?(.+?)/?$`);
  const match = path.match(versionRe);

  let pagePath = '';
  if (match && match[1]) pagePath = match[1];

  const versionSeg = isLatest ? '' : `${dirVersion}/`;
  const targetUrl = `${prefix}/projects/${projectSlug}/${versionSeg}${pagePath}`;
  window.location.href = targetUrl.endsWith('/') ? targetUrl : `${targetUrl}/`;
}
