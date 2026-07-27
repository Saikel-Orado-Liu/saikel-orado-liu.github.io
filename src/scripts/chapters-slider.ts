/**
 * 章节链接交互 — 纯 CSS hover/active，JS 仅处理选项卡切换后的链接状态刷新。
 */
export function initChaptersSlider(): void {
  const card = document.querySelector<HTMLElement>('.doc-chapters-card');
  if (!card || card.dataset.chaptersSliderReady) return;
  card.dataset.chaptersSliderReady = 'true';

  card.addEventListener('tabs-slider:refresh', () => {
    // 仅刷新引用 —— 不再强制选中第一项
  });
}
