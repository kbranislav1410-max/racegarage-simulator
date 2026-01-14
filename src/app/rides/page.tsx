"use client";

import { useState, useEffect, useCallback } from "react";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { Search, Plus, X, Download, Calendar } from "lucide-react";
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
  const [selectedDate, setSelectedDate] = useState<string>(
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
    startAt: new Date().toISOString().slice(0, 16),
    minutes: 30,
    source: "ON_SITE" as "ON_SITE" | "RESERVATION" | "VOUCHER" | "PREPAID",
    notes: "",
    // Payment fields
    amount: "",
    paymentMethod: "CASH_ON_SITE" as "CASH_ON_SITE" | "CARD_ON_SITE" | "VOUCHER_PORTAL" | "PREPAID",
  });
  const [rideFormErrors, setRideFormErrors] = useState<Record<string, string>>({});
  const [rideFormSubmitting, setRideFormSubmitting] = useState(false);

  // Fetch rides for selected date
  const fetchRides = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`/api/rides?date=${selectedDate}`);
      if (!response.ok) throw new Error("Failed to fetch rides");

      const data = await response.json();
      setRides(data.rides);
    } catch (err) {
      setError("Failed to load rides");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

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
      // Create ride session
      const rideResponse = await fetch("/api/rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          startAt: new Date(rideFormData.startAt).toISOString(),
          minutes: rideFormData.minutes,
          source: rideFormData.source,
          notes: rideFormData.notes || undefined,
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

      // Create payment record if amount is provided
      if (rideFormData.amount && parseFloat(rideFormData.amount) > 0) {
        const amountCents = Math.round(parseFloat(rideFormData.amount) * 100);
        
        // Determine receiver based on payment method
        let receiver: "FRIEND" | "ME";
        if (rideFormData.paymentMethod === "CASH_ON_SITE" || rideFormData.paymentMethod === "CARD_ON_SITE") {
          receiver = "FRIEND";
        } else {
          receiver = "ME";
        }

        await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amountCents,
            currency: "EUR",
            method: rideFormData.paymentMethod,
            receiver,
            customerId: selectedCustomer.id,
            sessionId: ride.id,
          }),
        });
      }

      // Reset and close modal
      setShowRecordModal(false);
      setStep("search");
      setSelectedCustomer(null);
      setRideFormData({
        startAt: new Date().toISOString().slice(0, 16),
        minutes: 30,
        source: "ON_SITE",
        notes: "",
        amount: "",
        paymentMethod: "CASH_ON_SITE",
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
    window.open(`/api/rides/export?date=${selectedDate}`, "_blank");
  };

  // Reset modal
  const resetModal = () => {
    setShowRecordModal(false);
    setStep("search");
    setSelectedCustomer(null);
    setSearchQuery("");
    setSearchResults([]);
    setRideFormData({
      startAt: new Date().toISOString().slice(0, 16),
      minutes: 30,
      source: "ON_SITE",
      notes: "",
      amount: "",
      paymentMethod: "CASH_ON_SITE",
    });
  };

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Simulator Rides
            </h1>
            <p className="text-slate-600 mt-2">
              Track and manage simulator ride sessions
            </p>
          </div>
          <button
            onClick={() => setShowRecordModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Record Ride
          </button>
        </div>

        {/* Date Filter & Export */}
        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Calendar className="w-5 h-5 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Rides Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Minutes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      Loading...
                    </td>
                  </tr>
                ) : rides.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No rides recorded for {selectedDate}. Click &quot;Record Ride&quot; to add one.
                    </td>
                  </tr>
                ) : (
                  rides.map((ride) => (
                    <tr key={ride.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">
                          {new Date(ride.startAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">
                          {ride.customer.firstName} {ride.customer.lastName}
                        </div>
                        <div className="text-sm text-slate-500">{ride.customer.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600">{ride.minutes} min</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                          {ride.source}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">{ride.notes || "-"}</div>
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
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">
                    {step === "search" ? "Select Customer" : "Record Ride"}
                  </h2>
                  <button
                    onClick={resetModal}
                    className="text-slate-400 hover:text-slate-600"
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
                        placeholder="Search by name, email, or address..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        autoFocus
                      />
                    </div>

                    {/* Search Results */}
                    {searchLoading && (
                      <div className="text-center py-4 text-slate-500">
                        Searching...
                      </div>
                    )}

                    {!searchLoading && searchResults.length > 0 && (
                      <div className="border border-slate-200 rounded-lg divide-y divide-slate-200 max-h-96 overflow-y-auto">
                        {searchResults.map((customer) => (
                          <button
                            key={customer.id}
                            onClick={() => handleSelectCustomer(customer)}
                            className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                          >
                            <div className="font-medium text-slate-900">
                              {customer.firstName} {customer.lastName}
                            </div>
                            <div className="text-sm text-slate-600">{customer.email}</div>
                            {(customer.street || customer.city) && (
                              <div className="text-sm text-slate-500">
                                {formatAddress(customer.street, customer.city)}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {!searchLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-slate-600 mb-4">No customers found</p>
                        <button
                          onClick={() => setShowCreateCustomerModal(true)}
                          className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
                        >
                          Create New Customer
                        </button>
                      </div>
                    )}

                    {searchQuery.length < 2 && (
                      <div className="text-center py-8 text-slate-500">
                        Start typing to search for customers...
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleRecordRide} className="space-y-4">
                    {/* Selected Customer */}
                    <div className="bg-slate-50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-slate-600 mb-1">Customer</p>
                      <p className="font-medium text-slate-900">
                        {selectedCustomer?.firstName} {selectedCustomer?.lastName}
                      </p>
                      <p className="text-sm text-slate-600">{selectedCustomer?.email}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setStep("search");
                          setSelectedCustomer(null);
                        }}
                        className="text-sm text-slate-600 hover:text-slate-800 mt-2"
                      >
                        Change customer
                      </button>
                    </div>

                    {rideFormErrors.general && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {rideFormErrors.general}
                      </div>
                    )}

                    {/* Date/Time */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Date & Time *
                      </label>
                      <input
                        type="datetime-local"
                        value={rideFormData.startAt}
                        onChange={(e) =>
                          setRideFormData({ ...rideFormData, startAt: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Minutes */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Minutes *
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
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Source */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Source *
                      </label>
                      <select
                        value={rideFormData.source}
                        onChange={(e) =>
                          setRideFormData({
                            ...rideFormData,
                            source: e.target.value as typeof rideFormData.source,
                          })
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        required
                      >
                        <option value="ON_SITE">On Site</option>
                        <option value="RESERVATION">Reservation</option>
                        <option value="VOUCHER">Voucher</option>
                        <option value="PREPAID">Prepaid</option>
                      </select>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Notes
                      </label>
                      <textarea
                        value={rideFormData.notes}
                        onChange={(e) =>
                          setRideFormData({ ...rideFormData, notes: e.target.value })
                        }
                        rows={3}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        placeholder="Optional notes about this ride..."
                      />
                    </div>

                    {/* Payment Section */}
                    <div className="border-t border-slate-200 pt-4 mt-4">
                      <h3 className="text-sm font-medium text-slate-700 mb-4">Payment</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Amount (EUR)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={rideFormData.amount}
                            onChange={(e) =>
                              setRideFormData({ ...rideFormData, amount: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                            placeholder="0.00"
                          />
                          <p className="text-xs text-slate-500 mt-1">Leave empty if no payment</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Payment Method
                          </label>
                          <select
                            value={rideFormData.paymentMethod}
                            onChange={(e) =>
                              setRideFormData({
                                ...rideFormData,
                                paymentMethod: e.target.value as typeof rideFormData.paymentMethod,
                              })
                            }
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                          >
                            <option value="CASH_ON_SITE">Cash (→ Friend)</option>
                            <option value="CARD_ON_SITE">Card (→ Friend)</option>
                            <option value="VOUCHER_PORTAL">Voucher (→ Me)</option>
                            <option value="PREPAID">Prepaid (→ Me)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={rideFormSubmitting}
                        className="flex-1 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {rideFormSubmitting ? "Recording..." : "Record Ride"}
                      </button>
                      <button
                        type="button"
                        onClick={resetModal}
                        className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        Cancel
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
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">Create Customer</h2>
                  <button
                    onClick={() => setShowCreateCustomerModal(false)}
                    className="text-slate-400 hover:text-slate-600"
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
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={customerFormData.firstName}
                        onChange={(e) =>
                          setCustomerFormData({ ...customerFormData, firstName: e.target.value })
                        }
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                          customerFormErrors.firstName ? "border-red-300" : "border-slate-300"
                        }`}
                        required
                      />
                      {customerFormErrors.firstName && (
                        <p className="text-red-600 text-sm mt-1">{customerFormErrors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={customerFormData.lastName}
                        onChange={(e) =>
                          setCustomerFormData({ ...customerFormData, lastName: e.target.value })
                        }
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                          customerFormErrors.lastName ? "border-red-300" : "border-slate-300"
                        }`}
                        required
                      />
                      {customerFormErrors.lastName && (
                        <p className="text-red-600 text-sm mt-1">{customerFormErrors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={customerFormData.email}
                      onChange={(e) =>
                        setCustomerFormData({ ...customerFormData, email: e.target.value })
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                        customerFormErrors.email ? "border-red-300" : "border-slate-300"
                      }`}
                      required
                    />
                    {customerFormErrors.email && (
                      <p className="text-red-600 text-sm mt-1">{customerFormErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Street
                    </label>
                    <input
                      type="text"
                      value={customerFormData.street}
                      onChange={(e) =>
                        setCustomerFormData({ ...customerFormData, street: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={customerFormData.city}
                      onChange={(e) =>
                        setCustomerFormData({ ...customerFormData, city: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={customerFormData.phone}
                      onChange={(e) =>
                        setCustomerFormData({ ...customerFormData, phone: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={customerFormSubmitting}
                      className="flex-1 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {customerFormSubmitting ? "Creating..." : "Create & Select"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateCustomerModal(false)}
                      className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancel
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
