"use client";

import { useState, useEffect } from "react";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { Download, Calendar, Euro, Trash2 } from "lucide-react";

interface PaymentRecord {
  id: string;
  amountCents: number;
  currency: string;
  method: string;
  receiver: string;
  createdAt: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  session: {
    id: string;
    startAt: string;
    minutes: number;
  } | null;
}

interface Settlement {
  year: number;
  month: number;
  monthName: string;
  summary: {
    totalPayments: number;
    sumFriend: number;
    sumMe: number;
    totalRevenue: number;
    friendOwesMe: number;
    settlementMessage: string;
  };
  byMethod: Record<string, { count: number; total: number }>;
  payments: PaymentRecord[];
}

export default function PaymentsPage() {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [settlement, setSettlement] = useState<Settlement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch settlement data
  useEffect(() => {
    const fetchSettlement = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(
          `/api/payments/settlement?year=${selectedYear}&month=${selectedMonth}`
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch settlement data");
        }

        const data = await response.json();
        setSettlement(data);
      } catch (err) {
        setError("Failed to load settlement data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettlement();
  }, [selectedYear, selectedMonth]);

  // Handle CSV export
  const handleExportCSV = () => {
    window.open(
      `/api/payments/export?year=${selectedYear}&month=${selectedMonth}`,
      "_blank"
    );
  };

  // Format currency
  const formatCurrency = (cents: number) => {
    return `€${(cents / 100).toFixed(2)}`;
  };

  // Get method badge color
  const getMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      PD_DRIVE_CLUB: "bg-blue-100 text-blue-800",
      VOUCHER_PARTNER: "bg-purple-100 text-purple-800",
      VOUCHER_RACEGARAGE: "bg-green-100 text-green-800",
      VOUCHER_PD_DRIVE_CLUB: "bg-orange-100 text-orange-800",
    };
    return colors[method] || "bg-slate-100 text-slate-800";
  };

  // Get method label in Slovak
  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      PD_DRIVE_CLUB: "PD Drive Club",
      VOUCHER_PARTNER: "Poukaz - partner",
      VOUCHER_RACEGARAGE: "Poukaz - Racegarage",
      VOUCHER_PD_DRIVE_CLUB: "Poukaz - PD Drive Club",
    };
    return labels[method] || method.replace(/_/g, " ");
  };

  // Get receiver badge color and label
  const getReceiverBadge = (receiver: string) => {
    return receiver === "FRIEND"
      ? "bg-blue-100 text-blue-800"
      : "bg-green-100 text-green-800";
  };

  const getReceiverLabel = (receiver: string) => {
    return receiver === "FRIEND" ? "PD Drive Club" : "Racegarage";
  };

  // Handle delete payment
  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm("Naozaj chcete odstrániť túto platbu?")) return;

    try {
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete payment");

      // Refresh settlement data
      const fetchSettlement = async () => {
        try {
          setLoading(true);
          setError("");
          const response = await fetch(
            `/api/payments/settlement?year=${selectedYear}&month=${selectedMonth}`
          );
          
          if (!response.ok) {
            throw new Error("Failed to fetch settlement data");
          }

          const data = await response.json();
          setSettlement(data);
        } catch (err) {
          setError("Failed to load settlement data");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchSettlement();
    } catch (err) {
      setError("Nepodarilo sa odstrániť platbu");
      console.error(err);
    }
  };

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Platby a Vyúčtovania
          </h1>
          <p className="text-slate-600 mt-2">
            50/50 vyúčtovanie a sledovanie platieb
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-slate-200">
            <nav className="flex -mb-px">
              <a
                href="/payments"
                className="px-6 py-4 text-sm font-medium border-b-2 border-slate-800 text-slate-800"
              >
                Platby
              </a>
              <a
                href="/payments/settlements"
                className="px-6 py-4 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              >
                Vyúčtovania
              </a>
            </nav>
          </div>
        </div>

        {/* Month Selector & Export */}
        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Calendar className="w-5 h-5 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-4 py-2 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-white"
              style={{ backgroundColor: '#292929', border: 'none' }}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {new Date(2000, month - 1).toLocaleString("default", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-white"
              style={{ backgroundColor: '#292929', border: 'none' }}
            >
              {Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i).map(
                (year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                )
              )}
            </select>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={!settlement || settlement.payments.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Exportovať CSV
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-slate-600">Načítavam údaje o vyúčtovaní...</div>
          </div>
        ) : settlement ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-slate-600">Celkové Príjmy</h3>
                <p className="text-3xl font-bold text-slate-800 mt-2">
                  {formatCurrency(settlement.summary.totalRevenue)}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {settlement.summary.totalPayments} platieb
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-slate-600">Celkom pre PD Drive Club</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {formatCurrency(settlement.summary.sumFriend)}
                </p>
                <p className="text-sm text-slate-500 mt-1">PD Drive club platby</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-slate-600">Celkom pre Racegarage</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {formatCurrency(settlement.summary.sumMe)}
                </p>
                <p className="text-sm text-slate-500 mt-1">Poukazy a ostatné</p>
              </div>

              <div
                className={`bg-white rounded-lg shadow p-6 ${
                  settlement.summary.friendOwesMe > 0
                    ? "border-2 border-green-500"
                    : settlement.summary.friendOwesMe < 0
                    ? "border-2 border-orange-500"
                    : "border-2 border-slate-300"
                }`}
              >
                <h3 className="text-sm font-medium text-slate-600">Vyúčtovanie</h3>
                <p
                  className={`text-3xl font-bold mt-2 ${
                    settlement.summary.friendOwesMe > 0
                      ? "text-green-600"
                      : settlement.summary.friendOwesMe < 0
                      ? "text-orange-600"
                      : "text-slate-800"
                  }`}
                >
                  {settlement.summary.friendOwesMe === 0
                    ? "€0.00"
                    : formatCurrency(Math.abs(settlement.summary.friendOwesMe))}
                </p>
                <p className="text-sm text-slate-600 mt-1 font-medium">
                  {settlement.summary.friendOwesMe > 0
                    ? "PD Drive Club mi dlhuje"
                    : settlement.summary.friendOwesMe < 0
                    ? "Racegarage dlhuje PD Drive Club"
                    : "Vyrovnané"}
                </p>
              </div>
            </div>

            {/* Settlement Message */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3">
                <Euro className="w-8 h-8" />
                <div>
                  <h3 className="text-sm font-medium opacity-90">Výsledok 50/50 vyúčtovania</h3>
                  <p className="text-xl font-bold mt-1">
                    {settlement.summary.settlementMessage}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Methods Breakdown */}
            {Object.keys(settlement.byMethod).length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4">
                  Rozdelenie podľa metód platby
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(settlement.byMethod).map(([method, data]) => (
                    <div key={method} className="border border-slate-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-slate-600">
                        {getMethodLabel(method as any)}
                      </h4>
                      <p className="text-2xl font-bold text-slate-800 mt-2">
                        {formatCurrency(data.total)}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">{data.count} platieb</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payments Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-800">História platieb</h2>
              </div>
              
              {settlement.payments.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  Žiadne platby zaznamenané pre {settlement.monthName} {settlement.year}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Dátum a Čas
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Zákazník
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Suma
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Metóda
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Príjemca
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Jazda
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Akcie
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {settlement.payments.map((payment) => {
                        const date = new Date(payment.createdAt);
                        return (
                          <tr key={payment.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-slate-900">
                                {date.toLocaleDateString()}
                              </div>
                              <div className="text-sm text-slate-500">
                                {date.toLocaleTimeString()}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {payment.customer ? (
                                <div>
                                  <div className="text-sm font-medium text-slate-900">
                                    {payment.customer.firstName} {payment.customer.lastName}
                                  </div>
                                  <div className="text-sm text-slate-500">
                                    {payment.customer.email}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sm text-slate-500">N/A</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-slate-900">
                                {formatCurrency(payment.amountCents)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getMethodBadge(
                                  payment.method
                                )}`}
                              >
                                {getMethodLabel(payment.method)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getReceiverBadge(
                                  payment.receiver
                                )}`}
                              >
                                {getReceiverLabel(payment.receiver)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {payment.session ? (
                                <div className="text-sm text-slate-600">
                                  {payment.session.minutes} min
                                </div>
                              ) : (
                                <span className="text-sm text-slate-500">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button
                                onClick={() => handleDeletePayment(payment.id)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Odstrániť platbu"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </ProtectedLayout>
  );
}
