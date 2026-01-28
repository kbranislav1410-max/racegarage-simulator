import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/settlements - List all settlements
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const status = searchParams.get("status");

    const where: any = {};
    if (year) {
      where.year = parseInt(year);
    }
    if (status && status !== "ALL") {
      where.status = status;
    }

    const settlements = await prisma.monthlySettlement.findMany({
      where,
      orderBy: [
        { year: "desc" },
        { month: "desc" },
      ],
    });

    return NextResponse.json(settlements);
  } catch (error) {
    console.error("Error fetching settlements:", error);
    return NextResponse.json(
      { error: "Failed to fetch settlements" },
      { status: 500 }
    );
  }
}

// POST /api/settlements - Create new settlement for a month
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { year, month } = body;

    if (!year || !month || month < 1 || month > 12) {
      return NextResponse.json(
        { error: "Invalid year or month" },
        { status: 400 }
      );
    }

    // Check if settlement already exists
    const existing = await prisma.monthlySettlement.findUnique({
      where: {
        year_month: {
          year: parseInt(year),
          month: parseInt(month),
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Settlement for this month already exists" },
        { status: 400 }
      );
    }

    // Calculate settlement from payment records
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const payments = await prisma.paymentRecord.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Calculate totals
    const totalAmountCents = payments.reduce((sum, p) => sum + p.amountCents, 0);
    const friendAmountCents = payments
      .filter((p) => p.receiver === "FRIEND")
      .reduce((sum, p) => sum + p.amountCents, 0);
    const meAmountCents = payments
      .filter((p) => p.receiver === "ME")
      .reduce((sum, p) => sum + p.amountCents, 0);

    // Settlement calculation: positive means friend owes me, negative means I owe friend
    const settlementCents = Math.round((friendAmountCents - meAmountCents) / 2);

    // Create settlement
    const settlement = await prisma.monthlySettlement.create({
      data: {
        year: parseInt(year),
        month: parseInt(month),
        status: "NOT_INVOICED",
        totalAmountCents,
        friendAmountCents,
        meAmountCents,
        settlementCents,
      },
    });

    return NextResponse.json(settlement, { status: 201 });
  } catch (error) {
    console.error("Error creating settlement:", error);
    return NextResponse.json(
      { error: "Failed to create settlement" },
      { status: 500 }
    );
  }
}
