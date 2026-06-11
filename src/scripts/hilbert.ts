/**
 * Order-4 Hilbert 曲线背景纹理 path 生成。
 * 16×16 网格 (256 段)，拼贴尺寸 280×280 px，旋转 45°。
 */
export function initHilbert(): void {
  function hilbertD2XY(n: number, d: number): [number, number] {
    let x = 0, y = 0;
    for (let s = 1; s < (1 << n); s <<= 1) {
      const rx = (d >> 1) & 1;
      const ry = (d ^ rx) & 1;
      if (ry === 0) {
        if (rx === 1) { x = s - 1 - x; y = s - 1 - y; }
        const t = x; x = y; y = t;
      }
      x += s * rx;
      y += s * ry;
      d >>= 2;
    }
    return [x, y];
  }

  const N = 4, total = 1 << (2 * N), grid = 1 << N;
  const tileSize = 280, cellSize = tileSize / grid;
  const extend = 1.2 * cellSize;

  const pts: [number, number][] = [];
  for (let i = 0; i < total; i++) {
    const xy = hilbertD2XY(N, i);
    pts.push([(xy[1] + 0.5) * cellSize, (xy[0] + 0.5) * cellSize]);
  }

  const first = pts[0], second = pts[1];
  const prev = pts[total - 2], last = pts[total - 1];
  const startDx = second[0] - first[0], startDy = second[1] - first[1];
  const endDx = last[0] - prev[0], endDy = last[1] - prev[1];

  let d = `M${(first[0] - (startDx / cellSize) * extend).toFixed(3)},${(first[1] - (startDy / cellSize) * extend).toFixed(3)}`;
  d += `L${first[0].toFixed(3)},${first[1].toFixed(3)}`;
  for (let j = 1; j < pts.length; j++) d += `L${pts[j][0].toFixed(3)},${pts[j][1].toFixed(3)}`;
  d += `L${(last[0] + (endDx / cellSize) * extend).toFixed(3)},${(last[1] + (endDy / cellSize) * extend).toFixed(3)}`;

  const pathEl = document.getElementById('hilbert-path');
  if (pathEl) pathEl.setAttribute('d', d);
}
