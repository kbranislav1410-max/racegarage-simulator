/**
 * Email service for sending ride completion and reservation notifications
 */

import prisma from "@/lib/prisma/client";
import { getEmailProvider } from "./provider";
import {
  generateRideCompletionHTML,
  generateRideCompletionText,
  generateReservationHTML,
  generateReservationText,
  type RideCompletionData,
  type ReservationData,
} from "./templates";
import { createAuditLog } from "@/lib/audit";
import { formatDateTime } from "@/lib/format";

/**
 * Send ride completion email to customer
 * Includes:
 * - Today's ride minutes
 * - Total minutes across all rides
 * - Challenge info if customer has recent attempt (last 24h) in current month
 */
export async function sendRideCompletionEmail(
  customerId: string,
  rideId: string,
  todayMinutes: number
): Promise<void> {
  try {
    // Get customer details
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!customer || !customer.email) {
      console.log(
        `Customer ${customerId} not found or has no email. Skipping email.`
      );
      return;
    }

    // Calculate total minutes
    const totalStats = await prisma.rideSession.aggregate({
      where: { customerId },
      _sum: {
        minutes: true,
      },
    });

    const totalMinutes = totalStats._sum.minutes || 0;

    // Check for recent challenge attempts (last 24 hours)
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed

    // Get current challenge month if exists
    const currentChallenge = await prisma.challengeMonth.findUnique({
      where: {
        year_month: {
          year: currentYear,
          month: currentMonth,
        },
      },
    });

    let challengeInfo: RideCompletionData["challengeInfo"] | undefined;

    if (currentChallenge) {
      // Check if customer has recent attempt
      const recentAttempt = await prisma.challengeAttempt.findFirst({
        where: {
          customerId,
          challengeMonthId: currentChallenge.id,
          recordedAt: {
            gte: yesterday,
          },
        },
        orderBy: {
          recordedAt: "desc",
        },
      });

      if (recentAttempt) {
        // Get customer's best lap time for this month
        const bestAttempt = await prisma.challengeAttempt.findFirst({
          where: {
            customerId,
            challengeMonthId: currentChallenge.id,
          },
          orderBy: {
            lapTimeMs: "asc",
          },
        });

        if (bestAttempt) {
          // Optimized rank calculation using raw query for better performance
          // Counts how many distinct customers have a better (lower) best lap time
          const rankResult = await prisma.$queryRaw<
            Array<{ rank: bigint }>
          >`
            SELECT CAST(COUNT(DISTINCT "customerId") + 1 AS INTEGER) as rank
            FROM (
              SELECT "customerId", MIN("lapTimeMs") as best_time
              FROM "challenge_attempts"
              WHERE "challengeMonthId" = ${currentChallenge.id}
              GROUP BY "customerId"
              HAVING MIN("lapTimeMs") < ${bestAttempt.lapTimeMs}
            ) as better_customers
          `;

          const rank = Number(rankResult[0]?.rank || 1);

          const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];

          challengeInfo = {
            bestLapTimeMs: bestAttempt.lapTimeMs,
            rank,
            monthName: monthNames[currentMonth - 1],
            year: currentYear,
          };
        }
      }
    }

    // Prepare email data
    const emailData: RideCompletionData = {
      customerName: `${customer.firstName} ${customer.lastName}`,
      todayMinutes,
      totalMinutes,
      challengeInfo,
    };

    // Generate email content
    const html = generateRideCompletionHTML(emailData);
    const text = generateRideCompletionText(emailData);
    const subject = challengeInfo
      ? `Ride Complete - ${todayMinutes} min + Challenge Update 🏆`
      : `Ride Complete - ${todayMinutes} minutes`;

    // Send email
    const provider = getEmailProvider();
    const success = await provider.send({
      to: customer.email,
      subject,
      html,
      text,
    });

    // Log email send attempt (don't fail the request if audit log fails)
    try {
      await createAuditLog("EMAIL_SENT", "RideSession", rideId, {
        to: customer.email,
        subject,
        success,
        includesChallenge: !!challengeInfo,
      });
    } catch (auditError) {
      console.error("Failed to create audit log for email:", auditError);
    }

    if (success) {
      console.log(`Ride completion email sent to ${customer.email}`);
    } else {
      console.error(`Failed to send ride completion email to ${customer.email}`);
    }
  } catch (error) {
    // Don't throw error - we don't want email failures to fail ride creation
    console.error("Error in sendRideCompletionEmail:", error);
  }
}

/**
 * Send reservation notification email to customer
 * @param email Customer email
 * @param customerName Customer name
 * @param type Email type: pending, confirmed, rejected, or cancelled
 * @param reservationDetails Reservation details
 */
export async function sendReservationEmail(
  email: string,
  customerName: string,
  type: "pending" | "confirmed" | "rejected" | "cancelled",
  reservationDetails: {
    scheduledAt: Date;
    durationMinutes: number;
    notes?: string | null;
  }
): Promise<void> {
  try {
    const emailData: ReservationData = {
      customerName,
      scheduledAt: formatDateTime(reservationDetails.scheduledAt),
      durationMinutes: reservationDetails.durationMinutes,
      status: type,
      notes: reservationDetails.notes,
    };

    const htmlContent = generateReservationHTML(emailData);
    const textContent = generateReservationText(emailData);

    let subject: string;
    switch (type) {
      case "pending":
        subject = "Reservation Request Received - Racing Simulator";
        break;
      case "confirmed":
        subject = "Reservation Confirmed - Racing Simulator";
        break;
      case "rejected":
        subject = "Reservation Update - Racing Simulator";
        break;
      case "cancelled":
        subject = "Reservation Cancelled - Racing Simulator";
        break;
    }

    const provider = getEmailProvider();
    const success = await provider.send({
      to: email,
      subject,
      html: htmlContent,
      text: textContent,
    });

    // Log email attempt to audit log
    try {
      await createAuditLog(
        "SEND_EMAIL",
        "Reservation",
        email,
        {
          type: `reservation_${type}`,
          email,
          success,
        }
      );
    } catch (auditError) {
      console.error("Failed to create audit log for reservation email:", auditError);
    }

    if (success) {
      console.log(`Reservation ${type} email sent to ${email}`);
    } else {
      console.error(`Failed to send reservation ${type} email to ${email}`);
    }
  } catch (error) {
    // Don't throw error - we don't want email failures to fail reservation updates
    console.error("Error in sendReservationEmail:", error);
  }
}
