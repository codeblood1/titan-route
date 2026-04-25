import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { supabase, saveRuntimeSupabaseConfig, clearRuntimeSupabaseConfig, hasRuntimeSupabaseConfig } from "@/lib/supabase";
import { Truck, Shield, ArrowLeft, AlertCircle, Settings, Database, Trash2, Activity, TestTube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TestResult {
  name: string;
  status: "pass" | "fail" | "running" | "idle";
  detail: string;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rawReason, setRawReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [sbUrl, setSbUrl] = useState("");
  const [sbKey, setSbKey] = useState("");
  const [configSaved, setConfigSaved] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [tests, setTests] = useState<TestResult[]>([
    { name: "Supabase Client", status: "idle", detail: "" },
    { name: "Auth Sign-In", status: "idle", detail: "" },
    { name: "Read admin_roles", status: "idle", detail: "" },
    { name: "Read packages", status: "idle", detail: "" },
  ]);
  const { login } = useAuth();
  const navigate = useNavigate();

  const hasSupabase = !!supabase;
  const hasStoredConfig = hasRuntimeSupabaseConfig();

  const updateTest = (name: string, status: TestResult["status"], detail: string) => {
    setTests((prev) => prev.map((t) => (t.name === name ? { ...t, status, detail } : t)));
  };

  const runDiagnostics = async () => {
    if (!supabase) {
      setError("Supabase is not connected. Configure it first.");
      return;
    }

    setShowDiagnostics(true);
    setTests([
      { name: "Supabase Client", status: "running", detail: "Checking..." },
      { name: "Auth Sign-In", status: "idle", detail: "" },
      { name: "Read admin_roles", status: "idle", detail: "" },
      { name: "Read packages", status: "idle", detail: "" },
    ]);

    // Test 1: Client connection
    try {
      const { data, error } = await supabase.from("packages").select("count").limit(0);
      if (error) {
        updateTest("Supabase Client", "fail", `Connection error: ${error.message} (${error.code})`);
      } else {
        updateTest("Supabase Client", "pass", "Connected to Supabase successfully");
      }
    } catch (e: any) {
      updateTest("Supabase Client", "fail", `Exception: ${e.message}`);
    }

    // Test 2: Auth with provided credentials
    if (email && password) {
      updateTest("Auth Sign-In", "running", `Trying ${email}...`);
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.user) {
          updateTest("Auth Sign-In", "fail", `Failed: ${error?.message || "No user"}`);
        } else {
          updateTest("Auth Sign-In", "pass", `Signed in as ${data.user.id}`);

          // Test 3: Read admin_roles for this user
          updateTest("Read admin_roles", "running", "Querying...");
          const userId = data.user.id;
          try {
            const { data: roleRows, error: roleError } = await supabase
              .from("admin_roles")
              .select("role, full_name, is_active, user_id")
              .eq("user_id", userId);

            if (roleError) {
              updateTest("Read admin_roles", "fail", `Query error: ${roleError.message}`);
            } else if (!roleRows || roleRows.length === 0) {
              updateTest(
                "Read admin_roles",
                "fail",
                `No rows found for user_id ${userId}. You MUST run: INSERT INTO admin_roles (user_id, role, full_name, is_active) VALUES ('${userId}', 'admin', 'Admin', true);`
              );
            } else {
              const active = roleRows.find((r: any) => r.is_active === true);
              if (active) {
                updateTest("Read admin_roles", "pass", `Found active role: ${active.role}`);
              } else {
                updateTest(
                  "Read admin_roles",
                  "fail",
                  `Found ${roleRows.length} row(s) but none are active (is_active=false). Run: UPDATE admin_roles SET is_active = true WHERE user_id = '${userId}';`
                );
              }
            }
          } catch (e: any) {
            updateTest("Read admin_roles", "fail", `Exception: ${e.message}`);
          }

          // Test 4: Read packages
          updateTest("Read packages", "running", "Querying...");
          try {
            const { data: pkgData, error: pkgError } = await supabase.from("packages").select("tracking_code").limit(1);
            if (pkgError) {
              updateTest("Read packages", "fail", `Query error: ${pkgError.message}`);
            } else {
              updateTest("Read packages", "pass", `Found ${pkgData?.length ?? 0} package(s)`);
            }
          } catch (e: any) {
            updateTest("Read packages", "fail", `Exception: ${e.message}`);
          }

          // Sign out after diagnostics
          await supabase.auth.signOut();
        }
      } catch (e: any) {
        updateTest("Auth Sign-In", "fail", `Exception: ${e.message}`);
      }
    } else {
      updateTest("Auth Sign-In", "fail", "Enter email and password above first");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setRawReason("");
    setIsLoading(true);

    const result = await login(email, password);
    setIsLoading(false);

    console.log("[Login] Result:", result);

    if (result.success) {
      navigate("/admin");
      return;
    }

    setRawReason(result.reason || "unknown");

    if (result.reason === "wrong_password") {
      setError(`Invalid email or password. (code: ${result.reason})`);
    } else if (result.reason === "no_admin_role") {
      setError(
        `Login succeeded, but this account does not have admin privileges. (code: ${result.reason}) ` +
        "Please assign an admin role in the admin_roles table. " +
        "Click 'Run Diagnostics' below for the exact SQL fix."
      );
    } else if (result.reason === "supabase_error") {
      setError(`Supabase connection error: ${result.debug || ""} (code: ${result.reason})`);
    } else {
      setError(`Unknown error: ${result.debug || result.reason || "no details"} (code: ${result.reason || "unknown"})`);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sbUrl.trim() || !sbKey.trim()) return;
    saveRuntimeSupabaseConfig(sbUrl, sbKey);
    setConfigSaved(true);
    setTimeout(() => window.location.reload(), 600);
  };

  const handleClearConfig = () => {
    clearRuntimeSupabaseConfig();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-blue-700 flex items-center justify-center mx-auto mb-4">
            <Truck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">TitanRoute Admin</h1>
          <p className="text-blue-200 mt-1">Sign in to manage shipments</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="flex items-center justify-center gap-2">
              <Shield className="h-5 w-5 text-blue-700" />
              Admin Sign In
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasSupabase && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2">
                <Database className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <div className="text-xs text-emerald-700">
                  <p className="font-semibold">Supabase Connected</p>
                  <p>Authenticating against live Supabase backend.</p>
                </div>
              </div>
            )}

            {!hasSupabase && hasStoredConfig && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <div className="text-xs text-red-700">
                  <p className="font-semibold">Supabase Config Stored But Not Connected</p>
                  <p>Credentials are saved but the client failed to initialize. Check DevTools Console for errors.</p>
                </div>
              </div>
            )}

            {!hasSupabase && !hasStoredConfig && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="text-xs text-amber-700">
                  <p className="font-semibold">Demo Mode Active</p>
                  <p>Supabase is not configured. Enter your Supabase credentials below to connect to your live backend.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Email</label>
                <Input
                  type="email"
                  placeholder="admin@titanroute.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-blue-700 hover:bg-blue-800 h-11"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Diagnostics Panel */}
            {hasSupabase && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDiagnostics((s) => !s)}
                  className="flex items-center gap-2 text-xs text-slate-500 hover:text-blue-700 transition-colors w-full justify-center"
                >
                  <Activity className="h-3.5 w-3.5" />
                  {showDiagnostics ? "Hide Diagnostics" : "Show Diagnostics & SQL Fix"}
                </button>

                {showDiagnostics && (
                  <div className="mt-3 space-y-3">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                          <TestTube className="h-3.5 w-3.5" />
                          Connection Tests
                        </span>
                        <Button size="sm" className="h-7 text-xs bg-blue-700 hover:bg-blue-800" onClick={runDiagnostics}>
                          Run Diagnostics
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {tests.map((test) => (
                          <div key={test.name} className="flex items-start gap-2 text-xs">
                            <span
                              className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                                test.status === "pass"
                                  ? "bg-emerald-500"
                                  : test.status === "fail"
                                  ? "bg-red-500"
                                  : test.status === "running"
                                  ? "bg-amber-400 animate-pulse"
                                  : "bg-slate-300"
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-slate-700">{test.name}</span>
                              {test.detail && (
                                <p className="text-slate-500 mt-0.5 break-words">{test.detail}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {rawReason === "no_admin_role" && email && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-2">
                        <p className="font-semibold">SQL Fix - Copy and run in Supabase SQL Editor:</p>
                        <p>First find your user ID:</p>
                        <code className="block bg-white border border-amber-300 rounded px-2 py-1 font-mono text-[10px] break-all">
                          SELECT id, email FROM auth.users WHERE email = &apos;{email}&apos;;
                        </code>
                        <p>Then insert admin role (replace USER_ID):</p>
                        <code className="block bg-white border border-amber-300 rounded px-2 py-1 font-mono text-[10px] break-all">
                          INSERT INTO admin_roles (user_id, role, full_name, is_active) VALUES (&apos;USER_ID_HERE&apos;, &apos;admin&apos;, &apos;Admin&apos;, true);
                        </code>
                        <p>Or update if already exists:</p>
                        <code className="block bg-white border border-amber-300 rounded px-2 py-1 font-mono text-[10px] break-all">
                          UPDATE admin_roles SET is_active = true, role = &apos;admin&apos; WHERE user_id = (SELECT id FROM auth.users WHERE email = &apos;{email}&apos;);
                        </code>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Supabase Configuration Panel */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowConfig((s) => !s)}
                className="flex items-center gap-2 text-xs text-slate-500 hover:text-blue-700 transition-colors w-full justify-center"
              >
                <Settings className="h-3.5 w-3.5" />
                {showConfig ? "Hide Supabase Configuration" : "Configure Supabase Connection"}
              </button>

              {showConfig && (
                <form onSubmit={handleSaveConfig} className="mt-3 space-y-3">
                  {configSaved ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 text-center">
                      Configuration saved! Reloading...
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="text-xs font-medium text-slate-600 mb-1 block">Supabase Project URL</label>
                        <Input
                          type="url"
                          placeholder="https://abcdefgh12345678.supabase.co"
                          value={sbUrl}
                          onChange={(e) => setSbUrl(e.target.value)}
                          className="h-9 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-600 mb-1 block">Supabase Anon Key</label>
                        <Input
                          type="text"
                          placeholder="eyJhbGciOiJIUzI1NiIs..."
                          value={sbKey}
                          onChange={(e) => setSbKey(e.target.value)}
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" className="flex-1 bg-blue-700 hover:bg-blue-800 text-xs h-8">
                          Save & Connect
                        </Button>
                        {hasStoredConfig && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={handleClearConfig}
                            className="text-xs h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Clear
                          </Button>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 text-center">
                        Credentials are stored locally in your browser. Never share your anon key publicly.
                      </p>
                    </>
                  )}
                </form>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="text-slate-500"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Tracking
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-blue-300/60 mt-6">
          {hasSupabase
            ? "Connected to Supabase authentication"
            : "Demo credentials: admin@titanroute.com / admin123"}
        </p>
      </div>
    </div>
  );
}
