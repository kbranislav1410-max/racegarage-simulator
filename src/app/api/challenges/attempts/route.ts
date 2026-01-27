import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { challengeAttemptSchema } from "@/lib/validations/challenge";
import { createAuditLog } from "@/lib/audit";

// GET /api/challenges/attempts - Get ALL attempts for a challenge month (not grouped)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const challengeMonthId = searchParams.get("challengeMonthId");

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
        lapTimeMs: "asc", // Sort by fastest time first
      },
    });

    // Format attempts with rank and customer name
    const formattedAttempts = attempts.map((attempt, index) => ({
      id: attempt.id,
      rank: index + 1,
      customerId: attempt.customerId,
      customerName: `${attempt.customer.firstName} ${attempt.customer.lastName}`,
      customerEmail: attempt.customer.email,
      lapTimeMs: attempt.lapTimeMs,
      recordedAt: attempt.recordedAt.toISOString(),
      sessionId: attempt.sessionId,
    }));

    return NextResponse.json({
      attempts: formattedAttempts,
      totalAttempts: formattedAttempts.length,
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

// DELETE /api/challenges/attempts - Delete a challenge attempt
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const attemptId = searchParams.get("id");

    if (!attemptId) {
      return NextResponse.json(
        { error: "Attempt ID is required" },
        { status: 400 }
      );
    }

    // Verify attempt exists
    const attempt = await prisma.challengeAttempt.findUnique({
      where: { id: attemptId },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { error: "Challenge attempt not found" },
        { status: 404 }
      );
    }

    // Delete the attempt
    await prisma.challengeAttempt.delete({
      where: { id: attemptId },
    });

    // Create audit log
    await createAuditLog("DELETE", "ChallengeAttempt", attemptId, {
      customerId: attempt.customerId,
      customerName: `${attempt.customer.firstName} ${attempt.customer.lastName}`,
      lapTimeMs: attempt.lapTimeMs,
      challengeMonthId: attempt.challengeMonthId,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting challenge attempt:", error);
    return NextResponse.json(
      { error: "Failed to delete challenge attempt" },
      { status: 500 }
    );
  }
}
