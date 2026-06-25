/**
 * TOC 右侧目录凹槽滑块 — 与语言下拉栏同款垂直滑动交互
 * 每个 .doc-toc-group 独立拥有一个滑块，默认定位在 H2 上，
 * hover 到 H3 时滑块移入 H3，离开后回到 H2。
 */
export function initTocSlider(): void {
  const groups = document.querySelectorAll('.doc-toc-group') as NodeListOf<HTMLElement>;
  if (groups.length === 0) return;

  groups.forEach(group => {
    if (group.classList.contains('has-toc-slider')) return;
    if (group.classList.contains('doc-version-wheel')) return;

    const links = group.querySelectorAll('.doc-toc-link') as NodeListOf<HTMLAnchorElement>;
    if (links.length < 1) return;

    const h2Link = group.querySelector('.doc-toc-depth-2') as HTMLAnchorElement | null;
    if (!h2Link) return;

    // ── 创建滑块 ──
    const slider = document.createElement('div');
    slider.className = 'doc-toc-slider';
    group.appendChild(slider);

    const highlight = document.createElement('div');
    highlight.className = 'doc-toc-slider-highlight';
    slider.appendChild(highlight);

    group.classList.add('has-toc-slider');

    // ── 状态变量 ──
    let lifted: HTMLAnchorElement | null = null;
    let hovering = false;
    let pressed = false;
    let instantMode = false;

    // ── 定位（改用 offsetTop/offsetHeight，避免 getBoundingClientRect 的 border 偏差）──
    function positionAt(target: HTMLAnchorElement, animate: boolean): void {
      if (!animate) { slider.style.transition = 'none'; }
      slider.style.top = `${target.offsetTop}px`;
      slider.style.height = `${target.offsetHeight}px`;
      if (!animate) { void slider.offsetHeight; slider.style.transition = ''; }
    }

    // ── 滑块抬起 ──
    function setSlider(on: boolean): void {
      slider.style.transition = 'top 0.4s cubic-bezier(0.4,0,0.2,1), height 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.25s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s ease, border-color 0.4s ease';
      slider.style.transform = on ? 'translate(-1px, -6px)' : 'translateY(0)';
      slider.classList.toggle('lifted', on);
      highlight.style.opacity = on ? '1' : '0.5';
    }

    // ── 文字状态 ──
    function lift(target: HTMLAnchorElement | null): void {
      if (target === lifted) return;
      if (lifted) {
        lifted.classList.remove('toc-lift', 'toc-hover-lift', 'instant-hover', 'instant-return', 'toc-pressed', 'instant-press');
        lifted.style.removeProperty('transition-delay');
        if (lifted === h2Link) lifted.classList.add('toc-dim');
      }
      lifted = target;
      if (lifted) {
        lifted.classList.add('toc-lift');
        lifted.classList.remove('toc-dim');
      }
    }

    function setTextHover(on: boolean, instant?: boolean, returning?: boolean): void {
      if (!lifted) return;
      lifted.classList.toggle('toc-hover-lift', on);
      lifted.classList.toggle('instant-hover', on && instant && !returning);
      lifted.classList.toggle('instant-return', on && instant && !!returning);
      instantMode = on && !!instant;
      if (on) {
        const t = instant && !returning ? 'translate(-1px, -6px)'
          : instant && returning ? 'translate(-3px, -6px)'
          : 'translate(-5px, -5px)';
        lifted.style.transition = 'transform 0.2s 0.05s cubic-bezier(0.34, 1.3, 0.64, 1)';
        lifted.style.transform = t;
      } else {
        lifted.style.transition = 'transform 0.2s 0.05s cubic-bezier(0.34, 1.3, 0.64, 1)';
        lifted.style.transform = '';
      }
    }

    // ── 初始定位 ──
    void group.offsetHeight;
    positionAt(h2Link, false);
    slider.style.transform = 'translateY(0)';
    h2Link.style.setProperty('transition', 'none', 'important');
    lift(h2Link);
    void h2Link.offsetHeight;
    h2Link.style.removeProperty('transition');

    // ── hover ──
    links.forEach(link => {
      link.addEventListener('mouseenter', () => {
        hovering = true;
        const same = (link === h2Link);
        const returning = same && (link !== lifted);
        positionAt(link, true);
        // 切换到新元素前清掉旧元素的 inline transform/transition
        if (lifted && lifted !== link) {
          lifted.style.transform = '';
          lifted.style.transition = '';
        }
        lift(link);
        setTextHover(true, same, returning);
        setSlider(true);
      });
    });

    // ── mouse leave ──
    let returnTimer: ReturnType<typeof setTimeout> | null = null;
    let pressRecover: ReturnType<typeof setTimeout> | null = null;
    group.addEventListener('mouseleave', () => {
      hovering = false;
      if (pressed) {
        if (pressRecover) clearTimeout(pressRecover);
        pressRecover = setTimeout(recoverPress, 0);
        return;
      }
      returnTimer = setTimeout(() => {
        if (!group.querySelector('.doc-toc-link:hover') && h2Link) {
          setTextHover(false);
          setSlider(false);
          lift(h2Link);
          positionAt(h2Link, true);
        }
      }, 150);
    });
    group.addEventListener('mouseenter', () => {
      if (returnTimer) { clearTimeout(returnTimer); returnTimer = null; }
      if (pressRecover) { clearTimeout(pressRecover); pressRecover = null; }
      if (pressed) recoverPress();
    });

    function recoverPress(): void {
      if (!pressed) return;
      pressed = false;
      if (lifted) lifted.classList.remove('toc-pressed', 'instant-press');
      setTextHover(false);
      lift(h2Link);
      slider.style.transition = 'none';
      slider.style.transform = 'translateY(0)';
      void slider.offsetHeight;
      slider.style.transition = 'top 0.4s cubic-bezier(0.4,0,0.2,1), height 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s ease, border-color 0.4s ease';
      if (h2Link) positionAt(h2Link, true);
    }

    function currentTarget(): HTMLAnchorElement | null {
      return lifted ?? h2Link;
    }

    // ── resize ──
    let resizeTimer: ReturnType<typeof setTimeout>;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const target = currentTarget();
        if (target) positionAt(target, false);
      }, 100);
    });

    // ── 按下 ──
    links.forEach(link => {
      link.addEventListener('mouseenter', () => { hovering = true; });
      link.addEventListener('mousedown', () => {
        pressed = true;
        slider.style.transition = 'transform 0.06s ease, box-shadow 0.1s ease, border-color 0.1s ease';
        slider.style.transform = 'translateY(0)';
        slider.classList.remove('lifted');
        highlight.style.opacity = '0.5';
        if (lifted) {
          const pt = instantMode ? '-1px, 1px' : '-2px, 1px';
          lifted.style.transition = 'transform 0.08s ease';
          lifted.style.transform = `translate(${pt})`;
          lifted.classList.add('toc-pressed');
          if (instantMode) lifted.classList.add('instant-press');
        }
      });
    });
    window.addEventListener('mouseup', () => {
      if (pressRecover) { clearTimeout(pressRecover); pressRecover = null; }
      pressed = false;
      if (lifted) {
        lifted.classList.remove('toc-pressed', 'instant-press');
        if (hovering) {
          const pt = instantMode ? '-1px, -6px' : '-3px, -6px';
          lifted.style.transition = 'transform 0.0s ease';
          lifted.style.transform = `translate(${pt})`;
        }
      }
      slider.style.transition = 'none';
      if (hovering) {
        slider.style.transform = 'translate(-1px, -6px)';
        slider.classList.add('lifted');
        highlight.style.opacity = '1';
      } else {
        slider.style.transform = 'translateY(0)';
      }
    });

    // ── 触摸降级 ──
    group.addEventListener('touchstart', () => {
      if (h2Link) {
        positionAt(h2Link, true);
        lift(h2Link);
        setSlider(false);
      }
    }, { once: true });
  });
}
