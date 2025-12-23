import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosRequestHeaders,
} from "axios";
import {
  getAccessToken,
  getRefreshToken,
  refreshAccessToken,
  clearTokens,
  isTokenExpiringSoon,
} from "./token";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

function isAuthUrl(url?: string) {
  if (!url) return false;
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/signup") ||
    url.includes("/auth/refresh") ||
    url.includes("/auth/logout")
  );
}

/* ------------------ REFRESH SINGLE-FLIGHT (QUEUE) ------------------ */
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

function resolveQueue(token: string | null) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

async function getFreshAccessToken(): Promise<string | null> {
  // ✅ Only refresh if refresh token exists
  const rt = getRefreshToken();
  if (!rt) {
    console.log("[API] No refresh_token available → cannot refresh.");
    return null;
  }

  if (isRefreshing) {
    return new Promise((resolve) => refreshQueue.push(resolve));
  }

  isRefreshing = true;
  try {
    console.log("[API] Calling /auth/refresh …");
    const newToken = await refreshAccessToken();

    resolveQueue(newToken);

    if (newToken) {
      console.log("[API] Refresh success ✅");
      return newToken;
    }

    console.log("[API] Refresh failed ❌ (returned null)");
    return null;
  } catch (e) {
    resolveQueue(null);
    console.log("[API] Refresh crashed ❌", e);
    return null;
  } finally {
    isRefreshing = false;
  }
}

/* -------------------- REQUEST INTERCEPTOR -------------------- */
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  config.headers = (config.headers ?? {}) as AxiosRequestHeaders;

  // Debug: confirm axios instance is used
  console.log("[API] Request →", config.method?.toUpperCase(), config.url);

  // Never attach/refresh on auth endpoints
  if (isAuthUrl(config.url)) return config;

  let token = getAccessToken();
  const refreshToken = getRefreshToken();

  // ✅ Proactive refresh only if BOTH tokens exist
  if (token && refreshToken && isTokenExpiringSoon(token, 30)) {
    console.log("[API] Access token expiring soon → proactive refresh…");
    const newToken = await getFreshAccessToken();
    if (newToken) token = newToken;
  }

  if (token) {
    (config.headers as any).Authorization = `Bearer ${token}`;
  } else {
    delete (config.headers as any).Authorization;
  }

  return config;
});

/* -------------------- RESPONSE INTERCEPTOR (401) -------------------- */
api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original: any = err.config;

    if (!err.response || !original) return Promise.reject(err);

    console.log(
      "[API] Response error →",
      err.response.status,
      original?.method?.toUpperCase(),
      original?.url
    );

    // Never refresh on auth endpoints
    if (isAuthUrl(original.url)) return Promise.reject(err);

    // ✅ Only handle 401 once
    if (err.response.status === 401 && !original._retry) {
      original._retry = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        console.log("[API] 401 + no refresh_token → logout.");
        clearTokens();
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(err);
      }

      console.log("[API] 401 received → refreshing & retrying…", original.url);

      const newToken = await getFreshAccessToken();
      if (!newToken) {
        console.log("[API] Refresh failed after 401 → logout.");
        clearTokens();
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(err);
      }

      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    }

    return Promise.reject(err);
  }
);
