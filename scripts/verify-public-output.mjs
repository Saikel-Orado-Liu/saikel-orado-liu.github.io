/**
 * 构建产物守卫 —— 内部页面绝不允许进入公开产物（GitHub Pages 上传的是整个 dist/）。
 *
 * 背景：/spec/ 规范参考页与若干调试页曾长期随 dist/ 一起部署到公网
 * （noindex 与 sitemap 排除只能防收录，不能防访问）。现在这些页面：
 *   - 规范参考页：源码位于 src/spec/，只在 `astro dev` 注入路由（见 astro.config.mjs）
 *   - 调试页：源码位于 tools/ 等非发布目录
 * 本脚本作为最后一道防线：一旦产物里重新出现内部路径，直接让构建失败。
 *
 * 依据：docs/网页设计规范.md §0.1「样式规范参考页与分离约束」。
 */
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');

/** 禁止出现在公开产物中的路径（相对 dist/） */
const FORBIDDEN = ['spec', 'spec/index.html', 'spec/components/index.html', 'gosper-test.html'];

const found = FORBIDDEN.filter((rel) => existsSync(path.join(DIST, rel)));

if (!existsSync(DIST)) {
  console.error('[verify-public-output] 未找到 dist/ —— 请先执行构建。');
  process.exit(1);
}

// 附带体检：dist 根目录的 .html 清单，便于人工复核是否有新的内部页混入
const rootHtml = readdirSync(DIST).filter((f) => f.endsWith('.html'));

if (found.length > 0) {
  console.error('[verify-public-output] ✗ 内部内容泄漏到公开产物：');
  for (const rel of found) console.error(`    dist/${rel}`);
  console.error('  请检查 src/spec/ 是否被移回 src/pages/、或 public/ 是否混入调试文件。');
  process.exit(1);
}

console.log(`[verify-public-output] ✓ 产物无内部页面（dist 根 html：${rootHtml.join(', ') || '无'}）`);
