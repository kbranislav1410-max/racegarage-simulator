"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedLayout } from "@/components/ProtectedLayout";

interface Settlement {
  id: string;
  year: number;
  month: number;
  status: "NOT_INVOICED" | "INVOICE_SENT" | "PAID";
  totalAmountCents: number;
  friendAmountCents: number;
  meAmountCents: number;
  settlementCents: number;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  paidDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

const statusLabels: Record<string, string> = {
  NOT_INVOICED: "Nevyfakturované",
  INVOICE_SENT: "Poslaná faktúra",
  PAID: "Zaplatená faktúra",
};

const statusColors: Record<string, string> = {
  NOT_INVOICED: "bg-yellow-100 text-yellow-800 border-yellow-300",
  INVOICE_SENT: "bg-blue-100 text-blue-800 border-blue-300",
  PAID: "bg-green-100 text-green-800 border-green-300",
};

const monthNames = [
  "Január", "Február", "Marec", "Apríl", "Máj", "Jún",
  "Júl", "August", "September", "Október", "November", "December"
];

export default function SettlementsPage() {
  const router = useRouter();
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createYear, setCreateYear] = useState(new Date().getFullYear());
  const [createMonth, setCreateMonth] = useState(new Date().getMonth() + 1);
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");

  useEffect(() => {
    fetchSettlements();
  }, [filterYear, filterStatus]);

  const fetchSettlements = async () => {
    try {
      const params = new URLSearchParams();
      if (filterYear !== "ALL") params.append("year", filterYear);
      if (filterStatus !== "ALL") params.append("status", filterStatus);

      const response = await fetch(`/api/settlements?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setSettlements(data);
      }
    } catch (error) {
      console.error("Error fetching settlements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSettlement = async () => {
    try {
      const response = await fetch("/api/settlements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: createYear,
          month: createMonth,
        }),
      });

      if (response.ok) {
        setShowCreateModal(false);
        fetchSettlements();
      } else {
        const error = await response.json();
        alert(error.error || "Chyba pri vytváraní vyúčtovania");
      }
    } catch (error) {
      console.error("Error creating settlement:", error);
      alert("Chyba pri vytváraní vyúčtovania");
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedSettlement) return;

    try {
      const response = await fetch(`/api/settlements/${selectedSettlement.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setShowStatusModal(false);
        setSelectedSettlement(null);
        fetchSettlements();
      } else {
        alert("Chyba pri aktualizácii stavu");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Chyba pri aktualizácii stavu");
    }
  };

  const handleDeleteSettlement = async (id: string) => {
    if (!confirm("Naozaj chcete zmazať toto vyúčtovanie?")) return;

    try {
      const response = await fetch(`/api/settlements/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchSettlements();
      } else {
        alert("Chyba pri mazaní vyúčtovania");
      }
    } catch (error) {
      console.error("Error deleting settlement:", error);
      alert("Chyba pri mazaní vyúčtovania");
    }
  };

  const openStatusModal = (settlement: Settlement) => {
    setSelectedSettlement(settlement);
    setNewStatus(settlement.status);
    setShowStatusModal(true);
  };

  const formatAmount = (cents: number) => {
    return `€${(cents / 100).toFixed(2)}`;
  };

  const years = Array.from(
    new Set([
      ...settlements.map((s) => s.year),
      new Date().getFullYear(),
      new Date().getFullYear() - 1,
    ])
  ).sort((a, b) => b - a);

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="text-center py-12">Načítavam vyúčtovania...</div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Vyúčtovania
          </h1>
          <p className="text-slate-600 mt-1">
            Mesačné vyúčtovania a faktúry
          </p>
        </div>

        {/* Filters and Create Button */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Vytvoriť vyúčtovanie
          </button>

          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
          >
            <option value="ALL">Všetky roky</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
          >
            <option value="ALL">Všetky stavy</option>
            <option value="NOT_INVOICED">Nevyfakturované</option>
            <option value="INVOICE_SENT">Poslaná faktúra</option>
            <option value="PAID">Zaplatená faktúra</option>
          </select>
        </div>

        {/* Settlements Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mesiac
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Celková suma
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vyúčtovanie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Faktúra č.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akcie
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {settlements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Žiadne vyúčtovania. Vytvorte nové vyúčtovanie pre mesiac.
                  </td>
                </tr>
              ) : (
                settlements.map((settlement) => (
                  <tr key={settlement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {monthNames[settlement.month - 1]} {settlement.year}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatAmount(settlement.totalAmountCents)}
                      </div>
                      <div className="text-xs text-gray-500">
                        PD: {formatAmount(settlement.friendAmountCents)} | RG: {formatAmount(settlement.meAmountCents)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {settlement.settlementCents > 0 ? (
                          <span className="text-green-600">PD Drive Club mi dlhuje {formatAmount(Math.abs(settlement.settlementCents))}</span>
                        ) : settlement.settlementCents < 0 ? (
                          <span className="text-red-600">Racegarage dlhuje {formatAmount(Math.abs(settlement.settlementCents))}</span>
                        ) : (
                          <span className="text-gray-600">Vyrovnané</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${statusColors[settlement.status]}`}>
                        {statusLabels[settlement.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {settlement.invoiceNumber || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openStatusModal(settlement)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Zmeniť stav
                      </button>
                      <button
                        onClick={() => handleDeleteSettlement(settlement.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Zmazať
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Create Settlement Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                Vytvoriť nové vyúčtovanie
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rok
                  </label>
                  <input
                    type="number"
                    value={createYear}
                    onChange={(e) => setCreateYear(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mesiac
                  </label>
                  <select
                    value={createMonth}
                    onChange={(e) => setCreateMonth(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                  >
                    {monthNames.map((name, index) => (
                      <option key={index + 1} value={index + 1}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreateSettlement}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Vytvoriť
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Zrušiť
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Update Status Modal */}
        {showStatusModal && selectedSettlement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                Zmeniť stav vyúčtovania
              </h2>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  {monthNames[selectedSettlement.month - 1]} {selectedSettlement.year}
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nový stav
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                >
                  <option value="NOT_INVOICED">Nevyfakturované</option>
                  <option value="INVOICE_SENT">Poslaná faktúra</option>
                  <option value="PAID">Zaplatená faktúra</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleUpdateStatus}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Uložiť
                </button>
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedSettlement(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Zrušiť
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
