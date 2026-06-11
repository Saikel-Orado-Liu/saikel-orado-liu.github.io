/**
 * 凹槽滑动指示器 — 纯 CSS class 驱动，无 inline transform，避免状态冲突
 */
export function initNavSlider(): void {
  const groove = document.querySelector('.navbar .navbar-nav ul') as HTMLElement | null;
  if (!groove) return;
  if (groove.classList.contains('has-slider')) return;

  const links = groove.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>;
  if (links.length === 0) return;

  const slider = document.createElement('div');
  slider.className = 'nav-slider';
  groove.appendChild(slider);

  const highlight = document.createElement('div');
  highlight.className = 'nav-slider-highlight';
  slider.appendChild(highlight);

  groove.classList.add('has-slider');

  const grooveEl = groove;
  const activeLink = grooveEl.querySelector('a.active') as HTMLAnchorElement | null;

  let lifted: HTMLAnchorElement | null = null;
  let instantMode = false;
  let hovering = false;
  let pressed = false;

  // ── 定位（以 <li> 为基准，不受 <a> 的 transform 影响）──
  function positionAt(target: HTMLAnchorElement, animate: boolean): void {
    const grooveRect = grooveEl.getBoundingClientRect();
    const li = target.parentElement as HTMLElement;
    const liRect = li.getBoundingClientRect();
    if (!animate) { slider.style.transition = 'none'; }
    slider.style.left = `${liRect.left - grooveRect.left}px`;
    slider.style.width = `${liRect.width}px`;
    if (!animate) { void slider.offsetHeight; slider.style.transition = ''; }
  }

  // ── 滑块状态（仅滑块 + 高光 + lifted class）─────────
  function setSlider(on: boolean): void {
    slider.style.transition = 'left 0.4s cubic-bezier(0.4,0,0.2,1), width 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.25s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s ease, border-color 0.4s ease';
    slider.style.transform = on ? 'translateY(-5px)' : 'translateY(-2px)';
    slider.classList.toggle('lifted', on);
    highlight.style.opacity = on ? '1' : '0.5';
  }

  // ── 文字状态（纯 class 驱动）────────────────────────
  function lift(target: HTMLAnchorElement | null): void {
    if (target === lifted) return;
    if (lifted) {
      lifted.classList.remove('nav-lift', 'nav-hover-lift', 'instant-hover', 'instant-return', 'nav-pressed', 'instant-press');
      lifted.style.removeProperty('transition-delay');
      if (lifted === activeLink) lifted.classList.add('nav-dim');
    }
    lifted = target;
    if (lifted) {
      lifted.classList.add('nav-lift');
      lifted.classList.remove('nav-dim');
    }
    links.forEach(l => {
      if (l !== lifted) l.classList.remove('nav-hover');
    });
  }

  function setTextHover(on: boolean, instant?: boolean, returning?: boolean): void {
    if (!lifted) return;
    lifted.classList.toggle('nav-hover-lift', on);
    lifted.classList.toggle('instant-hover', on && instant && !returning);
    lifted.classList.toggle('instant-return', on && instant && !!returning);
    instantMode = on && !!instant;
    if (on) {
      // 进入：交给 CSS 控制 delay
      lifted.style.removeProperty('transition-delay');
    } else {
      // 退出：始终 0 delay，覆盖 .nav-lift 的 CSS delay
      lifted.style.setProperty('transition-delay', '0.05s', 'important');
    }
  }

  // ── 初始状态（强制布局后无动画直接到位）─────────────────
  if (activeLink) {
    void grooveEl.offsetHeight; // 强制布局，确保 getBoundingClientRect 正确
    positionAt(activeLink, false);
    slider.style.transform = 'translateY(-2px)';
    activeLink.style.setProperty('transition', 'none', 'important');
    lift(activeLink);
    void activeLink.offsetHeight;
    activeLink.style.removeProperty('transition');
  }

  // ── hover ───────────────────────────────────────────
  links.forEach(link => {
    link.addEventListener('mouseenter', () => {
      const same = (link === activeLink);
      const returning = same && (link !== lifted);
      positionAt(link, true);
      lift(link);
      setTextHover(true, same, returning);
      setSlider(true);
    });
  });

  // ── mouse leave ─────────────────────────────────────
  let returnTimer: ReturnType<typeof setTimeout> | null = null;
  let pressRecover: ReturnType<typeof setTimeout> | null = null;
  grooveEl.addEventListener('mouseleave', () => {
    hovering = false;
    if (pressed) {
      // 按住拖出：0ms 后自动恢复（兜底 mouseup 丢失）
      if (pressRecover) clearTimeout(pressRecover);
      pressRecover = setTimeout(recoverPress, 0);
      return;
    }
    setTextHover(false);
    setSlider(false);
    if (activeLink) lift(activeLink);
    returnTimer = setTimeout(() => {
      if (activeLink && !grooveEl.querySelector('a:hover')) {
        positionAt(activeLink, true);
      }
    }, 150);
  });
  grooveEl.addEventListener('mouseenter', () => {
    if (returnTimer) { clearTimeout(returnTimer); returnTimer = null; }
    if (pressRecover) { clearTimeout(pressRecover); pressRecover = null; }
    if (pressed) recoverPress();
  });

  function recoverPress(): void {
    if (!pressed) return;
    pressed = false;
    if (lifted) lifted.classList.remove('nav-pressed', 'instant-press');
    setTextHover(false);
    if (activeLink) lift(activeLink);
    slider.style.transition = 'none';
    slider.style.transform = 'translateY(-2px)';
    void slider.offsetHeight;
    slider.style.transition = 'left 0.4s cubic-bezier(0.4,0,0.2,1), width 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s ease, border-color 0.4s ease';
    if (activeLink) positionAt(activeLink, true);
  }

  function currentTarget(): HTMLAnchorElement | null {
    return lifted ?? activeLink;
  }

  // ── resize ──────────────────────────────────────────
  let resizeTimer: ReturnType<typeof setTimeout>;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const target = currentTarget();
      if (target) positionAt(target, false);
    }, 100);
  });

  // ── 按下效果（纯 class）─────────────────────────────
  links.forEach(link => {
    link.addEventListener('mouseenter', () => { hovering = true; });
    link.addEventListener('mousedown', () => {
      pressed = true;
      slider.style.transition = 'transform 0.06s ease, box-shadow 0.1s ease, border-color 0.1s ease';
      slider.style.transform = 'translateY(0)';
      slider.classList.remove('lifted');
      highlight.style.opacity = '0.5';
      if (lifted) {
        lifted.classList.add('nav-pressed');
        if (instantMode) lifted.classList.add('instant-press');
      }
    });
  });
  window.addEventListener('mouseup', () => {
    if (pressRecover) { clearTimeout(pressRecover); pressRecover = null; }
    pressed = false;
    if (lifted) {
      lifted.classList.remove('nav-pressed', 'instant-press');
      lifted.style.setProperty('transition', 'none', 'important');
      void lifted.offsetHeight;
      lifted.style.removeProperty('transition');
    }
    // 松手快速回弹
    slider.style.transition = 'none'
    if (hovering) {
      slider.style.transform = 'translateY(-5px)';
      slider.classList.add('lifted');
      highlight.style.opacity = '1';
    } else {
      slider.style.transform = 'translateY(-2px)';
    }
  });

  // ── 触摸设备降级 ────────────────────────────────────
  grooveEl.addEventListener('touchstart', () => {
    if (activeLink) {
      positionAt(activeLink, true);
      lift(activeLink);
      setSlider(false);
    }
  }, { once: true });
}

