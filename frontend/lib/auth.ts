/* -------------------------- Token Management Helpers -------------------------- */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api";

/* Save tokens */
export function saveTokens(access: string, refresh: string, user?: any) {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
  if (user) localStorage.setItem("user", JSON.stringify(user));
}

/* Get tokens */
export function getAccessToken() {
  return localStorage.getItem("access_token");
}

export function getRefreshToken() {
  return localStorage.getItem("refresh_token");
}

/* Remove tokens */
export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
}

/* Refresh token if expired */
export async function refreshAccessToken() {
  const refresh = getRefreshToken();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!refresh || !user?.id) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        refresh_token: refresh,
      }),
    });

    if (!res.ok) throw new Error("Failed to refresh");

    const data = await res.json();
    saveTokens(data.access_token, data.refresh_token);
    return data.access_token;
  } catch (err) {
    console.error("Token refresh failed", err);
    clearTokens();
    window.location.href = "/login";
  }
}

/* Automatically attach access token & refresh if needed */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let token = getAccessToken();
  if (!token) token = await refreshAccessToken();

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  // If token expired, try refresh once
  if (res.status === 401) {
    token = await refreshAccessToken();
    if (token) {
      return fetch(`${API_BASE}${url}`, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    }
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
  return localStorage.getItem("current_company_id");
};
