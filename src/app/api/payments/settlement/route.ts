import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { monthlySettlementSchema } from "@/lib/validations/payment";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));

    const data = monthlySettlementSchema.parse({ year, month });

    // Calculate start and end of month
    const startOfMonth = new Date(data.year, data.month - 1, 1);
    const endOfMonth = new Date(data.year, data.month, 0, 23, 59, 59, 999);

    // Get all payments for the month
    const payments = await prisma.paymentRecord.findMany({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
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
        session: {
          select: {
            id: true,
            startAt: true,
            minutes: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate totals
    const sumFriend = payments
      .filter((p) => p.receiver === "FRIEND")
      .reduce((sum, p) => sum + p.amountCents, 0);

    const sumMe = payments
      .filter((p) => p.receiver === "ME")
      .reduce((sum, p) => sum + p.amountCents, 0);

    // Calculate 50/50 split settlement
    // If sumFriend > sumMe: Friend owes me (sumFriend - sumMe) / 2
    // If sumMe > sumFriend: I owe friend (sumMe - sumFriend) / 2
    const friendOwesMe = (sumFriend - sumMe) / 2;

    // Group payments by method
    const byMethod = payments.reduce((acc, p) => {
      if (!acc[p.method]) {
        acc[p.method] = { count: 0, total: 0 };
      }
      acc[p.method].count++;
      acc[p.method].total += p.amountCents;
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    return NextResponse.json({
      year: data.year,
      month: data.month,
      monthName: new Date(data.year, data.month - 1).toLocaleString('default', { month: 'long' }),
      summary: {
        totalPayments: payments.length,
        sumFriend: sumFriend,
        sumMe: sumMe,
        totalRevenue: sumFriend + sumMe,
        friendOwesMe: friendOwesMe,
        settlementMessage: 
          friendOwesMe > 0
            ? `Za mesiac ${data.year}-${String(data.month).padStart(2, '0')}: Kamarát má poslať mne ${(friendOwesMe / 100).toFixed(2)} €`
            : friendOwesMe < 0
            ? `Za mesiac ${data.year}-${String(data.month).padStart(2, '0')}: Ja mám poslať kamarátovi ${(Math.abs(friendOwesMe) / 100).toFixed(2)} €`
            : `Za mesiac ${data.year}-${String(data.month).padStart(2, '0')}: Žiadne vyrovnanie, sumy sú vyrovnané`,
      },
      byMethod,
      payments,
    });
  } catch (error) {
    console.error("Error calculating settlement:", error);
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid parameters", details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to calculate settlement" },
      { status: 500 }
    );
  }
}
