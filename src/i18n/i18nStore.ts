import { create } from 'zustand';
import { dataLookup } from './dataDict';
import { en, zh, type TKey } from './translations';

export type Lang = 'zh' | 'en';

const LANG_KEY = 'fitness-app-lang';

function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'en' || saved === 'zh') return saved;
    return (navigator.language || '').toLowerCase().startsWith('en') ? 'en' : 'zh';
  } catch {
    return 'zh';
  }
}

export type TParams = Record<string, string | number>;

interface I18nState {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey, params?: TParams) => string;
  d: (text: string) => string;
}

export const useI18n = create<I18nState>()((set, get) => ({
  lang: detectLang(),
  setLang: (l) => {
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      /* ignore */
    }
    set({ lang: l });
  },
  t: (key, params) => {
    const template = get().lang === 'en' ? en[key] ?? zh[key] : zh[key];
    if (!params) return template;
    return template.replace(/\{(\w+)\}/g, (_, name: string) => String(params[name] ?? ''));
  },
  d: (text) => {
    if (get().lang === 'zh') return text;
    return dataLookup(text);
  },
}));