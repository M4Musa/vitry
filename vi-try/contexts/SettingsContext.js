import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const { data: session, status } = useSession();
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      marketing: false,
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
    },
    language: 'English',
    currency: 'PKR',
    theme: 'light',
  });
  const [loading, setLoading] = useState(true);

  // Fetch user settings when authenticated
  useEffect(() => {
    const fetchSettings = async () => {
      if (status === 'authenticated' && session?.user) {
        try {
          const response = await fetch('/api/user/settings');
          if (response.ok) {
            const data = await response.json();
            setSettings(data);
          }
        } catch (error) {
          console.error('Error fetching settings:', error);
        }
      }
      setLoading(false);
    };

    fetchSettings();
  }, [session, status]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      root.style.setProperty('--bg-color', '#1a1a1a');
      root.style.setProperty('--text-color', '#ffffff');
      root.style.setProperty('--card-bg', '#2d2d2d');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
      root.style.setProperty('--bg-color', '#ffffff');
      root.style.setProperty('--text-color', '#000000');
      root.style.setProperty('--card-bg', '#f8f9fa');
    } else if (settings.theme === 'system') {
      // Use system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemPrefersDark) {
        root.classList.add('dark');
        root.style.setProperty('--bg-color', '#1a1a1a');
        root.style.setProperty('--text-color', '#ffffff');
        root.style.setProperty('--card-bg', '#2d2d2d');
      } else {
        root.classList.remove('dark');
        root.style.setProperty('--bg-color', '#ffffff');
        root.style.setProperty('--text-color', '#000000');
        root.style.setProperty('--card-bg', '#f8f9fa');
      }
    }
  }, [settings.theme]);

  // Update a specific setting
  const updateSetting = async (category, key, value) => {
    try {
      const response = await fetch(`/api/user/settings/${category}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: key, value }),
      });

      if (response.ok) {
        setSettings(prev => ({
          ...prev,
          [category]: {
            ...prev[category],
            [key]: value,
          },
        }));
        return true;
      }
    } catch (error) {
      console.error('Error updating setting:', error);
    }
    return false;
  };

  // Update general preference
  const updatePreference = async (key, value) => {
    try {
      const response = await fetch('/api/user/settings/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: key, value }),
      });

      if (response.ok) {
        setSettings(prev => ({
          ...prev,
          [key]: value,
        }));
        return true;
      }
    } catch (error) {
      console.error('Error updating preference:', error);
    }
    return false;
  };

  // Save all settings
  const saveAllSettings = async (newSettings) => {
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        return true;
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
    return false;
  };

  const value = {
    settings,
    setSettings,
    updateSetting,
    updatePreference,
    saveAllSettings,
    loading,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};