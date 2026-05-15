"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export const adminQueryKeys = {
  me: ["admin", "me"],
  dashboard: ["admin", "dashboard"],
  approvals: (params = {}) => ["admin", "approvals", params],
  reports: ["admin", "reports"],
  aiJobs: ["admin", "ai-jobs"],
  realtimeHealth: ["admin", "realtime-health"],
  hospitals: ["admin", "hospitals"],
  auditLogs: (params = {}) => ["admin", "audit-logs", params],
  users: (params = {}) => ["admin", "users", params],
  userDetail: (id) => ["admin", "users", id],
  appointments: (params = {}) => ["admin", "appointments", params],
  consultations: (params = {}) => ["admin", "consultations", params],
  analyticsSummary: ["admin", "analytics-summary"],
  analyticsTrends: (params = {}) => ["admin", "analytics-trends", params],
  billingSummary: ["admin", "billing-summary"],
  supportSummary: ["admin", "support-summary"],
  notifications: (params = {}) => ["admin", "notifications", params],
};

export function AdminQueryProvider({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: true,
            retry: (failureCount, error) => {
              if ([401, 403, 404].includes(error?.status)) return false;
              return failureCount < 2;
            },
          },
          mutations: {
            retry: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
