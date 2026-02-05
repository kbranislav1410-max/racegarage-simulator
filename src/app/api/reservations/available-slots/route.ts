import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

// Business hours configuration
const BUSINESS_HOURS = {
  start: 9, // 9 AM
  end: 21, // 9 PM
};

const SLOT_DURATION = 30; // minutes per slot

// Generate time slots for a given date
function generateTimeSlots(date: Date): { time: string; datetime: Date }[] {
  const slots: { time: string; datetime: Date }[] = [];
  const dateStr = date.toISOString().split("T")[0];

  for (
    let hour = BUSINESS_HOURS.start;
    hour < BUSINESS_HOURS.end;
    hour++
  ) {
    for (let minute = 0; minute < 60; minute += SLOT_DURATION) {
      const timeStr = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      const datetime = new Date(`${dateStr}T${timeStr}:00`);
      slots.push({ time: timeStr, datetime });
    }
  }

  return slots;
}

// Check if a slot overlaps with existing reservations
async function checkSlotAvailability(
  slotStart: Date,
  slotDuration: number = SLOT_DURATION
): Promise<boolean> {
  const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000);

  // Query only reservations that could potentially overlap
  // No buffer needed - fetch reservations where:
  // - Reservation starts before our slot ends AND
  // - Reservation ends after our slot starts
  const conflicts = await prisma.reservation.findMany({
    where: {
      status: {
        in: ["PENDING", "CONFIRMED"],
      },
      scheduledAt: {
        lt: slotEnd, // Reservation starts before slot ends
      },
    },
    select: {
      scheduledAt: true,
      durationMinutes: true,
    },
  });

  // Check for overlaps
  for (const reservation of conflicts) {
    const reservationEnd = new Date(
      reservation.scheduledAt.getTime() + reservation.durationMinutes * 60000
    );

    // Reservation ends after slot starts? Then we have overlap
    if (reservationEnd > slotStart) {
      // Double check the overlap logic
      if (
        (slotStart >= reservation.scheduledAt && slotStart < reservationEnd) ||
        (slotEnd > reservation.scheduledAt && slotEnd <= reservationEnd) ||
        (slotStart <= reservation.scheduledAt && slotEnd >= reservationEnd)
      ) {
        return false; // Slot is not available
      }
    }
  }

  return true; // Slot is available
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get("date");

    if (!dateParam) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    const date = new Date(dateParam);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    // Don't allow booking in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return NextResponse.json(
        { error: "Cannot check availability for past dates" },
        { status: 400 }
      );
    }

    // Generate all possible time slots
    const allSlots = generateTimeSlots(date);

    // Check availability for each slot
    const slotsWithAvailability = await Promise.all(
      allSlots.map(async (slot) => {
        // Don't show past slots for today
        const now = new Date();
        const isPast = slot.datetime < now;
        
        const isAvailable = isPast ? false : await checkSlotAvailability(slot.datetime);

        return {
          time: slot.time,
          available: isAvailable,
          isPast,
        };
      })
    );

    return NextResponse.json({
      date: dateParam,
      slots: slotsWithAvailability,
    });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch available slots" },
      { status: 500 }
    );
  }
}
