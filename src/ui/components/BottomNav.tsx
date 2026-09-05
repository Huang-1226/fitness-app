import { BarChart3, ClipboardList, Dumbbell, Home, Library } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { useI18n } from '@/i18n/i18nStore';

const items = [
  { to: '/', key: 'nav.home', icon: Home },
  { to: '/training', key: 'nav.training', icon: Dumbbell },
  { to: '/history', key: 'nav.history', icon: BarChart3 },
  { to: '/plan', key: 'nav.plan', icon: ClipboardList },
  { to: '/library', key: 'nav.library', icon: Library },
] as const;

export default function BottomNav() {
  const { t } = useI18n();
  return (
    <nav className="bg-card/95 fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-[640px] border-t border-border backdrop-blur pb-[env(safe-area-inset-bottom)]">
      {items.map(({ to, key, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] no-underline transition-colors ${
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`
          }
        >
          <Icon className="size-5" strokeWidth={2.2} />
          <span>{t(key)}</span>
        </NavLink>
      ))}
    </nav>
  );
}