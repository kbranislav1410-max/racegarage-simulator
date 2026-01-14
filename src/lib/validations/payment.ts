import { z } from "zod";

export const paymentMethodEnum = z.enum([
  "CASH_ON_SITE",
  "CARD_ON_SITE",
  "VOUCHER_PORTAL",
  "PREPAID",
]);

export const paymentReceiverEnum = z.enum(["FRIEND", "ME"]);

export const paymentCurrencyEnum = z.enum(["EUR", "USD", "GBP"]);

export const createPaymentSchema = z.object({
  amountCents: z.number().int().positive("Amount must be positive"),
  currency: paymentCurrencyEnum.default("EUR"),
  method: paymentMethodEnum,
  receiver: paymentReceiverEnum,
  customerId: z.string().optional(),
  sessionId: z.string().optional(),
  reservationId: z.string().optional(),
});

export const monthlySettlementSchema = z.object({
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type MonthlySettlementInput = z.infer<typeof monthlySettlementSchema>;
