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

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Filter menu items based on user role
  const visibleMenuItems = menuItems.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  return (
    <aside className="w-64 text-white p-6 rounded-2xl" style={{ backgroundColor: '#292929' }}>
      <div className="mb-8">
        <img 
          src="/logo.png" 
          alt="Racegarage Logo" 
          className="max-w-[200px] h-auto mb-1"
        />
        <p className="text-sm text-slate-400">Simulator</p>
      </div>
      <nav className="space-y-2">
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
    </aside>
  );
}
