"use client";

import { AdminQueryProvider } from "@/lib/query-client";
import { AdminRealtimeProvider } from "@/lib/realtime-client";
import { AuthGuard } from "@/components/layout/auth-guard";

export function Providers({ children }) {
  return (
    <AdminQueryProvider>
      <AuthGuard>
        <AdminRealtimeProvider>{children}</AdminRealtimeProvider>
      </AuthGuard>
    </AdminQueryProvider>
  );
}

