import type { SystemRole } from '../types';

export interface BackendUser {
  id: string;
  institutional_id: string;
  institutional_email: string;
  full_name: string;
  role: SystemRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface RegisterPayload {
  institutional_id: string;
  institutional_email: string;
  full_name: string;
  password: string;
  role: SystemRole;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface AuthSuccessResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: BackendUser;
}

export interface LogoutSuccessResponse {
  message: string;
}

export interface ApiErrorDetail {
  loc?: (string | number)[];
  msg?: string;
  type?: string;
}

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}
