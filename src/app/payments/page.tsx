"use client";

import { ProtectedLayout } from "@/components/ProtectedLayout";

export default function PaymentsPage() {
  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Payments & Financial Settlement
          </h1>
          <p className="text-slate-600 mt-2">
            Manage payments and 50/50 financial settlements
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-slate-600">
              Total Revenue
            </h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">$0.00</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-slate-600">
              Owner Share (50%)
            </h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">$0.00</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-slate-600">
              Partner Share (50%)
            </h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">$0.00</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Recent Transactions
          </h2>
          <div className="text-slate-600 text-center py-8">
            No transactions to display
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
