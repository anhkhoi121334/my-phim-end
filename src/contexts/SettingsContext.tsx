'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Settings {
  site: {
    name: string;
    description: string;
    logo: string;
    favicon: string;
    language: string;
    timezone: string;
  };
  api: {
    phimapiUrl: string;
    tmdbApiKey: string;
    enableCaching: boolean;
    cacheDuration: number;
  };
  security: {
    enableRegistration: boolean;
    requireEmailVerification: boolean;
    maxLoginAttempts: number;
    sessionTimeout: number;
  };
  notifications: {
    enableEmailNotifications: boolean;
    enablePushNotifications: boolean;
    adminEmail: string;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    primaryColor: string;
    enableAnimations: boolean;
  };
}

interface SettingsContextType {
  settings: Settings | null;
  loading: boolean;
  error: string | null;
  updateSettings: (newSettings: Settings) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/settings');
      
      if (response.status === 401) {
        // User not authenticated, use default settings
        setSettings({
          site: {
            name: 'MyPhim',
            description: 'Website xem phim trực tuyến hàng đầu Việt Nam',
            logo: '/myphim-logo.svg',
            favicon: '/favicon.ico',
            language: 'vi',
            timezone: 'Asia/Ho_Chi_Minh'
          },
          api: {
            phimapiUrl: 'https://phimapi.com',
            tmdbApiKey: '',
            enableCaching: true,
            cacheDuration: 3600
          },
          security: {
            enableRegistration: true,
            requireEmailVerification: false,
            maxLoginAttempts: 5,
            sessionTimeout: 24
          },
          notifications: {
            enableEmailNotifications: false,
            enablePushNotifications: true,
            adminEmail: 'admin@myphim.com'
          },
          appearance: {
            theme: 'dark',
            primaryColor: '#3b82f6',
            enableAnimations: true
          }
        });
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.settings);
      } else {
        setError(data.error || 'Failed to fetch settings');
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      // Use default settings on error
      setSettings({
        site: {
          name: 'MyPhim',
          description: 'Website xem phim trực tuyến hàng đầu Việt Nam',
          logo: '/myphim-logo.svg',
          favicon: '/favicon.ico',
          language: 'vi',
          timezone: 'Asia/Ho_Chi_Minh'
        },
        api: {
          phimapiUrl: 'https://phimapi.com',
          tmdbApiKey: '',
          enableCaching: true,
          cacheDuration: 3600
        },
        security: {
          enableRegistration: true,
          requireEmailVerification: false,
          maxLoginAttempts: 5,
          sessionTimeout: 24
        },
        notifications: {
          enableEmailNotifications: false,
          enablePushNotifications: true,
          adminEmail: 'admin@myphim.com'
        },
        appearance: {
          theme: 'dark',
          primaryColor: '#3b82f6',
          enableAnimations: true
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Settings) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSettings(newSettings);
        // Apply settings to the app
        applySettings(newSettings);
      } else {
        setError(data.error || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = async () => {
    await fetchSettings();
  };

  // Apply settings to the app (theme, colors, etc.)
  const applySettings = (newSettings: Settings) => {
    const html = document.documentElement;
    
    // Apply theme
    if (newSettings.appearance.theme === 'dark') {
      html.classList.add('dark');
      html.classList.remove('light');
    } else if (newSettings.appearance.theme === 'light') {
      html.classList.add('light');
      html.classList.remove('dark');
    } else if (newSettings.appearance.theme === 'auto') {
      // Auto theme based on system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        html.classList.add('dark');
        html.classList.remove('light');
      } else {
        html.classList.add('light');
        html.classList.remove('dark');
      }
    }
    
    // Apply primary color
    document.documentElement.style.setProperty('--primary-color', newSettings.appearance.primaryColor);
    
    // Apply animations
    if (!newSettings.appearance.enableAnimations) {
      html.classList.add('no-animations');
    } else {
      html.classList.remove('no-animations');
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      applySettings(settings);
    }
  }, [settings]);

  const value: SettingsContextType = {
    settings,
    loading,
    error,
    updateSettings,
    refreshSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
} 