/**
 * Rehype 插件：为所有 Markdown 链接添加 target="_blank" 和 rel="noopener noreferrer"。
 */
import { visit } from 'unist-util-visit';

export default function rehypeExternalLinks() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'a' && node.properties?.href) {
        node.properties.target = '_blank';
        node.properties.rel = 'noopener noreferrer';
      }
    });
  };
}
