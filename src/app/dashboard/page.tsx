"use client";

import { ProtectedLayout } from "@/components/ProtectedLayout";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalCustomers: number;
  totalRides: number;
  activeReservations: number;
  monthlyRevenue: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalRides: 0,
    activeReservations: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/dashboard/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Prehľad</h1>
          <p className="text-slate-600 mt-2">
            Vitajte v systéme Racegarage Simulátor
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-slate-600">
              Celkový počet zákazníkov
            </h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">
              {loading ? "..." : stats.totalCustomers}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-slate-600">Celkový počet jázd</h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">
              {loading ? "..." : stats.totalRides}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-slate-600">
              Aktívne rezervácie
            </h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">
              {loading ? "..." : stats.activeReservations}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-slate-600">
              Mesačný príjem
            </h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">
              {loading ? "..." : `€${stats.monthlyRevenue.toFixed(2)}`}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Nedávna aktivita
          </h2>
          <p className="text-slate-600">Žiadna nedávna aktivita na zobrazenie</p>
        </div>
      </div>
    </ProtectedLayout>
  );
}
