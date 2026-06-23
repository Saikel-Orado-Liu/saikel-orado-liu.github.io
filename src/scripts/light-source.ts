/**
 * Acrylic plate point-light highlight system.
 * Fixed point light source in the top-left area.
 * Each card gets --light-x/y (absolute px from card top-left) and --light-size/alpha
 * recalculated on scroll.
 */

// ── Light config ──
const LIGHT_VW = 0.08;   // x position as viewport fraction
const LIGHT_VY = 0.02;   // y position as viewport fraction (above viewport → top-left glow)
const LIGHT_RADIUS = 180; // fixed px radius — no stretching
const MAX_ALPHA_DARK = 0.18;
const MAX_ALPHA_LIGHT = 0.55;
const FALLOFF_START = 100;  // px: full intensity within this distance
const FALLOFF_END = 600;    // px: zero intensity beyond this distance

let raf = 0;
let targets: Element[] = [];

function updateHighlights() {
  const isLight = document.documentElement.classList.contains('light-style');
  const maxAlpha = isLight ? MAX_ALPHA_LIGHT : MAX_ALPHA_DARK;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const lightX = vw * LIGHT_VW;
  const lightY = vh * LIGHT_VY - window.scrollY; // absolute page coords

  for (const el of targets) {
    const rect = el.getBoundingClientRect();
    // Skip off-screen
    if (rect.bottom < -200 || rect.top > vh + 200) continue;

    // Light position relative to this card's top-left corner
    const localX = lightX - rect.left;
    const localY = lightY - rect.top;

    // Distance from card center to light
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = cx - lightX;
    const dy = cy - lightY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Alpha: sharp falloff beyond FALLOFF_START
    const alpha = Math.max(0, Math.min(1,
      dist <= FALLOFF_START
        ? 1
        : 1 - (dist - FALLOFF_START) / (FALLOFF_END - FALLOFF_START)
    )) * maxAlpha;

    const node = el as HTMLElement;
    node.style.setProperty('--light-x', `${Math.round(localX)}px`);
    node.style.setProperty('--light-y', `${Math.round(localY)}px`);
    node.style.setProperty('--light-size', `${LIGHT_RADIUS}px`);
    node.style.setProperty('--light-alpha', alpha.toFixed(3));
  }
}

function onScroll() {
  if (raf) return;
  raf = requestAnimationFrame(() => {
    raf = 0;
    updateHighlights();
  });
}

function collect() {
  targets = Array.from(document.querySelectorAll('.card, .plate, .plate-accent'));
}

export function initLightSource(): void {
  collect();
  updateHighlights();

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  document.addEventListener('astro:after-swap', () => {
    collect();
    updateHighlights();
  });
}
