import { Laptop, Moon, Sun } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useThemeStore, type ThemeMode } from '@/store/themeStore';

const OPTIONS: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
  { mode: 'light', label: '浅色', icon: Sun },
  { mode: 'dark', label: '深色', icon: Moon },
  { mode: 'system', label: '跟随系统', icon: Laptop },
];

export function ThemeToggle() {
  const { mode, resolved, setMode } = useThemeStore();
  const [open, setOpen] = useState(false);
  const ResolvedIcon = resolved === 'dark' ? Moon : Sun;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="size-9 shrink-0"
        aria-label="切换主题"
        onClick={() => setOpen(true)}
      >
        <ResolvedIcon className="size-4" />
      </Button>

      <Sheet open={open} onOpenChange={(o) => (o ? undefined : setOpen(false))}>
        <SheetContent side="bottom" className="p-0">
          <SheetHeader className="border-b border-border">
            <SheetTitle className="text-base">外观主题</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-2.5 px-4 pb-[calc(20px+env(safe-area-inset-bottom))] pt-1">
            {OPTIONS.map(({ mode: m, label, icon: Icon }) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setOpen(false);
                }}
                className={cn(
                  'flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border px-3 py-3.5 text-sm transition-colors',
                  mode === m
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-muted/30 text-muted-foreground',
                )}
              >
                <Icon className="size-5" />
                {label}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}