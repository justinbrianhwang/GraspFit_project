import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { UserProfile } from '../types';

interface AuthContextValue {
  user: UserProfile | null;
  login: (profile: UserProfile) => void;
  logout: () => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isRoot: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = (profile: UserProfile) => setUser(profile);
  const logout = () => setUser(null);
  const isAdmin = user?.role === 'admin' || user?.role === 'root';
  const isRoot = user?.role === 'root';

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user, isAdmin, isRoot }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
