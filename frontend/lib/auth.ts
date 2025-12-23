/* -------------------------- Auth & Token Helpers -------------------------- */

import { api } from "./api";
import {
  saveTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
  refreshAccessToken,
} from "./token";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api";

/**
 * ✅ Login using axios api client
 * Backend returns: { user, access_token, refresh_token }
 */
export async function login(email: string, password: string) {
  const res = await api.post("/auth/login", { email, password });
  const data: any = res.data ?? {};

  if (data?.access_token && data?.refresh_token) {
    saveTokens(data.access_token, data.refresh_token, data.user);
  }

  return data;
}

/**
 * ✅ Signup (same pattern)
 */
export async function signup(payload: any) {
  const res = await api.post("/auth/signup", payload);
  const data: any = res.data ?? {};

  // If your backend also returns tokens on signup, save them
  if (data?.access_token && data?.refresh_token) {
    saveTokens(data.access_token, data.refresh_token, data.user);
  }

  return data;
}

/**
 * ✅ Logout (calls backend, then clears tokens)
 */
export async function logout() {
  try {
    await api.post("/auth/logout");
  } catch {
    // ignore (token may already be invalid)
  } finally {
    clearTokens();
    if (typeof window !== "undefined") window.location.href = "/login";
  }
}

/**
 * ✅ fetchWithAuth helper (kept for places you still use fetch)
 * - Attaches access token
 * - If 401 -> refresh once -> retry
 *
 * IMPORTANT:
 * - refreshAccessToken() in token.ts already follows your backend:
 *   POST /auth/refresh with Authorization: Bearer <refresh_token>
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const isBrowser = typeof window !== "undefined";

  let token = getAccessToken();

  // If no access token but refresh token exists, try to refresh once
  if (!token && getRefreshToken()) {
    token = await refreshAccessToken();
  }

  const doFetch = async (t?: string | null) => {
    const headers = new Headers(options.headers as any);

    // Do not override content-type if caller is sending FormData
    const isFormData =
      typeof FormData !== "undefined" && options.body instanceof FormData;

    if (!isFormData && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (t) headers.set("Authorization", `Bearer ${t}`);

    const fullUrl = buildUrl(url);
    return fetch(fullUrl, { ...options, headers });
  };

  // First attempt
  let res = await doFetch(token);

  // If unauthorized, try refresh once
  if (res.status === 401) {
    const newToken = await refreshAccessToken();

    if (!newToken) {
      clearTokens();
      if (isBrowser) window.location.href = "/login";
      return res;
    }

    res = await doFetch(newToken);
  }

  return res;
}

/* --------------------------- Helper for API calls --------------------------- */
export const buildUrl = (path: string) => {
  if (!path) return API_BASE;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const cleanBase = API_BASE.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

/* --------------------------- Auth Header Helper ---------------------------- */
export const authHeader = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/* -------------------------- Current Company Helper ------------------------- */
export const getCurrentCompanyId = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("current_company_id");
};
