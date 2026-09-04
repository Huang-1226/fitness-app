import { BarChart3, ClipboardList, Dumbbell, Home, Library } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const items = [
  { to: '/', label: '首页', icon: Home },
  { to: '/training', label: '训练', icon: Dumbbell },
  { to: '/history', label: '记录', icon: BarChart3 },
  { to: '/plan', label: '计划', icon: ClipboardList },
  { to: '/library', label: '动作库', icon: Library },
] as const;

export default function BottomNav() {
  return (
    <nav className="bg-card/95 fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-[640px] border-t border-border backdrop-blur pb-[env(safe-area-inset-bottom)]">
      {items.map(({ to, label, icon: Icon }) => (
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
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}