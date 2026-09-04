import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

function systemTheme(): ResolvedTheme {
  return mediaQuery.matches ? 'dark' : 'light';
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  return mode === 'system' ? systemTheme() : mode;
}

function applyTheme(theme: ResolvedTheme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

function readStored(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
}

interface ThemeState {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()((set) => ({
  mode: readStored(),
  resolved: resolveTheme(readStored()),

  setMode: (mode) => {
    const resolved = resolveTheme(mode);
    applyTheme(resolved);
    localStorage.setItem(STORAGE_KEY, mode);
    set({ mode, resolved });
  },
}));

// 同步当前状态到 DOM（SSR/首帧兜底，正常情况下 index.html 内联脚本已处理）
applyTheme(useThemeStore.getState().resolved);

// 跟随系统：仅在 mode === 'system' 时响应系统变化
mediaQuery.addEventListener('change', (e) => {
  const { mode, resolved } = useThemeStore.getState();
  if (mode !== 'system') return;
  const next: ResolvedTheme = e.matches ? 'dark' : 'light';
  if (next === resolved) return;
  applyTheme(next);
  useThemeStore.setState({ resolved: next });
});