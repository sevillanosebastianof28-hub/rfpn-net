import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AdminLayout } from '@/components/layout/AdminLayout';

export default function AffiliateLayout() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'affiliate') return <Navigate to="/" replace />;

  return <AdminLayout />;
}
