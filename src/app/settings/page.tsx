"use client";

import { ProtectedLayout } from "@/components/ProtectedLayout";
import { useState, useEffect } from "react";
import { WorkingHours } from "@/lib/validations/settings";
import { Clock, Mail, DollarSign, Calendar, Users, Download, X } from "lucide-react";
import { formatDate } from "@/lib/format";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const DAY_LABELS: Record<string, string> = {
  monday: "Pondelok",
  tuesday: "Utorok",
  wednesday: "Streda",
  thursday: "Štvrtok",
  friday: "Piatok",
  saturday: "Sobota",
  sunday: "Nedeľa",
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [showNewsletterModal, setShowNewsletterModal] = useState(false);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<any[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);

  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    monday: { from: "10:00", to: "22:00", enabled: true },
    tuesday: { from: "10:00", to: "22:00", enabled: true },
    wednesday: { from: "10:00", to: "22:00", enabled: true },
    thursday: { from: "10:00", to: "22:00", enabled: true },
    friday: { from: "10:00", to: "22:00", enabled: true },
    saturday: { from: "12:00", to: "20:00", enabled: true },
    sunday: { from: "12:00", to: "20:00", enabled: false },
  });

  const [slotDurations, setSlotDurations] = useState<number[]>([15, 30, 60]);
  const [defaultCurrency, setDefaultCurrency] = useState("EUR");
  const [cardPaymentReceiver, setCardPaymentReceiver] = useState<"FRIEND" | "ME">("FRIEND");
  const [emailSenderName, setEmailSenderName] = useState("Racegarage Simulator");
  const [emailFromAddress, setEmailFromAddress] = useState("noreply@racegarage.local");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      if (!response.ok) throw new Error("Failed to load settings");
      
      const data = await response.json();
      const settings = data.settings;

      if (settings.workingHours) {
        setWorkingHours(JSON.parse(settings.workingHours));
      }
      if (settings.slotDurations) {
        setSlotDurations(JSON.parse(settings.slotDurations));
      }
      if (settings.defaultCurrency) {
        setDefaultCurrency(settings.defaultCurrency);
      }
      if (settings.cardPaymentReceiver) {
        setCardPaymentReceiver(settings.cardPaymentReceiver);
      }
      if (settings.emailSenderName) {
        setEmailSenderName(settings.emailSenderName);
      }
      if (settings.emailFromAddress) {
        setEmailFromAddress(settings.emailFromAddress);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
      setMessage({ type: "error", text: "Nepodarilo sa načítať nastavenia" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workingHours,
          slotDurations,
          defaultCurrency,
          cardPaymentReceiver,
          emailSenderName,
          emailFromAddress,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Nepodarilo sa uložiť nastavenia");
      }

      setMessage({ type: "success", text: "Nastavenia boli úspešne uložené" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Nepodarilo sa uložiť nastavenia",
      });
    } finally {
      setSaving(false);
    }
  };

  const loadNewsletterSubscribers = async () => {
    setLoadingSubscribers(true);
    try {
      const response = await fetch("/api/newsletter-subscribers");
      if (!response.ok) throw new Error("Failed to load newsletter subscribers");
      const data = await response.json();
      setNewsletterSubscribers(data.subscribers);
    } catch (error) {
      console.error("Failed to load newsletter subscribers:", error);
      setMessage({ type: "error", text: "Nepodarilo sa načítať odberateľov newslettera" });
    } finally {
      setLoadingSubscribers(false);
    }
  };

  const handleExportSubscribers = () => {
    window.location.href = "/api/newsletter-subscribers/export";
  };

  const handleShowNewsletterModal = () => {
    setShowNewsletterModal(true);
    loadNewsletterSubscribers();
  };

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-300">Načítavam nastavenia...</div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Nastavenia</h1>
          <p className="text-sm sm:text-base text-slate-300 mt-2">
            Konfigurácia obchodných nastavení a preferencií
          </p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Working Hours */}
        <div className="rounded-lg shadow p-4 sm:p-6" style={{ backgroundColor: "#292929" }}>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-white" />
            <h2 className="text-lg sm:text-xl font-bold text-white">Pracovné hodiny</h2>
          </div>
          <div className="space-y-3">
            {DAYS.map((day) => (
              <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="sm:w-32">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={workingHours[day].enabled}
                      onChange={(e) =>
                        setWorkingHours({
                          ...workingHours,
                          [day]: {
                            ...workingHours[day],
                            enabled: e.target.checked,
                          },
                        })
                      }
                      className="rounded w-5 h-5"
                    />
                    <span className="text-sm font-medium text-white">
                      {DAY_LABELS[day]}
                    </span>
                  </label>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={workingHours[day].from}
                    onChange={(e) =>
                      setWorkingHours({
                        ...workingHours,
                        [day]: {
                          ...workingHours[day],
                          from: e.target.value,
                        },
                      })
                    }
                    disabled={!workingHours[day].enabled}
                    className="px-3 py-2 border border-slate-600 rounded-lg disabled:bg-slate-800 disabled:text-slate-500 flex-1"
                    style={{ minHeight: '44px' }}
                  />
                  <span className="text-slate-300">-</span>
                  <input
                    type="time"
                    value={workingHours[day].to}
                    onChange={(e) =>
                      setWorkingHours({
                        ...workingHours,
                        [day]: {
                          ...workingHours[day],
                          to: e.target.value,
                        },
                      })
                    }
                    disabled={!workingHours[day].enabled}
                    className="px-3 py-2 border border-slate-600 rounded-lg disabled:bg-slate-800 disabled:text-slate-500 flex-1"
                    style={{ minHeight: '44px' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Slot Durations */}
          <div className="rounded-lg shadow p-4 sm:p-6" style={{ backgroundColor: "#292929" }}>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-white" />
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Možnosti trvania slotov
              </h2>
            </div>
            <div className="space-y-3">
              <p className="text-xs sm:text-sm text-slate-300">
                Dostupné možnosti trvania (minúty)
              </p>
              <div className="flex flex-wrap gap-2">
                {[15, 30, 45, 60, 90, 120].map((duration) => (
                  <label
                    key={duration}
                    className="flex items-center gap-2 px-3 py-2 border border-slate-600 rounded-lg cursor-pointer hover:bg-slate-700"
                    style={{ minHeight: '44px' }}
                  >
                    <input
                      type="checkbox"
                      checked={slotDurations.includes(duration)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSlotDurations([...slotDurations, duration].sort((a, b) => a - b));
                        } else {
                          setSlotDurations(slotDurations.filter((d) => d !== duration));
                        }
                      }}
                      className="rounded w-5 h-5"
                    />
                    <span className="text-sm font-medium">{duration} min</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Currency */}
          <div className="rounded-lg shadow p-4 sm:p-6" style={{ backgroundColor: "#292929" }}>
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-white" />
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Predvolená mena
              </h2>
            </div>
            <div>
              <select
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value)}
                className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-white"
                style={{ backgroundColor: "#1f1f1f", minHeight: '44px' }}
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payment Rules */}
        <div className="rounded-lg shadow p-4 sm:p-6" style={{ backgroundColor: "#292929" }}>
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4">
            Pravidlá platieb
          </h2>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Príjemca platby kartou
            </label>
            <p className="text-xs sm:text-sm text-slate-300 mb-3">
              Vyberte, kto má predvolene prijímať platby kartou
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <label className="flex items-center gap-2 px-4 py-3 border-2 border-slate-600 rounded-lg cursor-pointer hover:bg-slate-700" style={{ minHeight: '44px' }}>
                <input
                  type="radio"
                  name="cardReceiver"
                  checked={cardPaymentReceiver === "FRIEND"}
                  onChange={() => setCardPaymentReceiver("FRIEND")}
                  className="text-slate-800 w-5 h-5"
                />
                <span className="font-medium text-white">Priateľ</span>
              </label>
              <label className="flex items-center gap-2 px-4 py-3 border-2 border-slate-600 rounded-lg cursor-pointer hover:bg-slate-700" style={{ minHeight: '44px' }}>
                <input
                  type="radio"
                  name="cardReceiver"
                  checked={cardPaymentReceiver === "ME"}
                  onChange={() => setCardPaymentReceiver("ME")}
                  className="text-slate-800 w-5 h-5"
                />
                <span className="font-medium text-white">Ja</span>
              </label>
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="rounded-lg shadow p-4 sm:p-6" style={{ backgroundColor: "#292929" }}>
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-white" />
            <h2 className="text-lg sm:text-xl font-bold text-white">Nastavenia emailu</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-white mb-2">
                Meno odosielateľa
              </label>
              <input
                type="text"
                value={emailSenderName}
                onChange={(e) => setEmailSenderName(e.target.value)}
                placeholder="Racegarage Simulator"
                className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-white"
                style={{ backgroundColor: "#1f1f1f", minHeight: '44px' }}
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-white mb-2">
                Emailová adresa odosielateľa
              </label>
              <input
                type="email"
                value={emailFromAddress}
                onChange={(e) => setEmailFromAddress(e.target.value)}
                placeholder="noreply@racegarage.local"
                className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-white"
                style={{ backgroundColor: "#1f1f1f", minHeight: '44px' }}
              />
            </div>
          </div>
        </div>

        {/* Newsletter Subscribers */}
        <div className="rounded-lg shadow p-4 sm:p-6" style={{ backgroundColor: "#292929" }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-white" />
              <h2 className="text-lg sm:text-xl font-bold text-white">Newsletter</h2>
            </div>
            <button
              onClick={handleShowNewsletterModal}
              className="flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg hover:brightness-90 transition-colors w-full sm:w-auto"
              style={{ backgroundColor: "#c20003", minHeight: '44px' }}
            >
              <Users className="w-4 h-4" />
              <span className="text-sm sm:text-base">Zobraziť odberateľov</span>
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-300">
            Zoznam zákazníkov, ktorí majú záujem o newsletter a propagačné materiály
          </p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto px-6 py-2 text-white rounded-lg hover:brightness-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            style={{ backgroundColor: "#c20003", minHeight: '44px' }}
          >
            {saving ? "Ukladám..." : "Uložiť zmeny"}
          </button>
        </div>
      </div>

      {/* Newsletter Subscribers Modal */}
      {showNewsletterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: "#292929" }}>
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Odberatelia Newslettera
                </h2>
                <button
                  onClick={() => setShowNewsletterModal(false)}
                  className="text-slate-400 hover:text-slate-300"
                  style={{ minWidth: '44px', minHeight: '44px' }}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-sm sm:text-base text-slate-300">
                  Celkový počet odberateľov: <span className="font-semibold">{newsletterSubscribers.length}</span>
                </p>
                <button
                  onClick={handleExportSubscribers}
                  disabled={newsletterSubscribers.length === 0}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg hover:brightness-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto" 
                  style={{ backgroundColor: "#c20003", minHeight: '44px' }}
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm sm:text-base">Exportovať CSV</span>
                </button>
              </div>

              {loadingSubscribers ? (
                <div className="text-center py-8 text-sm sm:text-base text-slate-300">
                  Načítavam...
                </div>
              ) : newsletterSubscribers.length === 0 ? (
                <div className="text-center py-8 text-sm sm:text-base text-slate-300">
                  Zatiaľ nemáte žiadnych odberateľov newslettera.
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-slate-700" style={{ backgroundColor: "#1f1f1f" }}>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Meno
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Mesto
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Telefón
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Registrovaný
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700" style={{ backgroundColor: "#292929" }}>
                        {newsletterSubscribers.map((subscriber: any) => (
                          <tr key={subscriber.id} className="hover:bg-slate-700">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-white">
                                {subscriber.firstName} {subscriber.lastName}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-slate-300">{subscriber.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-slate-300">
                                {subscriber.city || "-"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-slate-300">
                                {subscriber.phone || "-"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-slate-300">
                                {formatDate(subscriber.createdAt)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-3">
                    {newsletterSubscribers.map((subscriber: any) => (
                      <div
                        key={subscriber.id}
                        className="p-4 rounded-lg border border-slate-700"
                        style={{ backgroundColor: "#1f1f1f" }}
                      >
                        <div className="space-y-2">
                          <div>
                            <div className="text-sm font-medium text-white">
                              {subscriber.firstName} {subscriber.lastName}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400">Email</div>
                            <div className="text-sm text-slate-300 break-all">{subscriber.email}</div>
                          </div>
                          {subscriber.city && (
                            <div>
                              <div className="text-xs text-slate-400">Mesto</div>
                              <div className="text-sm text-slate-300">{subscriber.city}</div>
                            </div>
                          )}
                          {subscriber.phone && (
                            <div>
                              <div className="text-xs text-slate-400">Telefón</div>
                              <div className="text-sm text-slate-300">{subscriber.phone}</div>
                            </div>
                          )}
                          <div>
                            <div className="text-xs text-slate-400">Registrovaný</div>
                            <div className="text-sm text-slate-300">{formatDate(subscriber.createdAt)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowNewsletterModal(false)}
                  className="w-full sm:w-auto px-6 py-2 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors text-white flex items-center justify-center"
                  style={{ minHeight: '44px' }}
                >
                  Zavrieť
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ProtectedLayout>
  );
}
