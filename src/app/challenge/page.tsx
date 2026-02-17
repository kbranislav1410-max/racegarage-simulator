"use client";

import { useState, useEffect, useCallback } from "react";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { Search, Plus, X, Trophy, Calendar, Trash2 } from "lucide-react";
import { formatAddress } from "@/lib/format";
import { parseLapTime, formatLapTime } from "@/lib/validations/challenge";
import { usePermissions } from "@/lib/use-permissions";

interface ChallengeMonth {
  id: string;
  year: number;
  month: number;
  trackName: string;
  carName: string;
  durationMinutes: number | null;
  prizeDescription: string | null;
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
  const { canDelete } = usePermissions();
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
    prizeDescription: "",
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
          prizeDescription: challengeFormData.prizeDescription || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setChallengeFormErrors({ general: error.error || "Failed to create challenge" });
        return;
      }

      // Success - refresh data and close modal
      setShowCreateChallengeModal(false);
      setChallengeFormData({ trackName: "", carName: "", prizeDescription: "" });
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
          lapTime: "Invalid lap time format. Use mm:ss:mmm or milliseconds" 
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
      setAttemptFormData({ lapTime: "" });
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
    setAttemptFormData({ lapTime: "" });
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
    "Január", "Február", "Marec", "Apríl", "Máj", "Jún",
    "Júl", "August", "September", "Október", "November", "December"
  ];

  const YEAR_RANGE = 3; // Number of years to show in dropdown

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Mesačné výzvy
            </h1>
            <p className="text-slate-300 mt-2">
              Sledujte mesačné výzvy najrýchlejších okruhových časov a rebríčky
            </p>
          </div>
          {challengeMonth && (
            <button
              onClick={() => setShowRecordAttemptModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors hover:brightness-90"
              style={{ backgroundColor: "#c20003" }}
            >
              <Plus className="w-4 h-4" />
              Zaznamenať pokus
            </button>
          )}
        </div>

        {/* Month Selector */}
        <div className="rounded-lg shadow p-4" style={{ backgroundColor: "#292929" }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <Calendar className="w-5 h-5 text-slate-400 hidden sm:block" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full sm:w-auto px-4 py-2 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-white"
              style={{ backgroundColor: '#1f1f1f', border: 'none', minHeight: '44px' }}
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
              className="w-full sm:w-auto px-4 py-2 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-white"
              style={{ backgroundColor: '#1f1f1f', border: 'none', minHeight: '44px' }}
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
          <div className="text-center py-12 text-slate-400">Načítavam...</div>
        ) : !challengeMonth ? (
          <div className="rounded-lg shadow p-6 sm:p-8 text-center" style={{ backgroundColor: "#292929" }}>
            <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Žiadna výzva pre {monthNames[selectedMonth - 1]} {selectedYear}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 mb-6">
              Vytvorte výzvu pre sledovanie okruhových časov a rebríčkov
            </p>
            <button
              onClick={() => setShowCreateChallengeModal(true)}
              className="px-6 py-2 text-white rounded-lg transition-colors"
              style={{ backgroundColor: "#c20003", minHeight: "44px" }}
            >
              Vytvoriť výzvu
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Challenge Info */}
            <div className="rounded-lg shadow p-4 sm:p-6" style={{ backgroundColor: "#292929" }}>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
                Výzva {monthNames[challengeMonth.month - 1]} {challengeMonth.year}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-slate-300">Trať</p>
                  <p className="font-medium text-white break-words">{challengeMonth.trackName}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-slate-300">Auto</p>
                  <p className="font-medium text-white break-words">{challengeMonth.carName}</p>
                </div>
                {challengeMonth.durationMinutes && (
                  <div>
                    <p className="text-xs sm:text-sm text-slate-300">Trvanie</p>
                    <p className="font-medium text-white">{challengeMonth.durationMinutes} minút</p>
                  </div>
                )}
                {challengeMonth.prizeDescription && (
                  <div>
                    <p className="text-xs sm:text-sm text-slate-300">Výhra</p>
                    <p className="font-medium text-white break-words">{challengeMonth.prizeDescription}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Rebríček */}
            <div className="rounded-lg shadow" style={{ backgroundColor: "#292929" }}>
              <div className="p-4 sm:p-6 border-b border-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    Rebríček
                  </h2>
                  <span className="text-xs sm:text-sm text-slate-300">
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
                    className="w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
                    style={{ backgroundColor: "#1f1f1f", border: "none", minHeight: "44px" }}
                  />
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="overflow-x-auto hidden md:block">
                <table className="w-full">
                  <thead className="border-b border-slate-700" style={{ backgroundColor: "#1f1f1f" }}>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Poradie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Zákazník
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Čas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Dátum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Akcie
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filteredAttempts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                          {leaderboardSearch
                            ? "Nenašli sa žiadni zákazníci"
                            : "Zatiaľ žiadne pokusy. Buďte prvý kto zaznamená čas!"}
                        </td>
                      </tr>
                    ) : (
                      filteredAttempts.map((entry) => (
                        <tr
                          key={entry.id}
                          className={`hover:brightness-90 ${
                            entry.rank <= 3 ? "bg-yellow-900/20" : ""
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
                              <span className="text-lg font-bold text-white">
                                #{entry.rank}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-white">
                              {entry.customerName}
                            </div>
                            <div className="text-sm text-slate-400">
                              {entry.customerEmail}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-lg font-mono font-bold text-white">
                              {formatLapTime(entry.lapTimeMs)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-300">
                              {new Date(entry.recordedAt).toLocaleDateString('sk-SK')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {canDelete && (
                              <button
                                onClick={() => handleDeleteAttempt(entry.id, entry.customerName)}
                                className="text-red-600 hover:text-red-900"
                                title="Odstrániť pokus"
                                style={{ minWidth: "44px", minHeight: "44px" }}
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-slate-700">
                {filteredAttempts.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">
                    {leaderboardSearch
                      ? "Nenašli sa žiadni zákazníci"
                      : "Zatiaľ žiadne pokusy. Buďte prvý kto zaznamená čas!"}
                  </div>
                ) : (
                  filteredAttempts.map((entry) => (
                    <div
                      key={entry.id}
                      className={`p-4 ${entry.rank <= 3 ? "bg-yellow-900/20" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          {entry.rank <= 3 && (
                            <Trophy
                              className={`w-5 h-5 ${
                                entry.rank === 1
                                  ? "text-yellow-500"
                                  : entry.rank === 2
                                  ? "text-gray-400"
                                  : "text-amber-600"
                              }`}
                            />
                          )}
                          <span className="text-lg font-bold text-white">
                            #{entry.rank}
                          </span>
                        </div>
                        <div className="text-lg font-mono font-bold text-white">
                          {formatLapTime(entry.lapTimeMs)}
                        </div>
                      </div>
                      
                      <div className="space-y-1 mb-3">
                        <div className="text-sm font-medium text-white">
                          {entry.customerName}
                        </div>
                        <div className="text-sm text-slate-400 break-words">
                          {entry.customerEmail}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(entry.recordedAt).toLocaleDateString('sk-SK')}
                        </div>
                      </div>

                      {canDelete && (
                        <button
                          onClick={() => handleDeleteAttempt(entry.id, entry.customerName)}
                          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                          style={{ minHeight: "44px" }}
                        >
                          <Trash2 className="w-4 h-4" />
                          Odstrániť pokus
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create Challenge Month Modal */}
        {showCreateChallengeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="rounded-lg max-w-md w-full" style={{ backgroundColor: "#292929" }}>
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    Vytvoriť výzvu
                  </h2>
                  <button
                    onClick={() => setShowCreateChallengeModal(false)}
                    className="text-slate-400 hover:text-slate-300"
                    style={{ minWidth: "44px", minHeight: "44px" }}
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
                    <p className="text-sm text-slate-300 mb-2">
                      Vytváram výzvu pre: <strong>{monthNames[selectedMonth - 1]} {selectedYear}</strong>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Názov trate *
                    </label>
                    <input
                      type="text"
                      value={challengeFormData.trackName}
                      onChange={(e) =>
                        setChallengeFormData({ ...challengeFormData, trackName: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-white"
                      style={{ backgroundColor: "#1f1f1f", minHeight: "44px" }}
                      placeholder="napr. Nürburgring Nordschleife"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Názov auta *
                    </label>
                    <input
                      type="text"
                      value={challengeFormData.carName}
                      onChange={(e) =>
                        setChallengeFormData({ ...challengeFormData, carName: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-white"
                      style={{ backgroundColor: "#1f1f1f", minHeight: "44px" }}
                      placeholder="napr. Porsche 911 GT3 RS"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Výhra
                    </label>
                    <input
                      type="text"
                      value={challengeFormData.prizeDescription}
                      onChange={(e) =>
                        setChallengeFormData({ ...challengeFormData, prizeDescription: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-white"
                      style={{ backgroundColor: "#1f1f1f", minHeight: "44px" }}
                      placeholder="napr. 50€ voucher, pohár, tričko..."
                    />
                    <p className="text-xs text-slate-400 mt-1">Voliteľné - čo je výhrou daného mesiaca</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={challengeFormSubmitting}
                      className="flex-1 px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: "#c20003", minHeight: "44px" }}
                    >
                      {challengeFormSubmitting ? "Vytváram..." : "Vytvoriť výzvu"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateChallengeModal(false)}
                      className="px-6 py-2 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors text-white"
                      style={{ minHeight: "44px" }}
                    >
                      Zrušiť
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
            <div className="rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: "#292929" }}>
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {attemptStep === "search" ? "Vybrať zákazníka" : "Zaznamenať čas okruhu"}
                  </h2>
                  <button
                    onClick={resetAttemptModal}
                    className="text-slate-400 hover:text-slate-300"
                    style={{ minWidth: "44px", minHeight: "44px" }}
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
                        placeholder="Hľadať podľa mena, emailu alebo adresy..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-white"
                        style={{ backgroundColor: "#1f1f1f", minHeight: "44px" }}
                        autoFocus
                      />
                    </div>

                    {/* Search Results */}
                    {searchLoading && (
                      <div className="text-center py-4 text-slate-400">
                        Hľadám...
                      </div>
                    )}

                    {!searchLoading && searchResults.length > 0 && (
                      <div className="rounded-lg max-h-96 overflow-y-auto" style={{ backgroundColor: "#1f1f1f" }}>
                        {searchResults.map((customer) => (
                          <button
                            key={customer.id}
                            onClick={() => handleSelectCustomer(customer)}
                            className="w-full px-4 py-3 text-left hover:bg-slate-800 transition-colors"
                            style={{ minHeight: "60px" }}
                          >
                            <div className="font-medium text-white">
                              {customer.firstName} {customer.lastName}
                            </div>
                            <div className="text-sm text-slate-300 break-words">{customer.email}</div>
                            {(customer.street || customer.city) && (
                              <div className="text-sm text-slate-400">
                                {formatAddress(customer.street, customer.city)}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {!searchLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
                      <div className="text-center py-8 text-slate-300">
                        Nenašli sa žiadni zákazníci zodpovedajúci &quot;{searchQuery}&quot;
                      </div>
                    )}

                    {searchQuery.length < 2 && (
                      <div className="text-center py-8 text-slate-400">
                        Začnite písať pre vyhľadanie zákazníkov...
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleRecordAttempt} className="space-y-4">
                    {/* Selected Customer */}
                    <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: "#1f1f1f" }}>
                      <p className="text-sm text-slate-300 mb-1">Zákazník</p>
                      <p className="font-medium text-white">
                        {selectedCustomer?.firstName} {selectedCustomer?.lastName}
                      </p>
                      <p className="text-sm text-slate-300 break-words">{selectedCustomer?.email}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setAttemptStep("search");
                          setSelectedCustomer(null);
                        }}
                        className="text-sm text-slate-300 hover:text-white mt-2"
                        style={{ minHeight: "44px" }}
                      >
                        Zmeniť zákazníka
                      </button>
                    </div>

                    {attemptFormErrors.general && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {attemptFormErrors.general}
                      </div>
                    )}

                    {/* Lap Time */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Čas okruhu *
                      </label>
                      <input
                        type="text"
                        value={attemptFormData.lapTime}
                        onChange={(e) =>
                          setAttemptFormData({ ...attemptFormData, lapTime: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
                        style={{ backgroundColor: "#1f1f1f", border: "none", minHeight: "44px" }}
                        placeholder="mm:ss:mmm (napr. 01:23:456) alebo ms (napr. 83456)"
                        required
                      />
                      {attemptFormErrors.lapTime && (
                        <p className="text-red-600 text-sm mt-1">{attemptFormErrors.lapTime}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">
                        Zadajte čas ako mm:ss:mmm (napr. 01:23:456) alebo milisekundy (napr. 83456)
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={attemptFormSubmitting}
                        className="flex-1 px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: "#c20003", minHeight: "44px" }}
                      >
                        {attemptFormSubmitting ? "Zaznamenávam..." : "Zaznamenať pokus"}
                      </button>
                      <button
                        type="button"
                        onClick={resetAttemptModal}
                        className="px-6 py-2 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors text-white"
                        style={{ minHeight: "44px" }}
                      >
                        Zrušiť
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
