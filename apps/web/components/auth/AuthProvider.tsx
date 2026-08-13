"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Permission } from "@real-estate/types";
import { MOCK_USERS } from "@/lib/mock-data/users";

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  loginByEmail: (email: string) => User;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "auth_current_user_id";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedUserId = typeof window !== "undefined" ? localStorage.getItem(AUTH_STORAGE_KEY) : null;
    const initialUser = MOCK_USERS.find((u) => u.id === savedUserId) || MOCK_USERS[0];
    setCurrentUser(initialUser);
    setIsLoaded(true);
  }, []);

  const loginByEmail = (email: string): User => {
    const matched = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase()) || MOCK_USERS[0];
    setCurrentUser(matched);
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_STORAGE_KEY, matched.id);
    }
    return matched;
  };

  const logout = () => {
    setCurrentUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, loginByEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function usePermission(permission: Permission): boolean {
  const { currentUser } = useAuth();
  if (!currentUser) return false;
  if (currentUser.accountType === "superAdmin") return true;
  return currentUser.permissions.includes(permission);
}
