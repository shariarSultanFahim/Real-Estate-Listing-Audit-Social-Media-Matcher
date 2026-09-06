"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Permission } from "@real-estate/types";
import { apiClient } from "@/lib/api-client";

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  loginByEmail: (email: string, password?: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "auth_current_user_id";
const AUTH_TOKEN_KEY = "auth_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function initAuth() {
      try {
        const savedToken = typeof window !== "undefined" ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
        if (savedToken) {
          try {
            const res = await apiClient.get("/auth/me");
            if (res.data) {
              setCurrentUser(res.data);
              setIsLoaded(true);
              return;
            }
          } catch {
            // Token expired or invalid
          }
        }

        // Fetch users from API to set initial default active user
        try {
          const usersRes = await apiClient.get("/users");
          if (Array.isArray(usersRes.data) && usersRes.data.length > 0) {
            const savedUserId = typeof window !== "undefined" ? localStorage.getItem(AUTH_STORAGE_KEY) : null;
            const matched = usersRes.data.find((u: User) => u.id === savedUserId) || usersRes.data[0];
            setCurrentUser(matched);
            setIsLoaded(true);
            return;
          }
        } catch {
          // Backend might be offline during initial load
        }
      } catch {
        // Ignore initialization error
      } finally {
        setIsLoaded(true);
      }
    }

    initAuth();
  }, []);

  const loginByEmail = async (email: string, password?: string): Promise<User> => {
    // Attempt real backend login
    const res = await apiClient.post("/auth/login", {
      email,
      password: password || "CrescentDemo2026!",
    });

    if (res.data?.user) {
      setCurrentUser(res.data.user);
      if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_STORAGE_KEY, res.data.user.id);
        if (res.data.token) {
          localStorage.setItem(AUTH_TOKEN_KEY, res.data.token);
        }
      }
      return res.data.user;
    }

    throw new Error("Invalid credentials");
  };

  const logout = () => {
    setCurrentUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
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
