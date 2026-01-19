import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function GET() {
  try {
    // Get total customers
    const totalCustomers = await prisma.customer.count();

    // Get total rides
    const totalRides = await prisma.ride.count();

    // Get active reservations (PENDING or CONFIRMED)
    const activeReservations = await prisma.reservation.count({
      where: {
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    });

    // Get monthly revenue (sum of all payments from current month)
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );
    const payments = await prisma.payment.findMany({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    const monthlyRevenue = payments.reduce(
      (sum: number, payment: typeof payments[0]) => sum + payment.amount,
      0
    );

    return NextResponse.json({
      totalCustomers,
      totalRides,
      activeReservations,
      monthlyRevenue,
    });
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
