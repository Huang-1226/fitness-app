import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { SettingsButton } from './SettingsButton';

export function PageHeader({ icon, title }: { icon: LucideIcon; title: ReactNode }) {
  const Icon = icon;
  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <Icon className="size-6 text-primary" />
        {title}
      </h1>
      <SettingsButton />
    </div>
  );
}