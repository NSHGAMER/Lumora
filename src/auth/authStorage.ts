import type { ThemeMode, User } from './authTypes';

const THEME_KEY = 'lumora_theme_mode';
const DEMO_USER_KEY = 'lumora_demo_user';

export const authStorage = {
  getTheme(): ThemeMode {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === 'dark' || stored === 'light' || stored === 'system') {
        return stored;
      }
    } catch {
      // ignore
    }
    return 'dark';
  },

  setTheme(theme: ThemeMode): void {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore
    }
  },

  // Isolated Mock/Demo session helper for UI preview testing ONLY.
  // NEVER stores passwords, JWT secrets, or production credentials.
  getDemoUser(): User | null {
    try {
      const stored = localStorage.getItem(DEMO_USER_KEY);
      if (stored) {
        return JSON.parse(stored) as User;
      }
    } catch {
      // ignore
    }
    return null;
  },

  setDemoUser(user: User): void {
    try {
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }
  },

  clearDemoUser(): void {
    try {
      localStorage.removeItem(DEMO_USER_KEY);
    } catch {
      // ignore
    }
  },
};
