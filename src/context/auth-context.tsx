
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSettings } from "./settings-context";

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  loginWithGoogle: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>({ id: 'local-user', email: 'user@example.com' });

  const login = async (email: string, pass: string): Promise<boolean> => {
    console.log("Login attempt with:", email);
    setUser({ id: 'local-user', email });
    return true;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    console.log("Google login attempt");
    setUser({ id: 'local-user', email: 'user@example.com' });
    return true;
  };

  const signup = async (email: string, pass: string) => {
     console.log("Signup attempt with:", email);
     setUser({ id: 'local-user', email });
  };

  const logout = async () => {
    console.log("Logout");
    setUser(null);
  };

  const isAuthenticated = !!user;

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
