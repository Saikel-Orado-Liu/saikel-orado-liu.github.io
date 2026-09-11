/**
 * 生成 README 封面 SVG（.github/assets/cover.svg）
 * 严格按 docs/网页设计规范.md 的材质与几何：
 *   板级三层阴影 4px/10px 8px 6px 1px/inset 5px 5px 3px 0 · 噪点 256@0.19 tile120 contrast8 overlay .25
 *   胶囊 tag 小型控件 1px 2px 0 0/2px 3px 4px 0/inset 1px 2px 1px 0 · 噪点 256@0.28 tile70 contrast5 overlay .5
 *   强调板 accent 87% + 黑 13%；标题 1px 1px 0 文字阴影；希尔伯特曲线背景 280px/45°/7px 圆头
 */
import { writeFileSync, mkdirSync } from 'node:fs';

// ── 希尔伯特曲线 path（与站点 hilbert.ts 同算法/同参数） ──
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

const W = 1280, H = 420;
const accentPlate = '#DE1300';      // accent 87% + 黑 13%
const accentEdge = '#FF5C4D';       // accent 70% + 白 30%
const plate = '#262626';
const text = '#F5F5F5';
const textDim = '#ADADAD';
const accent2 = '#FF6B6B';

/** 胶囊 tag（小型控件板级：1px 2px 切边 / 2px 3px 4px 柔影 / inset 1px 2px 内嵌） */
function tagWidth(label) {
  return 26 + label.length * 8.2;
}

function tag(x, y, label, tone = 'plate') {
  const h = 28, r = h / 2;
  const w = tagWidth(label);
  const isAccent = tone === 'accent';
  const body = isAccent ? accentPlate : plate;
  const edge = isAccent ? accentEdge : 'rgba(245,245,245,0.18)';
  return `
  <g>
    <rect x="${x.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="${h}" rx="${r}" fill="${body}" filter="url(#tagSoft)" />
    <rect x="${(x + 1).toFixed(1)}" y="${(y + 2).toFixed(1)}" width="${w.toFixed(1)}" height="${h}" rx="${r}" fill="${edge}" />
    <rect x="${x.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="${h}" rx="${r}" fill="${body}"
          stroke="rgba(245,245,245,${isAccent ? '0.15' : '0.06'})" stroke-width="1" />
    <g clip-path="url(#clipTag${x}${y})">
      <rect x="${x.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="${h}" filter="url(#grainFine)" opacity="0.20" style="mix-blend-mode:overlay" />
      <rect x="${x.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="${h}" fill="url(#tagInset)" />
      <rect x="${x.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="${h}" fill="url(#tagSheen)" opacity="0.28" />
    </g>
    <text x="${(x + w / 2).toFixed(1)}" y="${y + 19}" font-size="14" font-weight="500" text-anchor="middle"
          fill="${text}" font-family="'MiSans','PingFang SC','Microsoft YaHei','Segoe UI',system-ui,sans-serif">${label}</text>
  </g>
  <clipPath id="clipTag${x}${y}"><rect x="${x.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="${h}" rx="${r}" /></clipPath>`;
}

