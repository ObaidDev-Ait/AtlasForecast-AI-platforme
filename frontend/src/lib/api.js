// Single source of truth for the AtlasForecast API base URL.
// Override with VITE_API_URL in frontend/.env.local — never hardcode the port elsewhere.
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4001";

const ACCESS_TOKEN_KEY = "access_token";
const SESSION_KEY = "session";

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

export const storeSession = (session) => {
  if (!session?.access_token) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, session.access_token);
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const clearSession = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("user");
};

const getRefreshToken = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null")?.refresh_token || null;
  } catch {
    return null;
  }
};

// Shared across concurrent callers so a burst of 401s triggers exactly one
// refresh instead of one per request (React StrictMode double-mounts, etc.).
let inFlightRefresh = null;

/**
 * Exchanges the stored refresh token for a new session.
 * Resolves to the new access token, or null when the session is truly over.
 */
export const refreshSession = async () => {
  if (inFlightRefresh) return inFlightRefresh;

  const refresh_token = getRefreshToken();
  if (!refresh_token) return null;

  inFlightRefresh = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token }),
      });

      if (!response.ok) {
        clearSession();
        return null;
      }

      const data = await response.json();
      if (!data?.session?.access_token) {
        clearSession();
        return null;
      }

      // Supabase rotates the refresh token on every use, so the whole session
      // object must be replaced, not just the access token.
      storeSession(data.session);
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      return data.session.access_token;
    } catch {
      // Network failure: keep the session so a transient outage does not log
      // the user out, but report that no new token is available.
      return null;
    } finally {
      inFlightRefresh = null;
    }
  })();

  return inFlightRefresh;
};

const buildHeaders = (options, token) => {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const authFetch = async (url, options = {}) => {
  // An explicitly supplied Authorization header wins; otherwise fall back to
  // the stored session token.
  const explicit = options.headers?.["Authorization"];
  const initialToken = explicit
    ? explicit.replace(/^Bearer\s+/i, "")
    : getAccessToken();

  const response = await fetch(url, {
    ...options,
    headers: buildHeaders(options, initialToken),
  });

  // Never try to refresh the refresh call itself.
  if (response.status !== 401 || url.includes("/auth/refresh")) {
    return response;
  }

  const newToken = await refreshSession();
  if (!newToken) {
    return response;
  }

  // Retry once with the rotated token.
  return fetch(url, {
    ...options,
    headers: buildHeaders(options, newToken),
  });
};
