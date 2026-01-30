import { z } from "zod";

// Working hours schema
export const workingHoursSchema = z.object({
  monday: z.object({ from: z.string(), to: z.string(), enabled: z.boolean() }),
  tuesday: z.object({ from: z.string(), to: z.string(), enabled: z.boolean() }),
  wednesday: z.object({ from: z.string(), to: z.string(), enabled: z.boolean() }),
  thursday: z.object({ from: z.string(), to: z.string(), enabled: z.boolean() }),
  friday: z.object({ from: z.string(), to: z.string(), enabled: z.boolean() }),
  saturday: z.object({ from: z.string(), to: z.string(), enabled: z.boolean() }),
  sunday: z.object({ from: z.string(), to: z.string(), enabled: z.boolean() }),
});

// Settings update schema
export const settingsUpdateSchema = z.object({
  workingHours: workingHoursSchema.optional(),
  slotDurations: z.array(z.number()).optional(),
  defaultCurrency: z.string().optional(),
  cardPaymentReceiver: z.enum(["FRIEND", "ME"]).optional(),
  emailSenderName: z.string().optional(),
  emailFromAddress: z.string().email().optional(),
});

export type WorkingHours = z.infer<typeof workingHoursSchema>;
export type SettingsUpdate = z.infer<typeof settingsUpdateSchema>;
