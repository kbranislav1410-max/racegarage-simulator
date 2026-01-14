import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";

// GET /api/customers/search - Search customers for autocomplete
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";

    if (!query || query.length < 2) {
      return NextResponse.json({ customers: [] });
    }

    // Search customers by name, email, or address
    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { street: { contains: query, mode: "insensitive" } },
          { city: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 10,
      orderBy: { firstName: "asc" },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        street: true,
        city: true,
      },
    });

    return NextResponse.json({ customers });
  } catch (error) {
    console.error("Error searching customers:", error);
    return NextResponse.json(
      { error: "Failed to search customers" },
      { status: 500 }
    );
  }
}
