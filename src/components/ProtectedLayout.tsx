"use client";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#191919' }}>
      <div className="flex gap-6 min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col gap-6">
          <Topbar />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
