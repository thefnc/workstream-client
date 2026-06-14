import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  KanbanSquare, 
  ListTodo, 
  UsersRound,
  ActivitySquare,
  Users,
  Settings
} from 'lucide-react';

const MAIN_NAV = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Board', icon: KanbanSquare, path: '/board' },
  { name: 'Tasks', icon: ListTodo, path: '/tasks' },
  { name: 'Workload', icon: UsersRound, path: '/workload' },
  { name: 'Activity', icon: ActivitySquare, path: '/activity' },
];

const BOTTOM_NAV = [
  { name: 'Users', icon: Users, path: '/users' },
  { name: 'Settings', icon: Settings, path: '/settings' },
];

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const sidebarClass = `sidebar ${isOpen ? 'is-open' : ''}`;

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
        {MAIN_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `sidebar__nav-item ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
            >
              <Icon size={20} className="sidebar__nav-icon" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto px-4 py-4">
        <div className="h-px bg-white/10 mb-4" />
        <nav className="flex flex-col gap-1">
          {BOTTOM_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `sidebar__nav-item ${isActive ? 'active' : ''}`
                }
                onClick={onClose}
              >
                <Icon size={20} className="sidebar__nav-icon" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
