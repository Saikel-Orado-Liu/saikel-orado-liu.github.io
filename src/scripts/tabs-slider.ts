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

  function positionAt(target: HTMLElement, animate: boolean): void {
    if (!animate) { slider!.style.transition = 'none'; }
    // 使用 offsetTop/offsetHeight（不受 CSS transform 影响，相对 padding edge）
    let top = 0;
    let el: HTMLElement | null = target;
    while (el && el !== groove) {
      top += el.offsetTop;
      el = el.offsetParent as HTMLElement | null;
    }
    slider!.style.top = `${top}px`;
    if (!animate) { void slider!.offsetHeight; slider!.style.transition = ''; }
  }

  function setSlider(on: boolean): void {
    slider!.style.transition = 'top 0.4s cubic-bezier(0.4,0,0.2,1), height 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.25s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s ease, border-color 0.4s ease';
    slider!.style.transform = on ? 'translate(-2px, -6px)' : 'translateY(-2px)';
    slider!.classList.toggle('lifted', on);
    if (highlight) highlight.style.opacity = on ? '1' : '0.5';
  }

  function lift(target: HTMLElement | null): void {
    if (target === lifted) return;
    if (lifted) {
      lifted.classList.remove('tab-lift', 'tab-hover-lift', 'instant-hover', 'instant-return', 'tab-pressed', 'instant-press');
      lifted.classList.add('tab-dim');
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
    if (on) lifted.style.transitionDelay = '';
    else lifted.style.transitionDelay = '0.05s';
  }

  // 初始定位（冻结文字过渡，避免初始闪动）
  void groove.offsetHeight;
  positionAt(activeBtn, false);
  slider!.style.transform = 'translateY(-2px)';
  activeBtn.style.setProperty('transition', 'none', 'important');
  lift(activeBtn);
  void activeBtn.offsetHeight;
  activeBtn.style.removeProperty('transition');

  // hover
  btns.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      hovering = true;
      const same = (btn === getActive());
      const returning = same && (btn !== lifted);
      positionAt(btn, true);
      lift(btn);
      setTextHover(true, same, returning);
      setSlider(true);
    });
  });

  // mouse leave
  let returnTimer: ReturnType<typeof setTimeout> | null = null;
  let pressRecover: ReturnType<typeof setTimeout> | null = null;
  groove.addEventListener('mouseleave', () => {
    hovering = false;
    if (pressed) {
      if (pressRecover) clearTimeout(pressRecover);
      pressRecover = setTimeout(recoverPress, 0);
      return;
    }
    setTextHover(false);
    setSlider(false);
    const curActive = getActive();
    if (curActive) lift(curActive);
    returnTimer = setTimeout(() => {
      const cur = getActive();
      if (cur && !groove.querySelector('.doc-tab-btn:hover')) {
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
    setTextHover(false);
    if (lifted) lifted.classList.remove('tab-pressed', 'instant-press');
    if (cur) lift(cur);
    slider!.style.transition = 'none';
    slider!.style.transform = 'translateY(-2px)';
    void slider!.offsetHeight;
    slider!.style.transition = 'top 0.4s cubic-bezier(0.4,0,0.2,1), height 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s ease, border-color 0.4s ease';
    if (cur) positionAt(cur, true);
  }

  function currentTarget(): HTMLElement | null {
    return lifted ?? getActive();
  }

  // 监听外部选项卡切换（来自 doc-tabs.ts），同步内部状态
  groove.addEventListener('tabs-slider:refresh', () => {
    const newActive = groove.querySelector<HTMLElement>('.doc-tab-btn--active');
    if (!newActive || newActive === activeBtn) return;
    // 清理旧 active：移除动画类，加 tab-dim 保证回弹有过渡
    activeBtn.classList.remove('tab-lift', 'tab-hover-lift', 'instant-hover', 'instant-return', 'tab-pressed', 'instant-press');
    activeBtn.classList.add('tab-dim');
    // 若旧 active 正被 lift，重置引用
    if (lifted === activeBtn) {
      lifted = null;
    }
    // 更新引用
    activeBtn = newActive;
    // 新 active 初始抬起（冻结过渡避免闪动）
    activeBtn.style.setProperty('transition', 'none', 'important');
    activeBtn.classList.add('tab-lift');
    activeBtn.classList.remove('tab-dim');
    void activeBtn.offsetHeight;
    activeBtn.style.removeProperty('transition');
    // 滑块归位
    positionAt(activeBtn, false);
    slider!.style.transform = 'translateY(-2px)';
    slider!.classList.remove('lifted');
    if (highlight) highlight.style.opacity = '0.5';
  });

  // resize
  let resizeTimer: ReturnType<typeof setTimeout>;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const target = currentTarget();
      if (target) positionAt(target, false);
    }, 100);
  });

  // pressed
  btns.forEach(btn => {
    btn.addEventListener('mousedown', () => {
      pressed = true;
      slider!.style.transition = 'transform 0.06s ease, box-shadow 0.1s ease, border-color 0.1s ease';
      slider!.style.transform = 'translate(1px, 0)';
      slider!.classList.remove('lifted');
      if (highlight) highlight.style.opacity = '0.5';
      if (lifted) {
        lifted.classList.add('tab-pressed');
        if (instantMode) lifted.classList.add('instant-press');
      }
    });
  });
  window.addEventListener('mouseup', () => {
    if (pressRecover) { clearTimeout(pressRecover); pressRecover = null; }
    pressed = false;
    if (lifted) {
      lifted.classList.remove('tab-pressed', 'instant-press');
      lifted.style.setProperty('transition', 'none', 'important');
      void lifted.offsetHeight;
      lifted.style.removeProperty('transition');
    }
    slider!.style.transition = 'none';
    if (hovering) {
      slider!.style.transform = 'translateY(-5px)';
      slider!.classList.add('lifted');
      if (highlight) highlight.style.opacity = '1';
    } else {
      slider!.style.transform = 'translateY(-2px)';
    }
  });
}
