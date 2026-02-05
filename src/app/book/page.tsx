"use client";

import { useState } from "react";
import { Calendar, Clock, User, Mail, MapPin, Phone } from "lucide-react";

const DURATION_OPTIONS = [
  { value: 15, label: "15 minút" },
  { value: 30, label: "30 minút" },
  { value: 60, label: "1 hodina" },
  { value: 90, label: "1,5 hodiny" },
  { value: 120, label: "2 hodiny" },
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
    phone: string | null;
  } | null>(null);
  const [formData, setFormData] = useState({
    scheduledDate: "",
    scheduledTime: "",
    durationMinutes: 30,
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  
  // New state for available slots
  const [availableSlots, setAvailableSlots] = useState<Array<{
    time: string;
    available: boolean;
    isPast: boolean;
  }>>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");

  // Helper function to proceed as new customer
  const proceedAsNewCustomer = () => {
    setExistingCustomer(null);
    setFormData({
      ...formData,
      firstName: "",
      lastName: "",
      street: "",
      city: "",
      phone: "",
    });
    setStep(2);
  };

  const handleEmailCheck = async () => {
    if (!email) {
      setError("Prosím zadajte svoju e-mailovú adresu");
      return;
    }

    setCheckingEmail(true);
    setError("");

    try {
      const response = await fetch(
        `/api/customers/search?q=${encodeURIComponent(email)}`
      );
      
      // Check if response is ok before parsing
      if (!response.ok) {
        console.warn("Vyhľadávanie zákazníka zlyhalo, pokračujeme ako nový zákazník");
        proceedAsNewCustomer();
        return;
      }

      const data = await response.json();
      const customers = data.customers || [];

      // Find exact email match
      interface CustomerSearchResult {
        email: string;
        firstName: string;
        lastName: string;
        street?: string;
        city?: string;
        phone?: string;
      }
      const customer = customers.find(
        (c: CustomerSearchResult) => c.email.toLowerCase() === email.toLowerCase()
      );

      if (customer) {
        setExistingCustomer(customer);
        setFormData({
          ...formData,
          firstName: customer.firstName,
          lastName: customer.lastName,
          street: customer.street || "",
          city: customer.city || "",
          phone: customer.phone || "",
        });
      } else {
        proceedAsNewCustomer();
        return;
      }

      setStep(2);
    } catch (error) {
      console.warn("Chyba pri kontrole e-mailu zákazníka, pokračujeme ako nový zákazník:", error);
      proceedAsNewCustomer();
    } finally {
      setCheckingEmail(false);
    }
  };

  // Fetch available slots when date or duration changes
  const fetchAvailableSlots = async (date: string, duration: number) => {
    if (!date) {
      setAvailableSlots([]);
      return;
    }

    setLoadingSlots(true);
    try {
      const response = await fetch(
        `/api/reservations/available-slots?date=${encodeURIComponent(date)}&duration=${duration}`
      );

      if (!response.ok) {
        console.error("Failed to fetch available slots");
        setAvailableSlots([]);
        return;
      }

      const data = await response.json();
      setAvailableSlots(data.slots || []);
    } catch (error) {
      console.error("Error fetching available slots:", error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Handle date change
  const handleDateChange = (newDate: string) => {
    setFormData({ ...formData, scheduledDate: newDate, scheduledTime: "" });
    setSelectedSlot("");
    fetchAvailableSlots(newDate, formData.durationMinutes);
  };

  // Handle duration change
  const handleDurationChange = (newDuration: number) => {
    setFormData({ ...formData, durationMinutes: newDuration, scheduledTime: "" });
    setSelectedSlot("");
    // If date is already selected, refetch slots with new duration
    if (formData.scheduledDate) {
      fetchAvailableSlots(formData.scheduledDate, newDuration);
    }
  };

  // Handle slot selection
  const handleSlotSelect = (time: string) => {
    setSelectedSlot(time);
    setFormData({ ...formData, scheduledTime: time });
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
              phone: formData.phone,
            }),
      };

      const response = await fetch("/api/reservations/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Nepodarilo sa vytvoriť rezerváciu");
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError((err as Error).message || "Nepodarilo sa vytvoriť rezerváciu");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat" 
        style={{ 
          backgroundColor: '#1a1a1a',
          backgroundImage: 'url(/login-bg.jpg)',
          backgroundBlendMode: 'overlay'
        }}
      >
        <div className="rounded-lg shadow-xl p-8 max-w-md w-full text-center" style={{ backgroundColor: '#292929' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#c20003' }}>
            <svg
              className="w-8 h-8 text-white"
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
          <h2 className="text-2xl font-bold text-white mb-2">
            Rezervácia odoslaná!
          </h2>
          <p className="text-slate-300 mb-6">
            Vaša žiadosť o rezerváciu bola prijatá. Po jej schválení vám pošleme
            potvrdzujúci e-mail na adresu <strong className="text-white">{email}</strong>.
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
                phone: "",
              });
            }}
            className="px-6 py-2 text-white rounded-lg hover:brightness-90 transition-colors"
            style={{ backgroundColor: '#c20003' }}
          >
            Vytvoriť ďalšiu rezerváciu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat" 
      style={{ 
        backgroundColor: '#1a1a1a',
        backgroundImage: 'url(/login-bg.jpg)',
        backgroundBlendMode: 'overlay'
      }}
    >
      <div className="rounded-lg shadow-xl p-8 max-w-2xl w-full" style={{ backgroundColor: '#292929' }}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            Rezervácia simulátora
          </h1>
          <p className="text-slate-300">
            Rezervujte si čas na našom závodnom simulátore
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center mb-8">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 1
                ? "text-white"
                : "bg-slate-700 text-slate-400"
            }`}
            style={step >= 1 ? { backgroundColor: '#c20003' } : {}}
          >
            1
          </div>
          <div
            className={`flex-1 h-1 mx-2 ${
              step >= 2 ? "" : "bg-slate-700"
            }`}
            style={step >= 2 ? { backgroundColor: '#c20003' } : {}}
          />
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 2
                ? "text-white"
                : "bg-slate-700 text-slate-400"
            }`}
            style={step >= 2 ? { backgroundColor: '#c20003' } : {}}
          >
            2
          </div>
          <div
            className={`flex-1 h-1 mx-2 ${
              step >= 3 ? "" : "bg-slate-700"
            }`}
            style={step >= 3 ? { backgroundColor: '#c20003' } : {}}
          />
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 3
                ? "text-white"
                : "bg-slate-700 text-slate-400"
            }`}
            style={step >= 3 ? { backgroundColor: '#c20003' } : {}}
          >
            3
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-lg text-white" style={{ backgroundColor: '#8b0000' }}>
            {error}
          </div>
        )}

        {step === 1 && (
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleEmailCheck();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <Mail className="inline w-4 h-4 mr-2" />
                E-mailová adresa
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg text-white focus:ring-2 focus:ring-offset-2 focus:outline-none"
                style={{ backgroundColor: '#1f1f1f', border: 'none' }}
                placeholder="vasa.adresa@priklad.sk"
                required
              />
            </div>

            <button
              type="submit"
              disabled={checkingEmail || !email}
              className="w-full px-4 py-3 text-white rounded-lg hover:brightness-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#c20003' }}
            >
              {checkingEmail ? "Kontrolujem..." : "Pokračovať"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {existingCustomer && (
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#1f1f1f', border: '1px solid #c20003' }}>
                <p className="text-white font-medium">
                  Vitajte späť, {existingCustomer.firstName}!
                </p>
                <p className="text-sm text-slate-300">
                  Našli sme váš účet. Vaše údaje sú predvyplnené.
                </p>
              </div>
            )}

            {!existingCustomer && (
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#1f1f1f', border: '1px solid #c20003' }}>
                <p className="text-white font-medium">Nový zákazník</p>
                <p className="text-sm text-slate-300">
                  Prosím vyplňte svoje údaje pre dokončenie rezervácie.
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-white mb-2">
                <Clock className="inline w-4 h-4 mr-2" />
                Trvanie rezervácie
              </label>
              <select
                value={formData.durationMinutes}
                onChange={(e) => handleDurationChange(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-lg text-white focus:ring-2 focus:ring-offset-2 focus:outline-none"
                style={{ backgroundColor: '#1f1f1f', border: 'none' }}
                required
              >
                {DURATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} style={{ backgroundColor: '#1f1f1f' }}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-white mb-2">
                <Calendar className="inline w-4 h-4 mr-2" />
                Vyberte dátum
              </label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => handleDateChange(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-2 rounded-lg text-white focus:ring-2 focus:ring-offset-2 focus:outline-none"
                style={{ backgroundColor: '#1f1f1f', border: 'none' }}
                required
              />
            </div>

            {!formData.scheduledDate && (
              <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: '#1a1a1a', border: '1px solid #444' }}>
                <p className="text-sm text-slate-300 text-center">
                  ℹ️ Po výbere dátumu sa zobrazia dostupné časové sloty pre vámi zvolené trvanie ({formData.durationMinutes} minút)
                </p>
              </div>
            )}

            {formData.scheduledDate && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-3">
                  <Clock className="inline w-4 h-4 mr-2" />
                  Dostupné časové sloty pre {formData.durationMinutes} minút (Vyberte čas)
                </label>
                
                {loadingSlots ? (
                  <div className="text-center py-8 text-slate-300">
                    Načítavam dostupné termíny...
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-96 overflow-y-auto p-2 rounded-lg" style={{ backgroundColor: '#1a1a1a' }}>
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available || slot.isPast}
                        onClick={() => handleSlotSelect(slot.time)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedSlot === slot.time
                            ? 'ring-2 ring-offset-2 ring-offset-slate-900'
                            : ''
                        } ${
                          !slot.available || slot.isPast
                            ? 'cursor-not-allowed opacity-40'
                            : 'hover:brightness-110'
                        }`}
                        style={{
                          backgroundColor: selectedSlot === slot.time
                            ? '#c20003'
                            : slot.available && !slot.isPast
                            ? '#2a7c2a'
                            : '#666',
                          color: 'white',
                        }}
                        title={
                          slot.isPast
                            ? 'Už prešlo'
                            : slot.available
                            ? 'Dostupné'
                            : 'Obsadené'
                        }
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-300">
                    Žiadne dostupné termíny pre tento dátum a trvanie.
                  </div>
                )}

                {formData.scheduledDate && availableSlots.length > 0 && (
                  <div className="mt-3 flex items-center justify-center gap-6 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#2a7c2a' }}></div>
                      <span>Dostupné</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#666' }}></div>
                      <span>Obsadené</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded ring-2 ring-white" style={{ backgroundColor: '#c20003' }}></div>
                      <span>Vybrané</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-slate-700 pt-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                <User className="inline w-5 h-5 mr-2" />
                Osobné údaje
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    readOnly={!!existingCustomer}
                    className={`w-full px-4 py-2 rounded-lg text-white focus:ring-2 focus:ring-offset-2 focus:outline-none ${
                      existingCustomer ? "opacity-60" : ""
                    }`}
                    style={{ backgroundColor: '#1f1f1f', border: 'none' }}
                    required={!existingCustomer}
                  />
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
                    readOnly={!!existingCustomer}
                    className={`w-full px-4 py-2 rounded-lg text-white focus:ring-2 focus:ring-offset-2 focus:outline-none ${
                      existingCustomer ? "opacity-60" : ""
                    }`}
                    style={{ backgroundColor: '#1f1f1f', border: 'none' }}
                    required={!existingCustomer}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-white mb-2">
                  <MapPin className="inline w-4 h-4 mr-2" />
                  Ulica
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) =>
                    setFormData({ ...formData, street: e.target.value })
                  }
                  readOnly={!!existingCustomer}
                  className={`w-full px-4 py-2 rounded-lg text-white focus:ring-2 focus:ring-offset-2 focus:outline-none ${
                    existingCustomer ? "opacity-60" : ""
                  }`}
                  style={{ backgroundColor: '#1f1f1f', border: 'none' }}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-white mb-2">
                  Mesto *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  readOnly={!!existingCustomer}
                  className={`w-full px-4 py-2 rounded-lg text-white focus:ring-2 focus:ring-offset-2 focus:outline-none ${
                    existingCustomer ? "opacity-60" : ""
                  }`}
                  style={{ backgroundColor: '#1f1f1f', border: 'none' }}
                  required={!existingCustomer}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-white mb-2">
                  <Phone className="inline w-4 h-4 mr-2" />
                  Telefónne číslo *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  readOnly={!!existingCustomer}
                  className={`w-full px-4 py-2 rounded-lg text-white focus:ring-2 focus:ring-offset-2 focus:outline-none ${
                    existingCustomer ? "opacity-60" : ""
                  }`}
                  style={{ backgroundColor: '#1f1f1f', border: 'none' }}
                  required={!existingCustomer}
                  pattern="^(\+421\s?\d{3}\s?\d{3}\s?\d{3}|0\d{3}\s?\d{3}\s?\d{3})$"
                  title="Telefónne číslo musí byť vo formáte +421 xxx xxx xxx alebo 0xxx xxx xxx"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3 text-white rounded-lg hover:bg-slate-700 transition-colors"
                style={{ backgroundColor: '#1f1f1f', border: 'none' }}
              >
                Späť
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 text-white rounded-lg hover:brightness-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#c20003' }}
              >
                {loading ? "Odosielam..." : "Odoslať rezerváciu"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
