import { apiFetch, setAccessToken } from './client';
import type {
  BackendUser,
  RegisterPayload,
  LoginPayload,
  AuthSuccessResponse,
  LogoutSuccessResponse,
} from './types';
import type { User } from '../auth/authTypes';

/**
 * Transforms backend UserResponse into frontend User representation.
 * Preserves institutional identity fields while remaining backward-compatible with UI components.
 */
export function mapBackendUserToUser(bu: BackendUser): User {
  return {
    id: bu.id,
    name: bu.full_name,
    email: bu.institutional_email,
    role: bu.role,
    department: bu.role === 'faculty' ? 'Faculty Academic Division' : 'Undergraduate Division',
    studentId: bu.role === 'student' ? bu.institutional_id : undefined,
    institutionalId: bu.institutional_id,
    isActive: bu.is_active,
    createdAt: bu.created_at,
    updatedAt: bu.updated_at,
    lastLoginAt: bu.last_login_at,
  };
}

export const authApi = {
  /**
   * Register a new institutional user.
   * INVARIANT: Does NOT issue a JWT or log user in.
   */
  async register(payload: RegisterPayload): Promise<BackendUser> {
    return apiFetch<BackendUser>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true,
    });
  },

  /**
   * Authenticate with institutional identifier and password.
   * Receives access token (stored in memory) and sets HttpOnly refresh cookie.
   */
  async login(payload: LoginPayload): Promise<AuthSuccessResponse> {
    const response = await apiFetch<AuthSuccessResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true,
    });
    if (response.access_token) {
      setAccessToken(response.access_token);
    }
    return response;
  },

  /**
   * Restore session or rotate tokens using HttpOnly refresh cookie.
   * Returns newly minted short-lived access token and updated user profile.
   */
  async refresh(): Promise<AuthSuccessResponse> {
    const response = await apiFetch<AuthSuccessResponse>('/api/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({}),
      skipAuth: true,
    });
    if (response.access_token) {
      setAccessToken(response.access_token);
    }
    return response;
  },

  /**
   * Revoke current session and instruct backend to clear HttpOnly cookie.
   * Always clears in-memory access token even if the network call fails.
   */
  async logout(): Promise<LogoutSuccessResponse> {
    try {
      const response = await apiFetch<LogoutSuccessResponse>('/api/v1/auth/logout', {
        method: 'POST',
        body: JSON.stringify({}),
        skipAuth: true,
      });
      return response;
    } finally {
      setAccessToken(null);
    }
  },

  /**
   * Fetch currently authenticated user profile from /api/v1/auth/me.
   * Requires active Bearer access token in memory.
   */
  async me(): Promise<BackendUser> {
    return apiFetch<BackendUser>('/api/v1/auth/me');
  },
};
