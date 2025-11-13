import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserRole } from "../types";

interface AuthContextType {
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (userRole: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = "care8_active_role";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [role, setRole] = useState<UserRole | null>(null);

  // Restore session on mount
  useEffect(() => {
    const savedRole = sessionStorage.getItem(SESSION_KEY);
    if (savedRole === "preceptor" || savedRole === "admin") {
      setRole(savedRole);
    }
  }, []);

  const login = (userRole: UserRole) => {
    sessionStorage.setItem(SESSION_KEY, userRole);
    setRole(userRole);
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setRole(null);
  };

  const value: AuthContextType = {
    role,
    isAuthenticated: role !== null,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
