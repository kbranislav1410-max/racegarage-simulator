/**
 * Permission checks for role-based access control
 */

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER";

/**
 * Check if user can delete entities
 * - SUPER_ADMIN: can delete everything
 * - ADMIN: cannot delete anything
 * - USER: cannot delete anything
 */
export function canDelete(role: UserRole): boolean {
  return role === "SUPER_ADMIN";
}

/**
 * Check if user can view financial indicators
 * - SUPER_ADMIN: can view
 * - ADMIN: can view
 * - USER: cannot view
 */
export function canViewFinancials(role: UserRole): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

/**
 * Check if user has access to payments section
 * - SUPER_ADMIN: has access
 * - ADMIN: has access
 * - USER: no access
 */
export function canAccessPayments(role: UserRole): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

/**
 * Check if user has access to settings
 * - SUPER_ADMIN: has access
 * - ADMIN: has access
 * - USER: no access
 */
export function canAccessSettings(role: UserRole): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}
