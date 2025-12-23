"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api";
import axios from "axios";

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1) Login (AuthContext should store tokens)
      const user = await login(form.email, form.password);

      // Optional: store minimal user info (safe)
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: user?.id,
          email: user?.email,
        })
      );

      // 2) Company check must NOT break login flow
      try {
        const res = await api.get("/company/me");
        const company = res.data;

        if (!company) {
          router.push("/company/info");
          return;
        }

        router.push("/dashboard");
        return;
      } catch (err: any) {
        // Handle company/me errors correctly
        if (axios.isAxiosError(err)) {
          const status = err.response?.status;

          // ✅ If company not found: send to company setup page
          if (status === 404) {
            router.push("/company/info");
            return;
          }

          // ✅ If unauthorized: token not attached or session invalid
          if (status === 401) {
            setError("Your session is invalid. Please login again.");
            return;
          }

          // Other errors
          const msg =
            (err.response?.data as any)?.message ||
            err.message ||
            "Unable to verify company. Please try again.";
          setError(msg);
          return;
        }

        setError("Unable to verify company. Please try again.");
        return;
      }
    } catch (err: any) {
      // ✅ Log Axios errors reliably (Next overlay often shows {} otherwise)
      if (axios.isAxiosError(err)) {
        console.error("Login error:", {
          message: err.message,
          code: err.code,
          status: err.response?.status,
          data: err.response?.data,
        });

        setError(
          ((err.response?.data as any)?.message as string) ||
            "Invalid email or password"
        );
      } else {
        console.error("Login error (non-axios):", err);
        setError("Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm"
    >
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold text-foreground">
          Login to Your Account
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your credentials to continue.
        </p>
      </div>

      {/* Email */}
      <label className="block space-y-2 mb-4">
        <span className="text-sm font-medium text-foreground">Email</span>
        <input
          type="email"
          className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
      </label>

      {/* Password */}
      <label className="block space-y-2 mb-3">
        <span className="text-sm font-medium text-foreground">Password</span>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            className="h-11 w-full rounded-md border border-input bg-background px-3 pr-10 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </label>

      {error && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="h-11 w-full rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-70"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Don’t have an account?{" "}
        <a
          href="/signup"
          className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Sign Up
        </a>
      </p>
    </form>
  );
}
