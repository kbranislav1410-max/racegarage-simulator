/**
 * API client with authentication support
 */

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

/**
 * Get stored user from localStorage
 */
function getStoredUser() {
  if (typeof window === "undefined") return null;
  
  const userJson = localStorage.getItem("user");
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

/**
 * Create Authorization header with user data
 */
function createAuthHeader() {
  const user = getStoredUser();
  if (!user) return null;
  
  // Encode user as base64 for the Authorization header
  const token = Buffer.from(JSON.stringify(user)).toString("base64");
  return `Bearer ${token}`;
}

/**
 * Fetch wrapper that automatically adds authentication headers
 */
export async function authenticatedFetch(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const authHeader = createAuthHeader();
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Helper methods for common HTTP verbs
 */
export const api = {
  get: (url: string, options?: FetchOptions) =>
    authenticatedFetch(url, { ...options, method: "GET" }),
  
  post: (url: string, body?: unknown, options?: FetchOptions) =>
    authenticatedFetch(url, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  
  put: (url: string, body?: unknown, options?: FetchOptions) =>
    authenticatedFetch(url, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),
  
  patch: (url: string, body?: unknown, options?: FetchOptions) =>
    authenticatedFetch(url, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
  
  delete: (url: string, options?: FetchOptions) =>
    authenticatedFetch(url, { ...options, method: "DELETE" }),
};
