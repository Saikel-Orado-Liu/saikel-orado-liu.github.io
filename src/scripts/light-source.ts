/**
 * Acrylic plate point-light highlight system.
 * A fixed point light source illuminates all .card elements.
 * Each card's ::after pseudo-element gets --light-x, --light-y, --light-intensity
 * updated based on its position relative to the light source.
 */

// Light source position (fixed in viewport)
const LIGHT_VIEWPORT_X = 0.15; // 15% from left
const LIGHT_VIEWPORT_Y = 0.05; // 5% from top
const LIGHT_REACH = 1.2;      // max distance as fraction of viewport diagonal
const MAX_INTENSITY_DARK = 0.18;
const MAX_INTENSITY_LIGHT = 0.55;

let raf = 0;
let cards: Element[] = [];

function updateHighlights() {
  const isLight = document.documentElement.classList.contains('light-style');
  const maxIntensity = isLight ? MAX_INTENSITY_LIGHT : MAX_INTENSITY_DARK;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const diag = Math.sqrt(vw * vw + vh * vh);
  const lightPxX = vw * LIGHT_VIEWPORT_X;
  const lightPxY = vh * LIGHT_VIEWPORT_Y;

  for (const card of cards) {
    const rect = card.getBoundingClientRect();

    // Skip cards not in viewport
    if (rect.bottom < 0 || rect.top > vh || rect.right < 0 || rect.left > vw) continue;

    // Card center
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // Direction from light to card center
    const dx = cx - lightPxX;
    const dy = cy - lightPxY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Highlight position on card (relative to card, 0-100%)
    // The highlight appears where the light "hits" the card
    // For a plate surface, the highlight is offset toward the light source
    const highlightX = Math.max(0, Math.min(100,
      50 - (dx / rect.width) * 30
    ));
    const highlightY = Math.max(0, Math.min(100,
      50 - (dy / rect.height) * 30
    ));

    // Intensity falls off with distance
    const normalizedDist = dist / diag;
    const intensity = maxIntensity * Math.max(0, 1 - normalizedDist / LIGHT_REACH);

    // Apply CSS custom properties
    const el = card as HTMLElement;
    el.style.setProperty('--light-x', `${highlightX}%`);
    el.style.setProperty('--light-y', `${highlightY}%`);
    el.style.setProperty('--light-intensity', intensity.toFixed(3));
  }
}

function onScroll() {
  if (raf) return;
  raf = requestAnimationFrame(() => {
    raf = 0;
    updateHighlights();
  });
}

function collectCards() {
  cards = Array.from(document.querySelectorAll('.card, .plate, .plate-accent'));
}

export function initLightSource(): void {
  collectCards();
  updateHighlights();

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  // Re-collect cards on navigation
  document.addEventListener('astro:after-swap', () => {
    collectCards();
    updateHighlights();
  });
}
