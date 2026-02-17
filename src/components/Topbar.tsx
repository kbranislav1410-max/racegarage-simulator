"use client";

import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, Menu } from "lucide-react";

interface TopbarProps {
  onMenuToggle?: () => void;
}

export function Topbar({ onMenuToggle }: TopbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="px-4 py-3 sm:px-6 sm:py-4 rounded-2xl" style={{ backgroundColor: '#292929' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Hamburger menu button - only visible on mobile */}
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 text-white hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Otvoriť menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}
          <h2 className="text-base sm:text-xl font-semibold text-white truncate">
            Správa závodného simulátora
          </h2>
        </div>
        {/* User info and logout - only visible on desktop */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-300">
            <User className="w-5 h-5" />
            <div className="text-sm">
              <div className="font-medium text-white">{user?.name || "Používateľ"}</div>
              <div className="text-xs text-slate-400">{user?.role || "STAFF"}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg transition-colors hover:brightness-90"
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
