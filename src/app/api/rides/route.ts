import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { rideSessionSchema } from "@/lib/validations/ride";
import { createAuditLog } from "@/lib/audit";
import { sendRideCompletionEmail } from "@/lib/email/service";

// GET /api/rides - List rides with optional date filter
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date"); // Format: YYYY-MM-DD

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (date) {
      startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
    }

    const where = date
      ? {
          startAt: {
            gte: startDate,
            lte: endDate,
          },
        }
      : {};

    const rides = await prisma.rideSession.findMany({
      where,
      orderBy: { startAt: "desc" },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ rides });
  } catch (error) {
    console.error("Error fetching rides:", error);
    return NextResponse.json(
      { error: "Failed to fetch rides" },
      { status: 500 }
    );
  }
}

// POST /api/rides - Create new ride session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = rideSessionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Calculate endAt based on startAt and minutes
    const startAt = new Date(data.startAt);
    const endAt = new Date(startAt.getTime() + data.minutes * 60000);

    // Create ride session
    const ride = await prisma.rideSession.create({
      data: {
        customerId: data.customerId,
        startAt,
        endAt,
        minutes: data.minutes,
        source: data.source,
        partner: data.partner || null,
        voucherCode: data.voucherCode || null,
        notes: data.notes || null,
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Create audit log
    await createAuditLog("CREATE", "RideSession", ride.id, {
      customerId: data.customerId,
      customerName: `${customer.firstName} ${customer.lastName}`,
      minutes: data.minutes,
      source: data.source,
    });

    // Send ride completion email (async, don't wait for it)
    // Email failures won't affect the response
    sendRideCompletionEmail(data.customerId, ride.id, data.minutes).catch(
      (error) => {
        console.error("Background email error:", error);
      }
    );

    return NextResponse.json(ride, { status: 201 });
  } catch (error) {
    console.error("Error creating ride:", error);
    return NextResponse.json(
      { error: "Failed to create ride" },
      { status: 500 }
    );
  }
}
