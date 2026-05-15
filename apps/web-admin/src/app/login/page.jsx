"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Activity, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { adminDataApi } from "@/lib/admin-api";
import { useAdminStore } from "@/store/admin-store";

export default function LoginPage() {
  const router = useRouter();
  const login = useAdminStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await adminDataApi.login({ email, password });
      login(data.user, data.accessToken, data.refreshToken);
      router.replace("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-brand/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-purple/8 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo header */}
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#8B5CF6_0%,#A78BFA_50%,#C4B5FD_100%)] shadow-[0_14px_32px_rgba(139,92,246,0.25)]">
            <Activity className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-txt-primary">
            SwasthAI Admin
          </h1>
          <p className="mt-1.5 text-sm text-txt-secondary">
            Sign in to the operations console
          </p>
        </div>

        {/* Login card */}
        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-txt-secondary">
                Admin Email
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-input px-4 py-3 focus-within:border-border-active focus-within:ring-2 focus-within:ring-brand/10 transition-all">
                <Mail className="h-4 w-4 text-txt-muted" />
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@swasthai.com"
                  className="flex-1 bg-transparent text-sm text-txt-primary outline-none placeholder:text-txt-muted"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-txt-secondary">
                Password
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-input px-4 py-3 focus-within:border-border-active focus-within:ring-2 focus-within:ring-brand/10 transition-all">
                <Lock className="h-4 w-4 text-txt-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent text-sm text-txt-primary outline-none placeholder:text-txt-muted"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-txt-muted hover:text-txt-primary transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-error/20 bg-error/5 px-4 py-3 text-xs font-medium text-error"
              >
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#8B5CF6_0%,#7C3AED_100%)] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(139,92,246,0.25)] transition-all hover:shadow-[0_18px_40px_rgba(139,92,246,0.35)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[11px] text-txt-muted">
              Secured by enterprise JWT authentication
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
