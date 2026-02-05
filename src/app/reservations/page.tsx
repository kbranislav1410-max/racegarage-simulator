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
  Eye,
  Calendar,
  Clock,
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
  { value: "ALL", label: "Všetky stavy", color: "slate" },
  { value: "PENDING", label: "Čakajúce", color: "yellow" },
  { value: "CONFIRMED", label: "Potvrdené", color: "green" },
  { value: "REJECTED", label: "Zamietnuté", color: "red" },
  { value: "CANCELLED", label: "Zrušené", color: "orange" },
  { value: "COMPLETED", label: "Dokončené", color: "blue" },
  { value: "NO_SHOW", label: "Neprišiel", color: "gray" },
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
  
  // Reschedule modal state
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleReservation, setRescheduleReservation] = useState<Reservation | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSlot, setRescheduleSlot] = useState("");
  const [availableSlots, setAvailableSlots] = useState<Array<{
    time: string;
    available: boolean;
    isPast: boolean;
  }>>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

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
    if (!confirm(`Ste si istí, že chcete označiť túto rezerváciu ako ${newStatus}?`)) {
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
        alert(`Rezervácia ${newStatus.toLowerCase()} úspešne!`);
      } else {
        alert("Nepodarilo sa aktualizovať stav rezervácie");
      }
    } catch (error) {
      console.error("Error updating reservation:", error);
      alert("Nepodarilo sa aktualizovať rezerváciu");
    } finally {
      setActionInProgress(false);
    }
  };

  const handleDelete = async (reservationId: string) => {
    if (!confirm("Ste si istí, že chcete vymazať túto rezerváciu? Túto akciu nie je možné vrátiť späť.")) {
      return;
    }

    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchReservations();
        setShowDetailModal(false);
        alert("Rezervácia bola úspešne vymazaná");
      } else {
        alert("Nepodarilo sa vymazať rezerváciu");
      }
    } catch (error) {
      console.error("Error deleting reservation:", error);
      alert("Nepodarilo sa vymazať rezerváciu");
    }
  };

  // Quick action handlers for table buttons
  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowDetailModal(true);
  };

  const handleQuickApprove = async (reservationId: string) => {
    if (confirm("Schváliť túto rezerváciu?")) {
      await handleStatusChange(reservationId, "CONFIRMED");
    }
  };

  const handleQuickCancel = async (reservationId: string) => {
    if (confirm("Zrušiť túto rezerváciu?")) {
      await handleStatusChange(reservationId, "CANCELLED");
    }
  };

  // Reschedule modal handlers
  const handleOpenReschedule = (reservation: Reservation) => {
    setRescheduleReservation(reservation);
    setRescheduleDate("");
    setRescheduleSlot("");
    setAvailableSlots([]);
    setShowRescheduleModal(true);
  };

  const fetchAvailableSlotsForReschedule = async (date: string, duration: number) => {
    setLoadingSlots(true);
    try {
      const response = await fetch(
        `/api/reservations/available-slots?date=${date}&duration=${duration}`
      );
      if (!response.ok) throw new Error("Failed to fetch slots");
      const data = await response.json();
      setAvailableSlots(data.slots || []);
    } catch (error) {
      console.error("Error fetching available slots:", error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSaveReschedule = async () => {
    if (!rescheduleReservation || !rescheduleDate || !rescheduleSlot) {
      alert("Prosím vyberte dátum a čas");
      return;
    }

    setActionInProgress(true);
    try {
      const scheduledAt = new Date(`${rescheduleDate}T${rescheduleSlot}`).toISOString();
      const response = await fetch(`/api/reservations/${rescheduleReservation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledAt }),
      });

      if (response.ok) {
        await fetchReservations();
        setShowRescheduleModal(false);
        alert("Termín rezervácie bol úspešne zmenený");
      } else {
        alert("Nepodarilo sa zmeniť termín rezervácie");
      }
    } catch (error) {
      console.error("Error rescheduling:", error);
      alert("Nepodarilo sa zmeniť termín rezervácie");
    } finally {
      setActionInProgress(false);
    }
  };

  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
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
      name: reservation.guestName || "Neznámy",
      email: reservation.guestEmail || "Žiadny e-mail",
      isRegistered: false,
    };
  };

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Rezervácie</h1>
            <p className="text-slate-300 mt-2">
              Spravovať plány rezervácií a rezervačné harmonogramy
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-lg shadow p-4" style={{ backgroundColor: "#292929" }}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-300" />
              <span className="text-sm font-medium text-white">Filtre:</span>
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
                placeholder="Filtrovať podľa dátumu"
              />
            </div>
            {dateFilter && (
              <button
                onClick={() => setDateFilter("")}
                className="px-3 py-2 text-sm text-slate-300 hover:text-white"
              >
                Vymazať dátum
              </button>
            )}
          </div>
        </div>

        {/* Reservations Table */}
        <div className="rounded-lg shadow" style={{ backgroundColor: "#292929" }}>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              {statusFilter === "ALL" ? "Všetky rezervácie" : `${statusFilter} Rezervácie`}
              {dateFilter && ` dňa ${new Date(dateFilter).toLocaleDateString()}`}
            </h2>

            {loading ? (
              <div className="text-center py-8 text-slate-300">
                Načítavam rezervácie...
              </div>
            ) : reservations.length === 0 ? (
              <div className="text-center py-8 text-slate-300">
                Nenašli sa žiadne rezervácie.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: "#1f1f1f" }}>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-white">
                        Zákazník
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-white">
                        Naplánované
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-white">
                        Trvanie
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-white">
                        Stav
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-white">
                        Akcie
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
                                  <span className="ml-2 text-xs text-slate-400">(Hosť)</span>
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
                            <div className="flex items-center gap-2">
                              {/* View Details */}
                              <button
                                onClick={() => handleViewDetails(reservation)}
                                className="text-slate-300 hover:text-white p-1"
                                title="Zobraziť detaily"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              
                              {/* Approve (PENDING only) */}
                              {reservation.status === "PENDING" && (
                                <button
                                  onClick={() => handleQuickApprove(reservation.id)}
                                  className="text-green-400 hover:text-green-300 p-1"
                                  title="Schváliť"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                              
                              {/* Cancel (PENDING/CONFIRMED) */}
                              {(reservation.status === "PENDING" || reservation.status === "CONFIRMED") && (
                                <button
                                  onClick={() => handleQuickCancel(reservation.id)}
                                  className="text-red-400 hover:text-red-300 p-1"
                                  title="Zrušiť"
                                >
                                  <Ban className="w-4 h-4" />
                                </button>
                              )}
                              
                              {/* Reschedule (PENDING/CONFIRMED) */}
                              {(reservation.status === "PENDING" || reservation.status === "CONFIRMED") && (
                                <button
                                  onClick={() => handleOpenReschedule(reservation)}
                                  className="text-blue-400 hover:text-blue-300 p-1"
                                  title="Zmeniť termín"
                                >
                                  <Calendar className="w-4 h-4" />
                                </button>
                              )}
                            </div>
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
                  Detaily rezervácie
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
                    Informácie o zákazníkovi
                  </h3>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: "#1f1f1f" }}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-300">Meno</p>
                        <p className="font-medium text-white">
                          {getCustomerInfo(selectedReservation).name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-300">E-mail</p>
                        <p className="font-medium text-white">
                          {getCustomerInfo(selectedReservation).email}
                        </p>
                      </div>
                      {selectedReservation.customer?.phone && (
                        <div>
                          <p className="text-sm text-slate-300">Telefón</p>
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
                    Detaily rezervácie
                  </h3>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: "#1f1f1f" }}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-300">Naplánované na</p>
                        <p className="font-medium text-white">
                          {formatDateTime(new Date(selectedReservation.scheduledAt))}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-300">Trvanie</p>
                        <p className="font-medium text-white">
                          {selectedReservation.durationMinutes} minút
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-300">Stav</p>
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
                        <p className="text-sm text-slate-300">Vytvorené</p>
                        <p className="font-medium text-white">
                          {formatDateTime(new Date(selectedReservation.createdAt))}
                        </p>
                      </div>
                    </div>
                    {selectedReservation.notes && (
                      <div className="mt-4">
                        <p className="text-sm text-slate-300">Poznámky</p>
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
                    Poznámky k akcii (voliteľné)
                  </label>
                  <textarea
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-white"
                    style={{ backgroundColor: "#1f1f1f" }}
                    rows={3}
                    placeholder="Pridať poznámky k zamietnutiu alebo zrušeniu..."
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
                        Potvrdiť
                      </button>
                      <button
                        onClick={() =>
                          handleStatusChange(selectedReservation.id, "REJECTED")
                        }
                        disabled={actionInProgress}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Zamietnuť
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
                      Zrušiť
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
                        Dokončiť
                      </button>
                      <button
                        onClick={() =>
                          handleStatusChange(selectedReservation.id, "NO_SHOW")
                        }
                        disabled={actionInProgress}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                      >
                        <UserX className="w-4 h-4" />
                        Neprišiel
                      </button>
                    </>
                  )}

                  {canDelete && (
                    <button
                      onClick={() => handleDelete(selectedReservation.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ml-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                      Vymazať
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && rescheduleReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: "#292929" }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Zmeniť termín rezervácie
                </h2>
                <button
                  onClick={() => {
                    setShowRescheduleModal(false);
                    setRescheduleDate("");
                    setRescheduleSlot("");
                    setAvailableSlots([]);
                  }}
                  className="text-slate-300 hover:text-white"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Current Reservation Info */}
                <div className="p-4 rounded-lg" style={{ backgroundColor: "#1f1f1f" }}>
                  <p className="text-sm text-slate-300 mb-2">Aktuálny termín:</p>
                  <p className="text-white font-medium">
                    {formatDateTime(new Date(rescheduleReservation.scheduledAt))}
                  </p>
                  <p className="text-sm text-slate-300 mt-1">
                    Trvanie: {rescheduleReservation.durationMinutes} minút
                  </p>
                </div>

                {/* Date Picker */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Nový dátum
                  </label>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => {
                      setRescheduleDate(e.target.value);
                      setRescheduleSlot("");
                      if (e.target.value) {
                        fetchAvailableSlotsForReschedule(e.target.value, rescheduleReservation.durationMinutes);
                      }
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-white"
                    style={{ backgroundColor: "#1f1f1f" }}
                  />
                </div>

                {/* Time Slots */}
                {rescheduleDate && (
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">
                      <Clock className="inline w-4 h-4 mr-2" />
                      Dostupné časové sloty pre {rescheduleReservation.durationMinutes} minút
                    </label>
                    {loadingSlots ? (
                      <div className="text-center py-4 text-slate-300">
                        Načítavam sloty...
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <>
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-96 overflow-y-auto p-2 rounded-lg" style={{ backgroundColor: "#1f1f1f" }}>
                          {availableSlots.map((slot) => (
                            <button
                              key={slot.time}
                              onClick={() => setRescheduleSlot(slot.time)}
                              disabled={!slot.available || slot.isPast}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                rescheduleSlot === slot.time
                                  ? "ring-2 ring-white"
                                  : ""
                              }`}
                              style={{
                                backgroundColor: slot.available && !slot.isPast
                                  ? rescheduleSlot === slot.time
                                    ? "#c20003"
                                    : "#2a7c2a"
                                  : "#666",
                                color: "white",
                                opacity: !slot.available || slot.isPast ? 0.4 : 1,
                                cursor: !slot.available || slot.isPast ? "not-allowed" : "pointer",
                              }}
                            >
                              {slot.time}
                            </button>
                          ))}
                        </div>
                        
                        {/* Legend */}
                        <div className="flex gap-4 mt-3 text-xs text-slate-300">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#2a7c2a" }}></div>
                            <span>Dostupné</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#666" }}></div>
                            <span>Obsadené</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#c20003" }}></div>
                            <span>Vybrané</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4 text-slate-300">
                        Žiadne dostupné sloty pre tento dátum
                      </div>
                    )}
                  </div>
                )}

                {/* Time Range Summary */}
                {rescheduleSlot && (
                  <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: "#1f1f1f", border: "2px solid #c20003" }}>
                    <div className="flex items-center justify-center">
                      <Clock className="inline w-5 h-5 mr-2 text-red-500" />
                      <span className="text-white font-semibold text-lg">
                        Nový termín: {rescheduleSlot} - {calculateEndTime(rescheduleSlot, rescheduleReservation.durationMinutes)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 text-center mt-2">
                      Trvanie: {rescheduleReservation.durationMinutes} minút
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleSaveReschedule}
                    disabled={actionInProgress || !rescheduleDate || !rescheduleSlot}
                    className="flex-1 px-4 py-2 text-white rounded-lg hover:brightness-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: "#c20003" }}
                  >
                    {actionInProgress ? "Ukladám..." : "Uložiť"}
                  </button>
                  <button
                    onClick={() => {
                      setShowRescheduleModal(false);
                      setRescheduleDate("");
                      setRescheduleSlot("");
                      setAvailableSlots([]);
                    }}
                    className="px-4 py-2 border border-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    Zrušiť
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ProtectedLayout>
  );
}
