/**
 * AuthContext — manages login state and role (user / admin) across the entire app.
 *
 * Provides: user data, role ('user' | 'admin'), login/logout/register functions, loading state.
 * Default is unauthenticated (user = null), requires login or signup to see user profile.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { apiGetMe, apiLogin, apiGoogleLogin, apiLogout, apiRegister } from '../services/api';
import type { UserData } from '../services/api';
import type { AdminRole } from '../types/admin';

export const ADMIN_USER: UserData = {
  id: 'u-admin',
  username: 'admin',
  email: 'admin@reread.com',
  display_name: 'ผู้ดูแลระบบ ReRead',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
  created_at: '2025-01-10T08:00:00Z',
  updated_at: '2026-10-09T12:00:00Z',
};

export interface AuthContextType {
  user: UserData | null;
  role: AdminRole;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  loginAdmin: (email: string, password: string) => Promise<boolean>;
  register: (data: { username: string; email: string; password: string; display_name: string }) => Promise<void>;
  logout: () => Promise<void>;
  logoutAdmin: () => void;
  refreshUser: () => Promise<void>;
}


const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<AdminRole>(() => {
    const saved = sessionStorage.getItem('reread_admin_role');
    return saved === 'admin' ? 'admin' : 'user';
  });

  const [user, setUser] = useState<UserData | null>(() => {
    const savedRole = sessionStorage.getItem('reread_admin_role');
    if (savedRole === 'admin') return ADMIN_USER;
    return null;
  });

  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    // If admin is active in session, prioritize admin
    const savedRole = sessionStorage.getItem('reread_admin_role');
    if (savedRole === 'admin') {
      setRole('admin');
      setUser(ADMIN_USER);
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      setUser(null);
      setRole('user');
      setIsLoading(false);
      return;
    }

    try {
      const res = await apiGetMe();
      if (res && res.data) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch {
      // Token invalid/expired — clean up
      localStorage.removeItem('access_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check on mount
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (username: string, password: string) => {
    const res = await apiLogin(username, password);
    if (res.data) {
      localStorage.setItem('access_token', res.data.access_token);
      sessionStorage.removeItem('reread_admin_role');
      setRole('user');
      await refreshUser();
    }
  };

  const loginWithGoogle = async (credential: string) => {
    const res = await apiGoogleLogin(credential);
    if (res.data) {
      localStorage.setItem('access_token', res.data.access_token);
      sessionStorage.removeItem('reread_admin_role');
      setRole('user');
      await refreshUser();
    }
  };

  const loginAdmin = async (email: string, password: string): Promise<boolean> => {
    // Mock admin credentials
    if (email.trim().toLowerCase() === 'admin@reread.com' && password === 'admin1234') {
      sessionStorage.setItem('reread_admin_role', 'admin');
      setRole('admin');
      setUser(ADMIN_USER);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    sessionStorage.removeItem('reread_admin_role');
    setRole('user');
    setUser(null);
  };

  const register = async (data: { username: string; email: string; password: string; display_name: string }) => {
    await apiRegister(data);
    await login(data.username, data.password);
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      // Ignore
    }
    localStorage.removeItem('access_token');
    sessionStorage.removeItem('reread_admin_role');
    setRole('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        loginAdmin,
        register,
        logout,
        logoutAdmin,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );

}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
