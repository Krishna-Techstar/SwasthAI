"use client";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useAdminStore } from "@/store/admin-store";
import { cn } from "@/lib/utils";

export function AdminShell({ children }) {
  const sidebarCollapsed = useAdminStore((state) => state.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-background text-txt-primary">
      <Sidebar />
      <Header />
      <main
        className={cn(
          "min-h-screen pt-16 transition-all duration-300",
          sidebarCollapsed ? "pl-[72px]" : "pl-[260px]"
        )}
      >
        <div className="mx-auto w-full max-w-[1500px] px-6 py-6">{children}</div>
      </main>
    </div>
  );
}
