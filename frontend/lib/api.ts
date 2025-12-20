import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosRequestHeaders,
} from "axios";
import {
  getAccessToken,
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

/**
 * Runs refresh once. If already refreshing, waits.
 */
async function getFreshAccessToken(): Promise<string | null> {
  if (isRefreshing) {
    return new Promise((resolve) => {
      refreshQueue.push(resolve);
    });
  }

  isRefreshing = true;
  try {
    const newToken = await refreshAccessToken();
    resolveQueue(newToken);
    return newToken;
  } catch {
    resolveQueue(null);
    return null;
  } finally {
    isRefreshing = false;
  }
}

/* -------------------- REQUEST: ATTACH TOKEN + PROACTIVE REFRESH -------------------- */
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // ensure headers exists
  config.headers = (config.headers ?? {}) as AxiosRequestHeaders;

  // never attach/refresh on auth endpoints (prevents loops)
  if (isAuthUrl(config.url)) return config;

  let token = getAccessToken();

  // Proactive refresh ONLY if expiring soon (<= 30 seconds)
  if (token && isTokenExpiringSoon(token, 30)) {
    const newToken = await getFreshAccessToken();
    if (newToken) token = newToken;
  }

  if (token) {
    (config.headers as any).Authorization = `Bearer ${token}`;
  } else {
    // no token: ensure header not set
    delete (config.headers as any).Authorization;
  }

  return config;
});

/* ------------------ RESPONSE: HANDLE 401 (REFRESH + RETRY ONCE) ------------------ */
api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original: any = err.config;

    // If no response (network/CORS), do not logout
    if (!err.response) return Promise.reject(err);
    if (!original) return Promise.reject(err);

    // Never refresh on auth endpoints (prevents loops)
    if (isAuthUrl(original.url)) return Promise.reject(err);

    // Handle only 401, and retry only once
    if (err.response.status === 401 && !original._retry) {
      original._retry = true;
      original.headers = original.headers ?? {};

      // Attempt refresh
      const newToken = await getFreshAccessToken();

      // If refresh failed -> logout
      if (!newToken) {
        clearTokens();
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(err);
      }

      // Retry original request with new token
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    }

    return Promise.reject(err);
  }
);
