
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ProfileState } from "@/app/profile/page";
import { useSettings } from "./settings-context";

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  user: User | null;
  profile: ProfileState | null;
  setProfile: (profile: ProfileState) => void;
  loginWithEmail: (email: string, pass: string) => Promise<boolean>;
  signup: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  loginWithGoogle: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfileState] = useState<ProfileState | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const { settings } = useSettings();

  useEffect(() => {
    setIsAuthLoading(true);
    // Simulate checking for an existing session. In a real app, this would be an API call.
    // For this demo, we'll assume the user is always logged in.
    const localUser: User = { id: 'local-user', email: 'user@example.com' };
    setUser(localUser);

    try {
      const storedProfile = localStorage.getItem('myGaadiProfile');
      if (storedProfile) {
        setProfileState(JSON.parse(storedProfile));
      } else {
        const defaultProfile: ProfileState = {
          name: localUser.email.split('@')[0] || "New User",
          avatarUrl: null,
        };
        setProfileState(defaultProfile);
        localStorage.setItem('myGaadiProfile', JSON.stringify(defaultProfile));
      }
    } catch (e) {
      console.error("Failed to load or create profile", e);
      const defaultProfile: ProfileState = {
          name: localUser.email.split('@')[0] || "New User",
          avatarUrl: null
      };
      setProfileState(defaultProfile);
    } finally {
       setIsAuthLoading(false);
    }
  }, []);

  const loginWithEmail = async (email: string, pass: string): Promise<boolean> => {
    const localUser = { id: 'local-user', email };
    setUser(localUser);
    
    const defaultProfile: ProfileState = {
        name: email.split('@')[0] || "New User",
        avatarUrl: null
    };
    setProfileState(defaultProfile);
    localStorage.setItem('myGaadiProfile', JSON.stringify(defaultProfile));
    return true;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    const localUser = { id: 'local-user', email: 'user@example.com' };
    setUser(localUser);

    const defaultProfile: ProfileState = {
        name: localUser.email.split('@')[0] || "New User",
        avatarUrl: null
    };
    setProfileState(defaultProfile);
    localStorage.setItem('myGaadiProfile', JSON.stringify(defaultProfile));
    return true;
  };

  const signup = async (email: string, pass: string) => {
     const defaultProfile: ProfileState = {
        name: email.split('@')[0] || "New User",
        avatarUrl: null
     };
     localStorage.setItem('myGaadiProfile', JSON.stringify(defaultProfile));
  };

  const setProfile = useCallback((newProfile: ProfileState) => {
    setProfileState(newProfile);
    localStorage.setItem('myGaadiProfile', JSON.stringify(newProfile));
  }, []);

  const logout = () => {
    setUser(null);
    setProfileState(null);
    if(settings.clearDataOnLogout) {
        sessionStorage.removeItem('myGaadiNotifiedAlerts');
    }
    // Also clear the user's data from localstorage
    localStorage.removeItem('myGaadi_vehicles');
    localStorage.removeItem('myGaadi_serviceRecords');
    localStorage.removeItem('myGaadi_expenses');
    localStorage.removeItem('myGaadi_insurancePolicies');
    localStorage.removeItem('myGaadi_documents');
    localStorage.removeItem('myGaadiProfile');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAuthLoading, user, profile, setProfile, loginWithEmail, signup, logout, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
