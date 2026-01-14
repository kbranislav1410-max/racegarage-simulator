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
  Ticket,
  Settings,
} from "lucide-react";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["STAFF", "ADMIN"] },
  { href: "/customers", label: "Customers", icon: Users, roles: ["STAFF", "ADMIN"] },
  { href: "/rides", label: "Rides", icon: Car, roles: ["STAFF", "ADMIN"] },
  { href: "/reservations", label: "Reservations", icon: Calendar, roles: ["STAFF", "ADMIN"] },
  { href: "/challenge", label: "Challenge", icon: Trophy, roles: ["STAFF", "ADMIN"] },
  { href: "/payments", label: "Payments", icon: CreditCard, roles: ["ADMIN"] },
  { href: "/vouchers", label: "Vouchers", icon: Ticket, roles: ["STAFF", "ADMIN"] },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["ADMIN"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Filter menu items based on user role
  const visibleMenuItems = menuItems.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Racegarage</h1>
        <p className="text-sm text-slate-400">Simulator</p>
      </div>
      <nav className="space-y-2">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
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
