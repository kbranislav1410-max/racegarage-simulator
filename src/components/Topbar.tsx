"use client";

import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User } from "lucide-react";

export function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="px-6 py-4 rounded-2xl" style={{ backgroundColor: '#292929' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-white">
            Správa závodného simulátora
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-300">
            <User className="w-5 h-5" />
            <div className="text-sm">
              <div className="font-medium text-white">{user?.name || "Používateľ"}</div>
              <div className="text-xs text-slate-400">{user?.role || "STAFF"}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg transition-colors hover:bg-opacity-90"
            style={{ backgroundColor: '#c20003' }}
          >
            <LogOut className="w-4 h-4" />
            <span>Odhlásiť sa</span>
          </button>
        </div>
      </div>
    </header>
  );
}
