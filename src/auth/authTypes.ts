import type { SystemRole } from '../types';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export type ThemeMode = 'dark' | 'light' | 'system';

export interface User {
  id: string;
  name: string;
  email: string;
  role: SystemRole;
  department: string;
  studentId?: string;
  createdAt?: string;
  avatarUrl?: string;
}

export interface LoginCredentials {
  identifier: string; // email or student ID
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
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
  user: User | null;
  status: AuthStatus;
  theme: ThemeMode;
  isMockSession: boolean;
  login: (credentials: LoginCredentials, isDemo?: boolean) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  changePassword: (data: PasswordChangeData) => Promise<{ success: boolean; error?: string }>;
  setTheme: (theme: ThemeMode) => void;
}
