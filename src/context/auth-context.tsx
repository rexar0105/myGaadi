
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
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  loginWithGoogle: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialUser = { id: 'local-user', email: 'user@example.com' };

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfileState] = useState<ProfileState | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const { settings } = useSettings();

  useEffect(() => {
    // Simulate checking auth state on initial load
    setIsAuthLoading(true);

    // This simulates an async check for a user session
    setTimeout(() => {
        setUser(initialUser);

        const storedProfile = localStorage.getItem('myGaadiProfile');
        if (storedProfile) {
            setProfileState(JSON.parse(storedProfile));
        } else {
            // Create a default profile only if one doesn't exist in storage
            const defaultProfile: ProfileState = {
                name: initialUser.email.split('@')[0] || "New User",
                avatarUrl: null
            };
            setProfileState(defaultProfile);
            localStorage.setItem('myGaadiProfile', JSON.stringify(defaultProfile));
        }
        setIsAuthLoading(false);
    }, 100); // Small delay to simulate async operation
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsAuthLoading(true);
    const localUser = { id: 'local-user', email };
    setUser(localUser);
    
    // Set up default profile if none exists
    const storedProfile = localStorage.getItem('myGaadiProfile');
    if (!storedProfile) {
        const defaultProfile: ProfileState = {
            name: email.split('@')[0] || "New User",
            avatarUrl: null
        };
        setProfileState(defaultProfile);
        localStorage.setItem('myGaadiProfile', JSON.stringify(defaultProfile));
    }
    setIsAuthLoading(false);
    return true;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setIsAuthLoading(true);
    // In a real app, you'd get user info from Google
    const localUser = { id: 'local-user', email: 'user@example.com' };
    setUser(localUser);

     // Set up default profile if none exists
    const storedProfile = localStorage.getItem('myGaadiProfile');
    if (!storedProfile) {
        const defaultProfile: ProfileState = {
            name: localUser.email.split('@')[0] || "New User",
            avatarUrl: null
        };
        setProfileState(defaultProfile);
        localStorage.setItem('myGaadiProfile', JSON.stringify(defaultProfile));
    }
    setIsAuthLoading(false);
    return true;
  };

  const signup = async (email: string, pass: string) => {
     setIsAuthLoading(true);
     const localUser = { id: 'local-user', email };
     setUser(localUser);
     const defaultProfile: ProfileState = {
        name: email.split('@')[0] || "New User",
        avatarUrl: null
     };
     setProfileState(defaultProfile);
     localStorage.setItem('myGaadiProfile', JSON.stringify(defaultProfile));
     setIsAuthLoading(false);
  };

  const setProfile = useCallback((newProfile: ProfileState | null) => {
    setProfileState(newProfile);
    if (newProfile) {
        localStorage.setItem('myGaadiProfile', JSON.stringify(newProfile));
    } else {
        localStorage.removeItem('myGaadiProfile');
    }
  }, []);

  const logout = () => {
    setUser(null);
    setProfile(null);
    if(settings.clearDataOnLogout) {
        sessionStorage.removeItem('myGaadiNotifiedAlerts');
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAuthLoading, user, profile, setProfile, login, signup, logout, loginWithGoogle }}>
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
