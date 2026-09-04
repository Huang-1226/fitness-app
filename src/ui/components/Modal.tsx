import type { ReactNode } from 'react';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Sheet open onOpenChange={(open) => (open ? undefined : onClose())}>
      <SheetContent side="bottom" className="p-0">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="text-base">{title}</SheetTitle>
        </SheetHeader>
        <div className="max-h-[70dvh] overflow-y-auto px-4 pb-[env(safe-area-inset-bottom)]">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}