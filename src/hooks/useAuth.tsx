import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface LoginResult {
  success: boolean;
  reason?: string;
  debug?: string;
}

interface AuthContextValue {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_EMAIL = "admin@titanroute.com";
const DEMO_PASS = "admin123";
const LS_KEY = "tr_admin_v3";

const HAS_SUPABASE = !!supabase;

console.log("[Auth] Mode:", HAS_SUPABASE ? "SUPABASE" : "DEMO (fallback)");
if (HAS_SUPABASE) {
  console.log("[Auth] Supabase URL:", (supabase as any)?.supabaseUrl || "unknown");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      if (HAS_SUPABASE) {
        try {
          const { data: { session } } = await supabase!.auth.getSession();
          if (session?.user) {
            const adminUser = await loadSupabaseUser(session.user.id, session.user.email ?? "");
            if (adminUser) {
              setUser(adminUser);
              setIsLoading(false);
              return;
            }
          }
        } catch {
          /* ignore */
        }
      }

      try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.email) setUser(parsed);
        }
      } catch {
        localStorage.removeItem(LS_KEY);
      }
      setIsLoading(false);
    }

    checkSession();

    let subscription: { unsubscribe: () => void } | null = null;
    if (HAS_SUPABASE) {
      const { data } = supabase!.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const adminUser = await loadSupabaseUser(session.user.id, session.user.email ?? "");
          if (adminUser) setUser(adminUser);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          localStorage.removeItem(LS_KEY);
        }
      });
      subscription = data.subscription;
    }

    return () => subscription?.unsubscribe();
  }, []);

  async function loadSupabaseUser(userId: string, email: string): Promise<AdminUser | null> {
    if (!HAS_SUPABASE) return null;
    try {
      const { data: roleData, error } = await supabase!
        .from("admin_roles")
        .select("role, full_name, is_active, user_id")
        .eq("user_id", userId)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        console.error("[Auth] admin_roles query ERROR:", error.message);
        return null;
      }

      if (!roleData) {
        console.warn("[Auth] No active admin_roles for user_id:", userId);
        console.warn(`[Auth] FIX: INSERT INTO admin_roles (user_id, role, full_name, is_active) VALUES ('${userId}', 'admin', 'Admin', true);`);
        return null;
      }

      return {
        id: userId,
        email: email.toLowerCase(),
        name: roleData.full_name || email.split("@")[0] || "Admin",
        role: roleData.role,
      };
    } catch (err: any) {
      console.error("[Auth] loadSupabaseUser exception:", err?.message || err);
      return null;
    }
  }

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (HAS_SUPABASE) {
      try {
        const { data, error } = await supabase!.auth.signInWithPassword({
          email: trimmedEmail,
          password: trimmedPassword,
        });

        if (error || !data.user) {
          return { success: false, reason: "wrong_password", debug: error?.message || "No user returned" };
        }

        const adminUser = await loadSupabaseUser(data.user.id, data.user.email ?? trimmedEmail);

        if (adminUser) {
          setUser(adminUser);
          return { success: true };
        }

        await supabase!.auth.signOut();
        return { success: false, reason: "no_admin_role", debug: `User ${data.user.id} has no active admin_roles row` };
      } catch (err: any) {
        return { success: false, reason: "supabase_error", debug: err?.message || String(err) };
      }
    }

    // Demo mode
    if (trimmedEmail === DEMO_EMAIL.toLowerCase() && trimmedPassword === DEMO_PASS) {
      const adminUser: AdminUser = { id: "admin-1", email: DEMO_EMAIL, name: "Administrator", role: "admin" };
      setUser(adminUser);
      localStorage.setItem(LS_KEY, JSON.stringify(adminUser));
      return { success: true };
    }

    return { success: false, reason: "wrong_password", debug: "Demo mode: use admin@titanroute.com / admin123" };
  }, []);

  const logout = useCallback(async () => {
    if (HAS_SUPABASE) await supabase!.auth.signOut();
    setUser(null);
    localStorage.removeItem(LS_KEY);
  }, []);

  const value = useMemo(() => ({
    user, isAuthenticated: !!user, isLoading, login, logout,
  }), [user, isLoading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
