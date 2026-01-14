/**
 * Email templates for ride completion notifications
 */

import { formatLapTime } from "@/lib/validations/challenge";

export interface RideCompletionData {
  customerName: string;
  todayMinutes: number;
  totalMinutes: number;
  challengeInfo?: {
    bestLapTimeMs: number;
    rank: number;
    monthName: string;
    year: number;
  };
}

/**
 * Generate HTML email template for ride completion
 */
export function generateRideCompletionHTML(data: RideCompletionData): string {
  const challengeSection = data.challengeInfo
    ? `
    <div style="margin-top: 30px; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
      <h2 style="margin: 0 0 15px 0; color: #92400e; font-size: 18px;">
        🏆 Challenge Update - ${data.challengeInfo.monthName} ${data.challengeInfo.year}
      </h2>
      <p style="margin: 0 0 10px 0; color: #451a03; font-size: 16px;">
        <strong>Your Best Lap Time:</strong> ${formatLapTime(data.challengeInfo.bestLapTimeMs)}
      </p>
      <p style="margin: 0; color: #451a03; font-size: 16px;">
        <strong>Current Leaderboard Position:</strong> #${data.challengeInfo.rank}
      </p>
    </div>
  `
    : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ride Completed - Racegarage</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; color: #1f2937; font-size: 28px;">Racegarage Simulator</h1>
        <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">Racing Simulator Management</p>
      </div>

      <!-- Greeting -->
      <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px;">
        Hi ${data.customerName},
      </p>

      <!-- Main Message -->
      <div style="margin-bottom: 30px;">
        <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
          Thank you for riding with us today! Here's a summary of your session:
        </p>

        <!-- Stats Cards -->
        <div style="display: table; width: 100%; border-collapse: separate; border-spacing: 15px 0;">
          <div style="display: table-cell; width: 50%; background-color: #dbeafe; padding: 20px; border-radius: 8px; text-align: center;">
            <div style="color: #1e40af; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Today</div>
            <div style="color: #1e3a8a; font-size: 32px; font-weight: bold; margin-top: 10px;">${data.todayMinutes}</div>
            <div style="color: #3b82f6; font-size: 14px; margin-top: 5px;">minutes</div>
          </div>
          <div style="display: table-cell; width: 50%; background-color: #dcfce7; padding: 20px; border-radius: 8px; text-align: center;">
            <div style="color: #15803d; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Total</div>
            <div style="color: #14532d; font-size: 32px; font-weight: bold; margin-top: 10px;">${data.totalMinutes}</div>
            <div style="color: #22c55e; font-size: 14px; margin-top: 5px;">minutes</div>
          </div>
        </div>
      </div>

      ${challengeSection}

      <!-- Footer -->
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          See you on the track!<br>
          <strong>Racegarage Team</strong>
        </p>
      </div>
    </div>

    <!-- Footer Note -->
    <div style="text-align: center; margin-top: 20px;">
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text email template for ride completion
 */
export function generateRideCompletionText(data: RideCompletionData): string {
  const challengeSection = data.challengeInfo
    ? `

CHALLENGE UPDATE - ${data.challengeInfo.monthName} ${data.challengeInfo.year}
==========================================
Your Best Lap Time: ${formatLapTime(data.challengeInfo.bestLapTimeMs)}
Current Leaderboard Position: #${data.challengeInfo.rank}
`
    : "";

  return `
Racegarage Simulator
Racing Simulator Management

Hi ${data.customerName},

Thank you for riding with us today! Here's a summary of your session:

TODAY: ${data.todayMinutes} minutes
TOTAL: ${data.totalMinutes} minutes
${challengeSection}

See you on the track!
Racegarage Team

---
This is an automated message. Please do not reply to this email.
  `.trim();
}
