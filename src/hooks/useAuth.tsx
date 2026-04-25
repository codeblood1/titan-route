import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from "react";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin";
}

interface AuthContextValue {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "admin@fishtrack.com";
const LS_AUTH_KEY = "fishtrack_admin_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(LS_AUTH_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.token === "authenticated" && parsed?.user) {
          setUser(parsed.user);
        }
      } catch {
        localStorage.removeItem(LS_AUTH_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminUser: AdminUser = {
        id: "admin-1",
        email: ADMIN_EMAIL,
        name: "Administrator",
        role: "admin",
      };
      setUser(adminUser);
      localStorage.setItem(LS_AUTH_KEY, JSON.stringify({ token: "authenticated", user: adminUser }));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(LS_AUTH_KEY);
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
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
