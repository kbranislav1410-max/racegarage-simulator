import prisma from "@/lib/prisma/client";

// Cache the system user ID to avoid repeated database queries
let cachedSystemUserId: string | null = null;
let userCheckAttempted = false;

/**
 * Get or cache the system user ID for audit logging
 */
async function getSystemUserId(): Promise<string | null> {
  if (cachedSystemUserId) {
    return cachedSystemUserId;
  }

  // If we've already attempted to find a user and failed, don't try again
  if (userCheckAttempted && !cachedSystemUserId) {
    return null;
  }

  try {
    const systemUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    userCheckAttempted = true;

    if (systemUser) {
      cachedSystemUserId = systemUser.id;
      return systemUser.id;
    }
  } catch (error) {
    console.error("Failed to get system user:", error);
    userCheckAttempted = true;
  }

  return null;
}

/**
 * Create an audit log entry
 * Note: Audit logging is silently skipped if no user exists in the database
 */
export async function createAuditLog(
  action: string,
  entity: string,
  entityId: string,
  payload?: unknown
): Promise<void> {
  try {
    const userId = await getSystemUserId();

    // Skip audit logging if no user exists (e.g., during initial setup or when auth is disabled)
    if (!userId) {
      // Silent skip - don't log to avoid console spam
      return;
    }

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        payload: payload || {},
      },
    });
  } catch (error) {
    // Silent catch - audit logging should not break the main operation
    console.error("Audit log error (non-blocking):", error);
  }
}
