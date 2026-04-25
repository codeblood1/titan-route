import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { supabase, saveRuntimeSupabaseConfig, clearRuntimeSupabaseConfig, hasRuntimeSupabaseConfig } from "@/lib/supabase";
import { Truck, Shield, ArrowLeft, AlertCircle, Settings, Database, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [sbUrl, setSbUrl] = useState("");
  const [sbKey, setSbKey] = useState("");
  const [configSaved, setConfigSaved] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const hasSupabase = !!supabase;
  const hasStoredConfig = hasRuntimeSupabaseConfig();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      navigate("/admin");
      return;
    }

    if (result.reason === "wrong_password") {
      setError("Invalid email or password.");
    } else if (result.reason === "no_admin_role") {
      setError(
        "Login succeeded, but this account does not have admin privileges. " +
        "Please assign an admin role in the admin_roles table. " +
        "Open browser DevTools (F12) → Console for the exact SQL fix."
      );
    } else if (result.reason === "supabase_error") {
      setError("Supabase connection error. Please check your internet connection and Supabase configuration.");
    } else {
      setError("Invalid email or password, or this account does not have admin privileges.");
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
      <div className="w-full max-w-md">
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
