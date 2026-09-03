import { NavLink } from 'react-router-dom';

const items = [
  { to: '/', label: '首页', icon: '🏠' },
  { to: '/training', label: '训练', icon: '💪' },
  { to: '/history', label: '记录', icon: '📊' },
  { to: '/plan', label: '计划', icon: '📋' },
  { to: '/library', label: '动作库', icon: '🗂️' },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.to === '/'}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <span className="nav-icon">{it.icon}</span>
          <span>{it.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}