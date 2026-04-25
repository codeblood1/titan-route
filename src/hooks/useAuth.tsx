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

// Demo fallback credentials — used ONLY when Supabase is NOT configured
const DEMO_EMAIL = "admin@titanroute.com";
const DEMO_PASS = "admin123";
const LS_KEY = "tr_admin_v3";

// Check if Supabase client is actually initialized (URL + key provided)
const HAS_SUPABASE = !!supabase;

console.log("[Auth] Mode:", HAS_SUPABASE ? "SUPABASE" : "DEMO (fallback)");

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: check for existing session
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
        } catch (err) {
          console.warn("[Auth] Supabase session check failed:", err);
        }
      }

      // Fallback: check localStorage demo session
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
    }

    checkSession();

    // Listen for Supabase auth state changes (works across tabs)
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

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Load admin role from Supabase admin_roles table
  async function loadSupabaseUser(userId: string, email: string): Promise<AdminUser | null> {
    if (!HAS_SUPABASE) return null;
    try {
      const { data: roleData, error } = await supabase!
        .from("admin_roles")
        .select("role, full_name")
        .eq("user_id", userId)
        .eq("is_active", true)
        .single();

      if (error || !roleData) {
        console.warn("[Auth] User has no admin role in admin_roles table:", error?.message);
        return null;
      }

      return {
        id: userId,
        email: email.toLowerCase(),
        name: roleData.full_name || email.split("@")[0] || "Admin",
        role: roleData.role,
      };
    } catch (err) {
      console.error("[Auth] Error loading admin role:", err);
      return null;
    }
  }

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // ===== SUPABASE MODE =====
    if (HAS_SUPABASE) {
      try {
        console.log("[Auth] Trying Supabase login for:", trimmedEmail);
        const { data, error } = await supabase!.auth.signInWithPassword({
          email: trimmedEmail,
          password: trimmedPassword,
        });

        if (error || !data.user) {
          console.warn("[Auth] Supabase auth failed:", error?.message);
          return false;
        }

        console.log("[Auth] Supabase auth OK, checking admin_roles...");
        const adminUser = await loadSupabaseUser(data.user.id, data.user.email ?? trimmedEmail);
        if (adminUser) {
          console.log("[Auth] Admin confirmed:", adminUser.email, "role:", adminUser.role);
          setUser(adminUser);
          return true;
        }

        // Authenticated but not an admin — sign out
        console.warn("[Auth] User authenticated but NO admin role in admin_roles table");
        await supabase!.auth.signOut();
        return false;
      } catch (err) {
        console.error("[Auth] Supabase login error:", err);
        return false;
      }
    }

    // ===== DEMO FALLBACK MODE =====
    if (trimmedEmail === DEMO_EMAIL.toLowerCase() && trimmedPassword === DEMO_PASS) {
      const adminUser: AdminUser = {
        id: "admin-1",
        email: DEMO_EMAIL,
        name: "Administrator",
        role: "admin",
      };
      setUser(adminUser);
      localStorage.setItem(LS_KEY, JSON.stringify(adminUser));
      return true;
    }

    return false;
  }, []);

  const logout = useCallback(async () => {
    if (HAS_SUPABASE) {
      await supabase!.auth.signOut();
    }
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
