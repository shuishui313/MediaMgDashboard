import { beforeEach, describe, expect, it } from 'vitest';
import {
  THEME_STORAGE_KEY,
  applyTheme,
  bootstrapTheme,
  isTheme,
  readThemePreference,
  resolveInitialTheme,
  saveTheme,
  toggleTheme,
} from './theme';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
});

describe('isTheme / resolveInitialTheme', () => {
  it('只认 light 与 dark', () => {
    expect(isTheme('dark')).toBe(true);
    expect(isTheme('light')).toBe(true);
    expect(isTheme('auto')).toBe(false);
    expect(isTheme(null)).toBe(false);
  });

  it('已保存的选择优先于系统偏好', () => {
    expect(resolveInitialTheme('dark', false)).toBe('dark');
    expect(resolveInitialTheme('light', true)).toBe('light');
  });

  it('没存过或值非法时跟随系统偏好', () => {
    expect(resolveInitialTheme(null, true)).toBe('dark');
    expect(resolveInitialTheme(null, false)).toBe('light');
    expect(resolveInitialTheme('sepia', true)).toBe('dark');
  });
});

describe('toggleTheme', () => {
  it('两档来回切换', () => {
    expect(toggleTheme('light')).toBe('dark');
    expect(toggleTheme('dark')).toBe('light');
  });
});

describe('applyTheme', () => {
  it('dark 给 html 加 .dark，light 移除', () => {
    applyTheme('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    applyTheme('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});

describe('saveTheme / bootstrapTheme', () => {
  it('保存后引导优先读存储值，并同步到 html', () => {
    saveTheme('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(bootstrapTheme()).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('没存过时跟随系统，jsdom 默认浅色', () => {
    expect(readThemePreference()).toBe('light');
    expect(bootstrapTheme()).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
