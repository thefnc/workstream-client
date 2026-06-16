import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
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
  '/workload': 'Workload Overview',
  '/activity': 'Activity Logs',
  '/users': 'User Management',
  '/settings': 'Settings',
};

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const basePath = '/' + location.pathname.split('/')[1];
  const title = PAGE_TITLES[basePath] || 'Workstream';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="flex items-center gap-3">
        <button 
          className="lg:hidden text-muted-foreground hover:text-foreground"
          onClick={onMenuClick}
          aria-label="Open Menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="header__title truncate max-w-[150px] sm:max-w-none">{title}</h1>
      </div>

      <div className="header__actions ml-auto">
        <div className="header__search hidden sm:block">
          <Search size={16} className="header__search-icon" />
          <Input
            placeholder="Search tasks..."
            className="header__search-input"
          />
        </div>
        
        <button className="sm:hidden text-muted-foreground hover:text-foreground">
          <Search size={20} />
        </button>

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
                <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <span className="header__user-name hidden sm:inline">{user?.name || 'User'}</span>
            </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.role}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
