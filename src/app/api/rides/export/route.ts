import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";

// GET /api/rides/export - Export rides as CSV
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
      orderBy: { startAt: "asc" },
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

    // Generate CSV
    const headers = [
      "Date",
      "Start Time",
      "End Time",
      "Customer Name",
      "Customer Email",
      "Minutes",
      "Source",
      "Notes",
    ];

    const csvRows = [headers.join(",")];

    rides.forEach((ride) => {
      const row = [
        new Date(ride.startAt).toLocaleDateString(),
        new Date(ride.startAt).toLocaleTimeString(),
        ride.endAt ? new Date(ride.endAt).toLocaleTimeString() : "",
        `"${ride.customer.firstName} ${ride.customer.lastName}"`,
        ride.customer.email,
        ride.minutes.toString(),
        ride.source,
        `"${(ride.notes || "").replace(/"/g, '""')}"`,
      ];
      csvRows.push(row.join(","));
    });

    const csv = csvRows.join("\n");
    const filename = date
      ? `rides-${date}.csv`
      : `rides-${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting rides:", error);
    return NextResponse.json(
      { error: "Failed to export rides" },
      { status: 500 }
    );
  }
}
