import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@/lib/types';
import {
  acceptConsent as acceptConsentSvc,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  seedDemoData,
} from '@/lib/auth';
import { store } from '@/lib/storage';

interface AuthContextValue {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  acceptConsent: () => void;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    seedDemoData().finally(() => {
      if (!mounted) return;
      setUser(getCurrentUser());
      setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const refresh = useCallback(() => setUser(getCurrentUser()), []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginUser(email, password);
    if (res.ok && res.user) setUser(res.user);
    return { ok: res.ok, error: res.error };
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await registerUser(name, email, password);
    if (res.ok && res.user) setUser(res.user);
    return { ok: res.ok, error: res.error };
  }, []);

  const logout = useCallback(() => {
    logoutUser(getCurrentUser());
    setUser(null);
  }, []);

  const acceptConsent = useCallback(() => {
    const current = getCurrentUser();
    if (!current) return;
    const updated = acceptConsentSvc(current);
    setUser(updated);
  }, []);

  // Keep the in-memory user fresh if another tab mutates storage.
  useEffect(() => {
    const handler = () => {
      const id = store.getSession();
      setUser(id ? store.getUserById(id) ?? null : null);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, ready, login, register, logout, acceptConsent, refresh }),
    [user, ready, login, register, logout, acceptConsent, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
