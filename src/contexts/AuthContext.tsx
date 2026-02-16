import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AppRole;
  tenantId: string | null;
  isActive: boolean;
  avatarUrl: string | null;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, firstName: string, lastName: string, role?: AppRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasRole: (roles: AppRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchUserData(userId: string): Promise<AuthUser | null> {
  const [profileRes, roleRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle(),
  ]);

  if (!profileRes.data || !roleRes.data) return null;

  return {
    id: userId,
    email: profileRes.data.email,
    firstName: profileRes.data.first_name,
    lastName: profileRes.data.last_name,
    role: roleRes.data.role,
    tenantId: profileRes.data.tenant_id,
    isActive: profileRes.data.is_active,
    avatarUrl: profileRes.data.avatar_url,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Use setTimeout to avoid potential deadlocks with Supabase auth
        setTimeout(async () => {
          const userData = await fetchUserData(session.user.id);
          setAuthState({
            user: userData,
            isAuthenticated: !!userData,
            isLoading: false,
          });
        }, 0);
      } else {
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      }
    });

    // THEN check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const userData = await fetchUserData(session.user.id);
        setAuthState({
          user: userData,
          isAuthenticated: !!userData,
          isLoading: false,
        });
      } else {
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const register = useCallback(async (
    email: string, password: string, firstName: string, lastName: string, role: AppRole = 'developer'
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName, role },
      },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const hasRole = useCallback((roles: AppRole[]): boolean => {
    if (!authState.user) return false;
    return roles.includes(authState.user.role);
  }, [authState.user]);

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
