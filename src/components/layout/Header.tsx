import { useLocation } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/board': 'Board',
  '/tasks': 'Tasks',
  '/workload': 'Workload',
  '/activity': 'Activity',
  '/users': 'Users',
  '/settings': 'Settings',
};

export default function Header() {
  const location = useLocation();
  const basePath = '/' + location.pathname.split('/')[1];
  const title = PAGE_TITLES[basePath] || 'Workstream';

  return (
    <header className="header">
      <h1 className="header__title">{title}</h1>

      <div className="header__actions">
        <div className="header__search">
          <Search size={16} className="header__search-icon" />
          <Input
            placeholder="Search tasks..."
            className="header__search-input"
          />
        </div>

        <button className="header__notification" aria-label="Notifications">
          <Bell size={20} />
          <span className="header__notification-dot" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger
              className="header__user"
              aria-label="User menu"
            >
              <Avatar className="header__avatar">
                <AvatarFallback>SA</AvatarFallback>
              </Avatar>
              <span className="header__user-name">Super Admin</span>
            </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
