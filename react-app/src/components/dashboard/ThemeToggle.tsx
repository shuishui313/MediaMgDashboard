import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  THEME_STORAGE_KEY,
  applyTheme,
  readThemePreference,
  resolveInitialTheme,
  saveTheme,
  toggleTheme,
  type Theme,
} from '@/utils/theme';

/**
 * 壳层主题切换：选择写入 localStorage，html 上的 .dark 由 CSS 变量接管配色。
 * 用户没手动选过时，跟随系统偏好的实时变化。
 */
const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>(readThemePreference);
  const isDark = theme === 'dark';

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!media?.addEventListener) return;

    const onChange = (event: MediaQueryListEvent) => {
      // 手动选过就不再被系统偏好覆盖。
      if (window.localStorage.getItem(THEME_STORAGE_KEY)) return;
      setTheme(resolveInitialTheme(null, event.matches));
    };

    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const switchTheme = () => {
    const next = toggleTheme(theme);
    setTheme(next);
    saveTheme(next);
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={switchTheme}
      aria-pressed={isDark}
      aria-label={isDark ? '切换为浅色模式' : '切换为深色模式'}
      title={isDark ? '切换为浅色模式' : '切换为深色模式'}
      className="rounded-full border-border/60 bg-card/90 shadow-lg backdrop-blur"
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
};

export default ThemeToggle;
