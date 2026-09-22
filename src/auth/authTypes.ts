import type { SystemRole } from '../types';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export type ThemeMode = 'dark' | 'light' | 'system';

export interface User {
  id: string;
  name: string;
  email: string;
  role: SystemRole;
  department?: string;
  studentId?: string;
  institutionalId: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string | null;
  avatarUrl?: string;
}

export interface LoginCredentials {
  identifier: string; // email or student ID
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  institutionalId: string;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: SystemRole;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordData {
  newPassword: string;
  confirmPassword: string;
  recoveryCode?: string;
}

export interface AuthContextType {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  status: AuthStatus;
  theme: ThemeMode;
  isMockSession: boolean;
  login: (credentials: LoginCredentials, isDemo?: boolean) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => void;
  changePassword: (data: PasswordChangeData) => Promise<{ success: boolean; error?: string }>;
  setTheme: (theme: ThemeMode) => void;
}
