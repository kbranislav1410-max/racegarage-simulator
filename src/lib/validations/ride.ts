import { z } from "zod";

export const rideSessionSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  startAt: z.string().datetime("Invalid datetime"),
  minutes: z.number().int().positive("Minutes must be positive"),
  source: z.enum(["RESERVATION", "CAFE_CUSTOMER", "VOUCHER_PARTNER", "VOUCHER"]),
  partner: z.enum(["ZLAVOMAT", "ADROP", "NAJZAZITKY"]).optional(),
  voucherCode: z.string().optional(),
  notes: z.string().optional(),
  amountEur: z.number().positive("Amount must be positive").optional(),
  paymentMethod: z.enum(["CASH_ON_SITE", "CARD_ON_SITE", "VOUCHER_PORTAL", "PREPAID"]).optional(),
  lapTime: z.string().optional(), // Challenge lap time in format mm:ss.SSS
});

export type RideSessionInput = z.infer<typeof rideSessionSchema>;
