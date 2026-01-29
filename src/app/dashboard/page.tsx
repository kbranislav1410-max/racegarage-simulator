"use client";

import { ProtectedLayout } from "@/components/ProtectedLayout";
import { useEffect, useState } from "react";
import { Plus, Search, X, Calendar, UserPlus, Ticket, Trophy, ChevronRight, Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface DashboardStats {
  totalCustomers: number;
  totalRides: number;
  totalMinutes: number;
  newRidersThisMonth: number;
  returningRidersThisMonth: number;
  monthlyRevenue: number;
  monthlyRevenueRacegarage: number;
  monthlyRevenuePDDriveClub: number;
  monthlyRevenueChange: number;
  monthlyRevenueChangePercent: number;
  weeklyRevenue: number;
  weeklyRevenueRacegarage: number;
  weeklyRevenuePDDriveClub: number;
  monthlyRevenueByMonth: Array<{
    month: number;
    monthName: string;
    total: number;
    racegarage: number;
    pdDriveClub: number;
  }>;
  settlementAmount: number;
  // Customer statistics
  ridesThisWeek: number;
  ridesThisMonth: number;
  newCustomersThisWeek: number;
  newCustomersThisMonth: number;
  returningRidersThisWeek: number;
  ridesByMonth: Array<{
    month: number;
    monthName: string;
    count: number;
  }>;
  newCustomersByMonth: Array<{
    month: number;
    monthName: string;
    count: number;
  }>;
  returningCustomersByMonth: Array<{
    month: number;
    monthName: string;
    count: number;
  }>;
  yearlyRevenue: number;
  yearlyRevenueChange: number;
  yearlyRevenueChangePercent: number;
  yearlyCustomers: number;
  yearlyRides: number;
  yearlyMinutes: number;
  activeReservations: number;
  challengeLeaderboard: {
    challenge: {
      id: string;
      trackName: string;
      carName: string;
      durationMinutes: number;
    };
    topAttempts: Array<{
      rank: number;
      customerId: string;
      customerName: string;
      lapTimeMs: number;
      recordedAt: string;
    }>;
  } | null;
  frequentRiders: Array<{
    customerId: string;
    customerName: string;
    totalRides: number;
    totalMinutes: number;
  }>;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  street: string | null;
  city: string | null;
  phone: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalRides: 0,
    totalMinutes: 0,
    newRidersThisMonth: 0,
    returningRidersThisMonth: 0,
    monthlyRevenue: 0,
    monthlyRevenueRacegarage: 0,
    monthlyRevenuePDDriveClub: 0,
    monthlyRevenueChange: 0,
    monthlyRevenueChangePercent: 0,
    weeklyRevenue: 0,
    weeklyRevenueRacegarage: 0,
    weeklyRevenuePDDriveClub: 0,
    monthlyRevenueByMonth: [],
    settlementAmount: 0,
    ridesThisWeek: 0,
    ridesThisMonth: 0,
    newCustomersThisWeek: 0,
    newCustomersThisMonth: 0,
    returningRidersThisWeek: 0,
    ridesByMonth: [],
    newCustomersByMonth: [],
    returningCustomersByMonth: [],
    yearlyRevenue: 0,
    yearlyRevenueChange: 0,
    yearlyRevenueChangePercent: 0,
    yearlyCustomers: 0,
    yearlyRides: 0,
    yearlyMinutes: 0,
    activeReservations: 0,
    challengeLeaderboard: null,
    frequentRiders: [],
  });
  const [loading, setLoading] = useState(true);
  const [revenueFilter, setRevenueFilter] = useState<"all" | "racegarage" | "pdDriveClub">("all");
  const [customerFilter, setCustomerFilter] = useState<"rides" | "newCustomers" | "returningCustomers">("rides");

  // Record Ride Modal State
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [recordStep, setRecordStep] = useState<"choice" | "search" | "create-customer" | "record-ride">("choice");
  
  // Customer Search/Selection
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Create Customer Form
  const [customerFormData, setCustomerFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    phone: "",
    newsletter: false,
  });
  const [customerFormErrors, setCustomerFormErrors] = useState<Record<string, string>>({});
  const [customerFormSubmitting, setCustomerFormSubmitting] = useState(false);

  // Ride Form
  const [rideFormData, setRideFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    minutes: 30,
    partner: "" as "" | "ZLAVOMAT" | "ADROP" | "NAJZAZITKY",
    voucherCode: "",
    notes: "",
    amount: "",
    paymentMethod: "PD_DRIVE_CLUB" as "PD_DRIVE_CLUB" | "VOUCHER_PARTNER" | "VOUCHER_RACEGARAGE" | "VOUCHER_PD_DRIVE_CLUB",
  });
  const [rideFormErrors, setRideFormErrors] = useState<Record<string, string>>({});
  const [rideFormSubmitting, setRideFormSubmitting] = useState(false);

  // Helper function to get filtered revenue value
  const getFilteredRevenue = (total: number, racegarage: number, pdDriveClub: number) => {
    if (revenueFilter === "racegarage") return racegarage;
    if (revenueFilter === "pdDriveClub") return pdDriveClub;
    return total;
  };

  // Helper function to get chart data based on filter
  const getChartData = () => {
    return stats.monthlyRevenueByMonth.map(month => ({
      month: month.monthName,
      value: revenueFilter === "racegarage" ? month.racegarage : 
             revenueFilter === "pdDriveClub" ? month.pdDriveClub : 
             month.total
    }));
  };

  // Helper functions for customer statistics
  const getCustomerWeeklyCount = () => {
    if (customerFilter === "rides") return stats.ridesThisWeek;
    if (customerFilter === "newCustomers") return stats.newCustomersThisWeek;
    return stats.returningRidersThisWeek;
  };

  const getCustomerMonthlyCount = () => {
    if (customerFilter === "rides") return stats.ridesThisMonth;
    if (customerFilter === "newCustomers") return stats.newCustomersThisMonth;
    return stats.returningRidersThisMonth;
  };

  const getCustomerChartData = () => {
    if (customerFilter === "rides") return stats.ridesByMonth;
    if (customerFilter === "newCustomers") return stats.newCustomersByMonth;
    return stats.returningCustomersByMonth;
  };

  const getCustomerChartColor = () => {
    if (customerFilter === "rides") return "bg-blue-500";
    if (customerFilter === "newCustomers") return "bg-green-500";
    return "bg-purple-500";
  };

  const getCustomerTitle = () => {
    if (customerFilter === "rides") return "Počet jázd";
    if (customerFilter === "newCustomers") return "Noví zákazníci";
    return "Vracajúci sa zákazníci";
  };

  const getCustomerWeeklyLabel = () => {
    if (customerFilter === "rides") return "Počet jázd tento týždeň";
    if (customerFilter === "newCustomers") return "Noví zákazníci tento týždeň";
    return "Vracajúci sa tento týždeň";
  };

  const getCustomerMonthlyLabel = () => {
    if (customerFilter === "rides") return "Počet jázd tento mesiac";
    if (customerFilter === "newCustomers") return "Noví zákazníci tento mesiac";
    return "Vracajúci sa tento mesiac";
  };

  const getCustomerChartTitle = () => {
    if (customerFilter === "rides") return `Počet jázd po mesiacoch - ${new Date().getFullYear()}`;
    if (customerFilter === "newCustomers") return `Noví zákazníci po mesiacoch - ${new Date().getFullYear()}`;
    return `Vracajúci sa zákazníci po mesiacoch - ${new Date().getFullYear()}`;
  };

  // Format lap time from milliseconds to MM:SS.mmm
  const formatLapTime = (lapTimeMs: number) => {
    const totalSeconds = lapTimeMs / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const milliseconds = Math.floor((totalSeconds % 1) * 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  };

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

  // Search customers
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const searchCustomers = async () => {
      try {
        setSearchLoading(true);
        const response = await fetch(`/api/customers?search=${encodeURIComponent(searchQuery)}&limit=10`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.customers);
        }
      } catch (error) {
        console.error("Failed to search customers:", error);
      } finally {
        setSearchLoading(false);
      }
    };

    const timer = setTimeout(searchCustomers, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleOpenRecordModal = () => {
    setShowRecordModal(true);
    setRecordStep("choice");
    setSelectedCustomer(null);
    setSearchQuery("");
    setSearchResults([]);
    setCustomerFormData({
      email: "",
      firstName: "",
      lastName: "",
      street: "",
      city: "",
      phone: "",
      newsletter: false,
    });
    setCustomerFormErrors({});
    setRideFormData({
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      minutes: 30,
      partner: "",
      voucherCode: "",
      notes: "",
      amount: "",
      paymentMethod: "PD_DRIVE_CLUB",
    });
    setRideFormErrors({});
  };

  const handleCloseRecordModal = () => {
    setShowRecordModal(false);
    setRecordStep("choice");
    setSelectedCustomer(null);
  };

  // Quick action handlers
  const handleNewCustomer = () => {
    setShowRecordModal(true);
    setRecordStep("create-customer");
    setCustomerFormData({
      email: "",
      firstName: "",
      lastName: "",
      street: "",
      city: "",
      phone: "",
      newsletter: false,
    });
    setCustomerFormErrors({});
  };

  const handleSearchCustomer = () => {
    setShowRecordModal(true);
    setRecordStep("search");
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleNewVoucher = () => {
    router.push("/vouchers");
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setRecordStep("record-ride");
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerFormErrors({});
    setCustomerFormSubmitting(true);

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerFormData),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.errors) {
          setCustomerFormErrors(error.errors);
        } else {
          alert(error.error || "Nepodarilo sa vytvoriť zákazníka");
        }
        return;
      }

      const createdCustomer = await response.json();
      setSelectedCustomer(createdCustomer);
      setRecordStep("record-ride");
    } catch (error) {
      console.error("Failed to create customer:", error);
      alert("Nepodarilo sa vytvoriť zákazníka");
    } finally {
      setCustomerFormSubmitting(false);
    }
  };

  const handleRecordRide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    setRideFormErrors({});
    setRideFormSubmitting(true);

    try {
      const startAt = new Date(`${rideFormData.date}T${rideFormData.time}`);
      
      const response = await fetch("/api/rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          startAt: startAt.toISOString(),
          minutes: Number(rideFormData.minutes),
          source: "RESERVATION", // Default source since we removed the field
          partner: rideFormData.paymentMethod === "VOUCHER_PARTNER" ? rideFormData.partner : undefined,
          voucherCode: (rideFormData.paymentMethod === "VOUCHER_PARTNER" || rideFormData.paymentMethod === "VOUCHER_RACEGARAGE" || rideFormData.paymentMethod === "VOUCHER_PD_DRIVE_CLUB") ? rideFormData.voucherCode : undefined,
          notes: rideFormData.notes || undefined,
          amountEur: rideFormData.amount ? parseFloat(rideFormData.amount) : undefined,
          paymentMethod: rideFormData.amount ? rideFormData.paymentMethod : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.errors) {
          setRideFormErrors(error.errors);
        } else {
          alert(error.error || "Nepodarilo sa zaznamenať jazdu");
        }
        return;
      }

      alert("Jazda úspešne zaznamenaná!");
      handleCloseRecordModal();
      
      // Refresh stats
      const statsResponse = await fetch("/api/dashboard/stats");
      if (statsResponse.ok) {
        const data = await statsResponse.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to record ride:", error);
      alert("Nepodarilo sa zaznamenať jazdu");
    } finally {
      setRideFormSubmitting(false);
    }
  };

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Prehľad</h1>
          <p className="text-slate-300 mt-2">
            Vitajte v systéme Racegarage Simulátor
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={handleOpenRecordModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg flex items-center justify-center gap-3 font-medium shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={24} />
            <span>Nová jazda</span>
          </button>
          
          <button
            onClick={handleNewCustomer}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg flex items-center justify-center gap-3 font-medium shadow-md hover:shadow-lg transition-all"
          >
            <UserPlus size={24} />
            <span>Nový zákazník</span>
          </button>
          
          <button
            onClick={handleNewVoucher}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-lg flex items-center justify-center gap-3 font-medium shadow-md hover:shadow-lg transition-all"
          >
            <Ticket size={24} />
            <span>Nový poukaz</span>
          </button>
          
          <button
            onClick={handleSearchCustomer}
            className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-4 rounded-lg flex items-center justify-center gap-3 font-medium shadow-md hover:shadow-lg transition-all"
          >
            <Search size={24} />
            <span>Vyhľadať zákazníka</span>
          </button>
        </div>

        {/* Customer Statistics and Financial Indicators Side by Side */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Customer Statistics Section */}
          <div className="h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Zákazníci</h2>
              <select
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value as typeof customerFilter)}
                className="px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: '#292929', border: 'none' }}
              >
                <option value="rides">Počet jázd</option>
                <option value="newCustomers">Noví zákazníci</option>
                <option value="returningCustomers">Vracajúci sa zákazníci</option>
              </select>
            </div>

            {/* Weekly and Monthly Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="p-6 rounded-lg shadow" style={{ backgroundColor: "#292929" }}>
              <h3 className="text-sm font-medium text-slate-300">
                {getCustomerWeeklyLabel()}
              </h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {loading ? "..." : getCustomerWeeklyCount()}
              </p>
              {customerFilter === "returningCustomers" && !loading && (
                <p className="text-sm text-slate-400 mt-1">
                  Jazdili viac ako raz celkovo
                </p>
              )}
            </div>
            <div className="p-6 rounded-lg shadow" style={{ backgroundColor: "#292929" }}>
              <h3 className="text-sm font-medium text-slate-300">
                {getCustomerMonthlyLabel()}
              </h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {loading ? "..." : getCustomerMonthlyCount()}
              </p>
              {customerFilter === "returningCustomers" && !loading && (
                <p className="text-sm text-slate-400 mt-1">
                  Jazdili viac ako raz celkovo
                </p>
              )}
            </div>
          </div>
          
          {/* Chart */}
          <div className="p-6 rounded-lg shadow" style={{ backgroundColor: "#292929" }}>
            <h3 className="text-lg font-semibold text-white mb-4">
              {getCustomerChartTitle()}
            </h3>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-slate-300">Načítavam graf...</p>
              </div>
            ) : (
              <div className="h-64">
                <div className="flex items-end justify-between h-full gap-2">
                  {getCustomerChartData().map((data, index) => {
                    const chartData = getCustomerChartData();
                    const maxValue = Math.max(...chartData.map(d => d.count));
                    const height = maxValue > 0 ? (data.count / maxValue) * 100 : 0;
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div className="relative w-full" style={{ height: '200px' }}>
                          <div 
                            className={`absolute bottom-0 w-full rounded-t-lg transition-all ${getCustomerChartColor()}`}
                            style={{ height: `${height}%` }}
                            title={`${data.monthName}: ${data.count}`}
                          >
                            {data.count > 0 && (
                              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-white whitespace-nowrap">
                                {data.count}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-slate-300 text-center">
                          {data.monthName.slice(0, 3)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Financial Indicators Section */}
        <div className="h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Finančné ukazovatele</h2>
            <select
              value={revenueFilter}
              onChange={(e) => setRevenueFilter(e.target.value as typeof revenueFilter)}
              className="px-4 py-2 rounded-lg text-white"
              style={{ backgroundColor: '#292929', border: 'none' }}
            >
              <option value="all">Celkové príjmy</option>
              <option value="racegarage">Racegarage</option>
              <option value="pdDriveClub">PD Drive Club</option>
            </select>
          </div>

          {/* Weekly, Monthly, Settlement Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="p-6 rounded-lg shadow" style={{ backgroundColor: "#292929" }}>
              <h3 className="text-sm font-medium text-slate-300">
                Príjem za tento týždeň
              </h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {loading ? "..." : `€${getFilteredRevenue(
                  stats.weeklyRevenue,
                  stats.weeklyRevenueRacegarage,
                  stats.weeklyRevenuePDDriveClub
                ).toFixed(2)}`}
              </p>
              {!loading && revenueFilter === "all" && (
                <div className="mt-2 text-xs text-slate-400">
                  <div>Racegarage: €{stats.weeklyRevenueRacegarage.toFixed(2)}</div>
                  <div>PD Drive Club: €{stats.weeklyRevenuePDDriveClub.toFixed(2)}</div>
                </div>
              )}
            </div>

            <div className="p-6 rounded-lg shadow" style={{ backgroundColor: "#292929" }}>
              <h3 className="text-sm font-medium text-slate-300">
                Príjem za tento mesiac
              </h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {loading ? "..." : `€${getFilteredRevenue(
                  stats.monthlyRevenue,
                  stats.monthlyRevenueRacegarage,
                  stats.monthlyRevenuePDDriveClub
                ).toFixed(2)}`}
              </p>
              {!loading && revenueFilter === "all" && (
                <div className="mt-2 text-xs text-slate-400">
                  <div>Racegarage: €{stats.monthlyRevenueRacegarage.toFixed(2)}</div>
                  <div>PD Drive Club: €{stats.monthlyRevenuePDDriveClub.toFixed(2)}</div>
                </div>
              )}
              {!loading && stats.monthlyRevenueChange !== 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <span className={`text-sm font-medium ${stats.monthlyRevenueChange > 0 ? "text-green-600" : "text-red-600"}`}>
                    {stats.monthlyRevenueChange > 0 ? "+" : ""}
                    €{Math.abs(stats.monthlyRevenueChange).toFixed(2)}
                  </span>
                  <span className={`text-xs ${stats.monthlyRevenueChange > 0 ? "text-green-600" : "text-red-600"}`}>
                    ({stats.monthlyRevenueChange > 0 ? "+" : ""}
                    {stats.monthlyRevenueChangePercent.toFixed(1)}%)
                  </span>
                </div>
              )}
            </div>

            <div className="p-6 rounded-lg shadow" style={{ backgroundColor: "#292929" }}>
              <h3 className="text-sm font-medium text-slate-300">
                Vyrovnanie za aktuálny mesiac
              </h3>
              <p className={`text-3xl font-bold mt-2 ${
                stats.settlementAmount > 0 ? "text-green-600" : 
                stats.settlementAmount < 0 ? "text-red-600" : 
                "text-white"
              }`}>
                {loading ? "..." : stats.settlementAmount > 0 
                  ? `+€${stats.settlementAmount.toFixed(2)}`
                  : stats.settlementAmount < 0
                  ? `€${stats.settlementAmount.toFixed(2)}`
                  : "€0.00"
                }
              </p>
              {!loading && (
                <p className="text-xs text-slate-400 mt-2">
                  {stats.settlementAmount > 0 
                    ? "PD Drive Club mi dlhuje"
                    : stats.settlementAmount < 0
                    ? "Racegarage dlhuje"
                    : "Vyrovnané"
                  }
                </p>
              )}
            </div>
          </div>

          {/* Monthly Revenue Chart */}
          <div className="p-6 rounded-lg shadow" style={{ backgroundColor: "#292929" }}>
            <h3 className="text-lg font-semibold text-white mb-4">
              Mesačné príjmy za rok {new Date().getFullYear()}
            </h3>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-slate-300">Načítavam graf...</p>
              </div>
            ) : (
              <div className="h-64">
                <div className="flex items-end justify-between h-full gap-2">
                  {getChartData().map((data, index) => {
                    const maxValue = Math.max(...getChartData().map(d => d.value));
                    const height = maxValue > 0 ? (data.value / maxValue) * 100 : 0;
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div className="relative w-full" style={{ height: '200px' }}>
                          <div 
                            className={`absolute bottom-0 w-full rounded-t-lg transition-all ${
                              revenueFilter === "racegarage" ? "bg-blue-500" :
                              revenueFilter === "pdDriveClub" ? "bg-green-500" :
                              "bg-slate-600"
                            }`}
                            style={{ height: `${height}%` }}
                            title={`${data.month}: €${data.value.toFixed(2)}`}
                          >
                            {data.value > 0 && (
                              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-white whitespace-nowrap">
                                €{data.value.toFixed(0)}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-slate-300 text-center">
                          {data.month.slice(0, 3)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Yearly Overview */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Ročný prehľad</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-lg shadow" style={{ backgroundColor: "#292929" }}>
              <h3 className="text-sm font-medium text-slate-300">
                Príjem za tento rok
              </h3>
              <p className="text-3xl font-bold text-white mt-2">
                {loading ? "..." : `€${stats.yearlyRevenue.toFixed(2)}`}
              </p>
              {!loading && stats.yearlyRevenueChange !== 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <span className={`text-sm font-medium ${stats.yearlyRevenueChange > 0 ? "text-green-600" : "text-red-600"}`}>
                    {stats.yearlyRevenueChange > 0 ? "+" : ""}
                    €{Math.abs(stats.yearlyRevenueChange).toFixed(2)}
                  </span>
                  <span className={`text-sm ${stats.yearlyRevenueChange > 0 ? "text-green-600" : "text-red-600"}`}>
                    ({stats.yearlyRevenueChange > 0 ? "+" : ""}
                    {stats.yearlyRevenueChangePercent.toFixed(1)}%)
                  </span>
                </div>
              )}
            </div>
            
            <div className="p-6 rounded-lg shadow" style={{ backgroundColor: "#292929" }}>
              <h3 className="text-sm font-medium text-slate-300">
                Počet zákazníkov
              </h3>
              <p className="text-3xl font-bold text-white mt-2">
                {loading ? "..." : stats.yearlyCustomers}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Celkový počet
              </p>
            </div>

            <div className="p-6 rounded-lg shadow" style={{ backgroundColor: "#292929" }}>
              <h3 className="text-sm font-medium text-slate-300">
                Počet jázd
              </h3>
              <p className="text-3xl font-bold text-white mt-2">
                {loading ? "..." : stats.yearlyRides}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Za tento rok
              </p>
            </div>

            <div className="p-6 rounded-lg shadow" style={{ backgroundColor: "#292929" }}>
              <h3 className="text-sm font-medium text-slate-300">
                Počet odjazdených minút
              </h3>
              <p className="text-3xl font-bold text-white mt-2">
                {loading ? "..." : stats.yearlyMinutes.toLocaleString()}
              </p>
              {!loading && stats.yearlyMinutes > 0 && (
                <p className="text-sm text-slate-400 mt-1">
                  {(stats.yearlyMinutes / 60).toFixed(1)} hodín
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Challenge Leaderboard and Frequent Riders - Side by Side */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Challenge Leaderboard - TOP 3 */}
          <div className="p-6 rounded-lg shadow h-full" style={{ backgroundColor: "#292929" }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="text-yellow-500" size={24} />
              Aktuálna výzva
            </h2>
            <button
              onClick={() => router.push("/challenge")}
              className="flex items-center gap-2 px-4 py-2  text-white rounded-lg text-sm font-medium transition-colors hover:bg-opacity-90"
              style={{ backgroundColor: "#c20003" }}
            >
              Zobraziť celý rebríček
              <ChevronRight size={16} />
            </button>
          </div>
          
          {loading ? (
            <p className="text-slate-300">Načítavam...</p>
          ) : !stats.challengeLeaderboard ? (
            <div className="text-center py-8">
              <Trophy className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-300">Žiadna aktívna výzva pre tento mesiac</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Challenge Info */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-300">Trať:</span>
                    <span className="ml-2 font-semibold text-white">
                      {stats.challengeLeaderboard.challenge.trackName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-300">Auto:</span>
                    <span className="ml-2 font-semibold text-white">
                      {stats.challengeLeaderboard.challenge.carName}
                    </span>
                  </div>
                </div>
              </div>

              {/* TOP 3 Leaderboard */}
              {stats.challengeLeaderboard.topAttempts.length === 0 ? (
                <p className="text-center text-slate-300 py-4">
                  Zatiaľ žiadne pokusy. Buď prvý!
                </p>
              ) : (
                <div className="space-y-2">
                  {stats.challengeLeaderboard.topAttempts.map((attempt) => {
                    const medalColors = {
                      1: "bg-yellow-500 text-white",
                      2: "bg-slate-400 text-white",
                      3: "bg-amber-700 text-white",
                    };
                    const medalColor = medalColors[attempt.rank as keyof typeof medalColors];

                    return (
                      <div
                        key={attempt.rank}
                        className="flex items-center gap-3 p-4 rounded-lg border-2 border-slate-200 hover:border-slate-300 transition-colors"
                      >
                        {/* Rank Medal */}
                        <div className={`w-10 h-10 rounded-full ${medalColor} flex items-center justify-center font-bold text-lg flex-shrink-0`}>
                          {attempt.rank}
                        </div>
                        
                        {/* Customer Name */}
                        <div className="flex-1">
                          <p className="font-semibold text-white">
                            {attempt.customerName}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(attempt.recordedAt).toLocaleDateString("sk-SK")}
                          </p>
                        </div>
                        
                        {/* Lap Time */}
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">
                            {formatLapTime(attempt.lapTimeMs)}
                          </p>
                          <p className="text-xs text-slate-400">čas kola</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Most Frequent Riders - TOP 10 */}
        <div className="p-6 rounded-lg shadow h-full" style={{ backgroundColor: "#292929" }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="text-blue-600" size={24} />
              Najčastejší jazdci
            </h2>
          </div>
          
          {loading ? (
            <p className="text-slate-300">Načítavam...</p>
          ) : stats.frequentRiders.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-300">Žiadni jazdci</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.frequentRiders.map((rider, index) => (
                <div
                  key={rider.customerId}
                  className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  {/* Rank Number */}
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-white flex-shrink-0">
                    {index + 1}
                  </div>
                  
                  {/* Customer Name */}
                  <div className="flex-1">
                    <p className="font-semibold text-white">
                      {rider.customerName}
                    </p>
                  </div>
                  
                  {/* Statistics */}
                  <div className="text-right flex gap-4">
                    <div>
                      <p className="text-lg font-bold text-blue-600">
                        {rider.totalRides}
                      </p>
                      <p className="text-xs text-slate-400">jázd</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">
                        {rider.totalMinutes}
                      </p>
                      <p className="text-xs text-slate-400">minút</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Record Ride Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-white">
                Zaznamenať jazdu
              </h2>
              <button
                onClick={handleCloseRecordModal}
                className="text-slate-400 hover:text-slate-300"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Step 1: Choice */}
              {recordStep === "choice" && (
                <div className="space-y-4">
                  <p className="text-white mb-6">Vyberte typ zákazníka:</p>
                  <div className="grid grid-cols-1 gap-4">
                    <button
                      onClick={() => setRecordStep("search")}
                      className="border-2 border-blue-600 hover:bg-blue-50 text-blue-600 px-6 py-4 rounded-md font-medium text-left flex items-center gap-3"
                    >
                      <Search size={24} />
                      <div>
                        <div className="font-bold">Registrovaný zákazník</div>
                        <div className="text-sm opacity-80">Vyhľadať existujúceho zákazníka</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setRecordStep("create-customer")}
                      className="border-2 border-green-600 hover:bg-green-50 text-green-600 px-6 py-4 rounded-md font-medium text-left flex items-center gap-3"
                    >
                      <Plus size={24} />
                      <div>
                        <div className="font-bold">Nový zákazník</div>
                        <div className="text-sm opacity-80">Registrovať nového zákazníka</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Search Customer */}
              {recordStep === "search" && (
                <div className="space-y-4">
                  <button
                    onClick={() => setRecordStep("choice")}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    ← Späť na výber
                  </button>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Vyhľadať zákazníka
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Zadajte meno, priezvisko alebo email..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md"
                      />
                    </div>
                  </div>

                  {searchLoading && (
                    <p className="text-slate-300 text-center py-4">Vyhľadávam...</p>
                  )}

                  {!searchLoading && searchResults.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-300">Nájdení zákazníci:</p>
                      {searchResults.map((customer) => (
                        <button
                          key={customer.id}
                          onClick={() => handleSelectCustomer(customer)}
                          className="w-full text-left p-4 border border-slate-200 rounded-md hover:bg-slate-50 hover:border-blue-300"
                        >
                          <div className="font-medium text-white">
                            {customer.firstName} {customer.lastName}
                          </div>
                          <div className="text-sm text-slate-300">{customer.email}</div>
                          {customer.city && (
                            <div className="text-sm text-slate-400">{customer.city}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {!searchLoading && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
                    <p className="text-slate-300 text-center py-4">Žiadni zákazníci nenájdení</p>
                  )}
                </div>
              )}

              {/* Step 3: Create Customer */}
              {recordStep === "create-customer" && (
                <form onSubmit={handleCreateCustomer} className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setRecordStep("choice")}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    ← Späť na výber
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        Meno *
                      </label>
                      <input
                        type="text"
                        value={customerFormData.firstName}
                        onChange={(e) => setCustomerFormData({ ...customerFormData, firstName: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                        required
                      />
                      {customerFormErrors.firstName && (
                        <p className="text-red-600 text-sm mt-1">{customerFormErrors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        Priezvisko *
                      </label>
                      <input
                        type="text"
                        value={customerFormData.lastName}
                        onChange={(e) => setCustomerFormData({ ...customerFormData, lastName: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                        required
                      />
                      {customerFormErrors.lastName && (
                        <p className="text-red-600 text-sm mt-1">{customerFormErrors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={customerFormData.email}
                      onChange={(e) => setCustomerFormData({ ...customerFormData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      required
                    />
                    {customerFormErrors.email && (
                      <p className="text-red-600 text-sm mt-1">{customerFormErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Telefón
                    </label>
                    <input
                      type="tel"
                      value={customerFormData.phone}
                      onChange={(e) => setCustomerFormData({ ...customerFormData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    />
                    {customerFormErrors.phone && (
                      <p className="text-red-600 text-sm mt-1">{customerFormErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Ulica
                    </label>
                    <input
                      type="text"
                      value={customerFormData.street}
                      onChange={(e) => setCustomerFormData({ ...customerFormData, street: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    />
                    {customerFormErrors.street && (
                      <p className="text-red-600 text-sm mt-1">{customerFormErrors.street}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Mesto
                    </label>
                    <input
                      type="text"
                      value={customerFormData.city}
                      onChange={(e) => setCustomerFormData({ ...customerFormData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    />
                    {customerFormErrors.city && (
                      <p className="text-red-600 text-sm mt-1">{customerFormErrors.city}</p>
                    )}
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="newsletter"
                      checked={customerFormData.newsletter}
                      onChange={(e) => setCustomerFormData({ ...customerFormData, newsletter: e.target.checked })}
                      className="mr-2"
                    />
                    <label htmlFor="newsletter" className="text-sm text-white">
                      Zákazník má záujem o newsletter (propagačné materiály a novinky)
                    </label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      type="submit"
                      disabled={customerFormSubmitting}
                      className="flex-1  text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 hover:bg-opacity-90"
                      style={{ backgroundColor: "#c20003" }}
                    >
                      {customerFormSubmitting ? "Vytváram..." : "Vytvoriť a pokračovať"}
                    </button>
                  </div>
                </form>
              )}

              {/* Step 4: Record Ride */}
              {recordStep === "record-ride" && selectedCustomer && (
                <form onSubmit={handleRecordRide} className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-md mb-4">
                    <p className="text-sm text-slate-300">Zákazník:</p>
                    <p className="font-medium text-white">
                      {selectedCustomer.firstName} {selectedCustomer.lastName}
                    </p>
                    <p className="text-sm text-slate-300">{selectedCustomer.email}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        Dátum *
                      </label>
                      <input
                        type="date"
                        value={rideFormData.date}
                        onChange={(e) => setRideFormData({ ...rideFormData, date: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        Čas jazdy *
                      </label>
                      <input
                        type="time"
                        value={rideFormData.time}
                        onChange={(e) => setRideFormData({ ...rideFormData, time: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Suma zaplatená (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={rideFormData.amount}
                      onChange={(e) => setRideFormData({ ...rideFormData, amount: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Metóda platby
                    </label>
                    <select
                      value={rideFormData.paymentMethod}
                      onChange={(e) => setRideFormData({ 
                        ...rideFormData, 
                        paymentMethod: e.target.value as any,
                        partner: "", // Reset partner when payment method changes
                        voucherCode: "", // Reset voucher code when payment method changes
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    >
                      <option value="PD_DRIVE_CLUB">PD Drive Club</option>
                      <option value="VOUCHER_PARTNER">Poukaz - Partner</option>
                      <option value="VOUCHER_RACEGARAGE">Poukaz - Racegarage</option>
                      <option value="VOUCHER_PD_DRIVE_CLUB">Poukaz - PD Drive club</option>
                    </select>
                  </div>

                  {rideFormData.paymentMethod === "VOUCHER_PARTNER" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-white mb-1">
                          Partner *
                        </label>
                        <select
                          value={rideFormData.partner}
                          onChange={(e) => setRideFormData({ ...rideFormData, partner: e.target.value as any })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md"
                          required
                        >
                          <option value="">Vyberte partnera</option>
                          <option value="ZLAVOMAT">Zľavomat</option>
                          <option value="ADROP">Adrop</option>
                          <option value="NAJZAZITKY">Najzážitky</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-1">
                          Číslo poukazu *
                        </label>
                        <input
                          type="text"
                          value={rideFormData.voucherCode}
                          onChange={(e) => setRideFormData({ ...rideFormData, voucherCode: e.target.value })}
                          placeholder="Zadajte číslo poukazu"
                          className="w-full px-3 py-2 border border-slate-300 rounded-md"
                          required
                        />
                      </div>
                    </>
                  )}

                  {(rideFormData.paymentMethod === "VOUCHER_RACEGARAGE" || rideFormData.paymentMethod === "VOUCHER_PD_DRIVE_CLUB") && (
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        Číslo poukazu
                      </label>
                      <input
                        type="text"
                        value={rideFormData.voucherCode}
                        onChange={(e) => setRideFormData({ ...rideFormData, voucherCode: e.target.value })}
                        placeholder="Zadajte číslo poukazu"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Minúty *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={rideFormData.minutes}
                      onChange={(e) => setRideFormData({ ...rideFormData, minutes: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Poznámka
                    </label>
                    <textarea
                      value={rideFormData.notes}
                      onChange={(e) => setRideFormData({ ...rideFormData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCustomer(null);
                        setRecordStep("choice");
                      }}
                      className="px-4 py-2 border border-slate-300 text-white rounded-md hover:bg-slate-50"
                    >
                      Zrušiť
                    </button>
                    <button
                      type="submit"
                      disabled={rideFormSubmitting}
                      className="flex-1  text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 hover:bg-opacity-90"
                      style={{ backgroundColor: "#c20003" }}
                    >
                      {rideFormSubmitting ? "Zaznamenávam..." : "Zaznamenať jazdu"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </ProtectedLayout>
  );
}
