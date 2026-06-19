import { visit } from 'unist-util-visit';

export default function rehypeArticleImageSizes() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'img') return;
      if (!node.properties?.srcset) return;
      node.properties.sizes = '720px';
    });
  };
}
