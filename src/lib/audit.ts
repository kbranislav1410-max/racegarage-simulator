import prisma from "@/lib/prisma/client";

// Cache the system user ID to avoid repeated database queries
let cachedSystemUserId: string | null = null;

/**
 * Get or cache the system user ID for audit logging
 */
async function getSystemUserId(): Promise<string | null> {
  if (cachedSystemUserId) {
    return cachedSystemUserId;
  }

  try {
    const systemUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    if (systemUser) {
      cachedSystemUserId = systemUser.id;
      return systemUser.id;
    }
  } catch (error) {
    console.error("Failed to get system user:", error);
  }

  return null;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(
  action: string,
  entity: string,
  entityId: string,
  payload?: unknown
): Promise<void> {
  try {
    const userId = await getSystemUserId();

    if (!userId) {
      console.warn("No system user found for audit logging");
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
    console.error("Failed to create audit log:", error);
    // Don't throw - audit logging should not break the main operation
  }
}
