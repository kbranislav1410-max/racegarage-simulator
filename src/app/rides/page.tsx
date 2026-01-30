"use client";

import { useState, useEffect, useCallback } from "react";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { Search, Plus, X, Download, Calendar, Trash2 } from "lucide-react";
import { formatAddress } from "@/lib/format";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  street: string | null;
  city: string | null;
}

interface Ride {
  id: string;
  startAt: string;
  endAt: string | null;
  minutes: number;
  source: string;
  notes: string | null;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function RidesPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [dateFrom, setDateFrom] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [dateTo, setDateTo] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Record Ride Modal State
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [step, setStep] = useState<"search" | "form">("search");
  
  // Customer Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Create Customer Modal
  const [showCreateCustomerModal, setShowCreateCustomerModal] = useState(false);
  const [customerFormData, setCustomerFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    phone: "",
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
    // Payment fields
    amount: "",
    paymentMethod: "PD_DRIVE_CLUB" as "PD_DRIVE_CLUB" | "VOUCHER_PARTNER" | "VOUCHER_RACEGARAGE" | "VOUCHER_PD_DRIVE_CLUB",
  });
  const [rideFormErrors, setRideFormErrors] = useState<Record<string, string>>({});
  const [rideFormSubmitting, setRideFormSubmitting] = useState(false);

  // Fetch rides for selected date range
  const fetchRides = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`/api/rides?dateFrom=${dateFrom}&dateTo=${dateTo}`);
      if (!response.ok) throw new Error("Failed to fetch rides");

      const data = await response.json();
      setRides(data.rides);
    } catch (err) {
      setError("Failed to load rides");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  // Search customers (debounced)
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const response = await fetch(
          `/api/customers/search?q=${encodeURIComponent(searchQuery)}`
        );
        if (!response.ok) throw new Error("Search failed");

        const data = await response.json();
        setSearchResults(data.customers);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle customer selection
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setStep("form");
    setSearchQuery("");
    setSearchResults([]);
  };

  // Handle create customer
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
        if (error.details) {
          const errors: Record<string, string> = {};
          Object.keys(error.details).forEach((key) => {
            if (key !== "_errors") {
              errors[key] = error.details[key]._errors[0] || "Invalid value";
            }
          });
          setCustomerFormErrors(errors);
        } else {
          setCustomerFormErrors({ general: error.error || "Failed to create customer" });
        }
        return;
      }

      const newCustomer = await response.json();
      
      // Select the newly created customer
      setSelectedCustomer(newCustomer);
      setStep("form");
      setShowCreateCustomerModal(false);
      setCustomerFormData({
        email: "",
        firstName: "",
        lastName: "",
        street: "",
        city: "",
        phone: "",
      });
    } catch (err) {
      setCustomerFormErrors({ general: "An error occurred" });
      console.error(err);
    } finally {
      setCustomerFormSubmitting(false);
    }
  };

  // Handle record ride
  const handleRecordRide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    setRideFormErrors({});
    setRideFormSubmitting(true);

    try {
      // Combine date and time to create startAt datetime
      const startAt = new Date(`${rideFormData.date}T${rideFormData.time}`).toISOString();

      // Create ride session
      const rideResponse = await fetch("/api/rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          startAt,
          minutes: rideFormData.minutes,
          source: rideFormData.paymentMethod === "VOUCHER_PARTNER" ? "VOUCHER_PARTNER" : "RESERVATION", // Set correct source for partner vouchers
          partner: rideFormData.paymentMethod === "VOUCHER_PARTNER" && rideFormData.partner ? rideFormData.partner : undefined,
          voucherCode: (rideFormData.paymentMethod === "VOUCHER_PARTNER" || rideFormData.paymentMethod === "VOUCHER_RACEGARAGE" || rideFormData.paymentMethod === "VOUCHER_PD_DRIVE_CLUB") && rideFormData.voucherCode ? rideFormData.voucherCode : undefined,
          notes: rideFormData.notes || undefined,
          // Add payment fields
          amountEur: rideFormData.amount && parseFloat(rideFormData.amount) > 0 ? parseFloat(rideFormData.amount) : undefined,
          paymentMethod: rideFormData.amount && parseFloat(rideFormData.amount) > 0 ? rideFormData.paymentMethod : undefined,
        }),
      });

      if (!rideResponse.ok) {
        const error = await rideResponse.json();
        if (error.details) {
          const errors: Record<string, string> = {};
          Object.keys(error.details).forEach((key) => {
            if (key !== "_errors") {
              errors[key] = error.details[key]._errors[0] || "Invalid value";
            }
          });
          setRideFormErrors(errors);
        } else {
          setRideFormErrors({ general: error.error || "Failed to record ride" });
        }
        return;
      }

      const ride = await rideResponse.json();

      // Payment is now created by the API automatically
      // No need for duplicate payment creation here

      // Reset and close modal
      setShowRecordModal(false);
      setStep("search");
      setSelectedCustomer(null);
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
      
      // Refresh rides list
      fetchRides();
    } catch (err) {
      setRideFormErrors({ general: "An error occurred" });
      console.error(err);
    } finally {
      setRideFormSubmitting(false);
    }
  };

  // Handle export CSV
  const handleExportCSV = () => {
    window.open(`/api/rides/export?dateFrom=${dateFrom}&dateTo=${dateTo}`, "_blank");
  };

  // Handle delete ride
  const handleDeleteRide = async (rideId: string) => {
    if (!confirm("Naozaj chcete odstrániť túto jazdu?")) return;

    try {
      const response = await fetch(`/api/rides/${rideId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete ride");

      fetchRides();
    } catch (err) {
      setError("Nepodarilo sa odstrániť jazdu");
      console.error(err);
    }
  };

  // Reset modal
  const resetModal = () => {
    setShowRecordModal(false);
    setStep("search");
    setSelectedCustomer(null);
    setSearchQuery("");
    setSearchResults([]);
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
  };

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Jazdy
            </h1>
            <p className="text-slate-300 mt-2">
              Sledovanie a správa jázd simulátora
            </p>
          </div>
          <button
            onClick={() => setShowRecordModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:brightness-90 transition-colors"
            style={{ backgroundColor: "#c20003" }}
          >
            <Plus className="w-4 h-4" />
            Nová jazda
          </button>
        </div>

        {/* Date Range Filter & Export */}
        <div className="rounded-lg shadow p-4 flex items-center gap-4" style={{ backgroundColor: "#292929" }}>
          <div className="flex items-center gap-4 flex-1">
            <Calendar className="w-5 h-5 text-white" />
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-white">Od:</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-4 py-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
                style={{ backgroundColor: "#1f1f1f", border: "none" }}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-white">Do:</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-4 py-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
                style={{ backgroundColor: "#1f1f1f", border: "none" }}
              />
            </div>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:brightness-90 transition-colors"
            style={{ backgroundColor: "#c20003" }}
          >
            <Download className="w-4 h-4" />
            Exportovať CSV
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Rides Table */}
        <div className="rounded-lg shadow overflow-hidden" style={{ backgroundColor: "#292929" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-700" style={{ backgroundColor: "#1f1f1f" }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Dátum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Čas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Zákazník
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Minúty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Poznámky
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Akcie
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      Načítavam...
                    </td>
                  </tr>
                ) : rides.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      Žiadne jazdy pre obdobie {dateFrom} - {dateTo}. Kliknite &quot;Záznam jazdy&quot; pre pridanie.
                    </td>
                  </tr>
                ) : (
                  rides.map((ride) => (
                    <tr key={ride.id} className="hover:bg-slate-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {new Date(ride.startAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {new Date(ride.startAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-white">
                          {ride.customer.firstName} {ride.customer.lastName}
                        </div>
                        <div className="text-sm text-slate-400">{ride.customer.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-300">{ride.minutes} min</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-300">{ride.notes || "-"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleDeleteRide(ride.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Odstrániť jazdu"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Record Ride Modal */}
        {showRecordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: "#292929" }}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {step === "search" ? "Výber zákazníka" : "Záznam jazdy"}
                  </h2>
                  <button
                    onClick={resetModal}
                    className="text-slate-400 hover:text-slate-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {step === "search" ? (
                  <div className="space-y-4">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Hľadať podľa mena, emailu, alebo adresy..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-white"
                        style={{ backgroundColor: "#1f1f1f" }}
                        autoFocus
                      />
                    </div>

                    {/* Search Results */}
                    {searchLoading && (
                      <div className="text-center py-4 text-slate-400">
                        Hľadám...
                      </div>
                    )}

                    {!searchLoading && searchResults.length > 0 && (
                      <div className="rounded-lg max-h-96 overflow-y-auto" style={{ backgroundColor: "#1f1f1f" }}>
                        {searchResults.map((customer) => (
                          <button
                            key={customer.id}
                            onClick={() => handleSelectCustomer(customer)}
                            className="w-full px-4 py-3 text-left hover:brightness-90 transition-colors"
                          >
                            <div className="font-medium text-white">
                              {customer.firstName} {customer.lastName}
                            </div>
                            <div className="text-sm text-slate-300">{customer.email}</div>
                            {(customer.street || customer.city) && (
                              <div className="text-sm text-slate-400">
                                {formatAddress(customer.street, customer.city)}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {!searchLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-slate-300 mb-4">Nenašli sa žiadni zákazníci</p>
                        <button
                          onClick={() => setShowCreateCustomerModal(true)}
                          className="px-4 py-2 text-white rounded-lg transition-colors"
                          style={{ backgroundColor: "#c20003" }}
                        >
                          Vytvoriť nového zákazníka
                        </button>
                      </div>
                    )}

                    {searchQuery.length < 2 && (
                      <div className="text-center py-8 text-slate-400">
                        Začnite písať pre vyhľadanie zákazníkov...
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleRecordRide} className="space-y-4">
                    {/* Selected Customer */}
                    <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: "#1f1f1f" }}>
                      <p className="text-sm text-slate-300 mb-1">Zákazník</p>
                      <p className="font-medium text-white">
                        {selectedCustomer?.firstName} {selectedCustomer?.lastName}
                      </p>
                      <p className="text-sm text-slate-300">{selectedCustomer?.email}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setStep("search");
                          setSelectedCustomer(null);
                        }}
                        className="text-sm text-slate-300 hover:text-white mt-2"
                      >
                        Zmeniť zákazníka
                      </button>
                    </div>

                    {rideFormErrors.general && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {rideFormErrors.general}
                      </div>
                    )}

                    {/* Date and Time in separate fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Dátum *
                        </label>
                        <input
                          type="date"
                          value={rideFormData.date}
                          onChange={(e) =>
                            setRideFormData({ ...rideFormData, date: e.target.value })
                          }
                          className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
                          style={{ backgroundColor: "#1f1f1f", border: "none" }}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Čas jazdy *
                        </label>
                        <input
                          type="time"
                          value={rideFormData.time}
                          onChange={(e) =>
                            setRideFormData({ ...rideFormData, time: e.target.value })
                          }
                          className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
                          style={{ backgroundColor: "#1f1f1f", border: "none" }}
                          required
                        />
                      </div>
                    </div>

                    {/* Payment Section */}
                    <div className="border-t border-slate-700 pt-4 mt-4">
                      <h3 className="text-sm font-medium text-white mb-4">Platba</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Suma (€)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={rideFormData.amount}
                            onChange={(e) =>
                              setRideFormData({ ...rideFormData, amount: e.target.value })
                            }
                            className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
                            style={{ backgroundColor: "#1f1f1f", border: "none" }}
                            placeholder="0.00"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Metóda platby
                          </label>
                          <select
                            value={rideFormData.paymentMethod}
                            onChange={(e) =>
                              setRideFormData({
                                ...rideFormData,
                                paymentMethod: e.target.value as typeof rideFormData.paymentMethod,
                                partner: "", // Reset partner when payment method changes
                                voucherCode: "", // Reset voucher code when payment method changes
                              })
                            }
                            className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
                            style={{ backgroundColor: "#1f1f1f", border: "none" }}
                          >
                            <option value="PD_DRIVE_CLUB">PD Drive Club</option>
                            <option value="VOUCHER_PARTNER">Poukaz - Partner</option>
                            <option value="VOUCHER_RACEGARAGE">Poukaz - Racegarage</option>
                            <option value="VOUCHER_PD_DRIVE_CLUB">Poukaz - PD Drive club</option>
                          </select>
                        </div>
                      </div>

                      {/* Partner selection - shown only for VOUCHER_PARTNER */}
                      {rideFormData.paymentMethod === "VOUCHER_PARTNER" && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-white mb-2">
                            Partner *
                          </label>
                          <select
                            value={rideFormData.partner}
                            onChange={(e) =>
                              setRideFormData({
                                ...rideFormData,
                                partner: e.target.value as typeof rideFormData.partner,
                              })
                            }
                            className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
                            style={{ backgroundColor: "#1f1f1f", border: "none" }}
                            required
                          >
                            <option value="">Vyberte partnera...</option>
                            <option value="ZLAVOMAT">Zľavomat</option>
                            <option value="ADROP">Adrop</option>
                            <option value="NAJZAZITKY">Najzážitky</option>
                          </select>
                        </div>
                      )}

                      {/* Voucher Code - shown for voucher payment methods */}
                      {(rideFormData.paymentMethod === "VOUCHER_PARTNER" || 
                        rideFormData.paymentMethod === "VOUCHER_RACEGARAGE" || 
                        rideFormData.paymentMethod === "VOUCHER_PD_DRIVE_CLUB") && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-white mb-2">
                            Číslo poukazu {rideFormData.paymentMethod === "VOUCHER_PARTNER" ? "*" : ""}
                          </label>
                          <input
                            type="text"
                            value={rideFormData.voucherCode}
                            onChange={(e) =>
                              setRideFormData({ ...rideFormData, voucherCode: e.target.value })
                            }
                            className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
                            style={{ backgroundColor: "#1f1f1f", border: "none" }}
                            placeholder="Zadajte číslo poukazu"
                            required={rideFormData.paymentMethod === "VOUCHER_PARTNER"}
                          />
                        </div>
                      )}
                    </div>

                    {/* Minutes */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Minúty *
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={rideFormData.minutes}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value > 0) {
                            setRideFormData({ ...rideFormData, minutes: value });
                          }
                        }}
                        className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
                        style={{ backgroundColor: "#1f1f1f", border: "none" }}
                        required
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Poznámka
                      </label>
                      <textarea
                        value={rideFormData.notes}
                        onChange={(e) =>
                          setRideFormData({ ...rideFormData, notes: e.target.value })
                        }
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
                        style={{ backgroundColor: "#1f1f1f", border: "none" }}
                        placeholder="Voliteľná poznámka k jazde..."
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={rideFormSubmitting}
                        className="flex-1 px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: "#c20003" }}
                      >
                        {rideFormSubmitting ? "Ukladám..." : "Zaznamenať jazdu"}
                      </button>
                      <button
                        type="button"
                        onClick={resetModal}
                        className="px-6 py-2 border border-slate-600 rounded-lg hover:brightness-90 transition-colors text-white"
                      >
                        Zrušiť
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create Customer Modal */}
        {showCreateCustomerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: "#292929" }}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Vytvoriť zákazníka</h2>
                  <button
                    onClick={() => setShowCreateCustomerModal(false)}
                    className="text-slate-400 hover:text-slate-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleCreateCustomer} className="space-y-4">
                  {customerFormErrors.general && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {customerFormErrors.general}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Meno *
                      </label>
                      <input
                        type="text"
                        value={customerFormData.firstName}
                        onChange={(e) =>
                          setCustomerFormData({ ...customerFormData, firstName: e.target.value })
                        }
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-white ${
                          customerFormErrors.firstName ? "border-red-300" : "border-slate-600"
                        }`}
                        style={{ backgroundColor: "#1f1f1f" }}
                        required
                      />
                      {customerFormErrors.firstName && (
                        <p className="text-red-600 text-sm mt-1">{customerFormErrors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Priezvisko *
                      </label>
                      <input
                        type="text"
                        value={customerFormData.lastName}
                        onChange={(e) =>
                          setCustomerFormData({ ...customerFormData, lastName: e.target.value })
                        }
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-white ${
                          customerFormErrors.lastName ? "border-red-300" : "border-slate-600"
                        }`}
                        style={{ backgroundColor: "#1f1f1f" }}
                        required
                      />
                      {customerFormErrors.lastName && (
                        <p className="text-red-600 text-sm mt-1">{customerFormErrors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={customerFormData.email}
                      onChange={(e) =>
                        setCustomerFormData({ ...customerFormData, email: e.target.value })
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-white ${
                        customerFormErrors.email ? "border-red-300" : "border-slate-600"
                      }`}
                      style={{ backgroundColor: "#1f1f1f" }}
                      required
                    />
                    {customerFormErrors.email && (
                      <p className="text-red-600 text-sm mt-1">{customerFormErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Ulica
                    </label>
                    <input
                      type="text"
                      value={customerFormData.street}
                      onChange={(e) =>
                        setCustomerFormData({ ...customerFormData, street: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-white"
                      style={{ backgroundColor: "#1f1f1f" }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Mesto
                    </label>
                    <input
                      type="text"
                      value={customerFormData.city}
                      onChange={(e) =>
                        setCustomerFormData({ ...customerFormData, city: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-white"
                      style={{ backgroundColor: "#1f1f1f" }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Telefón
                    </label>
                    <input
                      type="tel"
                      value={customerFormData.phone}
                      onChange={(e) =>
                        setCustomerFormData({ ...customerFormData, phone: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-white"
                      style={{ backgroundColor: "#1f1f1f" }}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={customerFormSubmitting}
                      className="flex-1 px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: "#c20003" }}
                    >
                      {customerFormSubmitting ? "Vytváram..." : "Vytvoriť a vybrať"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateCustomerModal(false)}
                      className="px-6 py-2 border border-slate-600 rounded-lg hover:brightness-90 transition-colors text-white"
                    >
                      Zrušiť
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
