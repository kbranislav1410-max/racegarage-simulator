import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { formatDate } from "@/lib/format";

// GET /api/newsletter-subscribers/export - Export newsletter subscribers as CSV
export async function GET(request: NextRequest) {
  try {
    const subscribers = await prisma.customer.findMany({
      where: {
        newsletter: true,
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        city: true,
        phone: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Create CSV content
    const csvHeaders = "Email,Meno,Priezvisko,Mesto,Telefón,Registrovaný\n";
    const csvRows = subscribers
      .map((sub: {
        email: string;
        firstName: string;
        lastName: string;
        city: string | null;
        phone: string | null;
        createdAt: Date;
      }) => {
        return [
          sub.email,
          sub.firstName,
          sub.lastName,
          sub.city || "",
          sub.phone || "",
          formatDate(sub.createdAt),
        ]
          .map((field) => `"${field}"`)
          .join(",");
      })
      .join("\n");

    const csv = csvHeaders + csvRows;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting newsletter subscribers:", error);
    return NextResponse.json(
      { error: "Failed to export newsletter subscribers" },
      { status: 500 }
    );
  }
}
