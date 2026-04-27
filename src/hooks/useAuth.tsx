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
const LS_KEY = "tr_admin_v3";
const HAS_SUPABASE = !!supabase;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
    ),
  ]);
}

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage FIRST (fast, never hangs), then verify with Supabase
  useEffect(() => {
    let mounted = true;

    async function init() {
      // Step 1: Load from localStorage immediately (never hangs)
      let localUser: AdminUser | null = null;
      try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.email) {
            localUser = parsed as AdminUser;
            if (mounted) setUser(localUser);
          }
        }
      } catch {
        localStorage.removeItem(LS_KEY);
      }

      // Step 2: Stop loading spinner immediately so UI shows
      if (mounted) setIsLoading(false);

      // Step 3: Verify with Supabase in background (non-blocking)
      if (HAS_SUPABASE) {
        try {
          const { data: { session } } = await withTimeout(
            supabase!.auth.getSession(),
            5000
          );
          if (session?.user && mounted) {
            const adminUser = await withTimeout(
              loadSupabaseUser(session.user.id, session.user.email ?? ""),
              5000
            );
            if (adminUser && mounted) {
              setUser(adminUser);
              localStorage.setItem(LS_KEY, JSON.stringify(adminUser));
            } else if (adminUser === null && mounted && localUser) {
              // Supabase says no admin role, but we have local user
              // Keep local user but log warning
              console.warn("[Auth] Supabase session exists but no admin role found. Using cached credentials.");
            }
          }
        } catch (err: any) {
          console.warn("[Auth] Supabase verification failed:", err?.message);
          // LocalStorage user already set, so dashboard still works
        }
      }
    }

    init();
    return () => { mounted = false; };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (HAS_SUPABASE) {
      try {
        const { data, error } = await withTimeout(
          supabase!.auth.signInWithPassword({ email: trimmedEmail, password: trimmedPassword }),
          10000
        );
        if (error || !data.user) {
          return { success: false, reason: "wrong_password", debug: error?.message || "No user returned" };
        }
        const adminUser = await withTimeout(
          loadSupabaseUser(data.user.id, data.user.email ?? trimmedEmail),
          5000
        );
        if (adminUser) {
          setUser(adminUser);
          localStorage.setItem(LS_KEY, JSON.stringify(adminUser));
          return { success: true };
        }
        await supabase!.auth.signOut();
        return { success: false, reason: "no_admin_role", debug: `User ${data.user.id} has no active admin_roles row` };
      } catch (err: any) {
        const msg = err?.message || String(err);
        console.error("[Auth] login exception:", msg);
        return { success: false, reason: "supabase_error", debug: msg };
      }
    }

    return { success: false, reason: "supabase_error", debug: "Supabase not configured" };
  }, []);

  const logout = useCallback(async () => {
    if (HAS_SUPABASE) {
      try { await supabase!.auth.signOut(); } catch { /* ignore */ }
    }
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
