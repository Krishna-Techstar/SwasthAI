"use client";

import { useQuery } from "@tanstack/react-query";
import { Lock, MessageSquare, ShieldAlert } from "lucide-react";
import { adminDataApi } from "@/lib/admin-api";
import { adminQueryKeys } from "@/lib/query-client";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard, StatusBadge } from "@/components/ui/glass-card";

export function SupportSection() {
  const query = useQuery({
    queryKey: adminQueryKeys.supportSummary,
    queryFn: adminDataApi.supportSummary,
    refetchInterval: 60_000,
  });
  const totals = query.data?.totals ?? {};

  const auditColumns = [
    { key: "action", label: "Recent Action", render: (row) => <span className="font-medium text-brand">{row.action}</span> },
    { key: "actor", label: "Actor", render: (row) => row.actorEmail ?? row.actorRole ?? "system" },
    { key: "entityType", label: "Entity", render: (row) => <StatusBadge label={row.entityType} variant="neutral" /> },
    { key: "createdAt", label: "Time", render: (row) => fmt(row.createdAt) },
  ];

  const loginColumns = [
    { key: "email", label: "Email", render: (row) => <span className="font-medium">{row.email}</span> },
    { key: "reason", label: "Reason", render: (row) => row.reason ?? "-" },
    { key: "ipAddress", label: "IP", render: (row) => row.ipAddress ?? "-" },
    { key: "createdAt", label: "Time", render: (row) => fmt(row.createdAt) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Support"
        title="Support Center"
        subtitle="Operational support signals from audit logs, failed logins, and locked accounts."
        badge="Live API"
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatsCard
          label="Failed Logins 24h"
          value={dn(totals.failedLoginsLast24h)}
          change="Security support queue"
          changeType={totals.failedLoginsLast24h ? "down" : "up"}
          icon={<ShieldAlert className="h-5 w-5 text-error" />}
          iconBg="bg-error-dim"
        />
        <StatsCard
          label="Locked Users"
          value={dn(totals.lockedUsers)}
          change="May need admin review"
          changeType={totals.lockedUsers ? "down" : "up"}
          icon={<Lock className="h-5 w-5 text-warning" />}
          iconBg="bg-warning-dim"
          delay={80}
        />
        <StatsCard
          label="Disabled Users"
          value={dn(totals.disabledUsers)}
          change="Account lifecycle state"
          icon={<MessageSquare className="h-5 w-5 text-brand" />}
          delay={160}
        />
      </section>

      <DataTable
        columns={auditColumns}
        data={query.data?.recentAuditLogs ?? []}
        total={query.data?.recentAuditLogs?.length ?? 0}
        page={1}
        limit={10}
        loading={query.isLoading}
        emptyMessage="No audit activity yet."
      />

      <DataTable
        columns={loginColumns}
        data={query.data?.recentFailedLogins ?? []}
        total={query.data?.recentFailedLogins?.length ?? 0}
        page={1}
        limit={10}
        loading={query.isLoading}
        emptyMessage="No failed logins recorded."
      />
    </div>
  );
}

function dn(value) {
  return value === undefined || value === null ? "--" : new Intl.NumberFormat("en-IN").format(value);
}

function fmt(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}
