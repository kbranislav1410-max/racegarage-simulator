"use client";

import { ProtectedLayout } from "@/components/ProtectedLayout";
import { useEffect, useState } from "react";
import { Plus, Search, X, Calendar } from "lucide-react";

interface DashboardStats {
  totalCustomers: number;
  totalRides: number;
  totalMinutes: number;
  newRidersThisMonth: number;
  returningRidersThisMonth: number;
  monthlyRevenue: number;
  monthlyRevenueChange: number;
  monthlyRevenueChangePercent: number;
  yearlyRevenue: number;
  yearlyRevenueChange: number;
  yearlyRevenueChangePercent: number;
  activeReservations: number;
  recentRidesActivity: Array<{
    type: "ride";
    description: string;
    timestamp: string;
  }>;
  recentCustomersActivity: Array<{
    type: "customer";
    description: string;
    timestamp: string;
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
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalRides: 0,
    totalMinutes: 0,
    newRidersThisMonth: 0,
    returningRidersThisMonth: 0,
    monthlyRevenue: 0,
    monthlyRevenueChange: 0,
    monthlyRevenueChangePercent: 0,
    yearlyRevenue: 0,
    yearlyRevenueChange: 0,
    yearlyRevenueChangePercent: 0,
    activeReservations: 0,
    recentRidesActivity: [],
    recentCustomersActivity: [],
  });
  const [loading, setLoading] = useState(true);

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Prehľad</h1>
            <p className="text-slate-600 mt-2">
              Vitajte v systéme Racegarage Simulátor
            </p>
          </div>
          <button
            onClick={handleOpenRecordModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition"
          >
            <Plus size={20} />
            Zaznamenať jazdu
          </button>
        </div>

        {/* All-time Statistics */}
        <div>
          <h2 className="text-xl font-semibold text-slate-700 mb-4">Celková štatistika</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-slate-600">
                Celkový počet jazdcov
              </h3>
              <p className="text-3xl font-bold text-slate-800 mt-2">
                {loading ? "..." : stats.totalCustomers}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-slate-600">
                Celkový počet jázd
              </h3>
              <p className="text-3xl font-bold text-slate-800 mt-2">
                {loading ? "..." : stats.totalRides}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-slate-600">
                Celkový počet odjazdených minút
              </h3>
              <p className="text-3xl font-bold text-slate-800 mt-2">
                {loading ? "..." : stats.totalMinutes.toLocaleString()}
              </p>
              {!loading && stats.totalMinutes > 0 && (
                <p className="text-sm text-slate-500 mt-1">
                  {(stats.totalMinutes / 60).toFixed(1)} hodín
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Monthly Statistics */}
        <div>
          <h2 className="text-xl font-semibold text-slate-700 mb-4">Tento mesiac</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-slate-600">
                Noví jazdci
              </h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {loading ? "..." : stats.newRidersThisMonth}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Prvýkrát jazdili tento mesiac
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-slate-600">
                Vracajúci sa jazdci
              </h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {loading ? "..." : stats.returningRidersThisMonth}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Jazdili viac ako raz celkovo
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
          </div>
        </div>

        {/* Revenue Statistics */}
        <div>
          <h2 className="text-xl font-semibold text-slate-700 mb-4">Príjmy</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-slate-600">
                Príjem za tento mesiac
              </h3>
              <p className="text-3xl font-bold text-slate-800 mt-2">
                {loading ? "..." : `€${stats.monthlyRevenue.toFixed(2)}`}
              </p>
              {!loading && stats.monthlyRevenueChange !== 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <span className={`text-sm font-medium ${stats.monthlyRevenueChange > 0 ? "text-green-600" : "text-red-600"}`}>
                    {stats.monthlyRevenueChange > 0 ? "+" : ""}
                    €{Math.abs(stats.monthlyRevenueChange).toFixed(2)}
                  </span>
                  <span className={`text-sm ${stats.monthlyRevenueChange > 0 ? "text-green-600" : "text-red-600"}`}>
                    ({stats.monthlyRevenueChange > 0 ? "+" : ""}
                    {stats.monthlyRevenueChangePercent.toFixed(1)}%)
                  </span>
                  <span className="text-xs text-slate-500">
                    oproti minulému mesiacu
                  </span>
                </div>
              )}
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-slate-600">
                Príjem za tento rok
              </h3>
              <p className="text-3xl font-bold text-slate-800 mt-2">
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
                  <span className="text-xs text-slate-500">
                    oproti minulému roku
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Rides Activity */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Posledné jazdy
          </h2>
          {loading ? (
            <p className="text-slate-600">Načítavam...</p>
          ) : stats.recentRidesActivity.length === 0 ? (
            <p className="text-slate-600">Žiadne jazdy na zobrazenie</p>
          ) : (
            <div className="space-y-3">
              {stats.recentRidesActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-md hover:bg-slate-50 border border-slate-100"
                >
                  <div className="mt-1 w-2 h-2 rounded-full bg-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">
                      {activity.description}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(activity.timestamp).toLocaleString("sk-SK", {
                        day: "numeric",
                        month: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Customers Activity */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Noví jazdci
          </h2>
          {loading ? (
            <p className="text-slate-600">Načítavam...</p>
          ) : stats.recentCustomersActivity.length === 0 ? (
            <p className="text-slate-600">Žiadni noví jazdci na zobrazenie</p>
          ) : (
            <div className="space-y-3">
              {stats.recentCustomersActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-md hover:bg-slate-50 border border-slate-100"
                >
                  <div className="mt-1 w-2 h-2 rounded-full bg-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">
                      {activity.description}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(activity.timestamp).toLocaleString("sk-SK", {
                        day: "numeric",
                        month: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Record Ride Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-slate-800">
                Zaznamenať jazdu
              </h2>
              <button
                onClick={handleCloseRecordModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Step 1: Choice */}
              {recordStep === "choice" && (
                <div className="space-y-4">
                  <p className="text-slate-700 mb-6">Vyberte typ zákazníka:</p>
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
                    <label className="block text-sm font-medium text-slate-700 mb-2">
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
                    <p className="text-slate-600 text-center py-4">Vyhľadávam...</p>
                  )}

                  {!searchLoading && searchResults.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Nájdení zákazníci:</p>
                      {searchResults.map((customer) => (
                        <button
                          key={customer.id}
                          onClick={() => handleSelectCustomer(customer)}
                          className="w-full text-left p-4 border border-slate-200 rounded-md hover:bg-slate-50 hover:border-blue-300"
                        >
                          <div className="font-medium text-slate-800">
                            {customer.firstName} {customer.lastName}
                          </div>
                          <div className="text-sm text-slate-600">{customer.email}</div>
                          {customer.city && (
                            <div className="text-sm text-slate-500">{customer.city}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {!searchLoading && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
                    <p className="text-slate-600 text-center py-4">Žiadni zákazníci nenájdení</p>
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
                      <label className="block text-sm font-medium text-slate-700 mb-1">
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
                      <label className="block text-sm font-medium text-slate-700 mb-1">
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">
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
                    <label htmlFor="newsletter" className="text-sm text-slate-700">
                      Zákazník má záujem o newsletter (propagačné materiály a novinky)
                    </label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      type="submit"
                      disabled={customerFormSubmitting}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
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
                    <p className="text-sm text-slate-600">Zákazník:</p>
                    <p className="font-medium text-slate-800">
                      {selectedCustomer.firstName} {selectedCustomer.lastName}
                    </p>
                    <p className="text-sm text-slate-600">{selectedCustomer.email}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
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
                      <label className="block text-sm font-medium text-slate-700 mb-1">
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">
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
                        <label className="block text-sm font-medium text-slate-700 mb-1">
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
                        <label className="block text-sm font-medium text-slate-700 mb-1">
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
                      <label className="block text-sm font-medium text-slate-700 mb-1">
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">
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
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50"
                    >
                      Zrušiť
                    </button>
                    <button
                      type="submit"
                      disabled={rideFormSubmitting}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
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
