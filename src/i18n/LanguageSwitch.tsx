import { Languages } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useI18n, type Lang } from './i18nStore';

const OPTIONS: { lang: Lang; label: string }[] = [
  { lang: 'zh', label: '中文' },
  { lang: 'en', label: 'English' },
];

export default function LanguageSwitch() {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="size-9 shrink-0"
        aria-label={t('lang.title')}
        onClick={() => setOpen(true)}
      >
        <Languages className="size-4" />
      </Button>

      <Sheet open={open} onOpenChange={(o) => (o ? undefined : setOpen(false))}>
        <SheetContent side="bottom" className="p-0">
          <SheetHeader className="border-b border-border">
            <SheetTitle className="text-base">{t('lang.title')}</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-2.5 px-4 pb-[calc(20px+env(safe-area-inset-bottom))] pt-1">
            {OPTIONS.map(({ lang: l, label }) => (
              <button
                key={l}
                type="button"
                onClick={() => {
                  setLang(l);
                  setOpen(false);
                }}
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
        </SheetContent>
      </Sheet>
    </>
  );
}