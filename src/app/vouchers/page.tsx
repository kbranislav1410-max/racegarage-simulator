"use client";

import { useEffect, useState } from "react";
import { ProtectedLayout } from "@/components/ProtectedLayout";

interface Voucher {
  id: string;
  code: string;
  minutes: number;
  status: string;
  soldToEmail: string;
  soldToName: string;
  createdAt: string;
  redeemedAt: string | null;
  redeemedByCustomer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    minutes: "",
    soldToEmail: "",
    soldToName: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const response = await fetch("/api/vouchers");
      if (!response.ok) throw new Error("Failed to fetch vouchers");
      const data = await response.json();
      setVouchers(data);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      setError("Nepodarilo sa načítať vouchery");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          minutes: parseInt(formData.minutes),
          soldToEmail: formData.soldToEmail,
          soldToName: formData.soldToName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Nepodarilo sa vytvoriť voucher");
      }

      const newVoucher = await response.json();
      setSuccess(`Voucher vytvorený! Kód: ${newVoucher.code}`);
      setVouchers([newVoucher, ...vouchers]);
      setFormData({ minutes: "", soldToEmail: "", soldToName: "" });
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setShowCreateModal(false);
        setSuccess("");
      }, 2000);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const activeVouchers = vouchers.filter(
    (v) => v.status === "NEW" || v.status === "SENT"
  );
  const redeemedVouchers = vouchers.filter((v) => v.status === "REDEEMED");

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Vouchery</h1>
            <p className="text-slate-600 mt-2">
              Vytvorte a validujte vouchery pre zákazníkov
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
          >
            Vytvoriť Voucher
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Aktívne Vouchery ({activeVouchers.length})
            </h2>
            {loading ? (
              <div className="text-slate-600 text-center py-8">
                Načítavam...
              </div>
            ) : activeVouchers.length === 0 ? (
              <div className="text-slate-600 text-center py-8">
                Žiadne aktívne vouchery
              </div>
            ) : (
              <div className="space-y-3">
                {activeVouchers.map((voucher) => (
                  <div
                    key={voucher.id}
                    className="p-4 border border-slate-200 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-mono font-bold text-lg">
                          {voucher.code}
                        </p>
                        <p className="text-sm text-slate-600">
                          {voucher.minutes} minút • {voucher.soldToName}
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                        {voucher.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Použité Vouchery ({redeemedVouchers.length})
            </h2>
            {redeemedVouchers.length === 0 ? (
              <div className="text-slate-600 text-center py-8">
                Žiadne použité vouchery
              </div>
            ) : (
              <div className="space-y-3">
                {redeemedVouchers.slice(0, 5).map((voucher) => (
                  <div
                    key={voucher.id}
                    className="p-4 border border-slate-200 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-mono font-bold">
                          {voucher.code}
                        </p>
                        <p className="text-sm text-slate-600">
                          {voucher.redeemedByCustomer
                            ? `${voucher.redeemedByCustomer.firstName} ${voucher.redeemedByCustomer.lastName}`
                            : "Neznámy"}
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                        POUŽITÝ
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Voucher Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                Vytvoriť Nový Voucher
              </h2>
              
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
                  {success}
                </div>
              )}

              <form onSubmit={handleCreateVoucher} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Počet minút *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.minutes}
                    onChange={(e) =>
                      setFormData({ ...formData, minutes: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="napr. 30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email kupujúceho *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.soldToEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, soldToEmail: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="email@priklad.sk"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Meno kupujúceho *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.soldToName}
                    onChange={(e) =>
                      setFormData({ ...formData, soldToName: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="Meno Priezvisko"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setError("");
                      setSuccess("");
                    }}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Zrušiť
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
                  >
                    Vytvoriť
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