/**
 * 语言下拉栏垂直滑块 — 与导航滑块同款交互
 * DOM 创建与位置更新分离：首次调用创建 DOM，后续打开时重新定位
 */
function _ensureLangSlider(): {
  grooveEl: HTMLElement;
  links: NodeListOf<HTMLAnchorElement>;
  slider: HTMLElement;
  highlight: HTMLElement;
  activeLink: HTMLAnchorElement | null;
} | null {
  const groove = document.querySelector('.lang-switcher .lang-dropdown ul') as HTMLElement | null;
  if (!groove) return null;

  const links = groove.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>;
  if (links.length === 0) return null;

  // 已有 slider 则直接返回
  const existing = groove.querySelector('.lang-slider') as HTMLElement | null;
  if (existing) {
    const hl = groove.querySelector('.lang-slider-highlight') as HTMLElement;
    return {
      grooveEl: groove,
      links,
      slider: existing,
      highlight: hl,
      activeLink: groove.querySelector('a.active') as HTMLAnchorElement | null,
    };
  }

  const slider = document.createElement('div');
  slider.className = 'lang-slider';
  groove.appendChild(slider);

  const highlight = document.createElement('div');
  highlight.className = 'lang-slider-highlight';
  slider.appendChild(highlight);

  groove.classList.add('has-lang-slider');

  return {
    grooveEl: groove,
    links,
    slider,
    highlight,
    activeLink: groove.querySelector('a.active') as HTMLAnchorElement | null,
  };
}

