import { ApiError, type AuthSuccessResponse } from './types';

// Central API configuration adhering to Vite environment conventions
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') || 'http://localhost:8000';

// SECURITY INVARIANT:
// Access token is held in JavaScript memory ONLY.
// Never stored in localStorage, sessionStorage, IndexedDB, or accessible cookies.
let inMemoryAccessToken: string | null = null;

export const getAccessToken = (): string | null => inMemoryAccessToken;

export const setAccessToken = (token: string | null): void => {
  inMemoryAccessToken = token;
};

// Auth failure callback registry (invoked when refresh fails or session is revoked)
type AuthFailureCallback = () => void;
const authFailureListeners: Set<AuthFailureCallback> = new Set();

export const onAuthFailure = (cb: AuthFailureCallback): (() => void) => {
  authFailureListeners.add(cb);
  return () => authFailureListeners.delete(cb);
};

const notifyAuthFailure = (): void => {
  setAccessToken(null);
  authFailureListeners.forEach((cb) => {
    try {
      cb();
    } catch {
      // ignore callback errors
    }
  });
};

// Shared refresh promise to prevent concurrent refresh storms
let refreshPromise: Promise<string | null> | null = null;

/**
 * Execute a token refresh with the backend using the HttpOnly refresh cookie.
 * Ensures concurrent 401s share a single in-flight refresh request.
 */
export const executeTokenRefresh = async (): Promise<string | null> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        setAccessToken(null);
        notifyAuthFailure();
        return null;
      }

      const data = (await response.json()) as AuthSuccessResponse;
      if (data && data.access_token) {
        setAccessToken(data.access_token);
        return data.access_token;
      }

      setAccessToken(null);
      notifyAuthFailure();
      return null;
    } catch {
      setAccessToken(null);
      notifyAuthFailure();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

export interface ApiFetchOptions extends RequestInit {
  skipAuth?: boolean;
  _retry?: boolean;
}

/**
 * Central typed API client.
 * Features:
 * - Deterministic base URL resolution
 * - Automatic Bearer Authorization header injection from JS memory
 * - Enforces credentials: "include" for HttpOnly cookie exchange
 * - Normalizes JSON error responses into ApiError instances
 * - Concurrency-safe single refresh on 401 with one-time retry
 */
export async function apiFetch<T>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> {
  const { skipAuth = false, _retry = false, headers: customHeaders, ...restOptions } = options;

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const headers = new Headers(customHeaders);
  if (!headers.has('Content-Type') && !(restOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Inject in-memory access token if available and not explicitly skipped
  if (!skipAuth && inMemoryAccessToken) {
    headers.set('Authorization', `Bearer ${inMemoryAccessToken}`);
  }

  // Enforce credentials: "include" across all requests for HttpOnly cookie support
  const fetchConfig: RequestInit = {
    ...restOptions,
    headers,
    credentials: 'include',
  };

  let response: Response;
  try {
    response = await fetch(url, fetchConfig);
  } catch (err) {
    throw new ApiError(
      err instanceof Error ? err.message : 'Network error communicating with Lumora backend',
      0
    );
  }

  // Handle 401 Unauthorized with single token refresh and single retry
  const isAuthEndpoint =
    cleanEndpoint.includes('/api/v1/auth/login') ||
    cleanEndpoint.includes('/api/v1/auth/refresh') ||
    cleanEndpoint.includes('/api/v1/auth/register');

  if (response.status === 401 && !skipAuth && !_retry && !isAuthEndpoint) {
    const newAccessToken = await executeTokenRefresh();
    if (newAccessToken) {
      // Retry the original request ONCE with new access token
      return apiFetch<T>(endpoint, {
        ...options,
        _retry: true,
      });
    }
  }

  // Parse response body
  let responseData: unknown = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  } else {
    try {
      responseData = await response.text();
    } catch {
      responseData = null;
    }
  }

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    if (responseData && typeof responseData === 'object') {
      const dataObj = responseData as { detail?: string | { msg?: string }[] };
      if (typeof dataObj.detail === 'string') {
        errorMessage = dataObj.detail;
      } else if (Array.isArray(dataObj.detail) && dataObj.detail.length > 0) {
        const first = dataObj.detail[0];
        if (first && typeof first.msg === 'string') {
          errorMessage = first.msg;
        }
      }
    }
    throw new ApiError(errorMessage, response.status, responseData);
  }

  return responseData as T;
}
