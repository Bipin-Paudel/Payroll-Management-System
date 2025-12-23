import axios from "axios";

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";
const USER_KEY = "user";

function isBrowser() {
  return typeof window !== "undefined";
}

export function saveTokens(access: string, refresh: string, user?: any) {
  if (!isBrowser()) return;
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getAccessToken() {
  if (!isBrowser()) return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  if (!isBrowser()) return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function clearTokens() {
  if (!isBrowser()) return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * ✅ Safe base64url decode for BOTH browser + server
 */
function base64UrlDecode(input: string): string {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);

  if (typeof globalThis.atob === "function") {
    return globalThis.atob(padded);
  }
  // Node.js fallback
  return Buffer.from(padded, "base64").toString("utf-8");
}

/**
 * Decode JWT exp → returns exp in MILLISECONDS
 */
export function getTokenExp(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const payload = parts[1];
    const json = base64UrlDecode(payload);
    const parsed = JSON.parse(json);

    return typeof parsed?.exp === "number" ? parsed.exp * 1000 : null;
  } catch {
    return null;
  }
}

/**
 * ✅ Returns true if token expires within N seconds
 */
export function isTokenExpiringSoon(token: string, withinSeconds = 30): boolean {
  const expMs = getTokenExp(token);
  if (!expMs) return false;
  return expMs - Date.now() <= withinSeconds * 1000;
}

/**
 * ✅ Refresh Access Token (Backend expects refresh token in Authorization header)
 * POST /auth/refresh
 * Header: Authorization: Bearer <refresh_token>
 * Body: {}  (IMPORTANT: do NOT send null)
 */
export async function refreshAccessToken(): Promise<string | null> {
  const refresh_token = getRefreshToken();
  if (!refresh_token) return null;

  const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api";

  try {
    console.log("[TOKEN] POST /auth/refresh (Authorization Bearer refresh_token)");

    // ✅ Send {} instead of null to avoid "null is not valid JSON" issues
    const res = await axios.post(
      `${baseURL}/auth/refresh`,
      {}, // <-- IMPORTANT FIX
      {
        headers: {
          Authorization: `Bearer ${refresh_token}`,
        },
        timeout: 20000,
      }
    );

    const data: any = res.data ?? {};
    const newAccess = data.access_token ?? null;
    const newRefresh = data.refresh_token ?? null;

    if (!newAccess || typeof newAccess !== "string") return null;

    if (isBrowser()) localStorage.setItem(ACCESS_KEY, newAccess);

    if (newRefresh && typeof newRefresh === "string") {
      if (isBrowser()) localStorage.setItem(REFRESH_KEY, newRefresh);
    }

    return newAccess;
  } catch (e: any) {
    const status = e?.response?.status;
    const msg = e?.response?.data;
    console.log("[TOKEN] Refresh failed ❌", status, msg);
    return null;
  }
}
