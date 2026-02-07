import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, UserRole, AuthState } from '@/types';
import { mockUsers } from '@/data/mockData';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
  canAccess: (feature: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Features locked by role - for future milestones
const roleFeatureAccess: Record<UserRole, string[]> = {
  super_admin: ['dashboard', 'contacts', 'users', 'applications', 'audit_logs', 'settings'],
  central_admin: ['dashboard', 'users', 'applications', 'audit_logs'],
  developer: [], // Locked for Week 1
  broker: [], // Locked for Week 1
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock authentication - in production, this would validate against backend
    const user = mockUsers.find(u => u.email === email);
    
    if (user && password === 'demo123') {
      // Only allow super_admin and central_admin for now
      if (user.role === 'developer' || user.role === 'broker') {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    }
    
    setAuthState(prev => ({ ...prev, isLoading: false }));
    return false;
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const hasRole = useCallback((roles: UserRole[]): boolean => {
    if (!authState.user) return false;
    return roles.includes(authState.user.role);
  }, [authState.user]);

  const canAccess = useCallback((feature: string): boolean => {
    if (!authState.user) return false;
    return roleFeatureAccess[authState.user.role]?.includes(feature) ?? false;
  }, [authState.user]);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, hasRole, canAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
