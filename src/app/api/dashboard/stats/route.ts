import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
    const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);

    // Get total customers (all time)
    const totalCustomers = await prisma.customer.count();

    // Get total rides (all time)
    const totalRides = await prisma.rideSession.count();

    // Get total minutes driven (all time)
    const allRideSessions = await prisma.rideSession.findMany({
      select: { minutes: true },
    });
    const totalMinutes = allRideSessions.reduce(
      (sum: number, session: typeof allRideSessions[0]) => sum + session.minutes,
      0
    );

    // Get rides this month with customer info
    const ridesThisMonth = await prisma.rideSession.findMany({
      where: {
        startAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        customerId: true,
        customer: {
          select: {
            rideSessions: {
              select: { startAt: true },
              orderBy: { startAt: "asc" },
              take: 1,
            },
          },
        },
      },
    });

    // Calculate new riders this month (first ride ever was this month)
    const newRidersThisMonth = ridesThisMonth.filter((ride) => {
      const firstRide = ride.customer.rideSessions[0];
      return firstRide && firstRide.startAt >= startOfMonth;
    });
    const uniqueNewRiders = new Set(newRidersThisMonth.map((r) => r.customerId)).size;

    // Calculate returning riders this month (have more than 1 ride total and rode this month)
    const ridersThisMonth = new Set(ridesThisMonth.map((r) => r.customerId));
    let returningRidersCount = 0;
    
    for (const customerId of ridersThisMonth) {
      const totalRidesForCustomer = await prisma.rideSession.count({
        where: { customerId },
      });
      if (totalRidesForCustomer > 1) {
        returningRidersCount++;
      }
    }

    // Get monthly revenue
    const monthlyPayments = await prisma.paymentRecord.findMany({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: { amountCents: true },
    });
    const monthlyRevenue = monthlyPayments.reduce(
      (sum: number, payment: typeof monthlyPayments[0]) => sum + payment.amountCents,
      0
    ) / 100;

    // Get last month revenue for comparison
    const lastMonthPayments = await prisma.paymentRecord.findMany({
      where: {
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
      select: { amountCents: true },
    });
    const lastMonthRevenue = lastMonthPayments.reduce(
      (sum: number, payment: typeof lastMonthPayments[0]) => sum + payment.amountCents,
      0
    ) / 100;

    // Calculate month-over-month change
    const monthlyRevenueChange = monthlyRevenue - lastMonthRevenue;
    const monthlyRevenueChangePercent = lastMonthRevenue > 0 
      ? ((monthlyRevenueChange / lastMonthRevenue) * 100)
      : 0;

    // Get yearly revenue
    const yearlyPayments = await prisma.paymentRecord.findMany({
      where: {
        createdAt: {
          gte: startOfYear,
        },
      },
      select: { amountCents: true },
    });
    const yearlyRevenue = yearlyPayments.reduce(
      (sum: number, payment: typeof yearlyPayments[0]) => sum + payment.amountCents,
      0
    ) / 100;

    // Get last year revenue for comparison
    const lastYearPayments = await prisma.paymentRecord.findMany({
      where: {
        createdAt: {
          gte: startOfLastYear,
          lte: endOfLastYear,
        },
      },
      select: { amountCents: true },
    });
    const lastYearRevenue = lastYearPayments.reduce(
      (sum: number, payment: typeof lastYearPayments[0]) => sum + payment.amountCents,
      0
    ) / 100;

    // Calculate year-over-year change
    const yearlyRevenueChange = yearlyRevenue - lastYearRevenue;
    const yearlyRevenueChangePercent = lastYearRevenue > 0
      ? ((yearlyRevenueChange / lastYearRevenue) * 100)
      : 0;

    // Get active reservations
    const activeReservations = await prisma.reservation.count({
      where: {
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    });

    // Get recent activity (last 10 activities)
    const recentRides = await prisma.rideSession.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const recentCustomers = await prisma.customer.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    const recentPayments = await prisma.paymentRecord.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Combine and sort recent activity
    const recentActivity = [
      ...recentRides.map((ride) => ({
        type: "ride" as const,
        description: `${ride.customer.firstName} ${ride.customer.lastName} - Jazda ${ride.minutes} min`,
        timestamp: ride.createdAt,
      })),
      ...recentCustomers.map((customer) => ({
        type: "customer" as const,
        description: `Nový zákazník: ${customer.firstName} ${customer.lastName}`,
        timestamp: customer.createdAt,
      })),
      ...recentPayments.map((payment) => ({
        type: "payment" as const,
        description: `Platba ${(payment.amountCents / 100).toFixed(2)}€${payment.customer ? ` - ${payment.customer.firstName} ${payment.customer.lastName}` : ""}`,
        timestamp: payment.createdAt,
      })),
    ]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    return NextResponse.json({
      // All-time stats
      totalCustomers,
      totalRides,
      totalMinutes,
      
      // Monthly stats
      newRidersThisMonth: uniqueNewRiders,
      returningRidersThisMonth: returningRidersCount,
      monthlyRevenue,
      monthlyRevenueChange,
      monthlyRevenueChangePercent,
      
      // Yearly stats
      yearlyRevenue,
      yearlyRevenueChange,
      yearlyRevenueChangePercent,
      
      // Other stats
      activeReservations,
      
      // Recent activity
      recentActivity,
    });
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
