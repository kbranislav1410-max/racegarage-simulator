import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { rideSessionSchema } from "@/lib/validations/ride";
import { createAuditLog } from "@/lib/audit";
import { sendRideCompletionEmail } from "@/lib/email/service";

// GET /api/rides - List rides with optional date range filter
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateFrom = searchParams.get("dateFrom"); // Format: YYYY-MM-DD
    const dateTo = searchParams.get("dateTo"); // Format: YYYY-MM-DD
    const date = searchParams.get("date"); // Legacy single date support

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    // Support both new date range and legacy single date
    if (dateFrom || dateTo || date) {
      const fromDateStr = dateFrom || date;
      const toDateStr = dateTo || date;
      
      if (fromDateStr) {
        startDate = new Date(fromDateStr);
        startDate.setHours(0, 0, 0, 0);
      }
      
      if (toDateStr) {
        endDate = new Date(toDateStr);
        endDate.setHours(23, 59, 59, 999);
      }
    }

    const where = (startDate || endDate)
      ? {
          startAt: {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
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

    // If voucher code was provided, validate it BEFORE creating the ride
    let voucherToRedeem: { id: string; code: string } | null = null;
    if (data.voucherCode) {
      const voucher = await prisma.voucher.findUnique({
        where: { code: data.voucherCode.toUpperCase() },
      });

      // Validate voucher exists
      if (!voucher) {
        return NextResponse.json(
          { error: "Voucher code not found" },
          { status: 404 }
        );
      }

      // Validate voucher is not already redeemed (specific error message)
      if (voucher.status === "REDEEMED") {
        return NextResponse.json(
          { error: "This voucher has already been redeemed" },
          { status: 400 }
        );
      }

      // Validate voucher is active (NEW or SENT only)
      if (voucher.status !== "NEW" && voucher.status !== "SENT") {
        return NextResponse.json(
          { error: `This voucher is ${voucher.status.toLowerCase()} and cannot be used` },
          { status: 400 }
        );
      }

      // Validate voucher is not expired
      if (voucher.expiresAt && new Date() > new Date(voucher.expiresAt)) {
        return NextResponse.json(
          { error: "This voucher has expired" },
          { status: 400 }
        );
      }

      // Store voucher info for redemption after ride creation
      voucherToRedeem = { id: voucher.id, code: voucher.code };
    }

    // Calculate endAt based on startAt and minutes
    const startAt = new Date(data.startAt);
    const endAt = new Date(startAt.getTime() + data.minutes * 60000);

    // Create ride session (only after voucher validation passes)
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

    // Mark voucher as redeemed (validation already done above)
    if (voucherToRedeem) {
      await prisma.voucher.update({
        where: { code: voucherToRedeem.code.toUpperCase() },
        data: {
          status: "REDEEMED",
          redeemedAt: new Date(),
          redeemedByCustomerId: data.customerId,
        },
      });

      // Log voucher redemption
      await createAuditLog("UPDATE", "VOUCHER", voucherToRedeem.id, {
        status: "REDEEMED",
        redeemedBy: `${customer.firstName} ${customer.lastName}`,
      });
    }

    // Create partner voucher record if ride source is VOUCHER_PARTNER
    if (data.source === "VOUCHER_PARTNER" && data.partner && data.voucherCode) {
      await prisma.partnerVoucher.create({
        data: {
          code: data.voucherCode,
          partner: data.partner,
          sessionId: ride.id,
          customerId: data.customerId,
          customerName: `${customer.firstName} ${customer.lastName}`,
          customerEmail: customer.email,
          rideDate: startAt,
          status: "UNCLAIMED",
        },
      });

      // Log partner voucher creation
      await createAuditLog("CREATE", "PARTNER_VOUCHER", ride.id, {
        code: data.voucherCode,
        partner: data.partner,
        customerName: `${customer.firstName} ${customer.lastName}`,
      });
    }

    // Create payment record if amount is provided
    if (data.amountEur && data.paymentMethod) {
      // Map payment method to receiver
      let receiver: "ME" | "FRIEND";
      if (data.paymentMethod === "PD_DRIVE_CLUB" || data.paymentMethod === "VOUCHER_PD_DRIVE_CLUB") {
        receiver = "FRIEND";
      } else {
        receiver = "ME"; // VOUCHER_PARTNER, VOUCHER_RACEGARAGE
      }

      await prisma.paymentRecord.create({
        data: {
          customerId: data.customerId,
          sessionId: ride.id,
          amountCents: Math.round(data.amountEur * 100),
          method: data.paymentMethod,
          receiver,
        },
      });
    }

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
