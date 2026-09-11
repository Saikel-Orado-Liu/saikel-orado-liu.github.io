/**
 * 生成 README 封面 SVG（.github/assets/cover.svg）
 * 与站点设计语言一致：亚克力板（三层阴影）+ 希尔伯特晶格背景 + 品牌强调色 + 噪点材质
 */
import { writeFileSync, mkdirSync } from 'node:fs';

// ── 希尔伯特曲线 path（与站点 hilbert.ts 同算法/同参数：4 阶、280px tile） ──
function d2xy(n, d) {
  let x = 0, y = 0;
  for (let s = 1; s < (1 << n); s <<= 1) {
    const rx = (d >> 1) & 1;
    const ry = (d ^ rx) & 1;
    if (ry === 0) {
      if (rx === 1) { x = s - 1 - x; y = s - 1 - y; }
      const t = x; x = y; y = t;
    }
    x += s * rx; y += s * ry; d >>= 2;
  }
  return [x, y];
}
const N = 4, total = 1 << (2 * N), grid = 1 << N;
const tile = 280, cell = tile / grid, extend = 1.2 * cell;
const pts = [];
for (let i = 0; i < total; i++) { const [a, b] = d2xy(N, i); pts.push([(b + 0.5) * cell, (a + 0.5) * cell]); }
const f = pts[0], s2 = pts[1], p2 = pts[total - 2], l = pts[total - 1];
let hilbert = `M${(f[0] - ((s2[0] - f[0]) / cell) * extend).toFixed(2)},${(f[1] - ((s2[1] - f[1]) / cell) * extend).toFixed(2)}`;
hilbert += `L${f[0].toFixed(2)},${f[1].toFixed(2)}`;
for (let i = 1; i < pts.length; i++) hilbert += `L${pts[i][0].toFixed(2)},${pts[i][1].toFixed(2)}`;
hilbert += `L${(l[0] + ((l[0] - p2[0]) / cell) * extend).toFixed(2)},${(l[1] + ((l[1] - p2[1]) / cell) * extend).toFixed(2)}`;

