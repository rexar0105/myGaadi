
"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

interface AppSettings {
  notificationsEnabled: boolean;
  clearDataOnLogout: boolean;
  defaultSortOrder: 'newest' | 'oldest';
  reminderLeadTime: number; // in days
}

interface SettingsContextType {
  settings: AppSettings;
  setSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const defaultSettings: AppSettings = {
  notificationsEnabled: true,
  clearDataOnLogout: false,
  defaultSortOrder: 'newest',
  reminderLeadTime: 14,
};

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('myGaadiSettings');
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        // Merge with defaults to ensure all keys are present
        setSettings({ ...defaultSettings, ...parsedSettings });
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage", error);
    }
  }, []);

  const setSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prevSettings => {
      const newSettings = { ...prevSettings, [key]: value };
      try {
        localStorage.setItem('myGaadiSettings', JSON.stringify(newSettings));
      } catch (error) {
        console.error("Failed to save settings to localStorage", error);
      }
      return newSettings;
    });
  };

  const value = useMemo(() => ({ settings, setSetting }), [settings]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
