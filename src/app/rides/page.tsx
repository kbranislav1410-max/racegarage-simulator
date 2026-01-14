"use client";

import { ProtectedLayout } from "@/components/ProtectedLayout";

export default function RidesPage() {
  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Simulator Rides
            </h1>
            <p className="text-slate-600 mt-2">
              Track and manage simulator ride sessions
            </p>
          </div>
          <button className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors">
            Start New Ride
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Recent Rides
            </h2>
            <div className="text-slate-600 text-center py-8">
              No rides recorded yet. Click &quot;Start New Ride&quot; to begin.
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
