import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { createPaymentSchema } from "@/lib/validations/payment";
import { createAuditLog } from "@/lib/audit";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get("customerId");
    const sessionId = searchParams.get("sessionId");
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = 20;

    const where: Record<string, unknown> = {};
    if (customerId) where.customerId = customerId;
    if (sessionId) where.sessionId = sessionId;

    const [payments, total] = await Promise.all([
      prisma.paymentRecord.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          session: {
            select: {
              id: true,
              startAt: true,
              minutes: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.paymentRecord.count({ where }),
    ]);

    return NextResponse.json({
      payments,
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createPaymentSchema.parse(body);

    // Verify related entities exist
    if (data.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: data.customerId },
      });
      if (!customer) {
        return NextResponse.json(
          { error: "Customer not found" },
          { status: 404 }
        );
      }
    }

    if (data.sessionId) {
      const session = await prisma.rideSession.findUnique({
        where: { id: data.sessionId },
      });
      if (!session) {
        return NextResponse.json(
          { error: "Ride session not found" },
          { status: 404 }
        );
      }
    }

    if (data.reservationId) {
      const reservation = await prisma.reservation.findUnique({
        where: { id: data.reservationId },
      });
      if (!reservation) {
        return NextResponse.json(
          { error: "Reservation not found" },
          { status: 404 }
        );
      }
    }

    const payment = await prisma.paymentRecord.create({
      data: {
        amountCents: data.amountCents,
        currency: data.currency,
        method: data.method,
        receiver: data.receiver,
        customerId: data.customerId,
        sessionId: data.sessionId,
        reservationId: data.reservationId,
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

    // Audit log
    await createAuditLog({
      action: "CREATE",
      entity: "PaymentRecord",
      entityId: payment.id,
      payload: {
        amountCents: payment.amountCents,
        method: payment.method,
        receiver: payment.receiver,
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("Error creating payment:", error);
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid payment data", details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
