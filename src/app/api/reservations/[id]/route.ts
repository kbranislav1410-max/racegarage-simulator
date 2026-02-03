import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { updateReservationStatusSchema } from "@/lib/validations/reservation";
import { createAuditLog } from "@/lib/audit";
import { sendReservationEmail } from "@/lib/email/service";
import { ZodError } from "zod";
import { getAuthUser, checkDeletePermission } from "@/lib/auth-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            street: true,
            city: true,
            phone: true,
          },
        },
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(reservation);
  } catch (error) {
    console.error("Error fetching reservation:", error);
    return NextResponse.json(
      { error: "Failed to fetch reservation" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateReservationStatusSchema.parse(body);

    const existingReservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });

    if (!existingReservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: {
        status: validatedData.status,
        notes: validatedData.notes,
      },
      include: {
        customer: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Create audit log
    await createAuditLog(
      "UPDATE_RESERVATION_STATUS",
      "Reservation",
      id,
      {
        oldStatus: existingReservation.status,
        newStatus: validatedData.status,
        email: existingReservation.customer?.email || existingReservation.guestEmail,
      }
    );

    // Send email notification based on status change
    const email = existingReservation.customer?.email || existingReservation.guestEmail;
    const customerName = existingReservation.customer
      ? `${existingReservation.customer.firstName} ${existingReservation.customer.lastName}`
      : existingReservation.guestName;

    if (email) {
      if (validatedData.status === "CONFIRMED") {
        await sendReservationEmail(
          email,
          customerName || "Customer",
          "confirmed",
          {
            scheduledAt: updatedReservation.scheduledAt,
            durationMinutes: updatedReservation.durationMinutes,
          }
        );
      } else if (validatedData.status === "REJECTED" || validatedData.status === "CANCELLED") {
        await sendReservationEmail(
          email,
          customerName || "Customer",
          validatedData.status.toLowerCase() as "rejected" | "cancelled",
          {
            scheduledAt: updatedReservation.scheduledAt,
            durationMinutes: updatedReservation.durationMinutes,
            notes: validatedData.notes,
          }
        );
      }
    }

    return NextResponse.json(updatedReservation);
  } catch (error) {
    console.error("Error updating reservation:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update reservation" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check delete permission
    const user = getAuthUser(request);
    const permissionError = checkDeletePermission(user);
    if (permissionError) {
      return NextResponse.json(
        { error: permissionError.error },
        { status: permissionError.status }
      );
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    await prisma.reservation.delete({
      where: { id },
    });

    // Create audit log
    await createAuditLog(
      "DELETE",
      "Reservation",
      id,
      {
        email: reservation.customer?.email || reservation.guestEmail,
        scheduledAt: reservation.scheduledAt,
      }
    );

    return NextResponse.json({ message: "Reservation deleted successfully" });
  } catch (error) {
    console.error("Error deleting reservation:", error);
    return NextResponse.json(
      { error: "Failed to delete reservation" },
      { status: 500 }
    );
  }
}
