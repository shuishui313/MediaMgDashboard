export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'mediaai-theme';

export const isTheme = (value: unknown): value is Theme => value === 'light' || value === 'dark';

/** 已保存的选择优先；没存过或值被写坏时跟随系统偏好。 */
export const resolveInitialTheme = (stored: string | null, prefersDark: boolean): Theme =>
  isTheme(stored) ? stored : prefersDark ? 'dark' : 'light';

export const toggleTheme = (theme: Theme): Theme => (theme === 'dark' ? 'light' : 'dark');

export const readThemePreference = (): Theme =>
  resolveInitialTheme(
    window.localStorage.getItem(THEME_STORAGE_KEY),
    window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false,
  );

/** CSS 里 `:root` / `.dark` 已定义 color-scheme，这里只负责切换 class。 */
export const applyTheme = (theme: Theme): void => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
};

export const saveTheme = (theme: Theme): void => {
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
};

/** 在 React 挂载前调用，避免暗色偏好用户看到一闪白屏。 */
export const bootstrapTheme = (): Theme => {
  const theme = readThemePreference();
  applyTheme(theme);
  return theme;
};
