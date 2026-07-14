/**
 * 文档分类选项卡凹槽滑块 — 参照 TOC 滑块 (toc-slider.ts) 的 inline-transform 驱动模式
 * 所有文字位移动画由 JS inline transform 控制，CSS class 仅托管颜色与回退过渡，
 * 彻底消除 CSS 特异性冲突和动画断裂问题。
 */
export function initTabsSlider(): void {
  const groove = document.querySelector<HTMLElement>('.doc-tabs-groove');
  if (!groove) return;

  const slider = groove.querySelector<HTMLElement>('.doc-tabs-slider');
  const highlight = groove.querySelector<HTMLElement>('.doc-tabs-slider-highlight');
  const btns = groove.querySelectorAll<HTMLElement>('.doc-tab-btn') as NodeListOf<HTMLElement>;
  if (!slider || btns.length < 1) return;

  let lifted: HTMLElement | null = null;
  let activeBtn = groove.querySelector<HTMLElement>(".doc-tab-btn--active") ?? btns[0];

  function getActive(): HTMLElement {
    return groove!.querySelector<HTMLElement>(".doc-tab-btn--active") ?? activeBtn;
  }
  let hovering = false;
  let pressed = false;
  let instantMode = false;

  // ── 定位（offsetTop/offsetHeight，不受 transform 影响）──
  function positionAt(target: HTMLElement, animate: boolean): void {
    if (!animate) { slider!.style.transition = 'none'; }
    let top = 0;
    let el: HTMLElement | null = target;
    while (el && el !== groove) {
      top += el.offsetTop;
      el = el.offsetParent as HTMLElement | null;
    }
    slider!.style.top = `${top}px`;
    if (!animate) { void slider!.offsetHeight; slider!.style.transition = ''; }
  }

  // ── 滑块抬起 ──
  function setSlider(on: boolean): void {
    slider!.style.transition = 'top 0.4s cubic-bezier(0.4,0,0.2,1), height 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.25s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s ease, border-color 0.4s ease';
    slider!.style.transform = on ? 'translate(-2px, -6px)' : 'translateY(-2px)';
    slider!.classList.toggle('lifted', on);
    if (highlight) highlight.style.opacity = on ? '1' : '0.5';
  }

  // ── 文字抬起/归位（参照 TOC 模式 — CSS class 仅管颜色，inline transform 管位移）──
  function lift(target: HTMLElement | null): void {
    if (target === lifted) return;
    if (lifted) {
      lifted.classList.remove('tab-lift', 'tab-hover-lift', 'instant-hover', 'instant-return', 'tab-pressed', 'instant-press');
      if (lifted === getActive()) lifted.classList.add('tab-dim');
    }
    lifted = target;
    if (lifted) {
      lifted.classList.add('tab-lift');
      lifted.classList.remove('tab-dim');
    }
  }

  function setTextHover(on: boolean, instant?: boolean, returning?: boolean): void {
    if (!lifted) return;
    lifted.classList.toggle('tab-hover-lift', on);
    lifted.classList.toggle('instant-hover', on && instant && !returning);
    lifted.classList.toggle('instant-return', on && instant && !!returning);
    instantMode = on && !!instant;
    if (on) {
      const t = instant && !returning ? 'translate(-1px, -6px)'
        : instant && returning ? 'translate(-3px, -6px)'
        : 'translate(-1px, -5px)';
      lifted.style.transition = 'transform 0.2s 0.05s cubic-bezier(0.34, 1.3, 0.64, 1)';
      lifted.style.transform = t;
    } else {
      lifted.style.transition = 'transform 0.2s 0.05s cubic-bezier(0.34, 1.3, 0.64, 1)';
      lifted.style.transform = '';
    }
  }

  // ── 初始定位 ──
  void groove.offsetHeight;
  positionAt(activeBtn, false);
  slider!.style.transform = 'translateY(-2px)';
  activeBtn.style.setProperty('transition', 'none', 'important');
  lift(activeBtn);
  void activeBtn.offsetHeight;
  activeBtn.style.removeProperty('transition');

  // ── hover ──
  btns.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      hovering = true;
      const same = (btn === getActive());
      const returning = same && (btn !== lifted);
      positionAt(btn, true);
      // 切换到新元素前清掉旧元素的 inline transform/transition（TOC 模式）
      if (lifted && lifted !== btn) {
        lifted.style.transform = '';
        lifted.style.transition = '';
      }
      lift(btn);
      setTextHover(true, same, returning);
      setSlider(true);
    });
  });

  // ── mouse leave ──
  let returnTimer: ReturnType<typeof setTimeout> | null = null;
  let pressRecover: ReturnType<typeof setTimeout> | null = null;
  groove.addEventListener('mouseleave', () => {
    hovering = false;
    if (pressed) {
      if (pressRecover) clearTimeout(pressRecover);
      pressRecover = setTimeout(recoverPress, 0);
      return;
    }
    returnTimer = setTimeout(() => {
      const cur = getActive();
      if (!groove.querySelector('.doc-tab-btn:hover') && cur) {
        setTextHover(false);
        setSlider(false);
        lift(cur);
        positionAt(cur, true);
      }
    }, 150);
  });
  groove.addEventListener('mouseenter', () => {
    if (returnTimer) { clearTimeout(returnTimer); returnTimer = null; }
    if (pressRecover) { clearTimeout(pressRecover); pressRecover = null; }
    if (pressed) recoverPress();
  });

  function recoverPress(): void {
    const cur = getActive();
    if (!pressed) return;
    pressed = false;
    if (lifted) lifted.classList.remove('tab-pressed', 'instant-press');
    setTextHover(false);
    lift(cur);
    slider!.style.transition = 'none';
    slider!.style.transform = 'translateY(-2px)';
    void slider!.offsetHeight;
    slider!.style.transition = 'top 0.4s cubic-bezier(0.4,0,0.2,1), height 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s ease, border-color 0.4s ease';
    if (cur) positionAt(cur, true);
  }

  function currentTarget(): HTMLElement | null {
    return lifted ?? getActive();
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

  // ── 按下（TOC 模式 — inline transform 驱动）──
  btns.forEach(btn => {
    btn.addEventListener('mousedown', () => {
      pressed = true;
      slider!.style.transition = 'transform 0.06s ease, box-shadow 0.1s ease, border-color 0.1s ease';
      slider!.style.transform = 'translateY(0)';
      slider!.classList.remove('lifted');
      if (highlight) highlight.style.opacity = '0.5';
      if (lifted) {
        lifted.style.transition = 'transform 0.08s ease';
        lifted.style.transform = 'translate(-1px, 1px)';
        lifted.classList.add('tab-pressed');
        if (instantMode) lifted.classList.add('instant-press');
      }
    });
  });

  // ── 松开（TOC 模式 — transition 0.0s 瞬切回 hover 位）──
  window.addEventListener('mouseup', () => {
    if (pressRecover) { clearTimeout(pressRecover); pressRecover = null; }
    pressed = false;
    if (lifted) {
      lifted.classList.remove('tab-pressed', 'instant-press');
      if (hovering) {
        const pt = instantMode ? '-1px, -6px' : '-3px, -6px';
        lifted.style.transition = 'transform 0.0s ease';
        lifted.style.transform = `translate(${pt})`;
      }
    }
    slider!.style.transition = 'none';
    if (hovering) {
      slider!.style.transform = 'translate(-1px, -6px)';
      slider!.classList.add('lifted');
      if (highlight) highlight.style.opacity = '1';
    } else {
      slider!.style.transform = 'translateY(-2px)';
    }
  });

  // ── 监听外部选项卡切换（来自 doc-tabs.ts），同步内部状态 ──
  groove.addEventListener('tabs-slider:refresh', () => {
    const newActive = groove.querySelector<HTMLElement>('.doc-tab-btn--active');
    if (!newActive || newActive === activeBtn) return;

    // 清理旧 active：动画类 + inline 样式 + 加 tab-dim 回弹
    activeBtn.classList.remove('tab-lift', 'tab-hover-lift', 'instant-hover', 'instant-return', 'tab-pressed', 'instant-press');
    activeBtn.classList.add('tab-dim');
    activeBtn.style.transform = '';
    activeBtn.style.transition = '';
    if (lifted === activeBtn) {
      lifted = null;
    }

    // 更新引用
    activeBtn = newActive;

    // 新 active：移除残留 hover/press CSS class，但保留 inline transform
    // （不清 transform/transition，由下方 recovery 的 setTextHover 直接覆写，避免中间跌落）
    activeBtn.classList.remove('tab-hover-lift', 'instant-hover', 'instant-return', 'tab-pressed', 'instant-press', 'tab-dim');
    if (lifted === activeBtn) {
      lifted = null;
    }

    // 冻结过渡 → 加 tab-lift → 解冻
    activeBtn.style.setProperty('transition', 'none', 'important');
    activeBtn.classList.add('tab-lift');
    void activeBtn.offsetHeight;
    activeBtn.style.removeProperty('transition');

    // 滑块归位
    positionAt(activeBtn, false);
    slider!.style.transform = 'translateY(-2px)';
    slider!.classList.remove('lifted');
    if (highlight) highlight.style.opacity = '0.5';

    // 若鼠标仍在 newActive 上（Tab 切换无页面跳转），恢复 hover 态
    // 使用 returning=true 使 transform 与 mouseup 残留位一致，避免 X 轴偏移
    if (activeBtn.matches(':hover')) {
      hovering = true;
      lifted = activeBtn;
      setTextHover(true, true, true);
      // 瞬切到位（同 mouseup 模式），避免可见的 2px 右移过渡
      lifted.style.transition = 'transform 0.0s ease';
      void lifted.offsetHeight;
      lifted.style.transition = '';
      setSlider(true);
    }
  });
}