const W = 1280, H = 460;
const chipRows = [
  ['Astro 7.3', 'Tailwind CSS 4.3', 'TypeScript 5.9', '10 locales · RTL'],
  ['Static · GitHub Pages · Pagefind search', 'Code MIT · Content All Rights Reserved'],
];
let chipSvg = '';
chipRows.forEach((row, ri) => {
  let chipX = 212;
  const y = 330 + ri * 50;
  for (const c of row) {
    const w = 26 + c.length * 12.2;
    chipSvg += `
    <rect x="${chipX.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="38" rx="19" fill="#333333"
          stroke="rgba(245,245,245,0.10)" stroke-width="1" />
    <text x="${(chipX + w / 2).toFixed(1)}" y="${y + 25}" font-size="16.5" text-anchor="middle"
          fill="#F5F5F5" font-family="'Segoe UI',system-ui,sans-serif">${c}</text>`;
    chipX += w + 12;
  }
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="GameGeek-Saikel personal website">
  <title>游戏极客-Saikel · GameGeek-Saikel — personal website</title>
  <defs>
    <!-- 希尔伯特晶格背景（45° 旋转，与站点一致） -->
    <pattern id="lattice" width="${tile}" height="${tile}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <path d="${hilbert}" fill="none" stroke="#242424" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="0.55" />
    </pattern>

    <!-- 板级柔影（L2） -->
    <filter id="plateShadow" x="-20%" y="-40%" width="140%" height="200%">
      <feDropShadow dx="10" dy="8" stdDeviation="6" flood-color="#000000" flood-opacity="0.30" />
    </filter>

    <!-- 版心噪点（暗色板级：turb 0.19 / 3 oct，overlay 0.25） -->
    <filter id="grain" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.19" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="matrix" values="0.333 0.333 0.333 0 0  0.333 0.333 0.333 0 0  0.333 0.333 0.333 0 0  0 0 0 1 0" />
    </filter>

    <!-- 左上入射高光 / 内嵌暗边（L3） -->
    <linearGradient id="sheen" x1="0" y1="0" x2="0.75" y2="1">
      <stop offset="0" stop-color="#F5F5F5" stop-opacity="0.12" />
      <stop offset="0.45" stop-color="#F5F5F5" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="insetEdge" x1="0" y1="0" x2="0.6" y2="0.8">
      <stop offset="0" stop-color="#000000" stop-opacity="0.35" />
      <stop offset="0.35" stop-color="#000000" stop-opacity="0" />
    </linearGradient>

    <!-- 品牌标记：强调色亚克力圆板 -->
    <linearGradient id="brandSheen" x1="0" y1="0" x2="0.7" y2="1">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.40" />
      <stop offset="0.55" stop-color="#FFFFFF" stop-opacity="0" />
    </linearGradient>

    <clipPath id="plateClip"><rect x="56" y="40" width="1168" height="380" rx="24" /></clipPath>
    <clipPath id="brandClip"><circle cx="140" cy="140" r="46" /></clipPath>
  </defs>

  <!-- 画布底色 + 晶格 -->
  <rect width="${W}" height="${H}" fill="#141414" />
  <rect width="${W}" height="${H}" fill="url(#lattice)" />

  <!-- 板：L1 右下切边厚度（4px 硬边，白 20%） -->
  <rect x="60" y="44" width="1168" height="380" rx="24" fill="#F5F5F5" opacity="0.20" />
  <!-- 板体 + L2 环境柔影 -->
  <rect x="56" y="40" width="1168" height="380" rx="24" fill="#262626" filter="url(#plateShadow)" />
  <!-- 板噪声 + L3 内嵌暗边 + 漫反射高光（裁剪在板内） -->
  <g clip-path="url(#plateClip)">
    <rect x="56" y="40" width="1168" height="380" filter="url(#grain)" opacity="0.25" style="mix-blend-mode:overlay" />
    <rect x="56" y="40" width="1168" height="380" fill="url(#insetEdge)" />
    <rect x="56" y="40" width="1168" height="380" fill="url(#sheen)" />
  </g>
  <rect x="56.5" y="40.5" width="1167" height="379" rx="23.5" fill="none" stroke="rgba(245,245,245,0.08)" stroke-width="1" />

  <!-- 品牌标记（强调板 + 四芒星） -->
  <circle cx="143" cy="143" r="46" fill="#E61300" opacity="0.9" />
  <circle cx="140" cy="140" r="46" fill="#FF1500" />
  <g clip-path="url(#brandClip)">
    <circle cx="140" cy="140" r="46" fill="url(#brandSheen)" />
    <circle cx="140" cy="140" r="46" filter="url(#grain)" opacity="0.5" />
  </g>
  <path d="M140 110 L150 130 L170 140 L150 150 L140 170 L130 150 L110 140 L130 130 Z" fill="#FFFFFF" />

  <!-- 品牌文案 -->
  <text x="212" y="132" font-size="58" font-weight="700" fill="#F5F5F5"
        font-family="'MiSans','PingFang SC','Microsoft YaHei',system-ui,sans-serif">游戏极客-Saikel</text>
  <text x="212" y="176" font-size="24" fill="#FF6B6B"
        font-family="'Segoe UI',system-ui,sans-serif" letter-spacing="2">GameGeek-Saikel</text>
  <line x1="212" y1="204" x2="1180" y2="204" stroke="rgba(245,245,245,0.12)" stroke-width="1" />
  <text x="212" y="244" font-size="21" fill="#ADADAD"
        font-family="'MiSans','PingFang SC','Microsoft YaHei',system-ui,sans-serif">技术博客 · 虚幻引擎 5 插件文档 · 抽象拟物设计系统</text>
  <text x="212" y="276" font-size="19" fill="#ADADAD"
        font-family="'Segoe UI',system-ui,sans-serif">Blog · Unreal Engine 5 plugin docs · Acrylic design system — saikel-orado-liu.github.io</text>

  <!-- 能力标签 -->
  ${chipSvg}
</svg>
`;

mkdirSync('.github/assets', { recursive: true });
writeFileSync('.github/assets/cover.svg', svg, 'utf8');
console.log('.github/assets/cover.svg written, bytes =', svg.length);
