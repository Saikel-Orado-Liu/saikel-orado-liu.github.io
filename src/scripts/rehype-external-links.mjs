/**
 * Rehype 插件：为外部链接添加 target="_blank" 和 rel="noopener noreferrer"。
 * 内部链接（同源或相对路径）不做修改，保持默认跳转行为。
 */
import { visit } from 'unist-util-visit';

export default function rehypeExternalLinks() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'a' && node.properties?.href) {
        const href = node.properties.href;
        const isExternal = /^https?:\/\//.test(href);
        if (isExternal) {
          node.properties.target = '_blank';
          node.properties.rel = 'noopener noreferrer';
        }
      }
    });
  };
}
