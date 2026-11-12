"use client";

import React, { useState } from "react";
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  User,
} from "lucide-react";

export interface AuthUser {
  email: string;
  user_id: string;
  auth_mode: "demo" | "supabase";
  token?: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AuthUser) => void;
  initialTab?: "login" | "signup" | "demo";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialTab = "demo",
}) => {
  const [tab, setTab] = useState<"login" | "signup" | "demo">(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [demoRole, setDemoRole] = useState<"investor" | "quant" | "student">("investor");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync tab whenever modal opens or initialTab changes
  React.useEffect(() => {
    if (initialTab) {
      setTab(initialTab);
      setError(null);
    }
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
      const res = await fetch(`${apiBase}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (res.ok) {
        const data = await res.json();
        const user: AuthUser = {
          email: data.email,
          user_id: data.user_id,
          auth_mode: data.auth_mode,
          token: data.token,
        };
        localStorage.setItem("marketpulse_auth_user", JSON.stringify(user));
        onAuthSuccess(user);
        onClose();
      } else {
        throw new Error("Invalid credentials or server unavailable");
      }
    } catch {
      // Local demo fallback for static export / offline
      const user: AuthUser = {
        email: email.trim(),
        user_id: `usr_${Math.floor(Math.random() * 900000 + 100000)}`,
        auth_mode: "demo",
      };
      localStorage.setItem("marketpulse_auth_user", JSON.stringify(user));
      onAuthSuccess(user);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please provide an email and password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
      const res = await fetch(`${apiBase}/api/v1/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (res.ok) {
        const data = await res.json();
        const user: AuthUser = {
          email: data.email,
          user_id: data.user_id,
          auth_mode: data.auth_mode,
          token: data.token,
        };
        localStorage.setItem("marketpulse_auth_user", JSON.stringify(user));
        onAuthSuccess(user);
        onClose();
      } else {
        throw new Error("Registration failed");
      }
    } catch {
      const user: AuthUser = {
        email: email.trim(),
        user_id: `usr_${Math.floor(Math.random() * 900000 + 100000)}`,
        auth_mode: "demo",
      };
      localStorage.setItem("marketpulse_auth_user", JSON.stringify(user));
      onAuthSuccess(user);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDemo = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
      const res = await fetch(`${apiBase}/api/v1/auth/demo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: demoRole }),
      });

      if (res.ok) {
        const data = await res.json();
        const user: AuthUser = {
          email: data.email,
          user_id: data.user_id,
          auth_mode: "demo",
          token: data.token,
        };
        localStorage.setItem("marketpulse_auth_user", JSON.stringify(user));
        onAuthSuccess(user);
        onClose();
      } else {
        throw new Error("Demo session generation failed");
      }
    } catch {
      const user: AuthUser = {
        email: `demo-${demoRole}@marketpulse.local`,
        user_id: "00000000-0000-0000-0000-000000000001",
        auth_mode: "demo",
      };
      localStorage.setItem("marketpulse_auth_user", JSON.stringify(user));
      onAuthSuccess(user);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-sky-600 rounded-lg text-white">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-base text-slate-100">TradeX Pro Access</h3>
              <p className="text-[11px] text-slate-400">Sign in or explore instantly in demo mode</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950/50 p-1 text-xs font-semibold">
          <button
            onClick={() => {
              setTab("demo");
              setError(null);
            }}
            className={`py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
              tab === "demo"
                ? "bg-sky-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Demo</span>
          </button>
          <button
            onClick={() => {
              setTab("login");
              setError(null);
            }}
            className={`py-2 rounded-lg transition ${
              tab === "login"
                ? "bg-sky-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setTab("signup");
              setError(null);
            }}
            className={`py-2 rounded-lg transition ${
              tab === "signup"
                ? "bg-sky-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-5 mt-4 p-2.5 rounded-lg bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab 1: Instant Demo */}
        {tab === "demo" && (
          <div className="p-5 space-y-4">
            <div className="p-4 bg-sky-950/30 border border-sky-800/60 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                <Sparkles className="w-4 h-4" />
                <span>Zero-Credential Demo Mode</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Explore the complete application immediately without external Supabase cloud setup.
                Virtual portfolio, watchlists, research assistant, and AI Trading Academy are fully unlocked.
              </p>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1.5">
                Select Evaluator Role:
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(["investor", "quant", "student"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setDemoRole(r)}
                    className={`py-2 rounded-lg border capitalize font-semibold transition ${
                      demoRole === r
                        ? "bg-sky-950 border-sky-500 text-sky-300 ring-1 ring-sky-500"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleInstantDemo}
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg flex items-center justify-center gap-2"
            >
              <span>Launch Demo Session</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-[10px] text-slate-400 text-center">
              Simulated demonstration session • No credit card or paid cloud required
            </div>
          </div>
        )}

        {/* Tab 2: Login */}
        {tab === "login" && (
          <form onSubmit={handleLogin} className="p-5 space-y-4 text-xs">
            <div>
              <label className="text-slate-400 font-medium block mb-1">Email Address:</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@marketpulse.local"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Password:</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-9 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow"
            >
              {loading ? "Authenticating..." : "Sign In to MarketPulse"}
            </button>

            <div className="text-center text-[11px] text-slate-400">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setTab("signup")}
                className="text-sky-400 hover:underline font-semibold"
              >
                Sign up here
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Sign Up */}
        {tab === "signup" && (
          <form onSubmit={handleSignup} className="p-5 space-y-4 text-xs">
            <div>
              <label className="text-slate-400 font-medium block mb-1">Email Address:</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="trader@marketpulse.local"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Password (min 6 chars):</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-9 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Confirm Password:</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <div className="text-center text-[11px] text-slate-400">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setTab("login")}
                className="text-sky-400 hover:underline font-semibold"
              >
                Sign in
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
