"use client";

import { useState } from "react";
import { Calendar, Clock, User, Mail, MapPin } from "lucide-react";
import Link from "next/link";

const DURATION_OPTIONS = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
];

export default function BookPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [existingCustomer, setExistingCustomer] = useState<{
    id: string;
    firstName: string;
    lastName: string;
    street: string | null;
    city: string | null;
  } | null>(null);
  const [formData, setFormData] = useState({
    scheduledDate: "",
    scheduledTime: "",
    durationMinutes: 30,
    firstName: "",
    lastName: "",
    street: "",
    city: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const handleEmailCheck = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setCheckingEmail(true);
    setError("");

    try {
      const response = await fetch(
        `/api/customers/search?q=${encodeURIComponent(email)}`
      );
      const customers = await response.json();

      // Find exact email match
      const customer = customers.find(
        (c: unknown) => c.email.toLowerCase() === email.toLowerCase()
      );

      if (customer) {
        setExistingCustomer(customer);
        setFormData({
          ...formData,
          firstName: customer.firstName,
          lastName: customer.lastName,
          street: customer.street || "",
          city: customer.city || "",
        });
      } else {
        setExistingCustomer(null);
        setFormData({
          ...formData,
          firstName: "",
          lastName: "",
          street: "",
          city: "",
        });
      }

      setStep(2);
    } catch {
      setError("Failed to check email. Please try again.");
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const scheduledAt = new Date(
        `${formData.scheduledDate}T${formData.scheduledTime}`
      ).toISOString();

      const payload = {
        email,
        scheduledAt,
        durationMinutes: formData.durationMinutes,
        ...(existingCustomer
          ? {}
          : {
              firstName: formData.firstName,
              lastName: formData.lastName,
              street: formData.street,
              city: formData.city,
            }),
      };

      const response = await fetch("/api/reservations/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create reservation");
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(err.message || "Failed to create reservation");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Reservation Submitted!
          </h2>
          <p className="text-slate-600 mb-6">
            Your reservation request has been received. We will send you a
            confirmation email at <strong>{email}</strong> once it&apos;s been
            reviewed.
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setStep(1);
              setEmail("");
              setExistingCustomer(null);
              setFormData({
                scheduledDate: "",
                scheduledTime: "",
                durationMinutes: 30,
                firstName: "",
                lastName: "",
                street: "",
                city: "",
              });
            }}
            className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
          >
            Make Another Reservation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Book a Racing Simulator Session
          </h1>
          <p className="text-slate-600">
            Reserve your time on our state-of-the-art racing simulator
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center mb-8">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 1
                ? "bg-slate-800 text-white"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            1
          </div>
          <div
            className={`flex-1 h-1 mx-2 ${
              step >= 2 ? "bg-slate-800" : "bg-slate-200"
            }`}
          />
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 2
                ? "bg-slate-800 text-white"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            2
          </div>
          <div
            className={`flex-1 h-1 mx-2 ${
              step >= 3 ? "bg-slate-800" : "bg-slate-200"
            }`}
          />
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 3
                ? "bg-slate-800 text-white"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            3
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Mail className="inline w-4 h-4 mr-2" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                placeholder="your.email@example.com"
                required
              />
              <p className="mt-2 text-sm text-slate-500">
                We&apos;ll check if you&apos;re already in our system
              </p>
            </div>

            <button
              onClick={handleEmailCheck}
              disabled={checkingEmail || !email}
              className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkingEmail ? "Checking..." : "Continue"}
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {existingCustomer && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">
                  Welcome back, {existingCustomer.firstName}!
                </p>
                <p className="text-sm text-green-700">
                  We found your account. Your information is pre-filled below.
                </p>
              </div>
            )}

            {!existingCustomer && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 font-medium">New Customer</p>
                <p className="text-sm text-blue-700">
                  Please fill in your information to complete the reservation.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-2" />
                  Date
                </label>
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduledDate: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Clock className="inline w-4 h-4 mr-2" />
                  Time
                </label>
                <input
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduledTime: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Duration
              </label>
              <select
                value={formData.durationMinutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    durationMinutes: Number(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                required
              >
                {DURATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                <User className="inline w-5 h-5 mr-2" />
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    readOnly={!!existingCustomer}
                    className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent ${
                      existingCustomer ? "bg-slate-50" : ""
                    }`}
                    required={!existingCustomer}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    readOnly={!!existingCustomer}
                    className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent ${
                      existingCustomer ? "bg-slate-50" : ""
                    }`}
                    required={!existingCustomer}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-2" />
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) =>
                    setFormData({ ...formData, street: e.target.value })
                  }
                  readOnly={!!existingCustomer}
                  className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent ${
                    existingCustomer ? "bg-slate-50" : ""
                  }`}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  readOnly={!!existingCustomer}
                  className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent ${
                    existingCustomer ? "bg-slate-50" : ""
                  }`}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : "Submit Reservation"}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 pt-6 border-t text-center">
          <p className="text-sm text-slate-600">
            Already have a confirmed reservation?{" "}
            <Link href="/login" className="text-slate-800 hover:underline font-medium">
              Staff Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
