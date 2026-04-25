import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";

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
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Fallback credentials for localStorage-only mode (when Supabase is not configured)
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "admin@titanroute.com";
const LS_AUTH_KEY = "titanroute_admin_auth";

// True if Supabase credentials are configured
const HAS_SUPABASE = !!supabase;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: check for existing session
  useEffect(() => {
    async function checkSession() {
      if (HAS_SUPABASE) {
        // Try Supabase session first
        const { data: { session } } = await supabase!.auth.getSession();
        if (session?.user) {
          const adminUser = await loadSupabaseUser(session.user.id, session.user.email ?? "");
          if (adminUser) {
            setUser(adminUser);
            setIsLoading(false);
            return;
          }
        }
      }

      // Fallback: check localStorage
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
    }

    checkSession();

    // Listen for Supabase auth state changes (login/logout from other tabs, token refresh, etc.)
    let subscription: { unsubscribe: () => void } | null = null;
    if (HAS_SUPABASE) {
      const { data } = supabase!.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const adminUser = await loadSupabaseUser(session.user.id, session.user.email ?? "");
          if (adminUser) setUser(adminUser);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          localStorage.removeItem(LS_AUTH_KEY);
        }
      });
      subscription = data.subscription;
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Load admin role from Supabase admin_roles table
  async function loadSupabaseUser(userId: string, email: string): Promise<AdminUser | null> {
    if (!HAS_SUPABASE) return null;

    const { data: roleData, error } = await supabase!
      .from("admin_roles")
      .select("role, full_name")
      .eq("user_id", userId)
      .eq("is_active", true)
      .single();

    if (error || !roleData) {
      // User exists in auth.users but has no admin role assigned
      return null;
    }

    return {
      id: userId,
      email: email.toLowerCase(),
      name: roleData.full_name || email.split("@")[0] || "Admin",
      role: roleData.role,
    };
  }

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // Try Supabase Auth first (if configured)
    if (HAS_SUPABASE) {
      const { data, error } = await supabase!.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (error || !data.user) {
        return false;
      }

      // Check if this user has an admin role
      const adminUser = await loadSupabaseUser(data.user.id, data.user.email ?? trimmedEmail);
      if (adminUser) {
        setUser(adminUser);
        // Supabase handles its own session storage; no need for localStorage
        return true;
      }

      // User authenticated but has no admin role — sign them out
      await supabase!.auth.signOut();
      return false;
    }

    // Fallback: simple password check (localStorage mode)
    const expectedEmail = ADMIN_EMAIL.trim().toLowerCase();
    const expectedPassword = ADMIN_PASSWORD.trim();

    if (trimmedEmail === expectedEmail && trimmedPassword === expectedPassword) {
      const adminUser: AdminUser = {
        id: "admin-1",
        email: expectedEmail,
        name: "Administrator",
        role: "admin",
      };
      setUser(adminUser);
      localStorage.setItem(LS_AUTH_KEY, JSON.stringify({ token: "authenticated", user: adminUser }));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(async () => {
    if (HAS_SUPABASE) {
      await supabase!.auth.signOut();
    }
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
