"use client";

import { AuthProvider } from "@/context/AuthContext";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 👇 Wraps only login and signup routes with AuthProvider
  return <AuthProvider>{children}</AuthProvider>;
}
