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
  const [user, setUser] = useState<User | null>(() => {
    // Initialize from localStorage if available
    if (typeof window !== "undefined") {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          // Validate user object structure
          if (parsed && parsed.id && parsed.email && parsed.name && parsed.role) {
            return parsed as User;
          }
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        localStorage.removeItem("user");
      }
    }
    return null;
  });
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = !!user;

  const hasAccess = useCallback((route: string): boolean => {
    if (!user) return false;
    const allowedRoutes = roleAccess[user.role] || [];
    return allowedRoutes.includes(route);
  }, [user]);

  useEffect(() => {
    // Redirect to login if not authenticated and not on login page
    if (!isAuthenticated && pathname !== "/login") {
      router.push("/login");
      return;
    }

    // Check if user has access to current route
    if (isAuthenticated && pathname !== "/login") {
      const hasRouteAccess = hasAccess(pathname);
      if (!hasRouteAccess) {
        // Redirect to dashboard if user doesn't have access
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, pathname, router, hasAccess]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || "Login failed" };
      }

      // Store user data
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      router.push("/dashboard");
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "An error occurred during login" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    router.push("/login");
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
