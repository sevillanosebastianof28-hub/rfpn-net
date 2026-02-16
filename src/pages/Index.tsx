import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        if (user.role === 'super_admin' || user.role === 'central_admin') navigate('/admin');
        else if (user.role === 'developer') navigate('/developer');
        else if (user.role === 'broker') navigate('/broker');
        else navigate('/login');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

export default Index;
