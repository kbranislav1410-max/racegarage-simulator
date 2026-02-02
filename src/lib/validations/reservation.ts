import { z } from "zod";

// Schema for creating a public reservation
export const createPublicReservationSchema = z.object({
  scheduledAt: z.string().datetime(),
  durationMinutes: z.number().int().positive(),
  email: z.string().email(),
  // For registered customers, these will be optional (fetched from DB)
  // For new customers, these are required
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  street: z.string().optional(),
  city: z.string().optional(),
});

// Schema for internal reservation creation
export const createReservationSchema = z.object({
  customerId: z.string().optional(),
  guestEmail: z.string().email().optional(),
  guestName: z.string().optional(),
  guestStreet: z.string().optional(),
  guestCity: z.string().optional(),
  scheduledAt: z.string().datetime(),
  durationMinutes: z.number().int().positive(),
  notes: z.string().optional(),
});

// Schema for updating reservation status
export const updateReservationStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "REJECTED",
    "CANCELLED",
    "COMPLETED",
    "NO_SHOW",
  ]),
  notes: z.string().optional(),
});

export type CreatePublicReservationInput = z.infer<
  typeof createPublicReservationSchema
>;
export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateReservationStatusInput = z.infer<
  typeof updateReservationStatusSchema
>;
