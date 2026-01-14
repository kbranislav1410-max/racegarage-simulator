"use client";

import { ProtectedLayout } from "@/components/ProtectedLayout";

export default function CustomersPage() {
  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Customers</h1>
            <p className="text-slate-600 mt-2">
              Manage customer accounts and information
            </p>
          </div>
          <button className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors">
            Add Customer
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Customer List
            </h2>
            <div className="text-slate-600 text-center py-8">
              No customers found. Click &quot;Add Customer&quot; to get started.
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