export function initLangSlider(): void {
  const ctx = _ensureLangSlider();
  if (!ctx) return;
  // 已有事件绑定则跳过
  if (ctx.grooveEl.dataset.langSliderReady) return;
  ctx.grooveEl.dataset.langSliderReady = 'true';

  const { grooveEl, links, slider, highlight } = ctx;
  let activeLink = ctx.activeLink;

  let lifted: HTMLAnchorElement | null = null;
  let hovering = false;
  let pressed = false;
  let instantMode = false;

  // ── 垂直定位 ──
  function positionAt(target: HTMLAnchorElement, animate: boolean): void {
    const grooveRect = grooveEl.getBoundingClientRect();
    const li = target.parentElement as HTMLElement;
    const liRect = li.getBoundingClientRect();
    if (!animate) { slider.style.transition = 'none'; }
    slider.style.top = `${liRect.top - grooveRect.top}px`;
    slider.style.height = `${liRect.height}px`;
    if (!animate) { void slider.offsetHeight; slider.style.transition = ''; }
  }

  // ── 滑块状态 ──
  function setSlider(on: boolean): void {
    slider.style.transition = 'top 0.4s cubic-bezier(0.4,0,0.2,1), height 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.25s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s ease, border-color 0.4s ease';
    slider.style.transform = on ? 'translate(-2px, -6px)' : 'translateY(-2px)';
    slider.classList.toggle('lifted', on);
    highlight.style.opacity = on ? '1' : '0.5';
  }

  // ── 文字状态 ──
  function lift(target: HTMLAnchorElement | null): void {
    if (target === lifted) return;
    if (lifted) {
      lifted.classList.remove('lang-lift', 'lang-hover-lift', 'instant-hover', 'instant-return', 'lang-pressed', 'instant-press');
      if (lifted === activeLink) lifted.classList.add('lang-dim');
    }
    lifted = target;
    if (lifted) {
      lifted.classList.add('lang-lift');
      lifted.classList.remove('lang-dim');
    }
  }

  // ── 文字 hover 抬起 ──
  function setTextHover(on: boolean, instant?: boolean, returning?: boolean): void {
    if (!lifted) return;
    lifted.classList.toggle('lang-hover-lift', on);
    lifted.classList.toggle('instant-hover', on && instant && !returning);
    lifted.classList.toggle('instant-return', on && instant && !!returning);
    instantMode = on && !!instant;
    if (on) lifted.style.transitionDelay = '';
    else lifted.style.transitionDelay = '0.05s';
  }

  // ── 定位到 active（处理 display:none → block 后的首次布局）──
  function positionToActive(): void {
    activeLink = grooveEl.querySelector('a.active') as HTMLAnchorElement | null;
    if (!activeLink) return;
    // 强制读取布局以确保 getBoundingClientRect 正确
    void grooveEl.offsetHeight;
    positionAt(activeLink, false);
    slider.style.transform = 'translateY(-2px)';
    activeLink.style.setProperty('transition', 'none', 'important');
    lift(activeLink);
    void activeLink.offsetHeight;
    activeLink.style.removeProperty('transition');
  }

  // 标记为已定位（需在 dropdown 可见时首次执行）
  let positioned = false;
  function ensurePositioned(): void {
    if (positioned) return;
    if (grooveEl.offsetParent !== null) { // 可见
      positionToActive();
      positioned = true;
    }
  }

  // ── hover ──
  links.forEach(link => {
    link.addEventListener('mouseenter', () => {
      ensurePositioned();
      const same = (link === activeLink);
      const returning = same && (link !== lifted);
      positionAt(link, true);
      lift(link);
      setTextHover(true, same, returning);
      setSlider(true);
    });
  });

  // ── mouse leave ──
  let returnTimer: ReturnType<typeof setTimeout> | null = null;
  let pressRecover: ReturnType<typeof setTimeout> | null = null;
  grooveEl.addEventListener('mouseleave', () => {
    hovering = false;
    if (pressed) {
      if (pressRecover) clearTimeout(pressRecover);
      pressRecover = setTimeout(recoverPress, 0);
      return;
    }
    setTextHover(false);
    setSlider(false);
    if (activeLink) lift(activeLink);
    returnTimer = setTimeout(() => {
      if (activeLink && !grooveEl.querySelector('a:hover')) {
        positionAt(activeLink, true);
      }
    }, 150);
  });
  grooveEl.addEventListener('mouseenter', () => {
    if (returnTimer) { clearTimeout(returnTimer); returnTimer = null; }
    if (pressRecover) { clearTimeout(pressRecover); pressRecover = null; }
    if (pressed) recoverPress();
  });

  function recoverPress(): void {
    if (!pressed) return;
    pressed = false;
    setTextHover(false);
    if (lifted) lifted.classList.remove('lang-pressed', 'instant-press');
    if (activeLink) lift(activeLink);
    slider.style.transition = 'none';
    slider.style.transform = 'translateY(-2px)';
    void slider.offsetHeight;
    slider.style.transition = 'top 0.4s cubic-bezier(0.4,0,0.2,1), height 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s ease, border-color 0.4s ease';
    if (activeLink) positionAt(activeLink, true);
  }

  function currentTarget(): HTMLAnchorElement | null {
    return lifted ?? activeLink;
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
      slider.style.transform = 'translate(1px, 0)';
      slider.classList.remove('lifted');
      highlight.style.opacity = '0.5';
      if (lifted) {
        lifted.classList.add('lang-pressed');
        if (instantMode) lifted.classList.add('instant-press');
      }
    });
  });
  window.addEventListener('mouseup', () => {
    if (pressRecover) { clearTimeout(pressRecover); pressRecover = null; }
    pressed = false;
    if (lifted) {
      lifted.classList.remove('lang-pressed', 'instant-press');
      lifted.style.setProperty('transition', 'none', 'important');
      void lifted.offsetHeight;
      lifted.style.removeProperty('transition');
    }
    slider.style.transition = 'none';
    if (hovering) {
      slider.style.transform = 'translateY(-5px)';
      slider.classList.add('lifted');
      highlight.style.opacity = '1';
    } else {
      slider.style.transform = 'translateY(-2px)';
    }
  });

  // ── 触摸降级 ──
  grooveEl.addEventListener('touchstart', () => {
    if (activeLink) {
      positionAt(activeLink, true);
      lift(activeLink);
      setSlider(false);
    }
  }, { once: true });

  // ── 暴露重定位方法供外部调用 ──
  (grooveEl as any)._repositionLangSlider = function () {
    positioned = false;
    ensurePositioned();
  };
}

/** 下拉菜单打开时调用：重定位滑块到 active 项 */
export function repositionLangSlider(): void {
  const ul = document.querySelector('.lang-switcher .lang-dropdown ul') as HTMLElement | null;
  if (!ul) return;
  (ul as any)._repositionLangSlider?.();
}
