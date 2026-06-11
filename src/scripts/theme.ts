type Theme = 'dark' | 'light';

function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function getStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    // localStorage 不可用
  }
  return null;
}

function setStoredTheme(theme: Theme): void {
  try {
    localStorage.setItem('theme', theme);
  } catch {
    // localStorage 不可用
  }
}

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.classList.remove('light-style', 'dark-style');
  if (theme === 'light') {
    root.classList.add('light-style');
  }
  root.setAttribute('data-theme', theme);
}

function updateIcon(theme: Theme): void {
  const icon = document.querySelector('.theme-toggle i') as HTMLElement | null;
  if (!icon) return;
  icon.className = theme === 'dark' ? 'bx bx-moon' : 'bx bx-sun';
}

function initTheme(): void {
  const stored = getStoredTheme();
  const theme = stored ?? getSystemTheme();
  applyTheme(theme);
  updateIcon(theme);
}

function toggleTheme(e?: MouseEvent): void {
  const current = document.documentElement.getAttribute('data-theme') as Theme;
  const next: Theme = current === 'dark' ? 'light' : 'dark';

  if (e) {
    const root = document.documentElement;
    root.style.setProperty('--vt-pos-x', `${e.clientX}px`);
    root.style.setProperty('--vt-pos-y', `${e.clientY}px`);
    root.style.setProperty('--vt-size', `${Math.max(window.innerWidth, window.innerHeight) * 2}px`);
  }

  const doSwitch = () => {
    applyTheme(next);
    updateIcon(next);
    setStoredTheme(next);
  };

  if (document.startViewTransition) {
    document.startViewTransition(doSwitch);
  } else {
    doSwitch();
  }
}

// 监听系统主题变化（当用户未手动存储偏好时）
window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
  if (!getStoredTheme()) {
    const t = e.matches ? 'light' : 'dark';
    applyTheme(t);
    updateIcon(t);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  const btn = document.querySelector('.theme-toggle');
  if (btn) btn.addEventListener('click', (e: Event) => toggleTheme(e as MouseEvent));
});

export { initTheme, toggleTheme, getSystemTheme, getStoredTheme };
