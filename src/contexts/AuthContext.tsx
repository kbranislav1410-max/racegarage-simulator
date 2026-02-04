"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER";

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
const USER_ROUTES = [
  "/dashboard",
  "/customers",
  "/rides",
  "/reservations",
  "/challenge",
  "/vouchers",
];

const ADMIN_ONLY_ROUTES = [
  "/payments",
  "/payments/settlements",
  "/settings",
];

const SUPER_ADMIN_ONLY_ROUTES = [
  "/users",
];

const roleAccess: Record<UserRole, string[]> = {
  USER: USER_ROUTES,
  ADMIN: [...USER_ROUTES, ...ADMIN_ONLY_ROUTES],
  SUPER_ADMIN: [...USER_ROUTES, ...ADMIN_ONLY_ROUTES, ...SUPER_ADMIN_ONLY_ROUTES], // Super admin has access to all routes
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const isAuthenticated = !!user;

  const hasAccess = useCallback((route: string): boolean => {
    if (!user) return false;
    const allowedRoutes = roleAccess[user.role] || [];
    return allowedRoutes.some((allowedRoute) => 
      route === allowedRoute || route.startsWith(allowedRoute + "/")
    );
  }, [user]);

  useEffect(() => {
    // Skip check while loading
    if (isLoading) return;

    // Allow access to public routes
    const publicRoutes = ["/login", "/book"];
    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + "/"));
    
    if (!user && !isPublicRoute) {
      router.push("/login");
    } else if (user && pathname === "/login") {
      router.push("/dashboard");
    } else if (user && !isPublicRoute && !hasAccess(pathname)) {
      // Redirect to dashboard if user doesn't have access
      router.push("/dashboard");
    }
  }, [pathname, user, router, isLoading, hasAccess]);

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

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Network error" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    router.push("/login");
  };

  // Show loading state
  if (isLoading) {
    return null;
  }

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
