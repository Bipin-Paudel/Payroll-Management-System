"use client";

import type { ReactNode } from "react";
import Header from "@/components/header/Header";
import Sidebar from "@/components/sidebar/Sidebar";
import { LayoutProvider, useLayout } from "@/context/LayoutContext";

function Shell({ children }: { children: ReactNode }) {
  const { sidebarOpen } = useLayout();

  return (
    <div className="min-h-screen bg-white">
      {/* Header fixed height: 64px (h-16) */}
      <Header />

      {/* Body height = full screen minus header */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar fixed + full height */}
        {sidebarOpen && (
          <aside className="hidden md:block w-72 shrink-0 border-r bg-white h-[calc(100vh-64px)] sticky top-16">
            <Sidebar />
          </aside>
        )}

        {/* Content scrolls independently */}
        <main className="flex-1 min-w-0 h-[calc(100vh-64px)] overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <LayoutProvider>
      <Shell>{children}</Shell>
    </LayoutProvider>
  );
}
