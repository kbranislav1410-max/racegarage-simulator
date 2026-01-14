"use client";

import { ProtectedLayout } from "@/components/ProtectedLayout";
import { useState, useEffect } from "react";
import { WorkingHours } from "@/lib/validations/settings";
import { Clock, Mail, DollarSign, Calendar } from "lucide-react";

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

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-600">Loading settings...</div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
          <p className="text-slate-600 mt-2">
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
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-slate-700" />
            <h2 className="text-xl font-bold text-slate-800">Working Hours</h2>
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
                    <span className="text-sm font-medium text-slate-700">
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
                    className="px-3 py-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:text-slate-500"
                  />
                  <span className="text-slate-600">-</span>
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
                    className="px-3 py-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Slot Durations */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-slate-700" />
              <h2 className="text-xl font-bold text-slate-800">
                Slot Duration Options
              </h2>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Available duration options (minutes)
              </p>
              <div className="flex flex-wrap gap-2">
                {[15, 30, 45, 60, 90, 120].map((duration) => (
                  <label
                    key={duration}
                    className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50"
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
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-slate-700" />
              <h2 className="text-xl font-bold text-slate-800">
                Default Currency
              </h2>
            </div>
            <div>
              <select
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payment Rules */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Payment Rules
          </h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Card Payment Receiver
            </label>
            <p className="text-sm text-slate-600 mb-3">
              Choose who receives card payments by default
            </p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 px-4 py-2 border-2 border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="cardReceiver"
                  checked={cardPaymentReceiver === "FRIEND"}
                  onChange={() => setCardPaymentReceiver("FRIEND")}
                  className="text-slate-800"
                />
                <span className="font-medium">Friend</span>
              </label>
              <label className="flex items-center gap-2 px-4 py-2 border-2 border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="cardReceiver"
                  checked={cardPaymentReceiver === "ME"}
                  onChange={() => setCardPaymentReceiver("ME")}
                  className="text-slate-800"
                />
                <span className="font-medium">Me</span>
              </label>
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-slate-700" />
            <h2 className="text-xl font-bold text-slate-800">Email Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Sender Name
              </label>
              <input
                type="text"
                value={emailSenderName}
                onChange={(e) => setEmailSenderName(e.target.value)}
                placeholder="Racegarage Simulator"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                From Email Address
              </label>
              <input
                type="email"
                value={emailFromAddress}
                onChange={(e) => setEmailFromAddress(e.target.value)}
                placeholder="noreply@racegarage.local"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </ProtectedLayout>
  );
}
