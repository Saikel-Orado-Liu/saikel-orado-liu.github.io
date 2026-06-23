/**
 * Parallel light source for acrylic plate highlights.
 * A fixed directional light at (-200, -200) off-screen top-left.
 * All cards get a linear-gradient at 160deg with position offset
 * based on their distance from the light. Updates on scroll.
 */

const LIGHT_X = -200;  // off-screen left
const LIGHT_Y = -200;  // off-screen top

let raf = 0;
let targets: Element[] = [];

function update() {
  const scrollY = window.scrollY;

  for (const el of targets) {
    const rect = (el as HTMLElement).getBoundingClientRect();
    if (rect.bottom < -200 || rect.top > window.innerHeight + 200) continue;

    // Card center in page coordinates
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2 + scrollY;

    // Distance from light to card center (in page coords)
    const dx = cx - LIGHT_X;
    const dy = cy - LIGHT_Y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Normalize distance to [0,1] range (max 2000px)
    const t = Math.min(1, dist / 2000);

    // Highlight offset: closer to light = more highlight visible
    // bg-position moves the 1200px gradient relative to the card
    const offX = -200 + t * 400;  // from -200 to +200
    const offY = -150 + t * 300;  // from -150 to +150

    const node = el as HTMLElement;
    node.style.setProperty('--lx', `${offX}px`);
    node.style.setProperty('--ly', `${offY}px`);
  }
}

function onScroll() {
  if (raf) return;
  raf = requestAnimationFrame(() => { raf = 0; update(); });
}

function collect() {
  targets = Array.from(document.querySelectorAll('.card, .plate, .plate-accent'));
}

export function initParallelLight(): void {
  collect();
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  document.addEventListener('astro:after-swap', () => { collect(); update(); });
}
