import { z } from "zod";

// Phone number validation for Slovak format
// Accepts: +421 xxx xxx xxx or 0xxx xxx xxx (with or without spaces)
const phoneRegex = /^(\+421\s?\d{3}\s?\d{3}\s?\d{3}|0\d{3}\s?\d{3}\s?\d{3})$/;

// Schema for creating a public reservation
export const createPublicReservationSchema = z.object({
  scheduledAt: z.string().datetime(),
  durationMinutes: z.number().int().positive(),
  email: z.string().email(),
  // Required fields for new customers
  firstName: z.string().min(1, "Meno je povinné"),
  lastName: z.string().min(1, "Priezvisko je povinné"),
  city: z.string().min(1, "Mesto je povinné"),
  phone: z.string().regex(phoneRegex, "Telefónne číslo musí byť vo formáte +421 xxx xxx xxx alebo 0xxx xxx xxx"),
  // Optional fields
  street: z.string().optional(),
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
