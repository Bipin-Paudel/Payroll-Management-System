"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from "@/lib/token";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<any>;
  signup: (form: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- INIT USER ON PAGE LOAD ---------------- */
  useEffect(() => {
    const access = getAccessToken();
    const refresh = getRefreshToken();
    const storedUser = localStorage.getItem("user");

    if (access && refresh && storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      clearTokens();
    }

    setLoading(false);
  }, []);

  /* ----------------------- LOGIN ----------------------- */
  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });

    // ✅ backend must return these keys
    const { user: backendUser, access_token, refresh_token } = res.data;

    const formattedUser = {
      id: backendUser.id,
      email: backendUser.email,
    };

    // ✅ store tokens in correct keys
    saveTokens(access_token, refresh_token, formattedUser);
    setUser(formattedUser);

    return formattedUser;
  };

  /* ----------------------- SIGNUP ----------------------- */
  const signup = async (form: any) => {
    await api.post("/auth/signup", form);
    setTimeout(() => router.push("/login"), 1000);
  };

  /* ----------------------- LOGOUT ----------------------- */
  const logout = () => {
    clearTokens();
    setUser(null);
    router.replace("/login");
  };

  if (loading) return null;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