/** tag 行：按内容宽度顺排（间距 12px），避免手工估算坐标 */
const tagRowY = 308;
const tagLabels = ['Astro 7.3', '10 locales · RTL', 'Code MIT · Content ARR'];
let tagX = 214;
const tags = tagLabels.map((label) => {
  const svgTag = tag(tagX, tagRowY, label);
  tagX += tagWidth(label) + 12;
  return svgTag;
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img"
     aria-label="GameGeek-Saikel — personal website, blog, UE5 plugin documentation and an acrylic design system">
  <title>游戏极客-Saikel · GameGeek-Saikel</title>
  <defs>
    <!-- 背景：希尔伯特曲线晶格（280px tile / 45° / 7px 圆头 / #242424 / opacity .55） -->
    <pattern id="lattice" width="${tile}" height="${tile}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <path d="${hilbert}" fill="none" stroke="#242424" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="0.55" />
    </pattern>

    <!-- 板级 L2 环境柔影：10px 8px 6px 1px rgba(0,0,0,.30) -->
    <filter id="plateSoft" x="-15%" y="-30%" width="130%" height="180%">
      <feDropShadow dx="11" dy="9" stdDeviation="7" flood-color="#000000" flood-opacity="0.30" />
    </filter>
    <!-- 小型控件 L2 柔影：2px 3px 4px 0 rgba(0,0,0,.67) -->
    <filter id="tagSoft" x="-30%" y="-40%" width="170%" height="200%">
      <feDropShadow dx="2" dy="3" stdDeviation="2" flood-color="#000000" flood-opacity="0.67" />
    </filter>

    <!-- 板级噪点：CSS 中 256 viewBox 的噪点平铺到 120px ⇒ 有效频率 0.19×2.13 ≈ 0.40，contrast(8) 线性近似，overlay .25 -->
    <filter id="grainPlate" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.40" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="matrix" values="0.333 0.333 0.333 0 0  0.333 0.333 0.333 0 0  0.333 0.333 0.333 0 0  0 0 0 1 0" />
      <feComponentTransfer><feFuncR type="linear" slope="6" intercept="-2.5" /><feFuncG type="linear" slope="6" intercept="-2.5" /><feFuncB type="linear" slope="6" intercept="-2.5" /></feComponentTransfer>
    </filter>
    <!-- 小型控件噪点：256 viewBox 平铺到 70px ⇒ 有效频率 0.28×3.66 ≈ 1.0，contrast(5) 近似 -->
    <filter id="grainFine" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="1.0" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="matrix" values="0.333 0.333 0.333 0 0  0.333 0.333 0.333 0 0  0.333 0.333 0.333 0 0  0 0 0 1 0" />
      <feComponentTransfer><feFuncR type="linear" slope="5" intercept="-2" /><feFuncG type="linear" slope="5" intercept="-2" /><feFuncB type="linear" slope="5" intercept="-2" /></feComponentTransfer>
    </filter>

    <!-- 漫反射高光 160° -->
    <linearGradient id="sheen" x1="0" y1="0" x2="0.68" y2="1">
      <stop offset="0" stop-color="${text}" stop-opacity="0.12" />
      <stop offset="0.45" stop-color="${text}" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="tagSheen" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.40" />
      <stop offset="0.55" stop-color="#FFFFFF" stop-opacity="0" />
    </linearGradient>
    <!-- 内嵌暗边 L3 -->
    <linearGradient id="insetPlate" x1="0" y1="0" x2="0.55" y2="0.75">
      <stop offset="0" stop-color="#000000" stop-opacity="0.14" />
      <stop offset="0.4" stop-color="#000000" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="tagInset" x1="0" y1="0" x2="0.7" y2="0.9">
      <stop offset="0" stop-color="#000000" stop-opacity="0.15" />
      <stop offset="0.5" stop-color="#000000" stop-opacity="0" />
    </linearGradient>
    <!-- 强调板亮度渐变 -->
    <linearGradient id="accentSheen" x1="0" y1="0" x2="0.7" y2="1">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.40" />
      <stop offset="0.55" stop-color="#FFFFFF" stop-opacity="0" />
    </linearGradient>

    <clipPath id="clipPlate"><rect x="56" y="40" width="1168" height="340" rx="14" /></clipPath>
    <clipPath id="clipMark"><circle cx="140" cy="150" r="46" /></clipPath>
  </defs>

  <!-- 画布 -->
  <rect width="${W}" height="${H}" fill="#141414" />
  <rect width="${W}" height="${H}" fill="url(#lattice)" />

  <!-- 板：L2 柔影（先落影）→ L1 切边（叠在影之上，才不会被压暗）→ 板体 → 噪点 + L3 内嵌 + 高光 -->
  <rect x="56" y="40" width="1168" height="340" rx="14" fill="${plate}" filter="url(#plateSoft)" />
  <rect x="61" y="45" width="1168" height="340" rx="14" fill="rgba(245,245,245,0.22)" />
  <rect x="56" y="40" width="1168" height="340" rx="14" fill="${plate}" />
  <g clip-path="url(#clipPlate)">
    <rect x="56" y="40" width="1168" height="340" filter="url(#grainPlate)" opacity="0.20" style="mix-blend-mode:overlay" />
    <rect x="56" y="40" width="1168" height="340" fill="url(#insetPlate)" />
    <rect x="56" y="40" width="1168" height="340" fill="url(#sheen)" />
  </g>
  <path d="M70 40.5 H1200 M56.5 54 V366" stroke="rgba(245,245,245,0.05)" stroke-width="1" fill="none" />

  <!-- 品牌标记：强调板圆形徽记（柔影 → 切边 → 板体 → 内嵌 + 噪点 + 高光 + 四芒星） -->
  <circle cx="140" cy="150" r="46" fill="${accentPlate}" filter="url(#tagSoft)" />
  <circle cx="141.5" cy="152.5" r="46" fill="${accentEdge}" />
  <circle cx="140" cy="150" r="46" fill="${accentPlate}" />
  <g clip-path="url(#clipMark)">
    <circle cx="140" cy="150" r="46" filter="url(#grainFine)" opacity="0.22" style="mix-blend-mode:overlay" />
    <circle cx="140" cy="150" r="46" fill="url(#tagInset)" />
    <circle cx="140" cy="150" r="46" fill="url(#accentSheen)" />
  </g>
  <path d="M140 118 L151 139 L172 150 L151 161 L140 182 L129 161 L108 150 L129 139 Z" fill="#FFFFFF" />

  <!-- 标题（1px 1px 0 文字阴影）与身份 -->
  <text x="215" y="141" font-size="54" font-weight="700" fill="rgba(245,245,245,0.30)"
        font-family="'MiSans','PingFang SC','Microsoft YaHei',system-ui,sans-serif">游戏极客-Saikel</text>
  <text x="214" y="140" font-size="54" font-weight="700" fill="${text}"
        font-family="'MiSans','PingFang SC','Microsoft YaHei',system-ui,sans-serif">游戏极客-Saikel</text>
  <text x="216" y="178" font-size="21" fill="${accent2}" letter-spacing="3"
        font-family="'Segoe UI',system-ui,sans-serif">GameGeek-Saikel</text>
  <line x1="214" y1="204" x2="1180" y2="204" stroke="rgba(245,245,245,0.12)" stroke-width="1" />
  <text x="214" y="242" font-size="20" fill="${textDim}"
        font-family="'MiSans','PingFang SC','Microsoft YaHei',system-ui,sans-serif">技术博客 · 虚幻引擎 5 插件文档 · 抽象拟物设计系统</text>
  <text x="214" y="272" font-size="16.5" fill="${textDim}"
        font-family="'Segoe UI',system-ui,sans-serif">Blog · Unreal Engine 5 plugin docs · Acrylic design system</text>
  <text x="1180" y="270" font-size="14.5" fill="rgba(173,173,173,0.85)" text-anchor="end"
        font-family="'Segoe UI',system-ui,sans-serif">saikel-orado-liu.github.io</text>

  <!-- 胶囊 tag × 3（小型控件板级：圆角拟物） -->
  ${tags.join('\n  ')}
</svg>
`;

mkdirSync('.github/assets', { recursive: true });
writeFileSync('.github/assets/cover.svg', svg, 'utf8');
console.log('.github/assets/cover.svg written, bytes =', svg.length);
