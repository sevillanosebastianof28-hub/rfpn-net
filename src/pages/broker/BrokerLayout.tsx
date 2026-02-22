import { useState } from 'react';
import { Outlet, Navigate, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { LayoutDashboard, FileText, MessageSquare, User, Rss, LogOut, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/broker', end: true },
  { icon: User, label: 'My Profile', path: '/broker/profile' },
  { icon: FileText, label: 'Applications', path: '/broker/applications' },
  { icon: MessageSquare, label: 'Messages', path: '/broker/messages' },
  { icon: Rss, label: 'Social Feed', path: '/broker/feed' },
];

export default function BrokerLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const location = useLocation();

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'broker') return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-background">
      <aside className={cn('fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300', collapsed ? 'w-[72px]' : 'w-64')}>
        <div className={cn('flex h-16 items-center border-b border-sidebar-border px-4', collapsed ? 'justify-center' : 'justify-between')}>
          <Logo showText={!collapsed} size="sm" />
          {!collapsed && <Button variant="ghost" size="icon" onClick={() => setCollapsed(true)} className="h-8 w-8 text-muted-foreground"><ChevronLeft className="h-4 w-4" /></Button>}
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {!collapsed && <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Broker Portal</p>}
          {navItems.map(({ icon: Icon, label, path, end }) => {
            const isActive = end ? location.pathname === path : location.pathname.startsWith(path);
            const content = <div className={cn('nav-item', isActive && 'active')}><Icon className="h-5 w-5 shrink-0" />{!collapsed && <span>{label}</span>}</div>;
            return collapsed ? (
              <Tooltip key={path}><TooltipTrigger asChild><NavLink to={path} end={end}>{content}</NavLink></TooltipTrigger><TooltipContent side="right">{label}</TooltipContent></Tooltip>
            ) : <NavLink key={path} to={path} end={end}>{content}</NavLink>;
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <div className={cn('flex items-center gap-3 rounded-lg bg-sidebar-accent p-3', collapsed && 'justify-center p-2')}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                  <p className="truncate text-xs text-muted-foreground">Broker</p>
                </div>
                <Button variant="ghost" size="icon" onClick={logout} className="h-8 w-8 shrink-0"><LogOut className="h-4 w-4" /></Button>
              </>
            )}
          </div>
        </div>
        {collapsed && <Button variant="ghost" size="icon" onClick={() => setCollapsed(false)} className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-sidebar-border bg-sidebar text-muted-foreground"><ChevronRight className="h-3 w-3" /></Button>}
      </aside>
      <main className={cn('min-h-screen transition-all duration-300', collapsed ? 'ml-[72px]' : 'ml-64')}>
        <div className="p-6 lg:p-8"><Outlet /></div>
      </main>
    </div>
  );
}
