"use client";

import { ProtectedLayout } from "@/components/ProtectedLayout";

export default function ChallengePage() {
  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Monthly Challenges
          </h1>
          <p className="text-slate-600 mt-2">
            Track monthly challenges and view the leaderboard
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Current Challenge
            </h2>
            <div className="text-slate-600">
              <p className="mb-2">No active challenge this month</p>
              <p className="text-sm">Check back later for new challenges!</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Leaderboard
            </h2>
            <div className="text-slate-600 text-center py-4">
              No leaderboard data available
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Past Challenges
          </h2>
          <div className="text-slate-600 text-center py-8">
            No previous challenges to display
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
