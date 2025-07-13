
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { ProfileState } from "@/app/profile/page";
import { useSettings } from "./settings-context";

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  profile: ProfileState | null;
  setProfile: (profile: ProfileState) => void;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  loginWithGoogle: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfileState] = useState<ProfileState | null>(null);
  const { settings } = useSettings();

  useEffect(() => {
    // Simulate checking auth state
    const localUser = { id: 'local-user', email: 'user@example.com' };
    setUser(localUser);

    const storedProfile = localStorage.getItem('myGaadiProfile');
    if (storedProfile) {
      setProfileState(JSON.parse(storedProfile));
    } else {
      const defaultProfile: ProfileState = {
        name: localUser.email.split('@')[0] || "New User",
        avatarUrl: null
      };
      setProfileState(defaultProfile);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    console.log("Login attempt with:", email);
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

    return true;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    console.log("Google login attempt");
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
    return true;
  };

  const signup = async (email: string, pass: string) => {
     console.log("Signup attempt with:", email);
     const localUser = { id: 'local-user', email };
     setUser(localUser);
     const defaultProfile: ProfileState = {
        name: email.split('@')[0] || "New User",
        avatarUrl: null
     };
     setProfileState(defaultProfile);
     localStorage.setItem('myGaadiProfile', JSON.stringify(defaultProfile));
  };

  const setProfile = (newProfile: ProfileState) => {
    setProfileState(newProfile);
    localStorage.setItem('myGaadiProfile', JSON.stringify(newProfile));
  }

  const logout = () => {
    console.log("Logout");
    setUser(null);
    setProfile(null);
    if(settings.clearDataOnLogout) {
        sessionStorage.removeItem('myGaadiNotifiedAlerts');
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, profile, setProfile, login, signup, logout, loginWithGoogle }}>
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
