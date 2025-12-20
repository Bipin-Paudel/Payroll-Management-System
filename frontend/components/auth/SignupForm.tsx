"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export default function SignupForm() {
  const { signup } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validate = () => {
    if (!form.name.trim()) return "Full name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!form.password) return "Password is required.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      // ✅ only send fields backend expects
      await signup({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      setSuccess("Account created successfully! Redirecting to login...");

      setTimeout(() => router.push("/login"), 1200);
    } catch (err: any) {
      console.error("Signup error:", err?.response?.data || err);

      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Signup failed — please try again.";

      setError(typeof msg === "string" ? msg : "Signup failed — please try again.");
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
        Create Your Account
      </h2>

      {/* Full Name */}
      <label className="block mb-3">
        <span className="text-gray-800 font-medium">Full Name</span>
        <input
          type="text"
          className="w-full mt-1 p-2 border border-gray-300 text-gray-900 rounded-md focus:ring-2 focus:ring-purple-600 focus:outline-none"
          placeholder="John Doe"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </label>

      {/* Email */}
      <label className="block mb-3">
        <span className="text-gray-800 font-medium">Email</span>
        <input
          type="email"
          className="w-full mt-1 p-2 border border-gray-300 text-gray-900 rounded-md focus:ring-2 focus:ring-purple-600 focus:outline-none"
          placeholder="john@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
      </label>

      {/* Password */}
      <label className="block mb-3 relative">
        <span className="text-gray-800 font-medium">Password</span>
        <input
          type={showPassword ? "text" : "password"}
          className="w-full mt-1 p-2 border border-gray-300 text-gray-900 rounded-md focus:ring-2 focus:ring-purple-600 focus:outline-none pr-10"
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-3 top-9.5 text-gray-500 hover:text-purple-700"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </label>

      {/* Confirm Password */}
      <label className="block mb-4 relative">
        <span className="text-gray-800 font-medium">Confirm Password</span>
        <input
          type={showConfirm ? "text" : "password"}
          className="w-full mt-1 p-2 border border-gray-300 text-gray-900 rounded-md focus:ring-2 focus:ring-purple-600 focus:outline-none pr-10"
          placeholder="••••••••"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          required
        />
        <button
          type="button"
          onClick={() => setShowConfirm((v) => !v)}
          className="absolute right-3 top-9.5 text-gray-500 hover:text-purple-700"
          aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
        >
          {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </label>

      {/* Error Badge */}
      {error && (
        <p className="text-red-600 bg-red-100 border border-red-300 p-2 rounded-md text-sm text-center mb-3">
          {error}
        </p>
      )}

      {/* Success Badge */}
      {success && (
        <p className="text-green-600 bg-green-100 border border-green-300 p-2 rounded-md text-sm text-center mb-3">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-700 text-white py-2 rounded-md hover:bg-purple-800 transition disabled:opacity-70"
      >
        {loading ? "Creating..." : "Sign Up"}
      </button>

      <p className="text-sm text-center mt-4 text-gray-700">
        Already have an account?{" "}
        <a href="/login" className="text-purple-700 hover:underline font-medium">
          Login
        </a>
      </p>
    </form>
  );
}
