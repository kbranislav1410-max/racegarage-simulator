"use client";

import { useState, useEffect } from "react";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { Search, Plus, Eye, Trash2, X } from "lucide-react";
import { formatAddress, formatDate, formatDateTime } from "@/lib/format";

interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  street: string | null;
  city: string | null;
  phone: string | null;
  newsletter: boolean;
  createdAt: string;
}

interface CustomerDetail extends Customer {
  rideSessions: RideSession[];
}

interface RideSession {
  id: string;
  startAt: string;
  endAt: string | null;
  minutes: number;
  source: string;
  notes: string | null;
}

interface CustomerSummary {
  totalRides: number;
  totalMinutes: number;
  lastRide: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);
  const [customerSummary, setCustomerSummary] = useState<CustomerSummary | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    phone: "",
    newsletter: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
      });

      const response = await fetch(`/api/customers?${params}`);
      if (!response.ok) throw new Error("Failed to fetch customers");

      const data = await response.json();
      setCustomers(data.customers);
      setPagination(data.pagination);
    } catch (err) {
      setError("Failed to load customers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, search]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPagination({ ...pagination, page: 1 });
  };

  // Handle create customer
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setFormSubmitting(true);

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
          setFormErrors(errors);
        } else {
          setFormErrors({ general: error.error || "Failed to create customer" });
        }
        return;
      }

      // Reset form and close modal
      setFormData({
        email: "",
        firstName: "",
        lastName: "",
        street: "",
        city: "",
        phone: "",
        newsletter: false,
      });
      setShowCreateModal(false);
      fetchCustomers();
    } catch (err) {
      setFormErrors({ general: "An error occurred" });
      console.error(err);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle view customer detail
  const handleViewCustomer = async (customerId: string) => {
    try {
      const response = await fetch(`/api/customers/${customerId}`);
      if (!response.ok) throw new Error("Failed to fetch customer");

      const data = await response.json();
      setSelectedCustomer(data.customer);
      setCustomerSummary(data.summary);
      setShowDetailModal(true);
    } catch (err) {
      setError("Failed to load customer details");
      console.error(err);
    }
  };

  // Handle delete customer
  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm("Naozaj chcete odstrániť tohto zákazníka?")) return;

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete customer");

      fetchCustomers();
    } catch (err) {
      setError("Failed to delete customer");
      console.error(err);
    }
  };

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Zákazníci</h1>
            <p className="text-slate-300 mt-2">
              Spravujte zákaznícke účty a informácie
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:bg-opacity-90 transition-colors"
            style={{ backgroundColor: "#c20003" }}
          >
            <Plus className="w-4 h-4" />
            Pridať zákazníka
          </button>
        </div>

        {/* Search */}
        <div className="rounded-lg shadow p-4" style={{ backgroundColor: "#292929" }}>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Hľadať podľa mena, emailu alebo adresy..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
                style={{ backgroundColor: "#1f1f1f" }}
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 text-white rounded-lg hover:bg-opacity-90 transition-colors"
              style={{ backgroundColor: "#c20003" }}
            >
              Hľadať
            </button>
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSearchInput("");
                }}
                className="px-4 py-2 border border-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                Vymazať
              </button>
            )}
          </form>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Customer table */}
        <div className="rounded-lg shadow overflow-hidden" style={{ backgroundColor: "#292929" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-700" style={{ backgroundColor: "#1f1f1f" }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Meno
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Adresa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Telefón
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Akcie
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-300">
                      Načítavam...
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-300">
                      Nenašli sa žiadni zákazníci. Kliknite na &quot;Pridať zákazníka&quot; pre začatie.
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {customer.firstName} {customer.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-300">{customer.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-300">
                          {formatAddress(customer.street, customer.city)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-300">
                          {customer.phone || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewCustomer(customer.id)}
                            className="text-slate-300 hover:text-white p-1"
                            title="Zobraziť detaily"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Odstrániť"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between">
              <div className="text-sm text-slate-300">
                Zobrazených {(pagination.page - 1) * pagination.limit + 1} až{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} z{" "}
                {pagination.total} zákazníkov
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page - 1 })
                  }
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Predchádzajúce
                </button>
                <button
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page + 1 })
                  }
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border border-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ďalšie
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Create Customer Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: "#292929" }}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Pridať nového zákazníka</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-slate-400 hover:text-slate-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleCreateCustomer} className="space-y-4">
                  {formErrors.general && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {formErrors.general}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Meno *
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({ ...formData, firstName: e.target.value })
                        }
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white ${
                          formErrors.firstName ? "border-red-300" : "border-slate-600"
                        }`}
                        style={{ backgroundColor: "#1f1f1f" }}
                        required
                      />
                      {formErrors.firstName && (
                        <p className="text-red-400 text-sm mt-1">{formErrors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Priezvisko *
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white ${
                          formErrors.lastName ? "border-red-300" : "border-slate-600"
                        }`}
                        style={{ backgroundColor: "#1f1f1f" }}
                        required
                      />
                      {formErrors.lastName && (
                        <p className="text-red-400 text-sm mt-1">{formErrors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white ${
                        formErrors.email ? "border-red-300" : "border-slate-600"
                      }`}
                      style={{ backgroundColor: "#1f1f1f" }}
                      required
                    />
                    {formErrors.email && (
                      <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Ulica
                    </label>
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) =>
                        setFormData({ ...formData, street: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
                      style={{ backgroundColor: "#1f1f1f" }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Mesto
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
                      style={{ backgroundColor: "#1f1f1f" }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Telefón
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
                      style={{ backgroundColor: "#1f1f1f" }}
                    />
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: "#1f1f1f" }}>
                    <input
                      type="checkbox"
                      id="newsletter"
                      checked={formData.newsletter}
                      onChange={(e) =>
                        setFormData({ ...formData, newsletter: e.target.checked })
                      }
                      className="w-4 h-4 border-slate-600 rounded focus:ring-2 focus:ring-red-500"
                      style={{ accentColor: "#c20003" }}
                    />
                    <label htmlFor="newsletter" className="text-sm text-white cursor-pointer">
                      Zákazník má záujem o newsletter (propagačné materiály a novinky)
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="flex-1 px-6 py-2 text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: "#c20003" }}
                    >
                      {formSubmitting ? "Vytváram..." : "Vytvoriť zákazníka"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-6 py-2 border border-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      Zrušiť
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Customer Detail Modal */}
        {showDetailModal && selectedCustomer && customerSummary && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: "#292929" }}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    Detaily zákazníka
                  </h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-slate-400 hover:text-slate-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Basic Info */}
                <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: "#1f1f1f" }}>
                  <h3 className="font-semibold text-white mb-3">Základné informácie</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-400">Meno</p>
                      <p className="font-medium text-white">
                        {selectedCustomer.firstName} {selectedCustomer.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Email</p>
                      <p className="font-medium text-white">{selectedCustomer.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Adresa</p>
                      <p className="font-medium text-white">
                        {formatAddress(selectedCustomer.street, selectedCustomer.city)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Telefón</p>
                      <p className="font-medium text-white">{selectedCustomer.phone || "-"}</p>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="rounded-lg p-4" style={{ backgroundColor: "#1a3a52" }}>
                    <p className="text-sm text-blue-300 mb-1">Celkový počet jázd</p>
                    <p className="text-2xl font-bold text-blue-100">
                      {customerSummary.totalRides}
                    </p>
                  </div>
                  <div className="rounded-lg p-4" style={{ backgroundColor: "#1a4d2e" }}>
                    <p className="text-sm text-green-300 mb-1">Celkový počet minút</p>
                    <p className="text-2xl font-bold text-green-100">
                      {customerSummary.totalMinutes}
                    </p>
                  </div>
                  <div className="rounded-lg p-4" style={{ backgroundColor: "#4a1a4d" }}>
                    <p className="text-sm text-purple-300 mb-1">Posledná jazda</p>
                    <p className="text-sm font-medium text-purple-100">
                      {formatDate(customerSummary.lastRide)}
                    </p>
                  </div>
                </div>

                {/* Ride History */}
                <div>
                  <h3 className="font-semibold text-white mb-3">Nedávne jazdy</h3>
                  {selectedCustomer.rideSessions.length === 0 ? (
                    <p className="text-slate-300 text-center py-4">Zatiaľ žiadne jazdy</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedCustomer.rideSessions.map((ride) => (
                        <div
                          key={ride.id}
                          className="border border-slate-700 rounded-lg p-3"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-white">
                                {formatDateTime(ride.startAt)}
                              </p>
                              <p className="text-sm text-slate-300">
                                Trvanie: {ride.minutes} minút • Zdroj: {ride.source}
                              </p>
                              {ride.notes && (
                                <p className="text-sm text-slate-400 mt-1">
                                  {ride.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-6 py-2 border border-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    Zavrieť
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
