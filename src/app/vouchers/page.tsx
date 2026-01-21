"use client";

import { useEffect, useState } from "react";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { Search } from "lucide-react";

interface Voucher {
  id: string;
  code: string;
  minutes: number;
  status: string;
  soldToEmail: string;
  soldToName: string;
  createdAt: string;
  expiresAt: string;
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
  
  // Voucher check state
  const [checkCode, setCheckCode] = useState("");
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkedVoucher, setCheckedVoucher] = useState<Voucher | null>(null);
  const [checkError, setCheckError] = useState("");

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

  const handleCheckVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckError("");
    setCheckedVoucher(null);
    setCheckLoading(true);

    try {
      const response = await fetch(`/api/vouchers/check?code=${encodeURIComponent(checkCode)}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Voucher nebol nájdený");
      }

      const voucher = await response.json();
      setCheckedVoucher(voucher);
    } catch (error: any) {
      setCheckError(error.message);
    } finally {
      setCheckLoading(false);
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

        {/* Voucher Check Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Kontrola Voucheru
          </h2>
          <form onSubmit={handleCheckVoucher} className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={checkCode}
                  onChange={(e) => setCheckCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent font-mono"
                  placeholder="Zadajte kód voucheru (napr. XXXX-XXXX-XXXX)"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={checkLoading}
                className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors disabled:bg-slate-400 flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                {checkLoading ? "Kontrolujem..." : "Skontrolovať"}
              </button>
            </div>

            {checkError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                {checkError}
              </div>
            )}

            {checkedVoucher && (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-slate-800">
                    Informácie o vouchere
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      checkedVoucher.status === "REDEEMED"
                        ? "bg-gray-200 text-gray-800"
                        : checkedVoucher.status === "EXPIRED"
                        ? "bg-red-200 text-red-800"
                        : checkedVoucher.status === "CANCELLED"
                        ? "bg-yellow-200 text-yellow-800"
                        : "bg-green-200 text-green-800"
                    }`}
                  >
                    {checkedVoucher.status === "REDEEMED"
                      ? "POUŽITÝ"
                      : checkedVoucher.status === "EXPIRED"
                      ? "EXPIROVANÝ"
                      : checkedVoucher.status === "CANCELLED"
                      ? "ZRUŠENÝ"
                      : "AKTÍVNY"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Kód voucheru</p>
                    <p className="font-mono font-bold text-lg">
                      {checkedVoucher.code}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-600 mb-1">Počet minút</p>
                    <p className="font-semibold text-lg">
                      {checkedVoucher.minutes} minút
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-600 mb-1">
                      Vytvorený pre
                    </p>
                    <p className="font-semibold">{checkedVoucher.soldToName}</p>
                    <p className="text-sm text-slate-600">
                      {checkedVoucher.soldToEmail}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-600 mb-1">Dátum vytvorenia</p>
                    <p className="font-semibold">
                      {new Date(checkedVoucher.createdAt).toLocaleDateString(
                        "sk-SK",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-600 mb-1">Platnosť do</p>
                    <p className="font-semibold">
                      {new Date(checkedVoucher.expiresAt).toLocaleDateString(
                        "sk-SK",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      )}
                    </p>
                    {checkedVoucher.status !== "REDEEMED" && checkedVoucher.status !== "CANCELLED" && (
                      <p className="text-sm text-slate-600 mt-1">
                        {(() => {
                          const now = new Date();
                          const expires = new Date(checkedVoucher.expiresAt);
                          const diffTime = expires.getTime() - now.getTime();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          
                          if (diffDays < 0) {
                            return <span className="text-red-600 font-semibold">Expirovaný</span>;
                          } else if (diffDays === 0) {
                            return <span className="text-orange-600 font-semibold">Platný ešte dnes</span>;
                          } else if (diffDays === 1) {
                            return <span className="text-orange-600 font-semibold">Platný ešte 1 deň</span>;
                          } else if (diffDays < 30) {
                            return <span className="text-orange-600 font-semibold">Platný ešte {diffDays} dní</span>;
                          } else {
                            const diffMonths = Math.floor(diffDays / 30);
                            return <span className="text-green-600 font-semibold">Platný ešte {diffMonths} {diffMonths === 1 ? 'mesiac' : diffMonths < 5 ? 'mesiace' : 'mesiacov'}</span>;
                          }
                        })()}
                      </p>
                    )}
                  </div>

                  {checkedVoucher.status === "REDEEMED" && checkedVoucher.redeemedAt && (
                    <>
                      <div>
                        <p className="text-sm text-slate-600 mb-1">
                          Použitý dňa
                        </p>
                        <p className="font-semibold">
                          {new Date(checkedVoucher.redeemedAt).toLocaleDateString(
                            "sk-SK",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>

                      {checkedVoucher.redeemedByCustomer && (
                        <div>
                          <p className="text-sm text-slate-600 mb-1">
                            Použil zákazník
                          </p>
                          <p className="font-semibold">
                            {checkedVoucher.redeemedByCustomer.firstName}{" "}
                            {checkedVoucher.redeemedByCustomer.lastName}
                          </p>
                          <p className="text-sm text-slate-600">
                            {checkedVoucher.redeemedByCustomer.email}
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  <div className="md:col-span-2">
                    <p className="text-sm text-slate-600 mb-1">Stav</p>
                    <p className="font-semibold">
                      {checkedVoucher.status === "REDEEMED"
                        ? "✓ Voucher bol už použitý"
                        : checkedVoucher.status === "EXPIRED"
                        ? "✗ Voucher expiroval"
                        : checkedVoucher.status === "CANCELLED"
                        ? "✗ Voucher bol zrušený"
                        : "✓ Voucher je platný a môže byť použitý"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>
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
