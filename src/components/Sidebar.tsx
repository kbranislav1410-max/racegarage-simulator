"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  Car,
  Calendar,
  Trophy,
  CreditCard,
  FileText,
  Ticket,
  Settings,
  UserCog,
  LogOut,
  User,
  X,
} from "lucide-react";

const menuItems = [
  { href: "/dashboard", label: "Prehľad", icon: LayoutDashboard, roles: ["USER", "ADMIN", "SUPER_ADMIN"] },
  { href: "/customers", label: "Zákazníci", icon: Users, roles: ["USER", "ADMIN", "SUPER_ADMIN"] },
  { href: "/rides", label: "Jazdy", icon: Car, roles: ["USER", "ADMIN", "SUPER_ADMIN"] },
  { href: "/reservations", label: "Rezervácie", icon: Calendar, roles: ["USER", "ADMIN", "SUPER_ADMIN"] },
  { href: "/challenge", label: "Výzva", icon: Trophy, roles: ["USER", "ADMIN", "SUPER_ADMIN"] },
  { href: "/payments", label: "Platby", icon: CreditCard, roles: ["ADMIN", "SUPER_ADMIN"] },
  { href: "/vouchers", label: "Vouchery", icon: Ticket, roles: ["USER", "ADMIN", "SUPER_ADMIN"] },
  { href: "/settings", label: "Nastavenia", icon: Settings, roles: ["ADMIN", "SUPER_ADMIN"] },
  { href: "/users", label: "Používatelia", icon: UserCog, roles: ["SUPER_ADMIN"] },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Filter menu items based on user role
  const visibleMenuItems = menuItems.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
  };

  const handleLinkClick = () => {
    // Close mobile menu when a link is clicked
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "text-white p-6 rounded-2xl transition-transform duration-300 ease-in-out",
          // Desktop: always visible, fixed width
          "lg:w-64 lg:translate-x-0 lg:static",
          // Mobile: fixed position, slide in/out
          "fixed top-0 left-0 bottom-0 w-64 z-50 lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        style={{ backgroundColor: '#292929' }}
      >
        {/* Close button - only visible on mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors lg:hidden"
            aria-label="Zavrieť menu"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        <div className="mb-8">
          <img 
            src="/logo.png" 
            alt="Racegarage Logo" 
            className="max-w-[200px] h-auto mb-1"
          />
          <p className="text-sm text-slate-400">Simulator</p>
        </div>

        <nav className="space-y-2 mb-6 flex-1 overflow-y-auto">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            // Highlight menu items when on their page or subpages
            const isActive = pathname === item.href || 
              (item.href === "/payments" && pathname.startsWith("/payments/")) ||
              (item.href === "/vouchers" && pathname.startsWith("/vouchers/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  isActive
                    ? "text-white"
                    : "text-slate-300 hover:text-white"
                )}
                style={isActive ? { backgroundColor: '#c20003' } : undefined}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#c20003';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info and logout button at the bottom */}
        <div className="border-t border-slate-700 pt-4 mt-auto">
          <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg" style={{ backgroundColor: '#1f1f1f' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#c20003' }}>
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{user?.name || "Používateľ"}</div>
              <div className="text-xs text-slate-400">{user?.role || "STAFF"}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white rounded-lg transition-colors hover:brightness-90"
            style={{ backgroundColor: '#c20003' }}
          >
            <LogOut className="w-4 h-4" />
            <span>Odhlásiť sa</span>
          </button>
        </div>
      </aside>
    </>
  );
}
