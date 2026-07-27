/**
 * 章节链接交互 — 纯 CSS hover/active，JS 仅处理选项卡切换后的链接状态刷新。
 */
export function initChaptersSlider(): void {
  const card = document.querySelector<HTMLElement>('.doc-chapters-card');
  if (!card || card.dataset.chaptersSliderReady) return;
  card.dataset.chaptersSliderReady = 'true';

  function getVisibleLinks(): NodeListOf<HTMLAnchorElement> {
    const navs = card!.querySelectorAll<HTMLElement>('.doc-tree-nav:not(.doc-tree-nav--hidden)');
    const links: HTMLAnchorElement[] = [];
    navs.forEach(nav => {
      nav.querySelectorAll<HTMLAnchorElement>('.doc-tree-link').forEach(link => links.push(link));
    });
    return links as unknown as NodeListOf<HTMLAnchorElement>;
  }

  function getActiveLink(): HTMLAnchorElement | null {
    return card!.querySelector<HTMLAnchorElement>('.doc-tree-link--active');
  }

  /** 确保可见链接中至少有一个具备 --active 标记 */
  function ensureActive(): void {
    const links = Array.from(getVisibleLinks());
    if (links.length < 1) return;
    const active = getActiveLink();
    if (!active) {
      const first = links.find(l => !l.classList.contains('chapter-dim')) ?? links[0];
      first.classList.add('doc-tree-link--active');
    }
  }

  ensureActive();

  card.addEventListener('tabs-slider:refresh', () => {
    requestAnimationFrame(ensureActive);
  });
}
