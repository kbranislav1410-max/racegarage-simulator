import { NextRequest } from "next/server";
import { canDelete } from "./permissions";

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

/**
 * Get authenticated user from request headers
 * In a real application, this would validate a JWT token or session
 * For now, we'll accept the user data from the Authorization header
 */
export function getAuthUser(request: NextRequest): AuthUser | null {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return null;
    }

    // Parse user data from Authorization header
    // Format: "Bearer {base64-encoded-user-json}"
    const [bearer, token] = authHeader.split(" ");
    if (bearer !== "Bearer" || !token) {
      return null;
    }

    const userJson = Buffer.from(token, "base64").toString("utf-8");
    const user = JSON.parse(userJson);

    return user as AuthUser;
  } catch (error) {
    console.error("Failed to parse auth user:", error);
    return null;
  }
}

/**
 * Check if the authenticated user has permission to delete
 */
export function canUserDelete(user: AuthUser | null): boolean {
  if (!user) return false;
  return canDelete(user.role);
}

/**
 * Returns error response if user doesn't have delete permission
 */
export function checkDeletePermission(user: AuthUser | null): { error: string; status: number } | null {
  if (!user) {
    return { error: "Unauthorized", status: 401 };
  }
  
  if (!canUserDelete(user)) {
    return { error: "Forbidden: You do not have permission to delete", status: 403 };
  }

  return null;
}

/**
 * Alias for getAuthUser for consistency
 */
export const getUserFromRequest = getAuthUser;
