/**
 * 生成 README 徽章条（.github/assets/badges.svg）
 *
 * 与主站 .tag（小型控件板级）同配方：胶囊（--shape-full）+ 1px 2px 切边 + 2px 3px 4px 柔影
 * + inset 内嵌暗边 + 噪点（256 viewBox 平铺 70px ⇒ 有效频率 ≈1.0）+ 160° 漫反射高光。
 * 强调徽章走 .tag-accent（accent 87% + 黑 13%）。
 *
 * 画布透明：白底/暗底 GitHub 主题下都成立（暗色亚克力板在两种背景下均可读）。
 */
import { writeFileSync, mkdirSync } from 'node:fs';

const H = 32, R = H / 2, GAP = 12, PAD = 6;   // 画布上下留 6px 给切边与柔影
const plate = '#262626';
const accentPlate = '#DE1300';   // accent 87% + 黑 13%
const accentEdge = '#FF5C4D';    // accent 70% + 白 30%
const text = '#F5F5F5';

/** 徽章宽度：按字符宽度估算（CJK 15px / 拉丁 8.4px），与封面 tag 同一算法 */
function badgeWidth(label) {
  let w = 0;
  for (const ch of label) w += /[\u4e00-\u9fff\uff00-\uffef]/.test(ch) ? 15 : 8.4;
  return Math.round(26 + w) + 8;
}

const badges = [
  { label: 'Astro 7.3 · Tailwind 4.3', tone: 'plate' },
  { label: '10 locales · RTL', tone: 'plate' },
  { label: 'Code MIT · Content All Rights Reserved', tone: 'accent' },
];

const totalWidth = PAD * 2 + badges.reduce((sum, b) => sum + badgeWidth(b.label), 0) + GAP * (badges.length - 1);

let x = PAD;
const svgBadges = badges.map((b) => {
  const w = badgeWidth(b.label);
  const isAccent = b.tone === 'accent';
  const body = isAccent ? accentPlate : plate;
  const edge = isAccent ? accentEdge : 'rgba(245,245,245,0.20)';
  const y = PAD;
  const svg = `
  <g>
    <rect x="${x}" y="${y}" width="${w}" height="${H}" rx="${R}" fill="${body}" filter="url(#badgeSoft)" />
    <rect x="${x + 1}" y="${y + 2}" width="${w}" height="${H}" rx="${R}" fill="${edge}" />
    <rect x="${x}" y="${y}" width="${w}" height="${H}" rx="${R}" fill="${body}"
          stroke="rgba(245,245,245,${isAccent ? '0.15' : '0.06'})" stroke-width="1" />
    <g clip-path="url(#clipBadge${x})">
      <rect x="${x}" y="${y}" width="${w}" height="${H}" filter="url(#grain)" opacity="0.20" style="mix-blend-mode:overlay" />
      <rect x="${x}" y="${y}" width="${w}" height="${H}" fill="url(#badgeInset)" />
      <rect x="${x}" y="${y}" width="${w}" height="${H}" fill="url(#badgeSheen)" opacity="0.28" />
    </g>
    <text x="${x + w / 2}" y="${y + 21}" font-size="14" font-weight="500" text-anchor="middle" fill="${text}"
          font-family="'MiSans','PingFang SC','Microsoft YaHei','Segoe UI',system-ui,sans-serif">${b.label}</text>
  </g>
  <clipPath id="clipBadge${x}"><rect x="${x}" y="${y}" width="${w}" height="${H}" rx="${R}" /></clipPath>`;
  x += w + GAP;
  return svg;
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${H + PAD * 2}" viewBox="0 0 ${totalWidth} ${H + PAD * 2}"
     role="img" aria-label="Astro 7.3, Tailwind CSS 4.3, 10 locales with RTL, code MIT, content All Rights Reserved">
  <title>项目徽章</title>
  <defs>
    <!-- 小型控件 L2 柔影：2px 3px 4px 0 rgba(0,0,0,.67) -->
    <filter id="badgeSoft" x="-30%" y="-40%" width="170%" height="200%">
      <feDropShadow dx="2" dy="3" stdDeviation="2" flood-color="#000000" flood-opacity="0.67" />
    </filter>
    <!-- 小型控件噪点：256 viewBox 平铺 70px ⇒ 有效频率 1.0，contrast(5) 线性近似 -->
    <filter id="grain" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="1.0" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="matrix" values="0.333 0.333 0.333 0 0  0.333 0.333 0.333 0 0  0.333 0.333 0.333 0 0  0 0 0 1 0" />
      <feComponentTransfer><feFuncR type="linear" slope="5" intercept="-2" /><feFuncG type="linear" slope="5" intercept="-2" /><feFuncB type="linear" slope="5" intercept="-2" /></feComponentTransfer>
    </filter>
    <linearGradient id="badgeSheen" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.40" />
      <stop offset="0.55" stop-color="#FFFFFF" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="badgeInset" x1="0" y1="0" x2="0.7" y2="0.9">
      <stop offset="0" stop-color="#000000" stop-opacity="0.15" />
      <stop offset="0.5" stop-color="#000000" stop-opacity="0" />
    </linearGradient>
  </defs>
  ${svgBadges.join('\n  ')}
</svg>
`;

mkdirSync('.github/assets', { recursive: true });
writeFileSync('.github/assets/badges.svg', svg, 'utf8');
console.log(`.github/assets/badges.svg written — ${badges.length} badges, ${totalWidth}×${H + PAD * 2}, bytes = ${svg.length}`);
