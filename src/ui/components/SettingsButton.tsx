import { Laptop, Moon, Settings, Sun } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useI18n, type Lang } from '@/i18n/i18nStore';
import { useThemeStore, type ThemeMode } from '@/store/themeStore';

const LANGS: { lang: Lang; label: string }[] = [
  { lang: 'zh', label: '中文' },
  { lang: 'en', label: 'English' },
];

const THEMES: { mode: ThemeMode; labelKey: 'theme.light' | 'theme.dark' | 'theme.system'; icon: typeof Sun }[] = [
  { mode: 'light', labelKey: 'theme.light', icon: Sun },
  { mode: 'dark', labelKey: 'theme.dark', icon: Moon },
  { mode: 'system', labelKey: 'theme.system', icon: Laptop },
];

export function SettingsButton() {
  const { t, lang, setLang } = useI18n();
  const { mode, setMode } = useThemeStore();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="size-9 shrink-0"
        aria-label={t('settings.aria')}
        onClick={() => setOpen(true)}
      >
        <Settings className="size-4" />
      </Button>

      <Sheet open={open} onOpenChange={(o) => (o ? undefined : setOpen(false))}>
        <SheetContent side="bottom" className="p-0">
          <SheetHeader className="border-b border-border">
            <SheetTitle className="text-base">{t('settings.title')}</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-[calc(20px+env(safe-area-inset-bottom))] pt-1">
            <p className="pb-2 pt-1 text-sm font-semibold text-muted-foreground">{t('lang.title')}</p>
            <div className="grid grid-cols-2 gap-2.5">
              {LANGS.map(({ lang: l, label }) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={cn(
                    'flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border px-3 py-3.5 text-sm transition-colors',
                    lang === l
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-muted/30 text-muted-foreground',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <p className="pb-2 pt-4 text-sm font-semibold text-muted-foreground">{t('theme.title')}</p>
            <div className="grid grid-cols-3 gap-2.5">
              {THEMES.map(({ mode: m, labelKey, icon: Icon }) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={cn(
                    'flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border px-3 py-3.5 text-sm transition-colors',
                    mode === m
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-muted/30 text-muted-foreground',
                  )}
                >
                  <Icon className="size-5" />
                  {t(labelKey)}
                </button>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}