import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { challengeMonthSchema } from "@/lib/validations/challenge";

// GET /api/challenges - Get challenge month(s)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    if (year && month) {
      // Get specific month
      const challengeMonth = await prisma.challengeMonth.findUnique({
        where: {
          year_month: {
            year: parseInt(year),
            month: parseInt(month),
          },
        },
      });

      if (!challengeMonth) {
        return NextResponse.json({ challengeMonth: null });
      }

      return NextResponse.json({ challengeMonth });
    }

    // Get all challenge months, ordered by date descending
    const challengeMonths = await prisma.challengeMonth.findMany({
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: 12, // Last 12 months
    });

    return NextResponse.json({ challengeMonths });
  } catch (error) {
    console.error("Error fetching challenge months:", error);
    return NextResponse.json(
      { error: "Failed to fetch challenge months" },
      { status: 500 }
    );
  }
}

// POST /api/challenges - Create new challenge month
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = challengeMonthSchema.safeParse(body);
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

    // Check if challenge month already exists
    const existing = await prisma.challengeMonth.findUnique({
      where: {
        year_month: {
          year: data.year,
          month: data.month,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Challenge month already exists for this period" },
        { status: 409 }
      );
    }

    // Create challenge month
    const challengeMonth = await prisma.challengeMonth.create({
      data: {
        year: data.year,
        month: data.month,
        trackName: data.trackName,
        carName: data.carName,
        durationMinutes: data.durationMinutes,
      },
    });

    return NextResponse.json(challengeMonth, { status: 201 });
  } catch (error) {
    console.error("Error creating challenge month:", error);
    return NextResponse.json(
      { error: "Failed to create challenge month" },
      { status: 500 }
    );
  }
}
