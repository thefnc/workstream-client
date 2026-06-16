import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  KanbanSquare, 
  ListTodo, 
  UsersRound,
  ActivitySquare,
  Users
} from 'lucide-react';

import { useAuthStore } from '../../stores/authStore';

const MAIN_NAV = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Board', icon: KanbanSquare, path: '/board' },
  { name: 'Tasks', icon: ListTodo, path: '/tasks' },
  { name: 'Tim', icon: UsersRound, path: '/workload' },
  { name: 'Riwayat', icon: ActivitySquare, path: '/activity' },
];

const BOTTOM_NAV = [
  { name: 'Users', icon: Users, path: '/users', requireAdmin: true },
  // Settings is hidden for this trial
];

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const sidebarClass = `sidebar ${isOpen ? 'is-open' : ''}`;
  const user = useAuthStore((state) => state.user);
  
  const bottomNavFiltered = BOTTOM_NAV.filter(item => {
    if (item.requireAdmin && user?.role !== 'SUPER_ADMIN') {
      return false;
    }
    return true;
  });

  return (
    <aside className={sidebarClass}>
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">
          <div className="w-4 h-4 bg-white rotate-45" />
          <div className="w-4 h-4 border border-white rotate-45 -ml-2" />
        </div>
        <span className="sidebar__logo-text">Workstream</span>
      </div>

      <nav className="sidebar__nav">
        <ul className="sidebar__list">
          {MAIN_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                  }
                  onClick={onClose}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto px-3 py-4">
        <div className="sidebar__separator" />
        <ul className="sidebar__list">
          {bottomNavFiltered.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                  }
                  onClick={onClose}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
