"use client";

import { useAuth } from "@/contexts/AuthContext";
import { canDelete, canViewFinancials } from "./permissions";

/**
 * Hook to check user permissions in UI components
 */
export function usePermissions() {
  const { user } = useAuth();

  return {
    canDelete: user ? canDelete(user.role) : false,
    canViewFinancials: user ? canViewFinancials(user.role) : false,
    role: user?.role || null,
  };
}
