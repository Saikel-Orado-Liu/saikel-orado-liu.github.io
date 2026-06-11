/**
 * 为 /spec/ 页面代码块注入 Gosper 曲线 SVG 背景层。
 * 六边形晶格直接在每个代码块的 SVG 中平铺——无缝对齐。
 * 描边参数与页面 Hilbert 曲线一致，JS 控制暗/亮切换。
 */
export function initCodeBg(): void {
  const LEVEL = 3;
  const SCALE = 22;
  const NS = 'http://www.w3.org/2000/svg';

  /* ---- L-system ---- */
  function expand(s: string): string {
    let r = '';
    for (let i = 0; i < s.length; i++) {
      if (s[i] === 'A') r += 'A-B--B+A++AA+B-';
      else if (s[i] === 'B') r += '+A-BB--B-A++A+B';
      else r += s[i];
    }
    return r;
  }
  let str = 'A';
  for (let i = 0; i < LEVEL; i++) str = expand(str);

  const S3 = Math.sqrt(3);
  const DIR = [
    { dx: 1, dy: 0 }, { dx: 0.5, dy: S3 / 2 }, { dx: -0.5, dy: S3 / 2 },
    { dx: -1, dy: 0 }, { dx: -0.5, dy: -S3 / 2 }, { dx: 0.5, dy: -S3 / 2 },
  ];

  const pts: { x: number; y: number }[] = [{ x: 0, y: 0 }];
  let x = 0, y = 0, dir = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (c === 'A' || c === 'B') { x += DIR[dir].dx; y += DIR[dir].dy; pts.push({ x, y }); }
    else if (c === '+') dir = (dir + 5) % 6;
    else if (c === '-') dir = (dir + 1) % 6;
  }

  /* ---- 平铺向量 ---- */
  const vx = pts[pts.length - 1].x - pts[0].x;
  const vy = pts[pts.length - 1].y - pts[0].y;
  const cos60 = 0.5, sin60 = S3 / 2;
  const v60x = vx * cos60 - vy * sin60;
  const v60y = vx * sin60 + vy * cos60;

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of pts) { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); }

  /* ---- path d ---- */
  const scaled = pts.map(p => ({ x: (p.x - minX) * SCALE, y: (p.y - minY) * SCALE }));
  let d = 'M';
  for (let i = 0; i < scaled.length; i++) {
    d += `${scaled[i].x.toFixed(3)},${scaled[i].y.toFixed(3)}`;
    if (i < scaled.length - 1) d += 'L';
  }

  const TVx = vx * SCALE, TVy = vy * SCALE;
  const T60x = v60x * SCALE, T60y = v60y * SCALE;

  /* ---- 设置页面级 path 定义 ---- */
  const defPath = document.getElementById('gosper-curve');
  if (defPath) defPath.setAttribute('d', d);

  /* ---- 亮色同步 ---- */
  const isLight = (): boolean =>
    document.documentElement.classList.contains('light-style') ||
    (window.matchMedia('(prefers-color-scheme: light)').matches && !document.documentElement.classList.contains('dark-style'));

  function syncTheme(): void {
    const light = isLight();
    if (defPath) {
      defPath.setAttribute('stroke', light ? '#F0EADA' : '#202020');
      defPath.setAttribute('opacity', light ? '0.6' : '0.55');
    }
  }
  syncTheme();
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', syncTheme);
  new MutationObserver(syncTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  /* ---- 每个代码块的 SVG ---- */
  function renderBlock(block: Element): void {
    const rect = block.getBoundingClientRect();
    const W = rect.width, H = rect.height;
    if (W <= 0 || H <= 0) return;

    const svg = document.createElementNS(NS, 'svg');
    svg.classList.add('code-bg-gosper');
    svg.setAttribute('aria-hidden', 'true');

    const margin = Math.hypot(TVx, TVy) * 2;
    for (let i = -4; i <= 6; i++) {
      for (let j = -4; j <= 6; j++) {
        const px = i * TVx + j * T60x;
        const py = i * TVy + j * T60y;
        if (px > -margin && px < W + margin && py > -margin && py < H + margin) {
          const use = document.createElementNS(NS, 'use');
          use.setAttribute('href', '#gosper-curve');
          use.setAttribute('x', px.toFixed(2));
          use.setAttribute('y', py.toFixed(2));
          svg.appendChild(use);
        }
      }
    }

    block.insertBefore(svg, block.firstChild);
  }

  document.querySelectorAll('.shiki, .astro-code').forEach(block => {
    if (!block.querySelector('.code-bg-gosper')) renderBlock(block);
  });
}
