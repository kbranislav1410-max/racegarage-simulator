import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";

// GET /api/newsletter-subscribers - Get all newsletter subscribers
export async function GET(request: NextRequest) {
  try {
    const subscribers = await prisma.customer.findMany({
      where: {
        newsletter: true,
      },
      select: {
        id: true,
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

    return NextResponse.json({
      subscribers,
      count: subscribers.length,
    });
  } catch (error) {
    console.error("Error fetching newsletter subscribers:", error);
    return NextResponse.json(
      { error: "Failed to fetch newsletter subscribers" },
      { status: 500 }
    );
  }
}
