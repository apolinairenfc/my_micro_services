const THEME_KEY = 'theme_preference';

export type ThemeMode = 'light' | 'dark';

const getSystemTheme = (): ThemeMode => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme: ThemeMode) => {
  document.documentElement.dataset.theme = theme;
};

export const initializeTheme = () => {
  const stored = localStorage.getItem(THEME_KEY) as ThemeMode | null;
  const theme = stored || getSystemTheme();
  applyTheme(theme);
};

export const setTheme = (theme: ThemeMode) => {
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
};

export const toggleTheme = () => {
  const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
};

export const getTheme = (): ThemeMode => {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
};
