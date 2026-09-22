import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
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
import {
  authApi,
  mapBackendUserToUser,
  getAccessToken,
  setAccessToken,
  onAuthFailure,
  ApiError,
} from '../api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessTokenState, setAccessTokenState] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [theme, setThemeState] = useState<ThemeMode>(() => authStorage.getTheme());
  const [isMockSession, setIsMockSession] = useState<boolean>(false);

  // Prevent double restoration in React 18/19 StrictMode during development
  const restorationAttempted = useRef(false);

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

  // Listen for centralized API client auth failure (e.g. refresh token expired or revoked)
  useEffect(() => {
    const unsubscribe = onAuthFailure(() => {
      setUser(null);
      setAccessTokenState(null);
      setStatus('unauthenticated');
      setIsMockSession(false);
    });
    return unsubscribe;
  }, []);

  // Initial Auth Session Restoration on Startup:
  // 1. Starts with status = 'loading'
  // 2. Attempts POST /api/v1/auth/refresh with credentials: "include"
  // 3. If successful, stores access token in memory and sets user
  // 4. If refresh fails (e.g. 401 or no cookie), gracefully marks as unauthenticated without displaying errors
  useEffect(() => {
    if (restorationAttempted.current) return;
    restorationAttempted.current = true;

    const restoreSession = async () => {
      try {
        const response = await authApi.refresh();
        if (response && response.access_token && response.user) {
          setAccessToken(response.access_token);
          setAccessTokenState(response.access_token);
          const mappedUser = mapBackendUserToUser(response.user);
          setUser(mappedUser);
          setStatus('authenticated');
          setIsMockSession(false);
          return;
        }
      } catch {
        // A visitor without a refresh cookie or with an expired session is simply unauthenticated.
        // Do not display an error banner on normal initial visitor load.
      }

      // Check if there was an explicit demo/mock preview session saved locally
      const demoUser = authStorage.getDemoUser();
      if (demoUser) {
        setUser(demoUser);
        setStatus('authenticated');
        setIsMockSession(true);
      } else {
        setAccessToken(null);
        setAccessTokenState(null);
        setUser(null);
        setStatus('unauthenticated');
        setIsMockSession(false);
      }
    };

    restoreSession();
  }, []);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    authStorage.setTheme(newTheme);
    applyTheme(newTheme);
  };

  /**
   * Authenticate user against FastAPI backend.
   * On success:
   * - Short-lived access token is stored in JS memory ONLY
   * - HttpOnly refresh cookie is set automatically by the backend
   * - User profile is mapped into AuthContext
   */
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
        institutionalId: isFaculty ? 'FAC-102' : 'STU-2026-8841',
        isActive: true,
        createdAt: '2026-08-15T09:00:00Z',
      };

      authStorage.setDemoUser(mockUser);
      setUser(mockUser);
      setStatus('authenticated');
      setIsMockSession(true);
      return { success: true };
    }

    try {
      const response = await authApi.login({
        identifier: credentials.identifier.trim(),
        password: credentials.password,
      });

      setAccessTokenState(response.access_token);
      const mappedUser = mapBackendUserToUser(response.user);
      setUser(mappedUser);
      setStatus('authenticated');
      setIsMockSession(false);
      authStorage.clearDemoUser();

      return { success: true };
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          return { success: false, error: 'Invalid institutional credentials.' };
        }
        return { success: false, error: err.message || 'Authentication failed. Please verify credentials.' };
      }
      return { success: false, error: 'Unable to connect to campus authentication service.' };
    }
  };

  /**
   * Register a new institutional user via FastAPI backend.
   * SECURITY INVARIANT:
   * Registration does NOT log the user in automatically or create tokens/sessions.
   */
  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    if (!data.institutionalId || !data.fullName || !data.email || !data.password || !data.confirmPassword) {
      return { success: false, error: 'All registration fields are required.' };
    }

    if (data.institutionalId.trim().length < 3) {
      return { success: false, error: 'Institutional ID must be at least 3 characters in length.' };
    }

    if (data.password !== data.confirmPassword) {
      return { success: false, error: 'Passwords do not match.' };
    }

    if (data.password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters in length.' };
    }

    // Role guard: Privileged administrative roles require institutional IT registrar provisioning
    if (data.role !== 'student' && data.role !== 'faculty') {
      return {
        success: false,
        error: 'Administrator credentials require institutional IT registrar provisioning.',
      };
    }

    try {
      await authApi.register({
        institutional_id: data.institutionalId.trim(),
        institutional_email: data.email.trim(),
        full_name: data.fullName.trim(),
        password: data.password,
        role: data.role,
      });

      // Successful registration does NOT log user in
      return { success: true };
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          return { success: false, error: err.message || 'An account with this institutional ID or email already exists.' };
        }
        if (err.status === 403) {
          return { success: false, error: err.message || 'Registration for this role is restricted.' };
        }
        return { success: false, error: err.message || 'Registration failed. Please check your information.' };
      }
      return { success: false, error: 'Unable to connect to campus registration service.' };
    }
  };

  /**
   * Logout user from session.
   * Calls POST /api/v1/auth/logout to revoke server session and clear HttpOnly cookie.
   * Always clears in-memory credentials even if the backend network call fails.
   */
  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch {
      // Graceful fallback: ensure local memory is cleared regardless of network status
    } finally {
      setAccessToken(null);
      setAccessTokenState(null);
      authStorage.clearDemoUser();
      setUser(null);
      setStatus('unauthenticated');
      setIsMockSession(false);
    }
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    if (isMockSession) {
      authStorage.setDemoUser(updated);
    }
  };

  /**
   * In-session password change.
   * Truthful boundary: informs user that in-session password change endpoint is not yet supported by the backend.
   */
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

    return {
      success: false,
      error: 'In-session password change endpoint is scheduled for a future backend milestone.',
    };
  };

  const isAuthenticated = status === 'authenticated' && !!user;
  const isLoading = status === 'loading';

  return (
    <AuthContext.Provider
      value={{
        accessToken: accessTokenState || getAccessToken(),
        user,
        isAuthenticated,
        isLoading,
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
