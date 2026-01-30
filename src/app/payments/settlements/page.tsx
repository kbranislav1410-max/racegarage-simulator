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
  const [customInvoiceNumber, setCustomInvoiceNumber] = useState<string>("");

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
      interface UpdateBody {
        status: string;
        invoiceNumber?: string;
      }
      
      const body: UpdateBody = { status: newStatus };
      
      // Include invoice number if status is INVOICE_SENT
      // Send the value (even if empty) to allow clearing or setting custom number
      if (newStatus === "INVOICE_SENT") {
        body.invoiceNumber = customInvoiceNumber.trim();
      }
      
      const response = await fetch(`/api/settlements/${selectedSettlement.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setShowStatusModal(false);
        setSelectedSettlement(null);
        setCustomInvoiceNumber("");
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
    setCustomInvoiceNumber(settlement.invoiceNumber || "");
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
          <h1 className="text-3xl font-bold text-white">
            Platby a Vyúčtovania
          </h1>
          <p className="text-slate-300 mt-1">
            Mesačné vyúčtovania a faktúry
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="rounded-lg shadow" style={{ backgroundColor: "#292929" }}>
          <div className="border-b border-slate-700">
            <nav className="flex -mb-px">
              <a
                href="/payments"
                className="px-6 py-4 text-sm font-medium border-b-2 border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-600"
              >
                Platby
              </a>
              <a
                href="/payments/settlements"
                className="px-6 py-4 text-sm font-medium border-b-2 text-white"
                style={{ borderBottomColor: "#c20003" }}
              >
                Vyúčtovania
              </a>
            </nav>
          </div>
        </div>

        {/* Filters and Create Button */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2  text-white rounded-lg hover:bg-opacity-90 transition-colors" style={{ backgroundColor: "#c20003" }}
          >
            + Vytvoriť vyúčtovanie
          </button>

          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: '#292929', border: 'none' }}
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
            className="px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: '#292929', border: 'none' }}
          >
            <option value="ALL">Všetky stavy</option>
            <option value="NOT_INVOICED">Nevyfakturované</option>
            <option value="INVOICE_SENT">Poslaná faktúra</option>
            <option value="PAID">Zaplatená faktúra</option>
          </select>
        </div>

        {/* Settlements Table */}
        <div className="rounded-lg shadow overflow-hidden" style={{ backgroundColor: "#292929" }}>
          <table className="min-w-full divide-y divide-slate-700">
            <thead style={{ backgroundColor: "#1f1f1f" }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Mesiac
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Celková suma
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Vyúčtovanie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Faktúra č.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Akcie
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {settlements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Žiadne vyúčtovania. Vytvorte nové vyúčtovanie pre mesiac.
                  </td>
                </tr>
              ) : (
                settlements.map((settlement) => (
                  <tr key={settlement.id} className="hover:bg-slate-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {monthNames[settlement.month - 1]} {settlement.year}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {formatAmount(settlement.totalAmountCents)}
                      </div>
                      <div className="text-xs text-slate-400">
                        PD: {formatAmount(settlement.friendAmountCents)} | RG: {formatAmount(settlement.meAmountCents)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {settlement.settlementCents > 0 ? (
                          <span className="text-green-400">PD Drive Club mi dlhuje {formatAmount(Math.abs(settlement.settlementCents))}</span>
                        ) : settlement.settlementCents < 0 ? (
                          <span className="text-red-400">Racegarage dlhuje {formatAmount(Math.abs(settlement.settlementCents))}</span>
                        ) : (
                          <span className="text-slate-300">Vyrovnané</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${statusColors[settlement.status]}`}>
                        {statusLabels[settlement.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {settlement.invoiceNumber || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openStatusModal(settlement)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Zmeniť stav
                      </button>
                      <button
                        onClick={() => handleDeleteSettlement(settlement.id)}
                        className="text-red-400 hover:text-red-300"
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
            <div className="rounded-lg p-6 w-full max-w-md" style={{ backgroundColor: "#292929" }}>
              <h2 className="text-xl font-bold mb-4 text-white">
                Vytvoriť nové vyúčtovanie
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Rok
                  </label>
                  <input
                    type="number"
                    value={createYear}
                    onChange={(e) => setCreateYear(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-600 rounded-lg text-white"
                    style={{ backgroundColor: "#1f1f1f" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Mesiac
                  </label>
                  <select
                    value={createMonth}
                    onChange={(e) => setCreateMonth(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-600 rounded-lg text-white"
                    style={{ backgroundColor: "#1f1f1f" }}
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
                  className="flex-1 px-4 py-2  text-white rounded-lg hover:bg-opacity-90" style={{ backgroundColor: "#c20003" }}
                >
                  Vytvoriť
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-600 text-white rounded-lg hover:bg-slate-700"
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
            <div className="rounded-lg p-6 w-full max-w-md" style={{ backgroundColor: "#292929" }}>
              <h2 className="text-xl font-bold mb-4 text-white">
                Zmeniť stav vyúčtovania
              </h2>
              <div className="mb-4">
                <p className="text-sm text-slate-300 mb-2">
                  {monthNames[selectedSettlement.month - 1]} {selectedSettlement.year}
                </p>
                <label className="block text-sm font-medium text-white mb-1">
                  Nový stav
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-600 rounded-lg text-white"
                  style={{ backgroundColor: "#1f1f1f" }}
                >
                  <option value="NOT_INVOICED">Nevyfakturované</option>
                  <option value="INVOICE_SENT">Poslaná faktúra</option>
                  <option value="PAID">Zaplatená faktúra</option>
                </select>
              </div>
              
              {/* Show invoice number input when status is INVOICE_SENT */}
              {newStatus === "INVOICE_SENT" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white mb-1">
                    Číslo faktúry <span className="text-slate-400 font-normal">(voliteľné)</span>
                  </label>
                  <input
                    type="text"
                    value={customInvoiceNumber}
                    onChange={(e) => setCustomInvoiceNumber(e.target.value)}
                    placeholder="napr. 202501001"
                    className="w-full px-3 py-2 border border-slate-600 rounded-lg text-white"
                    style={{ backgroundColor: "#1f1f1f" }}
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Ak nevyplníte, číslo sa vygeneruje automaticky
                  </p>
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={handleUpdateStatus}
                  className="flex-1 px-4 py-2  text-white rounded-lg hover:bg-opacity-90" style={{ backgroundColor: "#c20003" }}
                >
                  Uložiť
                </button>
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedSettlement(null);
                    setCustomInvoiceNumber("");
                  }}
                  className="flex-1 px-4 py-2 border border-slate-600 text-white rounded-lg hover:bg-slate-700"
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
