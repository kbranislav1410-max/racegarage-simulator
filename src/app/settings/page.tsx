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
      setMessage({ type: "error", text: "Failed to load settings" });
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
        throw new Error(error.error || "Failed to save settings");
      }

      setMessage({ type: "success", text: "Settings saved successfully" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to save settings",
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
      setMessage({ type: "error", text: "Failed to load newsletter subscribers" });
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
          <div className="text-slate-300">Loading settings...</div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-slate-300 mt-2">
            Configure business settings and preferences
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
        <div className="rounded-lg shadow p-6" style={{ backgroundColor: "#292929" }}>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-white" />
            <h2 className="text-xl font-bold text-white">Working Hours</h2>
          </div>
          <div className="space-y-3">
            {DAYS.map((day) => (
              <div key={day} className="flex items-center gap-4">
                <div className="w-32">
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
                      className="rounded"
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
                    className="px-3 py-2 border border-slate-600 rounded-lg disabled:bg-slate-800 disabled:text-slate-500"
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
                    className="px-3 py-2 border border-slate-600 rounded-lg disabled:bg-slate-800 disabled:text-slate-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Slot Durations */}
          <div className="rounded-lg shadow p-6" style={{ backgroundColor: "#292929" }}>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-white" />
              <h2 className="text-xl font-bold text-white">
                Slot Duration Options
              </h2>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-slate-300">
                Available duration options (minutes)
              </p>
              <div className="flex flex-wrap gap-2">
                {[15, 30, 45, 60, 90, 120].map((duration) => (
                  <label
                    key={duration}
                    className="flex items-center gap-2 px-3 py-2 border border-slate-600 rounded-lg cursor-pointer hover:brightness-90"
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
                      className="rounded"
                    />
                    <span className="text-sm font-medium">{duration} min</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Currency */}
          <div className="rounded-lg shadow p-6" style={{ backgroundColor: "#292929" }}>
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-white" />
              <h2 className="text-xl font-bold text-white">
                Default Currency
              </h2>
            </div>
            <div>
              <select
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value)}
                className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-white"
                style={{ backgroundColor: "#1f1f1f" }}
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payment Rules */}
        <div className="rounded-lg shadow p-6" style={{ backgroundColor: "#292929" }}>
          <h2 className="text-xl font-bold text-white mb-4">
            Payment Rules
          </h2>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Card Payment Receiver
            </label>
            <p className="text-sm text-slate-300 mb-3">
              Choose who receives card payments by default
            </p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 px-4 py-2 border-2 border-slate-600 rounded-lg cursor-pointer hover:brightness-90">
                <input
                  type="radio"
                  name="cardReceiver"
                  checked={cardPaymentReceiver === "FRIEND"}
                  onChange={() => setCardPaymentReceiver("FRIEND")}
                  className="text-slate-800"
                />
                <span className="font-medium text-white">Friend</span>
              </label>
              <label className="flex items-center gap-2 px-4 py-2 border-2 border-slate-600 rounded-lg cursor-pointer hover:brightness-90">
                <input
                  type="radio"
                  name="cardReceiver"
                  checked={cardPaymentReceiver === "ME"}
                  onChange={() => setCardPaymentReceiver("ME")}
                  className="text-slate-800"
                />
                <span className="font-medium text-white">Me</span>
              </label>
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="rounded-lg shadow p-6" style={{ backgroundColor: "#292929" }}>
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-white" />
            <h2 className="text-xl font-bold text-white">Email Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Sender Name
              </label>
              <input
                type="text"
                value={emailSenderName}
                onChange={(e) => setEmailSenderName(e.target.value)}
                placeholder="Racegarage Simulator"
                className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-white"
                style={{ backgroundColor: "#1f1f1f" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                From Email Address
              </label>
              <input
                type="email"
                value={emailFromAddress}
                onChange={(e) => setEmailFromAddress(e.target.value)}
                placeholder="noreply@racegarage.local"
                className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-white"
                style={{ backgroundColor: "#1f1f1f" }}
              />
            </div>
          </div>
        </div>

        {/* Newsletter Subscribers */}
        <div className="rounded-lg shadow p-6" style={{ backgroundColor: "#292929" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-white" />
              <h2 className="text-xl font-bold text-white">Newsletter</h2>
            </div>
            <button
              onClick={handleShowNewsletterModal}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:brightness-90 transition-colors"
              style={{ backgroundColor: "#c20003" }}
            >
              <Users className="w-4 h-4" />
              Zobraziť odberateľov
            </button>
          </div>
          <p className="text-sm text-slate-300">
            Zoznam zákazníkov, ktorí majú záujem o newsletter a propagačné materiály
          </p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 text-white rounded-lg hover:brightness-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#c20003" }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Newsletter Subscribers Modal */}
      {showNewsletterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: "#292929" }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Odberatelia Newslettera
                </h2>
                <button
                  onClick={() => setShowNewsletterModal(false)}
                  className="text-slate-400 hover:text-slate-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <p className="text-slate-300">
                  Celkový počet odberateľov: <span className="font-semibold">{newsletterSubscribers.length}</span>
                </p>
                <button
                  onClick={handleExportSubscribers}
                  disabled={newsletterSubscribers.length === 0}
                  className="flex items-center gap-2 px-4 py-2  text-white rounded-lg hover:brightness-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: "#c20003" }}
                >
                  <Download className="w-4 h-4" />
                  Exportovať CSV
                </button>
              </div>

              {loadingSubscribers ? (
                <div className="text-center py-8 text-slate-300">
                  Načítavam...
                </div>
              ) : newsletterSubscribers.length === 0 ? (
                <div className="text-center py-8 text-slate-300">
                  Zatiaľ nemáte žiadnych odberateľov newslettera.
                </div>
              ) : (
                <div className="overflow-x-auto">
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
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowNewsletterModal(false)}
                  className="px-6 py-2 border border-slate-600 rounded-lg hover:brightness-90 transition-colors text-white"
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
