"use client";

import { useState, useEffect, useCallback } from "react";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import {
  CheckCircle,
  XCircle,
  Ban,
  Check,
  UserX,
  Trash2,
  Filter,
} from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { usePermissions } from "@/lib/use-permissions";

interface Reservation {
  id: string;
  customerId: string | null;
  customer: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    street: string | null;
    city: string | null;
    phone: string | null;
  } | null;
  guestEmail: string | null;
  guestName: string | null;
  guestStreet: string | null;
  guestCity: string | null;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  notes: string | null;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses", color: "slate" },
  { value: "PENDING", label: "Pending", color: "yellow" },
  { value: "CONFIRMED", label: "Confirmed", color: "green" },
  { value: "REJECTED", label: "Rejected", color: "red" },
  { value: "CANCELLED", label: "Cancelled", color: "orange" },
  { value: "COMPLETED", label: "Completed", color: "blue" },
  { value: "NO_SHOW", label: "No Show", color: "gray" },
];

export default function ReservationsPage() {
  const { canDelete } = usePermissions();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [actionNotes, setActionNotes] = useState("");

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "ALL") {
        params.append("status", statusFilter);
      }
      if (dateFilter) {
        params.append("date", dateFilter);
      }

      const response = await fetch(`/api/reservations?${params.toString()}`);
      const data = await response.json();
      setReservations(data);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateFilter]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleStatusChange = async (
    reservationId: string,
    newStatus: string
  ) => {
    if (!confirm(`Are you sure you want to mark this reservation as ${newStatus}?`)) {
      return;
    }

    setActionInProgress(true);
    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          notes: actionNotes || undefined,
        }),
      });

      if (response.ok) {
        await fetchReservations();
        setShowDetailModal(false);
        setActionNotes("");
        alert(`Reservation ${newStatus.toLowerCase()} successfully!`);
      } else {
        alert("Failed to update reservation status");
      }
    } catch (error) {
      console.error("Error updating reservation:", error);
      alert("Failed to update reservation");
    } finally {
      setActionInProgress(false);
    }
  };

  const handleDelete = async (reservationId: string) => {
    if (!confirm("Are you sure you want to delete this reservation? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchReservations();
        setShowDetailModal(false);
        alert("Reservation deleted successfully");
      } else {
        alert("Failed to delete reservation");
      }
    } catch (error) {
      console.error("Error deleting reservation:", error);
      alert("Failed to delete reservation");
    }
  };

  const getStatusColor = (status: string) => {
    const option = STATUS_OPTIONS.find((opt) => opt.value === status);
    return option?.color || "slate";
  };

  const getStatusBadgeClass = (status: string) => {
    const colorMap: Record<string, string> = {
      yellow: "bg-yellow-100 text-yellow-800",
      green: "bg-green-100 text-green-800",
      red: "bg-red-100 text-red-800",
      orange: "bg-orange-100 text-orange-800",
      blue: "bg-blue-100 text-blue-800",
      gray: "bg-gray-100 text-gray-800",
      slate: "bg-slate-100 text-slate-800",
    };
    const color = getStatusColor(status);
    return colorMap[color] || colorMap.slate;
  };

  const getCustomerInfo = (reservation: Reservation) => {
    if (reservation.customer) {
      return {
        name: `${reservation.customer.firstName} ${reservation.customer.lastName}`,
        email: reservation.customer.email,
        isRegistered: true,
      };
    }
    return {
      name: reservation.guestName || "Unknown",
      email: reservation.guestEmail || "No email",
      isRegistered: false,
    };
  };

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Reservations</h1>
            <p className="text-slate-300 mt-2">
              Manage booking and reservation schedules
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-lg shadow p-4" style={{ backgroundColor: "#292929" }}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-300" />
              <span className="text-sm font-medium text-white">Filters:</span>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-white border-slate-600"
                style={{ backgroundColor: '#1f1f1f' }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-white"
                style={{ backgroundColor: '#1f1f1f' }}
                placeholder="Filter by date"
              />
            </div>
            {dateFilter && (
              <button
                onClick={() => setDateFilter("")}
                className="px-3 py-2 text-sm text-slate-300 hover:text-white"
              >
                Clear date
              </button>
            )}
          </div>
        </div>

        {/* Reservations Table */}
        <div className="rounded-lg shadow" style={{ backgroundColor: "#292929" }}>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              {statusFilter === "ALL" ? "All Reservations" : `${statusFilter} Reservations`}
              {dateFilter && ` on ${new Date(dateFilter).toLocaleDateString()}`}
            </h2>

            {loading ? (
              <div className="text-center py-8 text-slate-300">
                Loading reservations...
              </div>
            ) : reservations.length === 0 ? (
              <div className="text-center py-8 text-slate-300">
                No reservations found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: "#1f1f1f" }}>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-white">
                        Customer
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-white">
                        Scheduled
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-white">
                        Duration
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-white">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-white">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((reservation) => {
                      const customerInfo = getCustomerInfo(reservation);
                      return (
                        <tr
                          key={reservation.id}
                          className="border-b border-slate-700 hover:bg-slate-700"
                        >
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-white">
                                {customerInfo.name}
                                {!customerInfo.isRegistered && (
                                  <span className="ml-2 text-xs text-slate-400">(Guest)</span>
                                )}
                              </div>
                              <div className="text-sm text-slate-300">
                                {customerInfo.email}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-white">
                            {formatDateTime(new Date(reservation.scheduledAt))}
                          </td>
                          <td className="py-3 px-4 text-sm text-white">
                            {reservation.durationMinutes} min
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusBadgeClass(
                                reservation.status
                              )}`}
                            >
                              {reservation.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => {
                                setSelectedReservation(reservation);
                                setShowDetailModal(true);
                              }}
                              className="px-3 py-1 text-sm text-white hover:bg-slate-700 rounded"
                            >
                              View Details
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
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: "#292929" }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Reservation Details
                </h2>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setActionNotes("");
                  }}
                  className="text-slate-300 hover:text-white"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Customer Info */}
                <div>
                  <h3 className="text-sm font-medium text-white mb-2">
                    Customer Information
                  </h3>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: "#1f1f1f" }}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-300">Name</p>
                        <p className="font-medium text-white">
                          {getCustomerInfo(selectedReservation).name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-300">Email</p>
                        <p className="font-medium text-white">
                          {getCustomerInfo(selectedReservation).email}
                        </p>
                      </div>
                      {selectedReservation.customer?.phone && (
                        <div>
                          <p className="text-sm text-slate-300">Phone</p>
                          <p className="font-medium text-white">
                            {selectedReservation.customer.phone}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reservation Details */}
                <div>
                  <h3 className="text-sm font-medium text-white mb-2">
                    Reservation Details
                  </h3>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: "#1f1f1f" }}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-300">Scheduled At</p>
                        <p className="font-medium text-white">
                          {formatDateTime(new Date(selectedReservation.scheduledAt))}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-300">Duration</p>
                        <p className="font-medium text-white">
                          {selectedReservation.durationMinutes} minutes
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-300">Status</p>
                        <p>
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusBadgeClass(
                              selectedReservation.status
                            )}`}
                          >
                            {selectedReservation.status}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-300">Created</p>
                        <p className="font-medium text-white">
                          {formatDateTime(new Date(selectedReservation.createdAt))}
                        </p>
                      </div>
                    </div>
                    {selectedReservation.notes && (
                      <div className="mt-4">
                        <p className="text-sm text-slate-300">Notes</p>
                        <p className="font-medium text-white">
                          {selectedReservation.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Notes */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Action Notes (optional)
                  </label>
                  <textarea
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-white"
                    style={{ backgroundColor: "#1f1f1f" }}
                    rows={3}
                    placeholder="Add notes for rejection or cancellation..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-4">
                  {selectedReservation.status === "PENDING" && (
                    <>
                      <button
                        onClick={() =>
                          handleStatusChange(selectedReservation.id, "CONFIRMED")
                        }
                        disabled={actionInProgress}
                        className="flex items-center gap-2 px-4 py-2  text-white rounded-lg hover:brightness-90 transition-colors disabled:opacity-50" style={{ backgroundColor: "#c20003" }}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Confirm
                      </button>
                      <button
                        onClick={() =>
                          handleStatusChange(selectedReservation.id, "REJECTED")
                        }
                        disabled={actionInProgress}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}

                  {(selectedReservation.status === "PENDING" ||
                    selectedReservation.status === "CONFIRMED") && (
                    <button
                      onClick={() =>
                        handleStatusChange(selectedReservation.id, "CANCELLED")
                      }
                      disabled={actionInProgress}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                    >
                      <Ban className="w-4 h-4" />
                      Cancel
                    </button>
                  )}

                  {selectedReservation.status === "CONFIRMED" && (
                    <>
                      <button
                        onClick={() =>
                          handleStatusChange(selectedReservation.id, "COMPLETED")
                        }
                        disabled={actionInProgress}
                        className="flex items-center gap-2 px-4 py-2  text-white rounded-lg hover:brightness-90 transition-colors disabled:opacity-50" style={{ backgroundColor: "#c20003" }}
                      >
                        <Check className="w-4 h-4" />
                        Complete
                      </button>
                      <button
                        onClick={() =>
                          handleStatusChange(selectedReservation.id, "NO_SHOW")
                        }
                        disabled={actionInProgress}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                      >
                        <UserX className="w-4 h-4" />
                        No Show
                      </button>
                    </>
                  )}

                  {canDelete && (
                    <button
                      onClick={() => handleDelete(selectedReservation.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ml-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ProtectedLayout>
  );
}
