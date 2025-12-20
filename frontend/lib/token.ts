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
 * Decode JWT exp
 * ✅ Returns exp in MILLISECONDS so you can compare with Date.now()
 */
export function getTokenExp(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const payload = parts[1];

    // base64url -> base64
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    // add missing padding
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);

    const json = atob(padded);
    const parsed = JSON.parse(json);

    // JWT exp is in seconds → convert to ms
    return typeof parsed?.exp === "number" ? parsed.exp * 1000 : null;
  } catch {
    return null;
  }
}

/**
 * ✅ Helper used by api.ts
 * Returns true if token expires within N seconds (default 30s)
 */
export function isTokenExpiringSoon(token: string, withinSeconds = 30): boolean {
  const expMs = getTokenExp(token);
  if (!expMs) return false;
  return expMs - Date.now() <= withinSeconds * 1000;
}

/**
 * ✅ Refresh Access Token (NEW BACKEND FLOW)
 * POST /auth/refresh
 * Header: Authorization: Bearer <refresh_token>
 * Body: none
 *
 * Use plain axios here (NOT api) to avoid interceptor recursion loop.
 *
 * Backend returns:
 * { access_token, refresh_token }
 *
 * ✅ IMPORTANT: Do NOT clear tokens here on failure.
 * Let api.ts decide to logout ONLY when refresh fails during a real 401 flow.
 */
export async function refreshAccessToken(): Promise<string | null> {
  const refresh_token = getRefreshToken();
  if (!refresh_token) return null;

  const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api";

  try {
    const res = await axios.post(`${baseURL}/auth/refresh`, null, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refresh_token}`,
      },
      timeout: 20000,
    });

    const data: any = res.data ?? {};
    const newAccess = data.access_token ?? null;
    const newRefresh = data.refresh_token ?? null;

    if (!newAccess || typeof newAccess !== "string") {
      return null;
    }

    // ✅ Save new access token
    if (isBrowser()) localStorage.setItem(ACCESS_KEY, newAccess);

    // ✅ Save rotated refresh token (if backend returns it)
    if (newRefresh && typeof newRefresh === "string") {
      if (isBrowser()) localStorage.setItem(REFRESH_KEY, newRefresh);
    }

    return newAccess;
  } catch {
    //  Do not clear tokens here (prevents random logout on temporary errors)
    return null;
  }
}
