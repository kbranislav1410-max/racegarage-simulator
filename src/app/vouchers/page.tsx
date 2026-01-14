"use client";

import { ProtectedLayout } from "@/components/ProtectedLayout";

export default function VouchersPage() {
  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Vouchers</h1>
            <p className="text-slate-600 mt-2">
              Create and validate vouchers for customers
            </p>
          </div>
          <button className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors">
            Create Voucher
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Active Vouchers
            </h2>
            <div className="text-slate-600 text-center py-8">
              No active vouchers
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Validate Voucher
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter voucher code"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
              <button className="w-full px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors">
                Validate
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Voucher History
          </h2>
          <div className="text-slate-600 text-center py-8">
            No voucher history to display
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
