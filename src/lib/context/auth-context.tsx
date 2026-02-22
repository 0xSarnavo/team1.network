'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api/client';

interface User {
  id: string;
  email: string;
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  level: number;
  totalXp: number;
  onboardingCompleted: boolean;
  adminRoles?: {
    isSuperAdmin: boolean;
    isSuperSuperAdmin: boolean;
    moduleLeads: string[];
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  hasModuleLead: (module: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get<User>('/api/auth/me');
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  const login = useCallback(async (accessToken: string) => {
    api.setToken(accessToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
    }
    await fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // ignore
    }
    api.setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
  }, []);

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  // Initialize: restore token from localStorage + fetch user
  useEffect(() => {
    const init = async () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('accessToken');
        if (stored) {
          api.setToken(stored);
        }
      }
      await fetchUser();
      setLoading(false);
    };
    init();
  }, [fetchUser]);

  // Listen for token refresh events
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.accessToken) {
        localStorage.setItem('accessToken', detail.accessToken);
      }
    };
    window.addEventListener('token-refreshed', handler);
    return () => window.removeEventListener('token-refreshed', handler);
  }, []);

  const isAdmin = !!user?.adminRoles && (
    user.adminRoles.isSuperAdmin ||
    user.adminRoles.isSuperSuperAdmin ||
    user.adminRoles.moduleLeads.length > 0
  );

  const isSuperAdmin = !!user?.adminRoles?.isSuperAdmin || !!user?.adminRoles?.isSuperSuperAdmin;

  const hasModuleLead = useCallback((module: string) => {
    if (!user?.adminRoles) return false;
    if (user.adminRoles.isSuperAdmin || user.adminRoles.isSuperSuperAdmin) return true;
    return user.adminRoles.moduleLeads.includes(module);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, isAdmin, isSuperAdmin, hasModuleLead }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
