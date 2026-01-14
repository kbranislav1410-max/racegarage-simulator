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
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        session: {
          select: {
            startAt: true,
            minutes: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Calculate totals
    const sumFriend = payments
      .filter((p) => p.receiver === "FRIEND")
      .reduce((sum, p) => sum + p.amountCents, 0);

    const sumMe = payments
      .filter((p) => p.receiver === "ME")
      .reduce((sum, p) => sum + p.amountCents, 0);

    const friendOwesMe = (sumFriend - sumMe) / 2;

    // Generate CSV
    const csvRows: string[] = [];

    // Header
    csvRows.push(
      [
        "Date",
        "Time",
        "Customer Name",
        "Customer Email",
        "Amount (EUR)",
        "Payment Method",
        "Receiver",
        "Session Minutes",
      ].join(",")
    );

    // Data rows
    for (const payment of payments) {
      const createdAt = new Date(payment.createdAt);
      const date = createdAt.toISOString().split("T")[0];
      const time = createdAt.toTimeString().split(" ")[0];
      const customerName = payment.customer
        ? `"${payment.customer.firstName} ${payment.customer.lastName}"`
        : "N/A";
      const customerEmail = payment.customer?.email || "N/A";
      const amount = (payment.amountCents / 100).toFixed(2);
      const method = payment.method;
      const receiver = payment.receiver;
      const sessionMinutes = payment.session?.minutes || "N/A";

      csvRows.push(
        [
          date,
          time,
          customerName,
          customerEmail,
          amount,
          method,
          receiver,
          sessionMinutes,
        ].join(",")
      );
    }

    // Summary rows
    csvRows.push("");
    csvRows.push("SUMMARY");
    csvRows.push(`Total Revenue (EUR),${((sumFriend + sumMe) / 100).toFixed(2)}`);
    csvRows.push(`Friend Total (EUR),${(sumFriend / 100).toFixed(2)}`);
    csvRows.push(`Me Total (EUR),${(sumMe / 100).toFixed(2)}`);
    csvRows.push("");
    csvRows.push("50/50 SETTLEMENT");
    
    if (friendOwesMe > 0) {
      csvRows.push(`Friend Owes Me (EUR),${(friendOwesMe / 100).toFixed(2)}`);
    } else if (friendOwesMe < 0) {
      csvRows.push(`I Owe Friend (EUR),${(Math.abs(friendOwesMe) / 100).toFixed(2)}`);
    } else {
      csvRows.push("Settlement,Even - No payment needed");
    }

    const csv = csvRows.join("\n");
    const filename = `payments-${data.year}-${String(data.month).padStart(2, "0")}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting payments:", error);
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid parameters", details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to export payments" },
      { status: 500 }
    );
  }
}
