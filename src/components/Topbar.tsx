"use client";

import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User } from "lucide-react";

export function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-slate-800">
            Správa závodného simulátora
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-600">
            <User className="w-5 h-5" />
            <div className="text-sm">
              <div className="font-medium">{user?.name || "Používateľ"}</div>
              <div className="text-xs text-slate-500">{user?.role || "STAFF"}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-slate-700 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Odhlásiť sa</span>
          </button>
        </div>
      </div>
    </header>
  );
}
