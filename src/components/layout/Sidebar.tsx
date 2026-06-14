import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Kanban,
  ListTodo,
  BarChart3,
  Activity,
  Users,
  Settings,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/board', label: 'Board', icon: Kanban },
  { to: '/tasks', label: 'Tasks', icon: ListTodo },
  { to: '/workload', label: 'Workload', icon: BarChart3 },
  { to: '/activity', label: 'Activity', icon: Activity },
];

const bottomNavItems = [
  { to: '/users', label: 'Users', icon: Users },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <span className="sidebar__logo-icon">W</span>
        <span className="sidebar__logo-text">Workstream</span>
      </div>

      <nav className="sidebar__nav">
        <ul className="sidebar__list">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                }
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <Separator className="sidebar__separator" />

        <ul className="sidebar__list">
          {bottomNavItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                }
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
