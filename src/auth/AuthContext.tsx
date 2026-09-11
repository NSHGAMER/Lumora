import React, { createContext, useState, useEffect, useCallback } from 'react';
import type {
  User,
  AuthStatus,
  ThemeMode,
  LoginCredentials,
  RegisterData,
  PasswordChangeData,
  AuthContextType,
} from './authTypes';
import { authStorage } from './authStorage';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [theme, setThemeState] = useState<ThemeMode>(() => authStorage.getTheme());
  const [isMockSession, setIsMockSession] = useState<boolean>(false);

  // Apply Theme to document root
  const applyTheme = useCallback((mode: ThemeMode) => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');

    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'dark' : 'light');
    } else {
      root.classList.add(mode);
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Check for existing demo session on mount
  useEffect(() => {
    const demoUser = authStorage.getDemoUser();
    if (demoUser) {
      setUser(demoUser);
      setStatus('authenticated');
      setIsMockSession(true);
    } else {
      setStatus('unauthenticated');
    }
  }, []);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    authStorage.setTheme(newTheme);
    applyTheme(newTheme);
  };

  // Phase 2A Login method with explicit boundary:
  // Does not fake real backend authentication. Standard login informs about Phase 2B backend.
  // Optional demo login explicitly marked as UI preview only.
  const login = async (
    credentials: LoginCredentials,
    isDemo: boolean = false
  ): Promise<{ success: boolean; error?: string }> => {
    if (!credentials.identifier || !credentials.password) {
      return { success: false, error: 'Please enter your institutional ID/email and password.' };
    }

    if (isDemo) {
      const isFaculty = credentials.identifier.toLowerCase().includes('faculty');
      const mockUser: User = {
        id: isFaculty ? 'usr-fac-102' : 'usr-stu-849',
        name: isFaculty ? 'Dr. Sarah Vance' : 'Alex Chen',
        email: isFaculty ? 's.vance@lumora.edu' : 'alex.chen@lumora.edu',
        role: isFaculty ? 'faculty' : 'student',
        department: isFaculty ? 'Quantum Computation' : 'Aerospace Engineering',
        studentId: isFaculty ? undefined : 'STU-2026-8841',
        createdAt: '2026-08-15T09:00:00Z',
      };

      authStorage.setDemoUser(mockUser);
      setUser(mockUser);
      setStatus('authenticated');
      setIsMockSession(true);
      return { success: true };
    }

    // Explicit notice that backend authentication is connected in Phase 2B
    return {
      success: false,
      error:
        'FastAPI backend endpoint (/api/v1/auth/login) is scheduled for Phase 2B. To preview the authenticated UI, use the "Preview with Demo Account" option.',
    };
  };

  // Phase 2A Registration method:
  // Visually and architecturally models immediate account activation without email verification.
  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    if (!data.fullName || !data.email || !data.password || !data.confirmPassword) {
      return { success: false, error: 'All registration fields are required.' };
    }

    if (data.password !== data.confirmPassword) {
      return { success: false, error: 'Passwords do not match.' };
    }

    if (data.password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters in length.' };
    }

    // Role guard: Administrator accounts cannot be created publicly
    if (data.role === 'admin') {
      return {
        success: false,
        error: 'Administrator credentials require institutional IT registrar provisioning.',
      };
    }

    const newUser: User = {
      id: `usr-reg-${Math.floor(1000 + Math.random() * 9000)}`,
      name: data.fullName,
      email: data.email,
      role: data.role,
      department: 'Undergraduate Sciences',
      studentId: `STU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
    };

    authStorage.setDemoUser(newUser);
    setUser(newUser);
    setStatus('authenticated');
    setIsMockSession(true);
    return { success: true };
  };

  const logout = () => {
    authStorage.clearDemoUser();
    setUser(null);
    setStatus('unauthenticated');
    setIsMockSession(false);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    if (isMockSession) {
      authStorage.setDemoUser(updated);
    }
  };

  const changePassword = async (data: PasswordChangeData): Promise<{ success: boolean; error?: string }> => {
    if (!data.currentPassword || !data.newPassword || !data.confirmPassword) {
      return { success: false, error: 'All password fields are required.' };
    }

    if (data.newPassword !== data.confirmPassword) {
      return { success: false, error: 'New passwords do not match.' };
    }

    if (data.newPassword.length < 8) {
      return { success: false, error: 'New password must be at least 8 characters.' };
    }

    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        theme,
        isMockSession,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        setTheme,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
