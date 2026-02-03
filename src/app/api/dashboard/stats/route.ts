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

    // Calculate start of current week (Monday)
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Sunday
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() + diff);
    startOfWeek.setHours(0, 0, 0, 0);

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
      select: { 
        amountCents: true,
        receiver: true,
      },
    });
    
    const monthlyRevenue = monthlyPayments.reduce(
      (sum: number, payment: typeof monthlyPayments[0]) => sum + payment.amountCents,
      0
    ) / 100;

    const monthlyRevenueRacegarage = monthlyPayments
      .filter(p => p.receiver === "ME")
      .reduce((sum: number, payment) => sum + payment.amountCents, 0) / 100;

    const monthlyRevenuePDDriveClub = monthlyPayments
      .filter(p => p.receiver === "FRIEND")
      .reduce((sum: number, payment) => sum + payment.amountCents, 0) / 100;

    // Get weekly revenue
    const weeklyPayments = await prisma.paymentRecord.findMany({
      where: {
        createdAt: {
          gte: startOfWeek,
        },
      },
      select: { 
        amountCents: true,
        receiver: true,
      },
    });
    
    const weeklyRevenue = weeklyPayments.reduce(
      (sum: number, payment: typeof weeklyPayments[0]) => sum + payment.amountCents,
      0
    ) / 100;

    const weeklyRevenueRacegarage = weeklyPayments
      .filter(p => p.receiver === "ME")
      .reduce((sum: number, payment) => sum + payment.amountCents, 0) / 100;

    const weeklyRevenuePDDriveClub = weeklyPayments
      .filter(p => p.receiver === "FRIEND")
      .reduce((sum: number, payment) => sum + payment.amountCents, 0) / 100;

    // Get monthly revenue data for the entire year (for chart)
    const monthlyRevenueByMonth = [];
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(now.getFullYear(), month, 1);
      const monthEnd = new Date(now.getFullYear(), month + 1, 0, 23, 59, 59);
      
      const monthPayments = await prisma.paymentRecord.findMany({
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        select: { 
          amountCents: true,
          receiver: true,
        },
      });

      const total = monthPayments.reduce((sum, p) => sum + p.amountCents, 0) / 100;
      const racegarage = monthPayments.filter(p => p.receiver === "ME").reduce((sum, p) => sum + p.amountCents, 0) / 100;
      const pdDriveClub = monthPayments.filter(p => p.receiver === "FRIEND").reduce((sum, p) => sum + p.amountCents, 0) / 100;

      monthlyRevenueByMonth.push({
        month: month + 1,
        monthName: new Date(now.getFullYear(), month).toLocaleString('sk-SK', { month: 'long' }),
        total,
        racegarage,
        pdDriveClub,
      });
    }

    // Calculate settlement for current month
    const settlementAmount = (monthlyRevenuePDDriveClub - monthlyRevenueRacegarage) / 2;

    // === CUSTOMER STATISTICS ===
    
    // Get rides this week
    const ridesThisWeek = await prisma.rideSession.count({
      where: {
        startAt: {
          gte: startOfWeek,
        },
      },
    });

    // Get rides this month
    const ridesThisMonthCount = ridesThisMonth.length;

    // Get rides by month for the year (for chart)
    const ridesByMonth = [];
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(now.getFullYear(), month, 1);
      const monthEnd = new Date(now.getFullYear(), month + 1, 0, 23, 59, 59);
      
      const count = await prisma.rideSession.count({
        where: {
          startAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      ridesByMonth.push({
        month: month + 1,
        monthName: new Date(now.getFullYear(), month).toLocaleString('sk-SK', { month: 'long' }),
        count,
      });
    }

    // Get new customers this week (customers created this week)
    const newCustomersThisWeek = await prisma.customer.count({
      where: {
        createdAt: {
          gte: startOfWeek,
        },
      },
    });

    // Get new customers this month (customers created this month)
    const newCustomersThisMonth = await prisma.customer.count({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Get new customers by month for the year (for chart)
    const newCustomersByMonth = [];
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(now.getFullYear(), month, 1);
      const monthEnd = new Date(now.getFullYear(), month + 1, 0, 23, 59, 59);
      
      const count = await prisma.customer.count({
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      newCustomersByMonth.push({
        month: month + 1,
        monthName: new Date(now.getFullYear(), month).toLocaleString('sk-SK', { month: 'long' }),
        count,
      });
    }

    // Get returning customers this week
    const ridesThisWeekData = await prisma.rideSession.findMany({
      where: {
        startAt: {
          gte: startOfWeek,
        },
      },
      select: {
        customerId: true,
      },
    });
    
    const ridersThisWeek = new Set(ridesThisWeekData.map((r) => r.customerId));
    let returningRidersThisWeek = 0;
    
    for (const customerId of ridersThisWeek) {
      const totalRidesForCustomer = await prisma.rideSession.count({
        where: { customerId },
      });
      if (totalRidesForCustomer > 1) {
        returningRidersThisWeek++;
      }
    }

    // Get returning customers by month for the year (for chart)
    const returningCustomersByMonth = [];
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(now.getFullYear(), month, 1);
      const monthEnd = new Date(now.getFullYear(), month + 1, 0, 23, 59, 59);
      
      const monthRides = await prisma.rideSession.findMany({
        where: {
          startAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        select: {
          customerId: true,
        },
      });

      const ridersInMonth = new Set(monthRides.map((r) => r.customerId));
      let returningCount = 0;
      
      for (const customerId of ridersInMonth) {
        const totalRidesForCustomer = await prisma.rideSession.count({
          where: { customerId },
        });
        if (totalRidesForCustomer > 1) {
          returningCount++;
        }
      }

      returningCustomersByMonth.push({
        month: month + 1,
        monthName: new Date(now.getFullYear(), month).toLocaleString('sk-SK', { month: 'long' }),
        count: returningCount,
      });
    }

    // Yearly totals
    const yearlyCustomers = totalCustomers;
    const yearlyRides = await prisma.rideSession.count({
      where: {
        startAt: {
          gte: startOfYear,
        },
      },
    });
    const yearlyRideSessions = await prisma.rideSession.findMany({
      where: {
        startAt: {
          gte: startOfYear,
        },
      },
      select: { minutes: true },
    });
    const yearlyMinutes = yearlyRideSessions.reduce(
      (sum: number, session: typeof yearlyRideSessions[0]) => sum + session.minutes,
      0
    );

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

    // Get current month's challenge
    const currentChallenge = await prisma.challengeMonth.findUnique({
      where: {
        year_month: {
          year: now.getFullYear(),
          month: now.getMonth() + 1, // JavaScript months are 0-indexed
        },
      },
    });

    // Get TOP 3 challenge attempts for current month
    let challengeLeaderboard = null;
    if (currentChallenge) {
      const topAttempts = await prisma.challengeAttempt.findMany({
        where: {
          challengeMonthId: currentChallenge.id,
        },
        take: 3,
        orderBy: {
          lapTimeMs: "asc", // Fastest times first
        },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      challengeLeaderboard = {
        challenge: {
          id: currentChallenge.id,
          trackName: currentChallenge.trackName,
          carName: currentChallenge.carName,
          durationMinutes: currentChallenge.durationMinutes,
          prizeDescription: currentChallenge.prizeDescription,
        },
        topAttempts: topAttempts.map((attempt, index) => ({
          rank: index + 1,
          customerId: attempt.customerId,
          customerName: `${attempt.customer.firstName} ${attempt.customer.lastName}`,
          lapTimeMs: attempt.lapTimeMs,
          recordedAt: attempt.recordedAt.toISOString(),
        })),
      };
    }

    // Get most frequent riders (TOP 10)
    const frequentRiders = await prisma.customer.findMany({
      include: {
        rideSessions: {
          select: {
            minutes: true,
          },
        },
      },
    });

    // Calculate total rides and minutes for each customer
    const ridersWithStats = frequentRiders
      .map((customer) => {
        const totalRides = customer.rideSessions.length;
        const totalMinutes = customer.rideSessions.reduce(
          (sum, session) => sum + session.minutes,
          0
        );
        
        return {
          customerId: customer.id,
          customerName: `${customer.firstName} ${customer.lastName}`,
          totalRides,
          totalMinutes,
        };
      })
      .filter((rider) => rider.totalRides > 0) // Only include riders with at least 1 ride
      .sort((a, b) => b.totalRides - a.totalRides) // Sort by total rides descending
      .slice(0, 10); // Take TOP 10

    return NextResponse.json({
      // All-time stats
      totalCustomers,
      totalRides,
      totalMinutes,
      
      // Monthly stats
      newRidersThisMonth: uniqueNewRiders,
      returningRidersThisMonth: returningRidersCount,
      monthlyRevenue,
      monthlyRevenueRacegarage,
      monthlyRevenuePDDriveClub,
      monthlyRevenueChange,
      monthlyRevenueChangePercent,
      
      // Weekly stats
      weeklyRevenue,
      weeklyRevenueRacegarage,
      weeklyRevenuePDDriveClub,

      // Monthly revenue by month (for chart)
      monthlyRevenueByMonth,

      // Settlement
      settlementAmount,
      
      // Customer statistics - Weekly
      ridesThisWeek,
      newCustomersThisWeek,
      returningRidersThisWeek,

      // Customer statistics - Monthly
      ridesThisMonth: ridesThisMonthCount,
      newCustomersThisMonth,

      // Customer statistics - Charts
      ridesByMonth,
      newCustomersByMonth,
      returningCustomersByMonth,
      
      // Yearly stats
      yearlyRevenue,
      yearlyRevenueChange,
      yearlyRevenueChangePercent,
      yearlyCustomers,
      yearlyRides,
      yearlyMinutes,
      
      // Other stats
      activeReservations,
      
      // Challenge leaderboard (TOP 3)
      challengeLeaderboard,
      
      // Most frequent riders (TOP 10)
      frequentRiders: ridersWithStats,
    });
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
