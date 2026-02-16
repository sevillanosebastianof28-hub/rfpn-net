import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'super_admin' && user?.role !== 'central_admin') return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className={cn('min-h-screen transition-all duration-300', sidebarCollapsed ? 'ml-[72px]' : 'ml-64')}>
        <div className="p-6 lg:p-8"><Outlet /></div>
      </main>
    </div>
  );
}
