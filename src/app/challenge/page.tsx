"use client";

import { useState, useEffect, useCallback } from "react";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { Search, Plus, X, Trophy, Calendar, Trash2 } from "lucide-react";
import { formatAddress } from "@/lib/format";
import { parseLapTime, formatLapTime } from "@/lib/validations/challenge";

interface ChallengeMonth {
  id: string;
  year: number;
  month: number;
  trackName: string;
  carName: string;
  durationMinutes: number | null;
  createdAt: string;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  street: string | null;
  city: string | null;
}

interface AttemptEntry {
  id: string;
  rank: number;
  customerId: string;
  customerName: string;
  customerEmail: string;
  lapTimeMs: number;
  recordedAt: string;
  sessionId: string | null;
}

export default function ChallengePage() {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  
  const [challengeMonth, setChallengeMonth] = useState<ChallengeMonth | null>(null);
  const [attempts, setAttempts] = useState<AttemptEntry[]>([]);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Create Challenge Month Modal
  const [showCreateChallengeModal, setShowCreateChallengeModal] = useState(false);
  const [challengeFormData, setChallengeFormData] = useState({
    trackName: "",
    carName: "",
    durationMinutes: "",
  });
  const [challengeFormErrors, setChallengeFormErrors] = useState<Record<string, string>>({});
  const [challengeFormSubmitting, setChallengeFormSubmitting] = useState(false);

  // Record Attempt Modal
  const [showRecordAttemptModal, setShowRecordAttemptModal] = useState(false);
  const [attemptStep, setAttemptStep] = useState<"search" | "form">("search");
  
  // Customer Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Attempt Form
  const [attemptFormData, setAttemptFormData] = useState({
    lapTime: "",
    sessionId: "",
  });
  const [attemptFormErrors, setAttemptFormErrors] = useState<Record<string, string>>({});
  const [attemptFormSubmitting, setAttemptFormSubmitting] = useState(false);

  // Customer Search in Leaderboard
  const [leaderboardSearch, setLeaderboardSearch] = useState("");

  // Fetch challenge month and leaderboard
  const fetchChallengeData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch challenge month
      const challengeResponse = await fetch(
        `/api/challenges?year=${selectedYear}&month=${selectedMonth}`
      );
      if (!challengeResponse.ok) throw new Error("Failed to fetch challenge");

      const challengeData = await challengeResponse.json();
      setChallengeMonth(challengeData.challengeMonth);

      // If challenge exists, fetch attempts
      if (challengeData.challengeMonth) {
        const attemptsResponse = await fetch(
          `/api/challenges/attempts?challengeMonthId=${challengeData.challengeMonth.id}`
        );
        if (!attemptsResponse.ok) throw new Error("Failed to fetch attempts");

        const attemptsData = await attemptsResponse.json();
        setAttempts(attemptsData.attempts);
        setTotalAttempts(attemptsData.totalAttempts);
      } else {
        setAttempts([]);
        setTotalAttempts(0);
      }
    } catch (err) {
      setError("Failed to load challenge data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    fetchChallengeData();
  }, [fetchChallengeData]);

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

  // Handle create challenge month
  const handleCreateChallengeMonth = async (e: React.FormEvent) => {
    e.preventDefault();
    setChallengeFormErrors({});
    setChallengeFormSubmitting(true);

    try {
      const response = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: selectedYear,
          month: selectedMonth,
          trackName: challengeFormData.trackName,
          carName: challengeFormData.carName,
          durationMinutes: challengeFormData.durationMinutes ? parseInt(challengeFormData.durationMinutes) : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setChallengeFormErrors({ general: error.error || "Failed to create challenge" });
        return;
      }

      // Success - refresh data and close modal
      setShowCreateChallengeModal(false);
      setChallengeFormData({ trackName: "", carName: "", durationMinutes: "" });
      fetchChallengeData();
    } catch (err) {
      setChallengeFormErrors({ general: "An error occurred" });
      console.error(err);
    } finally {
      setChallengeFormSubmitting(false);
    }
  };

  // Handle customer selection
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setAttemptStep("form");
    setSearchQuery("");
    setSearchResults([]);
  };

  // Handle record attempt
  const handleRecordAttempt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !challengeMonth) return;

    setAttemptFormErrors({});
    setAttemptFormSubmitting(true);

    try {
      // Parse lap time
      const lapTimeMs = parseLapTime(attemptFormData.lapTime);
      
      if (!lapTimeMs) {
        setAttemptFormErrors({ 
          lapTime: "Invalid lap time format. Use mm:ss.mmm or milliseconds" 
        });
        setAttemptFormSubmitting(false);
        return;
      }

      const response = await fetch("/api/challenges/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          challengeMonthId: challengeMonth.id,
          lapTimeMs,
          sessionId: attemptFormData.sessionId || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setAttemptFormErrors({ general: error.error || "Failed to record attempt" });
        return;
      }

      // Success - refresh leaderboard and close modal
      setShowRecordAttemptModal(false);
      setAttemptStep("search");
      setSelectedCustomer(null);
      setAttemptFormData({ lapTime: "", sessionId: "" });
      fetchChallengeData();
    } catch (err) {
      setAttemptFormErrors({ general: "An error occurred" });
      console.error(err);
    } finally {
      setAttemptFormSubmitting(false);
    }
  };

  // Reset attempt modal
  const resetAttemptModal = () => {
    setShowRecordAttemptModal(false);
    setAttemptStep("search");
    setSelectedCustomer(null);
    setSearchQuery("");
    setSearchResults([]);
    setAttemptFormData({ lapTime: "", sessionId: "" });
  };

  // Delete attempt
  const handleDeleteAttempt = async (attemptId: string, customerName: string) => {
    if (!confirm(`Naozaj chcete odstrániť pokus používateľa ${customerName}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/challenges/attempts?id=${attemptId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete attempt");
      }

      // Refresh data
      fetchChallengeData();
    } catch (err) {
      console.error("Error deleting attempt:", err);
      alert("Nepodarilo sa odstrániť pokus");
    }
  };

  // Filter attempts by search
  const filteredAttempts = leaderboardSearch
    ? attempts.filter(
        (entry) =>
          entry.customerName.toLowerCase().includes(leaderboardSearch.toLowerCase()) ||
          entry.customerEmail.toLowerCase().includes(leaderboardSearch.toLowerCase())
      )
    : attempts;

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const YEAR_RANGE = 3; // Number of years to show in dropdown

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Monthly Challenges
            </h1>
            <p className="text-slate-600 mt-2">
              Track monthly lap time challenges and leaderboards
            </p>
          </div>
          {challengeMonth && (
            <button
              onClick={() => setShowRecordAttemptModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Record Attempt
            </button>
          )}
        </div>

        {/* Month Selector */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-4 py-2 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-white"
              style={{ backgroundColor: '#292929', border: 'none' }}
            >
              {monthNames.map((name, index) => (
                <option key={index + 1} value={index + 1}>
                  {name}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-white"
              style={{ backgroundColor: '#292929', border: 'none' }}
            >
              {Array.from({ length: YEAR_RANGE }, (_, i) => currentDate.getFullYear() - i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading...</div>
        ) : !challengeMonth ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              No Challenge for {monthNames[selectedMonth - 1]} {selectedYear}
            </h2>
            <p className="text-slate-600 mb-6">
              Create a challenge to start tracking lap times and leaderboards
            </p>
            <button
              onClick={() => setShowCreateChallengeModal(true)}
              className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
            >
              Create Challenge
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Challenge Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                {monthNames[challengeMonth.month - 1]} {challengeMonth.year} Challenge
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Track</p>
                  <p className="font-medium text-slate-900">{challengeMonth.trackName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Car</p>
                  <p className="font-medium text-slate-900">{challengeMonth.carName}</p>
                </div>
                {challengeMonth.durationMinutes && (
                  <div>
                    <p className="text-sm text-slate-600">Trvanie</p>
                    <p className="font-medium text-slate-900">{challengeMonth.durationMinutes} minút</p>
                  </div>
                )}
              </div>
            </div>

            {/* Rebríček */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-800">
                    Rebríček
                  </h2>
                  <span className="text-sm text-slate-600">
                    {totalAttempts} {totalAttempts === 1 ? 'pokus' : 'pokusov'}
                  </span>
                </div>

                {/* Search in Attempts */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Hľadať zákazníka..."
                    value={leaderboardSearch}
                    onChange={(e) => setLeaderboardSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Poradie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Zákazník
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Čas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Dátum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Akcie
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredAttempts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                          {leaderboardSearch
                            ? "Nenašli sa žiadni zákazníci"
                            : "Zatiaľ žiadne pokusy. Buďte prvý kto zaznamená čas!"}
                        </td>
                      </tr>
                    ) : (
                      filteredAttempts.map((entry) => (
                        <tr
                          key={entry.id}
                          className={`hover:bg-slate-50 ${
                            entry.rank <= 3 ? "bg-yellow-50" : ""
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {entry.rank <= 3 && (
                                <Trophy
                                  className={`w-5 h-5 mr-2 ${
                                    entry.rank === 1
                                      ? "text-yellow-500"
                                      : entry.rank === 2
                                      ? "text-gray-400"
                                      : "text-amber-600"
                                  }`}
                                />
                              )}
                              <span className="text-lg font-bold text-slate-900">
                                #{entry.rank}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-slate-900">
                              {entry.customerName}
                            </div>
                            <div className="text-sm text-slate-500">
                              {entry.customerEmail}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-lg font-mono font-bold text-slate-900">
                              {formatLapTime(entry.lapTimeMs)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-600">
                              {new Date(entry.recordedAt).toLocaleDateString('sk-SK')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteAttempt(entry.id, entry.customerName)}
                              className="text-red-600 hover:text-red-900"
                              title="Odstrániť pokus"
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
          </div>
        )}

        {/* Create Challenge Month Modal */}
        {showCreateChallengeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">
                    Create Challenge
                  </h2>
                  <button
                    onClick={() => setShowCreateChallengeModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleCreateChallengeMonth} className="space-y-4">
                  {challengeFormErrors.general && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {challengeFormErrors.general}
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-slate-600 mb-2">
                      Creating challenge for: <strong>{monthNames[selectedMonth - 1]} {selectedYear}</strong>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Track Name *
                    </label>
                    <input
                      type="text"
                      value={challengeFormData.trackName}
                      onChange={(e) =>
                        setChallengeFormData({ ...challengeFormData, trackName: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      placeholder="e.g., Nürburgring Nordschleife"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Car Name *
                    </label>
                    <input
                      type="text"
                      value={challengeFormData.carName}
                      onChange={(e) =>
                        setChallengeFormData({ ...challengeFormData, carName: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      placeholder="e.g., Porsche 911 GT3 RS"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Trvanie (minúty)
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={challengeFormData.durationMinutes}
                      onChange={(e) =>
                        setChallengeFormData({ ...challengeFormData, durationMinutes: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      placeholder="napr. 30"
                    />
                    <p className="text-xs text-slate-500 mt-1">Voliteľné - dĺžka časovky v minútach</p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={challengeFormSubmitting}
                      className="flex-1 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {challengeFormSubmitting ? "Creating..." : "Create Challenge"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateChallengeModal(false)}
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

        {/* Record Attempt Modal */}
        {showRecordAttemptModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">
                    {attemptStep === "search" ? "Select Customer" : "Record Lap Time"}
                  </h2>
                  <button
                    onClick={resetAttemptModal}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {attemptStep === "search" ? (
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
                      <div className="text-center py-8 text-slate-600">
                        No customers found matching &quot;{searchQuery}&quot;
                      </div>
                    )}

                    {searchQuery.length < 2 && (
                      <div className="text-center py-8 text-slate-500">
                        Start typing to search for customers...
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleRecordAttempt} className="space-y-4">
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
                          setAttemptStep("search");
                          setSelectedCustomer(null);
                        }}
                        className="text-sm text-slate-600 hover:text-slate-800 mt-2"
                      >
                        Change customer
                      </button>
                    </div>

                    {attemptFormErrors.general && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {attemptFormErrors.general}
                      </div>
                    )}

                    {/* Lap Time */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Lap Time *
                      </label>
                      <input
                        type="text"
                        value={attemptFormData.lapTime}
                        onChange={(e) =>
                          setAttemptFormData({ ...attemptFormData, lapTime: e.target.value })
                        }
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                          attemptFormErrors.lapTime ? "border-red-300" : "border-slate-300"
                        }`}
                        placeholder="mm:ss.mmm (e.g., 01:23.456) or ms (e.g., 83456)"
                        required
                      />
                      {attemptFormErrors.lapTime && (
                        <p className="text-red-600 text-sm mt-1">{attemptFormErrors.lapTime}</p>
                      )}
                      <p className="text-xs text-slate-500 mt-1">
                        Enter time as mm:ss.mmm (e.g., 01:23.456) or milliseconds (e.g., 83456)
                      </p>
                    </div>

                    {/* Session ID (Optional) */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Link to Ride Session (Optional)
                      </label>
                      <input
                        type="text"
                        value={attemptFormData.sessionId}
                        onChange={(e) =>
                          setAttemptFormData({ ...attemptFormData, sessionId: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        placeholder="Ride Session ID (optional)"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={attemptFormSubmitting}
                        className="flex-1 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {attemptFormSubmitting ? "Recording..." : "Record Attempt"}
                      </button>
                      <button
                        type="button"
                        onClick={resetAttemptModal}
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
      </div>
    </ProtectedLayout>
  );
}
