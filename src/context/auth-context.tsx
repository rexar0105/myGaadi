
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSettings } from "./settings-context";
import { useData } from "./data-context";

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, pass: string) => boolean;
  signup: (email: string, pass: string) => void;
  logout: () => void;
  loginWithGoogle: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A mock user database
const MOCK_USERS: { [email: string]: string } = {
    "test@example.com": "password123",
    "user@google.com": "google-provided-password", // Mock google user
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { settings } = useSettings();
  const data = useData();

  useEffect(() => {
    // Mock checking for a session token in localStorage
    try {
      const storedUser = localStorage.getItem("myGaadiUser");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem("myGaadiUser");
    } finally {
        setIsLoading(false);
    }
  }, []);

  const login = (email: string, pass: string): boolean => {
    if (MOCK_USERS[email] && MOCK_USERS[email] === pass) {
      const loggedInUser = { id: Date.now().toString(), email };
      setUser(loggedInUser);
      setIsAuthenticated(true);
      localStorage.setItem("myGaadiUser", JSON.stringify(loggedInUser));
      return true;
    }
    return false;
  };

  const loginWithGoogle = (): boolean => {
    // In a real app, this would involve a popup and token exchange with a backend.
    // Here, we'll just simulate a successful Google login.
    const googleUser = { id: 'google-user-123', email: 'user@google.com' };
    setUser(googleUser);
    setIsAuthenticated(true);
    localStorage.setItem("myGaadiUser", JSON.stringify(googleUser));
    return true;
  }

  const signup = (email: string, pass: string) => {
    if (MOCK_USERS[email]) {
      throw new Error("User with this email already exists.");
    }
    if(pass.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
    }
    MOCK_USERS[email] = pass;
    // In a real app, you might auto-login or just show a success message
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("myGaadiUser");
    if (settings.clearDataOnLogout) {
      sessionStorage.clear();
      data?.clearAllData();
    }
  };

  if (isLoading) {
    // You can return a loading spinner here
    return null;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, signup, logout, loginWithGoogle }}>
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
