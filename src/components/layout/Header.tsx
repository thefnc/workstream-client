import { useNavigate } from 'react-router-dom';
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

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="flex items-center gap-4 flex-1">
        <button 
          className="lg:hidden text-muted-foreground hover:text-foreground"
          onClick={onMenuClick}
          aria-label="Open Menu"
        >
          <Menu size={20} />
        </button>
        
        <div className="relative w-full max-w-md hidden sm:block">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks, assets, or designers..."
            className="w-full bg-muted/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary/30 rounded-full pl-10 py-2 h-10 transition-all"
          />
        </div>
      </div>

      <div className="header__actions ml-auto">
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
