import { useState, useEffect, useCallback } from 'react';
import type { CookiePreferences } from '../types';

const COOKIE_PREFERENCES_KEY = 'lumora_cookie_preferences';

const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  preferences: true,
  analytics: false,
};

export function useCookiePreferences() {
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);
  const [isSaved, setIsSaved] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<CookiePreferences>;
        setPreferences({
          essential: true,
          preferences: parsed.preferences ?? true,
          analytics: parsed.analytics ?? false,
          updatedAt: parsed.updatedAt,
        });
      }
    } catch {
      // Fallback to defaults on storage error
      setPreferences(DEFAULT_PREFERENCES);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const updatePreference = useCallback((key: keyof Omit<CookiePreferences, 'essential' | 'updatedAt'>, value: boolean) => {
    setIsSaved(false);
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const savePreferences = useCallback(() => {
    const updated: CookiePreferences = {
      ...preferences,
      essential: true,
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(updated));
      setPreferences(updated);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3500);
      return true;
    } catch {
      return false;
    }
  }, [preferences]);

  const resetPreferences = useCallback(() => {
    try {
      localStorage.removeItem(COOKIE_PREFERENCES_KEY);
      setPreferences(DEFAULT_PREFERENCES);
      setIsSaved(false);
    } catch {
      // ignore
    }
  }, []);

  return {
    preferences,
    updatePreference,
    savePreferences,
    resetPreferences,
    isSaved,
    isInitialized,
  };
}
