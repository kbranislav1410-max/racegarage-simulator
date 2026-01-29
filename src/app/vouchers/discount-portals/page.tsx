"use client";

import { useEffect, useState } from "react";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

interface PartnerVoucher {
  id: string;
  code: string;
  partner: string;
  status: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  rideDate: string;
  claimedAt: string | null;
  createdAt: string;
  session: {
    customer: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export default function DiscountPortalsPage() {
  const [vouchers, setVouchers] = useState<PartnerVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "UNCLAIMED" | "CLAIMED">("ALL");
  const [partnerFilter, setPartnerFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const response = await fetch("/api/partner-vouchers");
      if (!response.ok) throw new Error("Failed to fetch partner vouchers");
      const data = await response.json();
      setVouchers(data);
    } catch (error) {
      console.error("Error fetching partner vouchers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsClaimed = async (id: string) => {
    if (
      !confirm(
        "Naozaj chcete označiť tento voucher ako uplatnený? Táto akcia potvrdí, že ste dostali platbu od partnera."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/partner-vouchers?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CLAIMED" }),
      });

      if (!response.ok) throw new Error("Failed to update voucher");

      // Refresh list
      fetchVouchers();
    } catch (error) {
      console.error("Error updating voucher:", error);
      alert("Nepodarilo sa aktualizovať voucher");
    }
  };

  const handleMarkAsUnclaimed = async (id: string) => {
    if (
      !confirm(
        "Naozaj chcete označiť tento voucher ako neuplatnený?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/partner-vouchers?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "UNCLAIMED" }),
      });

      if (!response.ok) throw new Error("Failed to update voucher");

      // Refresh list
      fetchVouchers();
    } catch (error) {
      console.error("Error updating voucher:", error);
      alert("Nepodarilo sa aktualizovať voucher");
    }
  };

  const getPartnerName = (partner: string) => {
    switch (partner) {
      case "ZLAVOMAT":
        return "Zľavomat";
      case "ADROP":
        return "Adrop";
      case "NAJZAZITKY":
        return "Najzážitky";
      default:
        return partner;
    }
  };

  const filteredVouchers = vouchers.filter((voucher) => {
    if (filter !== "ALL" && voucher.status !== filter) return false;
    if (partnerFilter !== "ALL" && voucher.partner !== partnerFilter) return false;
    return true;
  });

  const unclaimedCount = vouchers.filter((v) => v.status === "UNCLAIMED").length;
  const claimedCount = vouchers.filter((v) => v.status === "CLAIMED").length;

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Zľavové portály</h1>
          <p className="text-slate-300 mt-2">
            Správa voucherov zakúpených cez partnerské portály
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="rounded-lg shadow" style={{ backgroundColor: "#292929" }}>
          <div className="border-b border-slate-700">
            <nav className="flex -mb-px">
              <a
                href="/vouchers"
                className="px-6 py-4 text-sm font-medium border-b-2 border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-600"
              >
                Moje vouchery
              </a>
              <a
                href="/vouchers/discount-portals"
                className="px-6 py-4 text-sm font-medium border-b-2 border-red-600 text-white"
              >
                Zľavové portály
              </a>
            </nav>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg shadow p-6" style={{ backgroundColor: "#292929" }}>
            <p className="text-sm text-slate-400">Celkom voucherov</p>
            <p className="text-3xl font-bold text-white">{vouchers.length}</p>
          </div>
          <div className="rounded-lg shadow p-6" style={{ backgroundColor: "#292929" }}>
            <p className="text-sm text-slate-400">Neuplatnené</p>
            <p className="text-3xl font-bold text-orange-400">{unclaimedCount}</p>
          </div>
          <div className="rounded-lg shadow p-6" style={{ backgroundColor: "#292929" }}>
            <p className="text-sm text-slate-400">Uplatnené</p>
            <p className="text-3xl font-bold text-green-400">{claimedCount}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-lg shadow p-4" style={{ backgroundColor: "#292929" }}>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Stav
              </label>
              <select
                value={filter}
                onChange={(e) =>
                  setFilter(e.target.value as "ALL" | "UNCLAIMED" | "CLAIMED")
                }
                className="rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                style={{ backgroundColor: '#292929', border: 'none' }}
              >
                <option value="ALL">Všetky</option>
                <option value="UNCLAIMED">Neuplatnené</option>
                <option value="CLAIMED">Uplatnené</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Partner
              </label>
              <select
                value={partnerFilter}
                onChange={(e) => setPartnerFilter(e.target.value)}
                className="rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                style={{ backgroundColor: '#292929', border: 'none' }}
              >
                <option value="ALL">Všetci partneri</option>
                <option value="ZLAVOMAT">Zľavomat</option>
                <option value="ADROP">Adrop</option>
                <option value="NAJZAZITKY">Najzážitky</option>
              </select>
            </div>
          </div>
        </div>

        {/* Vouchers Table */}
        <div className="rounded-lg shadow overflow-hidden" style={{ backgroundColor: "#292929" }}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead style={{ backgroundColor: "#1f1f1f" }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Kód voucheru
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Partner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Zákazník
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Dátum jazdy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Stav
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Uplatnené dňa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Akcie
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredVouchers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-4 text-center text-slate-400"
                    >
                      Žiadne vouchery
                    </td>
                  </tr>
                ) : (
                  filteredVouchers.map((voucher) => (
                    <tr key={voucher.id} className="hover:bg-slate-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm font-semibold text-white">
                          {voucher.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getPartnerName(voucher.partner)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-white">
                            {voucher.customerName}
                          </div>
                          <div className="text-slate-400">
                            {voucher.customerEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {new Date(voucher.rideDate).toLocaleDateString("sk-SK", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {voucher.status === "UNCLAIMED" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <XCircle className="h-3 w-3 mr-1" />
                            Neuplatnený
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Uplatnený
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {voucher.claimedAt
                          ? new Date(voucher.claimedAt).toLocaleDateString(
                              "sk-SK",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {voucher.status === "UNCLAIMED" ? (
                          <button
                            onClick={() => handleMarkAsClaimed(voucher.id)}
                            className="text-green-400 hover:text-green-300 font-medium"
                          >
                            Označiť ako uplatnený
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMarkAsUnclaimed(voucher.id)}
                            className="text-orange-400 hover:text-orange-300 font-medium"
                          >
                            Označiť ako neuplatnený
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Help Text */}
        <div className="border rounded-lg p-4" style={{ backgroundColor: "#1f1f1f", borderColor: "#3b82f6" }}>
          <h3 className="text-sm font-semibold text-blue-400 mb-2">
            Ako to funguje:
          </h3>
          <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
            <li>
              Keď zákazník použije voucher z partnerského portálu, zobrazí sa tu ako{" "}
              <strong>Neuplatnený</strong>
            </li>
            <li>
              Po tom, čo si uplatníte voucher u partnera a dostanete platbu, označte ho
              ako <strong>Uplatnený</strong>
            </li>
            <li>
              Systém automaticky zaznamená dátum a čas uplatnenia
            </li>
          </ul>
        </div>
      </div>
    </ProtectedLayout>
  );
}
