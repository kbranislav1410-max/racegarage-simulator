import { z } from "zod";

export const rideSessionSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  startAt: z.string().datetime("Invalid datetime"),
  minutes: z.number().int().positive("Minutes must be positive"),
  source: z.enum(["ON_SITE", "RESERVATION", "VOUCHER", "PREPAID"]),
  notes: z.string().optional(),
});

export type RideSessionInput = z.infer<typeof rideSessionSchema>;
