/**
 * 版本蜗轮控件 — CSS 3D 圆柱滚轮切换项目文档版本
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
    const highlight = wheel.querySelector('.doc-version-wheel-highlight') as HTMLElement;
    if (!viewport || !track || items.length === 0) continue;

    const project = (wheel as HTMLElement).dataset.project!;
    const current = (wheel as HTMLElement).dataset.current!;
    const currentDir = `v${current.split('.')[0]}`;
    const prefix = (wheel as HTMLElement).dataset.prefix || '';

    // ── 计算每个 item 高度和中心偏移 ──
    const itemHeight = items[0].offsetHeight;
    const viewportHeight = viewport.offsetHeight;
    const centerOffset = (viewportHeight - itemHeight) / 2;

    // ── 初始滚动到当前版本 ──
    let activeIndex = 0;
    items.forEach((item, i) => {
      if (item.dataset.version === currentDir) activeIndex = i;
    });

    function scrollToIndex(index: number, smooth = true) {
      const y = index * itemHeight;
      if (smooth) {
        viewport.scrollTo({ top: y, behavior: 'smooth' });
      } else {
        viewport.scrollTop = y;
      }
    }

    // ── 3D 透视更新 ──
    function updatePerspective() {
      const scrollTop = viewport.scrollTop;
      const centerIndex = Math.round(scrollTop / itemHeight);

      items.forEach((item, i) => {
        const dist = i - centerIndex;
        const absDist = Math.abs(dist);

        if (absDist === 0) {
          item.style.transform = 'rotateX(0deg) scale(1)';
          item.style.opacity = '1';
        } else if (absDist === 1) {
          const angle = dist > 0 ? -25 : 25;
          item.style.transform = `rotateX(${angle}deg) scale(0.88)`;
          item.style.opacity = '0.5';
        } else if (absDist === 2) {
          const angle = dist > 0 ? -45 : 45;
          item.style.transform = `rotateX(${angle}deg) scale(0.75)`;
          item.style.opacity = '0.25';
        } else {
          const angle = dist > 0 ? -60 : 60;
          item.style.transform = `rotateX(${angle}deg) scale(0.6)`;
          item.style.opacity = '0.1';
        }
      });

      // 高光线位置
      if (highlight) {
        highlight.style.top = `${centerOffset}px`;
        highlight.style.height = `${itemHeight}px`;
      }
    }

    // ── 吸附到最近 item ──
    let snapTimeout: ReturnType<typeof setTimeout>;
    function snapToNearest() {
      clearTimeout(snapTimeout);
      snapTimeout = setTimeout(() => {
        const scrollTop = viewport.scrollTop;
        const nearestIndex = Math.round(scrollTop / itemHeight);
        const clampedIndex = Math.max(0, Math.min(items.length - 1, nearestIndex));
        scrollToIndex(clampedIndex, true);
      }, 80);
    }

    // ── 事件监听 ──
    viewport.addEventListener('scroll', () => {
      updatePerspective();
      snapToNearest();
    }, { passive: true });

    // 点击非中心 item → 切换
    items.forEach((item, i) => {
      item.addEventListener('click', () => {
        scrollToIndex(i, true);
      });
    });

    // 吸附完成后触发版本切换
    let lastIndex = activeIndex;
    viewport.addEventListener('scrollend', () => {
      const scrollTop = viewport.scrollTop;
      const newIndex = Math.round(scrollTop / itemHeight);
      const clampedIndex = Math.max(0, Math.min(items.length - 1, newIndex));

      if (clampedIndex !== lastIndex) {
        lastIndex = clampedIndex;
        const selectedDirVersion = items[clampedIndex].dataset.version!;
        switchVersion(project, selectedDirVersion, currentDir, prefix);
      }
    });

    // fallback: 监听 scroll 结束（scrollend 不被所有浏览器支持）
    let scrollEndTimer: ReturnType<typeof setTimeout>;
    viewport.addEventListener('scroll', () => {
      clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(() => {
        const scrollTop = viewport.scrollTop;
        const newIndex = Math.round(scrollTop / itemHeight);
        const clampedIndex = Math.max(0, Math.min(items.length - 1, newIndex));

        if (clampedIndex !== lastIndex) {
          lastIndex = clampedIndex;
          const selectedDirVersion = items[clampedIndex].dataset.version!;
          switchVersion(project, selectedDirVersion, currentDir, prefix);
        }
      }, 150);
    }, { passive: true });

    // 键盘支持
    wheel.setAttribute('tabindex', '0');
    wheel.addEventListener('keydown', (e) => {
      const ev = e as KeyboardEvent;
      if (ev.key === 'ArrowUp' || ev.key === 'ArrowDown') {
        ev.preventDefault();
        const direction = ev.key === 'ArrowUp' ? -1 : 1;
        const newIndex = Math.max(0, Math.min(items.length - 1, lastIndex + direction));
        scrollToIndex(newIndex, true);
      }
    });

    // 初始化
    scrollToIndex(activeIndex, false);
    updatePerspective();
  }
}

/**
 * 切换版本 — 构建目标 URL 并跳转。
 * 若当前页面在目标版本不存在，回退到同章节首页。
 */
function switchVersion(
  projectSlug: string,
  targetVersion: string,
  currentVersion: string,
  prefix: string,
): void {
  const path = window.location.pathname;

  // 从 URL 提取当前页面的相对路径（去掉项目前缀和版本前缀）
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedSlug = projectSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$\\$');
  const versionRe = new RegExp(`^${escapedPrefix}/projects/${escapedSlug}/(?:v[^/]+/)?(.+?)/?$`);
  const match = path.match(versionRe);

  let pagePath = '';
  if (match && match[1]) {
    pagePath = match[1];
  }

  // 构建目标 URL
  const isLatest = targetVersion === currentVersion;
  const versionSeg = isLatest ? '' : `${targetVersion}/`;
  const targetUrl = `${prefix}/projects/${projectSlug}/${versionSeg}${pagePath}`;

  // 使用 data 属性传递回退信息，让服务端/客户端处理 404
  // 对于静态站点，直接跳转 — 如果 404 由 404.astro 处理
  window.location.href = targetUrl.endsWith('/') ? targetUrl : `${targetUrl}/`;
}
