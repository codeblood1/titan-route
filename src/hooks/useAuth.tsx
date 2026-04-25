import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from "react";

// ========================
// ULTRA-SIMPLE AUTH v3
// No Supabase dependency for fallback login
// ========================

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextValue {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// HARDCODED DEMO CREDENTIALS — these are baked into the JS bundle
const DEMO_EMAIL = "admin@titanroute.com";
const DEMO_PASS = "admin123";
const LS_KEY = "tr_admin_v3";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.email) {
          setUser(parsed);
        }
      }
    } catch {
      localStorage.removeItem(LS_KEY);
    }
    setIsLoading(false);
  }, []);

  // Synchronous login — returns true/false immediately
  const login = useCallback((email: string, password: string): boolean => {
    const e = email.trim().toLowerCase();
    const p = password.trim();

    if (e === DEMO_EMAIL.toLowerCase() && p === DEMO_PASS) {
      const u: AdminUser = {
        id: "admin-1",
        email: DEMO_EMAIL,
        name: "Administrator",
        role: "admin",
      };
      setUser(u);
      localStorage.setItem(LS_KEY, JSON.stringify(u));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(LS_KEY);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
    }),
    [user, isLoading, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
