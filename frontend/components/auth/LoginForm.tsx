"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api";

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  /* ----------------------------------------------------
     LOGIN SUBMIT HANDLER (1 user -> 1 company)
  ---------------------------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      // 1) Login (AuthContext saves tokens + user)
      const user = await login(form.email, form.password);

      // 2) Save user to localStorage (if your AuthContext doesn't already)
      //    Keep this for safety; it won't hurt even if AuthContext saves too.
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: user.id,
          email: user.email,
        })
      );

      // 3) Check if company exists
      const res = await api.get("/company/me");
      const company = res.data;

      // If no company -> go create company
      if (!company) {
        router.push("/company/info");
        return;
      }

      // Company exists -> dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err?.response?.data || err);
      setError(err?.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
    >
      <h2 className="text-2xl font-semibold text-center text-purple-700 mb-6">
        Login to Your Account
      </h2>

      {/* Email */}
      <label className="block mb-3">
        <span className="text-gray-800 font-medium">Email</span>
        <input
          type="email"
          className="w-full mt-1 p-2 border border-gray-300 text-gray-900 rounded-md focus:ring-2 focus:ring-purple-600 focus:outline-none"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="you@example.com"
          required
        />
      </label>

      {/* Password */}
      <label className="block mb-4 relative">
        <span className="text-gray-800 font-medium">Password</span>
        <input
          type={showPassword ? "text" : "password"}
          className="w-full mt-1 p-2 border border-gray-300 text-gray-900 rounded-md focus:ring-2 focus:ring-purple-600 focus:outline-none pr-10"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="••••••••"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-9.5 text-gray-500 hover:text-purple-700"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </label>

      {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-700 text-white py-2 rounded-md hover:bg-purple-800 transition disabled:opacity-70"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <p className="text-sm text-center mt-4 text-gray-700">
        Don’t have an account?{" "}
        <a href="/signup" className="text-purple-700 hover:underline font-medium">
          Sign Up
        </a>
      </p>
    </form>
  );
}
