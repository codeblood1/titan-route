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

// Hardcoded fallback for demo mode (when Supabase is not configured)
const FALLBACK_EMAIL = "admin@titanroute.com";
const FALLBACK_PASSWORD = "admin123";
const LS_AUTH_KEY = "titanroute_auth_v2";

// Check if Supabase is actually configured
const HAS_SUPABASE = !!(supabase);
console.log("[Auth] HAS_SUPABASE:", HAS_SUPABASE);
console.log("[Auth] Supabase client:", supabase ? "initialized" : "null");

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: check for existing session
  useEffect(() => {
    async function checkSession() {
      console.log("[Auth] Checking session... HAS_SUPABASE:", HAS_SUPABASE);
      
      if (HAS_SUPABASE) {
        try {
          const { data: { session } } = await supabase!.auth.getSession();
          console.log("[Auth] Supabase session:", session ? "found" : "none");
          if (session?.user) {
            const adminUser = await loadSupabaseUser(session.user.id, session.user.email ?? "");
            if (adminUser) {
              console.log("[Auth] Loaded Supabase admin user:", adminUser.email);
              setUser(adminUser);
              setIsLoading(false);
              return;
            }
          }
        } catch (err) {
          console.error("[Auth] Supabase session check failed:", err);
        }
      }

      // Fallback: check localStorage
      try {
        const stored = localStorage.getItem(LS_AUTH_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.token === "authenticated" && parsed?.user) {
            console.log("[Auth] Loaded localStorage user:", parsed.user.email);
            setUser(parsed.user);
          }
        }
      } catch {
        localStorage.removeItem(LS_AUTH_KEY);
      }
      setIsLoading(false);
    }

    checkSession();

    // Listen for Supabase auth state changes
    let subscription: { unsubscribe: () => void } | null = null;
    if (HAS_SUPABASE) {
      const { data } = supabase!.auth.onAuthStateChange(async (event, session) => {
        console.log("[Auth] Auth state change:", event);
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
    try {
      const { data: roleData, error } = await supabase!
        .from("admin_roles")
        .select("role, full_name")
        .eq("user_id", userId)
        .eq("is_active", true)
        .single();

      if (error || !roleData) {
        console.warn("[Auth] No admin role found for user:", userId, error?.message);
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
    
    console.log("[Auth] Login attempt:", trimmedEmail, "| HAS_SUPABASE:", HAS_SUPABASE);

    // Try Supabase Auth first (if configured)
    if (HAS_SUPABASE) {
      try {
        console.log("[Auth] Trying Supabase auth...");
        const { data, error } = await supabase!.auth.signInWithPassword({
          email: trimmedEmail,
          password: trimmedPassword,
        });

        if (error || !data.user) {
          console.warn("[Auth] Supabase auth failed:", error?.message);
          return false;
        }

        console.log("[Auth] Supabase auth success, checking admin role...");
        const adminUser = await loadSupabaseUser(data.user.id, data.user.email ?? trimmedEmail);
        if (adminUser) {
          console.log("[Auth] Admin role confirmed, logged in:", adminUser.email);
          setUser(adminUser);
          return true;
        }

        console.warn("[Auth] User authenticated but no admin role");
        await supabase!.auth.signOut();
        return false;
      } catch (err) {
        console.error("[Auth] Supabase login error:", err);
        return false;
      }
    }

    // Fallback: simple password check
    console.log("[Auth] Using fallback auth mode");
    console.log("[Auth] Expected email:", FALLBACK_EMAIL);
    console.log("[Auth] Input email:", trimmedEmail);
    console.log("[Auth] Email match:", trimmedEmail === FALLBACK_EMAIL.trim().toLowerCase());
    console.log("[Auth] Password match:", trimmedPassword === FALLBACK_PASSWORD.trim());

    if (trimmedEmail === FALLBACK_EMAIL.trim().toLowerCase() && trimmedPassword === FALLBACK_PASSWORD.trim()) {
      console.log("[Auth] Fallback login successful");
      const adminUser: AdminUser = {
        id: "admin-1",
        email: FALLBACK_EMAIL,
        name: "Administrator",
        role: "admin",
      };
      setUser(adminUser);
      localStorage.setItem(LS_AUTH_KEY, JSON.stringify({ token: "authenticated", user: adminUser }));
      return true;
    }
    
    console.warn("[Auth] Fallback login failed - credentials mismatch");
    return false;
  }, []);

  const logout = useCallback(async () => {
    console.log("[Auth] Logging out...");
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
