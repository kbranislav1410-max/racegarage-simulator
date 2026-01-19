import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { challengeAttemptSchema } from "@/lib/validations/challenge";
import { createAuditLog } from "@/lib/audit";

// GET /api/challenges/attempts - Get attempts for a challenge month with leaderboard
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const challengeMonthId = searchParams.get("challengeMonthId");
    const customerId = searchParams.get("customerId"); // For searching specific customer

    if (!challengeMonthId) {
      return NextResponse.json(
        { error: "Challenge month ID is required" },
        { status: 400 }
      );
    }

    // Get all attempts for this challenge month
    const attempts = await prisma.challengeAttempt.findMany({
      where: {
        challengeMonthId,
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
      orderBy: {
        recordedAt: "desc",
      },
    });

    // Calculate leaderboard: best time per customer
    const customerBestTimes = new Map<string, {
      customerId: string;
      customerName: string;
      customerEmail: string;
      bestLapTimeMs: number;
      attemptCount: number;
      lastAttemptAt: Date;
    }>();

    attempts.forEach((attempt: typeof attempts[0]) => {
      const existing = customerBestTimes.get(attempt.customerId);
      const customerName = `${attempt.customer.firstName} ${attempt.customer.lastName}`;
      
      if (!existing || attempt.lapTimeMs < existing.bestLapTimeMs) {
        customerBestTimes.set(attempt.customerId, {
          customerId: attempt.customerId,
          customerName,
          customerEmail: attempt.customer.email,
          bestLapTimeMs: attempt.lapTimeMs,
          attemptCount: existing ? existing.attemptCount + 1 : 1,
          lastAttemptAt: attempt.recordedAt,
        });
      } else {
        // Not a better time, just increment count and update timestamp if newer
        existing.attemptCount++;
        if (attempt.recordedAt > existing.lastAttemptAt) {
          existing.lastAttemptAt = attempt.recordedAt;
        }
      }
    });

    // Convert to array and sort by best time
    const leaderboard = Array.from(customerBestTimes.values())
      .sort((a, b) => a.bestLapTimeMs - b.bestLapTimeMs);

    // Add rank
    const leaderboardWithRank = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    // If searching for specific customer, return full list but highlight position
    if (customerId) {
      const customerPosition = leaderboardWithRank.findIndex(
        (entry) => entry.customerId === customerId
      );
      
      return NextResponse.json({
        leaderboard: leaderboardWithRank,
        customerPosition: customerPosition >= 0 ? customerPosition : null,
        totalParticipants: leaderboardWithRank.length,
      });
    }

    // Return top 20 by default
    return NextResponse.json({
      leaderboard: leaderboardWithRank.slice(0, 20),
      totalParticipants: leaderboardWithRank.length,
    });
  } catch (error) {
    console.error("Error fetching challenge attempts:", error);
    return NextResponse.json(
      { error: "Failed to fetch challenge attempts" },
      { status: 500 }
    );
  }
}

// POST /api/challenges/attempts - Create new challenge attempt
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = challengeAttemptSchema.safeParse(body);
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

    // Verify challenge month exists
    const challengeMonth = await prisma.challengeMonth.findUnique({
      where: { id: data.challengeMonthId },
    });

    if (!challengeMonth) {
      return NextResponse.json(
        { error: "Challenge month not found" },
        { status: 404 }
      );
    }

    // If sessionId provided, verify it exists
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

    // Create challenge attempt
    const attempt = await prisma.challengeAttempt.create({
      data: {
        customerId: data.customerId,
        challengeMonthId: data.challengeMonthId,
        lapTimeMs: data.lapTimeMs,
        sessionId: data.sessionId || null,
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

    // Create audit log
    await createAuditLog("CREATE", "ChallengeAttempt", attempt.id, {
      customerId: data.customerId,
      customerName: `${customer.firstName} ${customer.lastName}`,
      challengeMonthId: data.challengeMonthId,
      lapTimeMs: data.lapTimeMs,
    });

    return NextResponse.json(attempt, { status: 201 });
  } catch (error) {
    console.error("Error creating challenge attempt:", error);
    return NextResponse.json(
      { error: "Failed to create challenge attempt" },
      { status: 500 }
    );
  }
}
