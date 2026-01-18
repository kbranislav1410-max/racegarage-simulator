"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

type UserRole = "ADMIN" | "STAFF";

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasAccess: (route: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define which routes each role can access
const STAFF_ROUTES = [
  "/dashboard",
  "/customers",
  "/rides",
  "/reservations",
  "/challenge",
  "/vouchers",
];

const ADMIN_ONLY_ROUTES = [
  "/payments",
  "/settings",
];

const roleAccess: Record<UserRole, string[]> = {
  STAFF: STAFF_ROUTES,
  ADMIN: [...STAFF_ROUTES, ...ADMIN_ONLY_ROUTES],
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Default mock user with ADMIN role - authentication disabled
  const [user] = useState<User>({
    id: "mock-user-id",
    email: "user@racegarage.com",
    name: "Guest User",
    role: "ADMIN",
  });
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = true; // Always authenticated

  const hasAccess = useCallback((route: string): boolean => {
    // All routes accessible without authentication
    return true;
  }, []);

  useEffect(() => {
    // Redirect from login page to dashboard if someone tries to access it
    if (pathname === "/login") {
      router.push("/dashboard");
    }
  }, [pathname, router]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Authentication disabled - always return success
    router.push("/dashboard");
    return { success: true };
  };

  const logout = () => {
    // Authentication disabled - just redirect to dashboard
    router.push("/dashboard");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, hasAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
