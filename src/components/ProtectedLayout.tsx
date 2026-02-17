"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen p-2 sm:p-4 lg:p-6" style={{ backgroundColor: '#191919' }}>
      <div className="flex gap-2 sm:gap-4 lg:gap-6 min-h-screen">
        <Sidebar isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
        <div className="flex-1 flex flex-col gap-2 sm:gap-4 lg:gap-6 min-w-0">
          <Topbar onMenuToggle={toggleMobileMenu} />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
