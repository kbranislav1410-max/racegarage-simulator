"use client";

import { ProtectedLayout } from "@/components/ProtectedLayout";

export default function DashboardPage() {
  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-600 mt-2">
            Welcome to the Racegarage Simulator Management System
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-slate-600">
              Total Customers
            </h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-slate-600">Total Rides</h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-slate-600">
              Active Reservations
            </h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-slate-600">
              Monthly Revenue
            </h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">$0</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Recent Activity
          </h2>
          <p className="text-slate-600">No recent activity to display</p>
        </div>
      </div>
    </ProtectedLayout>
  );
}
