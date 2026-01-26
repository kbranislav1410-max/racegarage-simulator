import { z } from "zod";

export const challengeMonthSchema = z.object({
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12),
  trackName: z.string().min(1, "Track name is required").max(100),
  carName: z.string().min(1, "Car name is required").max(100),
  durationMinutes: z.number().int().positive().optional(),
});

export const challengeAttemptSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  challengeMonthId: z.string().min(1, "Challenge month is required"),
  lapTimeMs: z.number().int().positive("Lap time must be positive"),
  sessionId: z.string().optional(),
});

export type ChallengeMonthInput = z.infer<typeof challengeMonthSchema>;
export type ChallengeAttemptInput = z.infer<typeof challengeAttemptSchema>;

// Helper function to parse lap time from various formats
export function parseLapTime(input: string): number | null {
  // Trim whitespace
  const trimmed = input.trim();
  
  // Try to parse as direct milliseconds (e.g., "65432")
  // Use Number to ensure entire string is parsed
  const directMs = Number(trimmed);
  if (Number.isInteger(directMs) && directMs > 0) {
    return directMs;
  }

  // Try to parse as mm:ss.mmm format (e.g., "01:05.432")
  const timeRegex = /^(\d{1,2}):(\d{2})\.(\d{3})$/;
  const match = trimmed.match(timeRegex);
  
  if (match) {
    const minutes = parseInt(match[1]);
    const seconds = parseInt(match[2]);
    const milliseconds = parseInt(match[3]);
    
    if (seconds >= 60) {
      return null; // Invalid seconds
    }
    
    return (minutes * 60 * 1000) + (seconds * 1000) + milliseconds;
  }

  return null; // Invalid format
}

// Helper function to format milliseconds as mm:ss.mmm
export function formatLapTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = ms % 1000;
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}
