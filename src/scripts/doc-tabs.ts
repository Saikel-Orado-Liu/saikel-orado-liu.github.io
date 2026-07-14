/**
 * 文档侧边栏分类选项卡切换逻辑
 * 纯客户端切换：所有 tab 对应的章节已预渲染在 DOM 中，通过 data-tab 属性控制显隐。
 * 页面间导航时重置为默认选项卡。
 */

export function initDocTabs(
  tabsCard: HTMLElement,
  chaptersCard: HTMLElement,
  initialTab: string,
): void {
  let activeTab = initialTab;

  function switchTab(tab: string): void {
    if (tab === activeTab) return;
    activeTab = tab;
    applyTab(tab);
    // 通知 tabs-slider 刷新内部状态
    tabsCard.dispatchEvent(new CustomEvent('tabs-slider:refresh'));
  }

  function applyTab(tab: string): void {
    // 更新选项卡按钮状态
    tabsCard.querySelectorAll<HTMLElement>('.doc-tab-btn').forEach((btn) => {
      const isActive = btn.dataset.tab === tab;
      btn.classList.toggle('doc-tab-btn--active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });

    // 更新章节列表显隐
    chaptersCard.querySelectorAll<HTMLElement>('.doc-tree-nav').forEach((nav) => {
      const isVisible = nav.dataset.tab === tab;
      nav.classList.toggle('doc-tree-nav--hidden', !isVisible);
    });

    chaptersCard.dataset.activeTab = tab;

    // 重定位 tabs 滑块
    const slider = tabsCard.querySelector<HTMLElement>('.doc-tabs-slider');
    if (slider) {
      const activeBtn = tabsCard.querySelector<HTMLElement>('.doc-tab-btn--active');
      if (activeBtn) {
        const groove = slider.parentElement!;
        // 使用 offsetTop/offsetHeight（不受 CSS transform 影响，相对 padding edge）
        let top = 0;
        let el: HTMLElement | null = activeBtn;
        while (el && el !== groove) {
          top += el.offsetTop;
          el = el.offsetParent as HTMLElement | null;
        }
        slider.style.transition = 'none';
        slider.style.top = `${top}px`;
        void slider.offsetHeight;
        slider.style.transition = '';
      }
    }
  }

  // 绑定选项卡点击
  tabsCard.querySelectorAll<HTMLElement>('.doc-tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      if (tab) switchTab(tab);
    });
  });

  // 初始定位滑块
  applyTab(activeTab);

  // 添加 aria 属性
  tabsCard.setAttribute('role', 'tablist');
  tabsCard.querySelectorAll<HTMLElement>('.doc-tab-btn').forEach((btn) => {
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', String(btn.dataset.tab === activeTab));
  });
}
