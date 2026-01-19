import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { settingsUpdateSchema } from "@/lib/validations/settings";
import { createAuditLog } from "@/lib/audit";

// Cache for settings
let settingsCache: Record<string, string> = {};
let cacheTimestamp = 0;
const CACHE_TTL = 60000; // 1 minute

// Get all settings
export async function GET() {
  try {
    // Check cache
    const now = Date.now();
    if (now - cacheTimestamp < CACHE_TTL && Object.keys(settingsCache).length > 0) {
      return NextResponse.json({ settings: settingsCache });
    }

    // Fetch from database
    const settings = await prisma.settings.findMany();
    
    // Build cache
    settingsCache = {};
    type SettingType = typeof settings[0];
    settings.forEach((setting: SettingType) => {
      settingsCache[setting.key] = setting.value;
    });
    cacheTimestamp = now;

    // Set defaults if not found
    const defaults = {
      workingHours: JSON.stringify({
        monday: { from: "10:00", to: "22:00", enabled: true },
        tuesday: { from: "10:00", to: "22:00", enabled: true },
        wednesday: { from: "10:00", to: "22:00", enabled: true },
        thursday: { from: "10:00", to: "22:00", enabled: true },
        friday: { from: "10:00", to: "22:00", enabled: true },
        saturday: { from: "12:00", to: "20:00", enabled: true },
        sunday: { from: "12:00", to: "20:00", enabled: false },
      }),
      slotDurations: JSON.stringify([15, 30, 60]),
      defaultCurrency: "EUR",
      cardPaymentReceiver: "FRIEND",
      emailSenderName: "Racegarage Simulator",
      emailFromAddress: "noreply@racegarage.local",
    };

    // Merge with defaults
    const result = { ...defaults, ...settingsCache };

    return NextResponse.json({ settings: result });
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// Update settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = settingsUpdateSchema.parse(body);

    // Update each setting
    const updates: Promise<any>[] = [];
    
    if (validated.workingHours) {
      updates.push(
        prisma.settings.upsert({
          where: { key: "workingHours" },
          update: { value: JSON.stringify(validated.workingHours) },
          create: { key: "workingHours", value: JSON.stringify(validated.workingHours) },
        })
      );
    }

    if (validated.slotDurations) {
      updates.push(
        prisma.settings.upsert({
          where: { key: "slotDurations" },
          update: { value: JSON.stringify(validated.slotDurations) },
          create: { key: "slotDurations", value: JSON.stringify(validated.slotDurations) },
        })
      );
    }

    if (validated.defaultCurrency) {
      updates.push(
        prisma.settings.upsert({
          where: { key: "defaultCurrency" },
          update: { value: validated.defaultCurrency },
          create: { key: "defaultCurrency", value: validated.defaultCurrency },
        })
      );
    }

    if (validated.cardPaymentReceiver) {
      updates.push(
        prisma.settings.upsert({
          where: { key: "cardPaymentReceiver" },
          update: { value: validated.cardPaymentReceiver },
          create: { key: "cardPaymentReceiver", value: validated.cardPaymentReceiver },
        })
      );
    }

    if (validated.emailSenderName) {
      updates.push(
        prisma.settings.upsert({
          where: { key: "emailSenderName" },
          update: { value: validated.emailSenderName },
          create: { key: "emailSenderName", value: validated.emailSenderName },
        })
      );
    }

    if (validated.emailFromAddress) {
      updates.push(
        prisma.settings.upsert({
          where: { key: "emailFromAddress" },
          update: { value: validated.emailFromAddress },
          create: { key: "emailFromAddress", value: validated.emailFromAddress },
        })
      );
    }

    await Promise.all(updates);

    // Invalidate cache
    cacheTimestamp = 0;
    settingsCache = {};

    // Create audit log
    await createAuditLog("UPDATE", "Settings", "settings", validated);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update settings:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
