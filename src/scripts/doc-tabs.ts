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
  }

  // 绑定选项卡点击
  tabsCard.querySelectorAll<HTMLElement>('.doc-tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      if (tab) switchTab(tab);
    });
  });

  // 添加 aria 属性
  tabsCard.setAttribute('role', 'tablist');
  tabsCard.querySelectorAll<HTMLElement>('.doc-tab-btn').forEach((btn) => {
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', String(btn.dataset.tab === activeTab));
  });
}
