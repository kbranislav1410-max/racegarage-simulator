import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { createAuditLog } from "@/lib/audit";

// DELETE /api/rides/[id] - Delete ride session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if ride session exists
    const rideSession = await prisma.rideSession.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!rideSession) {
      return NextResponse.json(
        { error: "Ride session not found" },
        { status: 404 }
      );
    }

    // Delete ride session (cascade will handle related records)
    await prisma.rideSession.delete({
      where: { id },
    });

    // Create audit log
    await createAuditLog("DELETE", "RideSession", id, {
      customer: `${rideSession.customer.firstName} ${rideSession.customer.lastName}`,
      startAt: rideSession.startAt,
      minutes: rideSession.minutes,
      source: rideSession.source,
    });

    return NextResponse.json({ message: "Ride session deleted successfully" });
  } catch (error) {
    console.error("Error deleting ride session:", error);
    return NextResponse.json(
      { error: "Failed to delete ride session" },
      { status: 500 }
    );
  }
}
