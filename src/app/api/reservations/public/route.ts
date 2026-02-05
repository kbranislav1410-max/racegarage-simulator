import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { createPublicReservationSchema } from "@/lib/validations/reservation";
import { ZodError } from "zod";

// Check for time conflicts
async function checkTimeConflict(
  scheduledAt: Date,
  durationMinutes: number
): Promise<boolean> {
  const endAt = new Date(scheduledAt.getTime() + durationMinutes * 60000);

  // Find conflicting reservations (not CANCELLED, REJECTED, COMPLETED, or NO_SHOW)
  const conflicts = await prisma.reservation.findMany({
    where: {
      status: {
        in: ["PENDING", "CONFIRMED"],
      },
      OR: [
        {
          // Existing reservation starts before new one ends and ends after new one starts
          AND: [
            { scheduledAt: { lt: endAt } },
            {
              scheduledAt: {
                gte: new Date(scheduledAt.getTime() - 1000), // Allow for small time diff
              },
            },
          ],
        },
      ],
    },
  });

  // More precise conflict check
  for (const reservation of conflicts) {
    const reservationEnd = new Date(
      reservation.scheduledAt.getTime() + reservation.durationMinutes * 60000
    );

    // Check if time slots overlap
    if (
      (scheduledAt >= reservation.scheduledAt && scheduledAt < reservationEnd) ||
      (endAt > reservation.scheduledAt && endAt <= reservationEnd) ||
      (scheduledAt <= reservation.scheduledAt && endAt >= reservationEnd)
    ) {
      return true; // Conflict found
    }
  }

  return false;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createPublicReservationSchema.parse(body);

    const { email, scheduledAt: scheduledAtString, durationMinutes } = validatedData;
    const scheduledAt = new Date(scheduledAtString);

    // Check if scheduled time is in the past
    if (scheduledAt < new Date()) {
      return NextResponse.json(
        { error: "Cannot book a reservation in the past" },
        { status: 400 }
      );
    }

    // Check for time conflicts
    const hasConflict = await checkTimeConflict(scheduledAt, durationMinutes);
    if (hasConflict) {
      return NextResponse.json(
        {
          error:
            "This time slot is already booked. Please choose a different time.",
        },
        { status: 409 }
      );
    }

    // Check if customer exists by email
    const existingCustomer = await prisma.customer.findUnique({
      where: { email: email.toLowerCase() },
    });

    let reservation;

    if (existingCustomer) {
      // Create reservation for existing customer
      reservation = await prisma.reservation.create({
        data: {
          customerId: existingCustomer.id,
          scheduledAt,
          durationMinutes,
          status: "PENDING",
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
    } else {
      // Validate that we have all required fields for new customer
      if (
        !validatedData.firstName ||
        !validatedData.lastName
      ) {
        return NextResponse.json(
          {
            error:
              "First name and last name are required for new customers",
          },
          { status: 400 }
        );
      }

      // Create new customer and reservation in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create new customer
        const newCustomer = await tx.customer.create({
          data: {
            email: email.toLowerCase(),
            firstName: validatedData.firstName!,
            lastName: validatedData.lastName!,
            street: validatedData.street || null,
            city: validatedData.city || null,
            phone: validatedData.phone || null,
            newsletter: false,
          },
        });

        // Create reservation linked to new customer
        const newReservation = await tx.reservation.create({
          data: {
            customerId: newCustomer.id,
            scheduledAt,
            durationMinutes,
            status: "PENDING",
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

        return newReservation;
      });

      reservation = result;
    }

    // TODO: Send confirmation email
    // await sendEmail({
    //   to: email,
    //   subject: "Reservation Received",
    //   ...
    // });

    return NextResponse.json({
      message: "Reservation created successfully",
      reservation: {
        id: reservation.id,
        scheduledAt: reservation.scheduledAt,
        durationMinutes: reservation.durationMinutes,
        status: reservation.status,
      },
    });
  } catch (error) {
    console.error("Error creating public reservation:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid reservation data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create reservation" },
      { status: 500 }
    );
  }
}
