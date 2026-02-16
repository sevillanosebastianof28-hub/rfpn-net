import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  FileText, 
  ScrollText, 
  Settings,
  Code2,
  Briefcase,
  Lock,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const mainNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin', end: true },
  { icon: Building2, label: 'Contacts', path: '/admin/contacts' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: FileText, label: 'Applications', path: '/admin/applications' },
  { icon: ScrollText, label: 'Audit Logs', path: '/admin/audit-logs' },
];

const lockedNavItems = [
  { icon: Code2, label: 'Developer Portal', path: '/developer' },
  { icon: Briefcase, label: 'Broker Portal', path: '/broker' },
];

const bottomNavItems = [
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const NavItem = ({ icon: Icon, label, path, end, locked }: { 
    icon: typeof LayoutDashboard; 
    label: string; 
    path?: string; 
    end?: boolean;
    locked?: boolean;
  }) => {
    const isActive = path ? (end ? location.pathname === path : location.pathname.startsWith(path)) : false;
    
    const content = (
      <div className={cn(
        'nav-item',
        isActive && 'active',
        locked && 'locked'
      )}>
        <Icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span>{label}</span>}
        {locked && !collapsed && <Lock className="ml-auto h-3.5 w-3.5 text-muted-foreground/50" />}
      </div>
    );

    if (locked) {
      if (collapsed) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-not-allowed">{content}</div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{label}</p>
              <p className="text-xs text-muted-foreground">Coming in future milestone</p>
            </TooltipContent>
          </Tooltip>
        );
      }
      return content;
    }

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink to={path!} end={end}>
              {content}
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      );
    }

    return (
      <NavLink to={path!} end={end}>
        {content}
      </NavLink>
    );
  };

  return (
    <aside className={cn(
      'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300',
      collapsed ? 'w-[72px]' : 'w-64'
    )}>
      {/* Header */}
      <div className={cn(
        'flex h-16 items-center border-b border-sidebar-border px-4',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        <Logo showText={!collapsed} size="sm" />
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggle}
          className={cn('h-8 w-8 text-muted-foreground hover:text-foreground', collapsed && 'hidden')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {/* Main Navigation */}
        <div className="space-y-1">
          {!collapsed && (
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Main
            </p>
          )}
          {mainNavItems.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}
        </div>

        {/* Portal Links */}
        <div className="mt-6 space-y-1">
          {!collapsed && (
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Portals
            </p>
          )}
          {lockedNavItems.map((item) => (
            <NavItem key={item.label} icon={item.icon} label={item.label} path={item.path} />
          ))}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-sidebar-border p-3">
        {bottomNavItems.map((item) => (
          <NavItem key={item.path} {...item} />
        ))}
        
        {/* User Info & Logout */}
        <div className={cn(
          'mt-3 flex items-center gap-3 rounded-lg bg-sidebar-accent p-3',
          collapsed && 'justify-center p-2'
        )}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="truncate text-xs text-muted-foreground capitalize">
                {user?.role.replace('_', ' ')}
              </p>
            </div>
          )}
          {!collapsed && (
            <Button variant="ghost" size="icon" onClick={logout} className="h-8 w-8 shrink-0">
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Collapsed Toggle */}
      {collapsed && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggle}
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-sidebar-border bg-sidebar text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      )}
    </aside>
  );
}
