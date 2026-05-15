"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminDataApi } from "@/lib/admin-api";
import { adminQueryKeys } from "@/lib/query-client";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/glass-card";

export function AuditLogsSection() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: adminQueryKeys.auditLogs({ page, search }),
    queryFn: () => adminDataApi.auditLogs({ page, limit: 25, search: search || undefined }),
    keepPreviousData: true,
  });

  const items = query.data?.items ?? query.data ?? [];
  const total = query.data?.total ?? items.length;

  const columns = [
    { key: "action", label: "Action", render: (row) => <span className="font-medium text-brand">{row.action}</span> },
    { key: "actor", label: "Actor", render: (row) => row.actorEmail ?? row.actorRole ?? "system" },
    { key: "entityType", label: "Entity", render: (row) => <StatusBadge label={row.entityType} variant="neutral" /> },
    { key: "entityId", label: "Entity ID", render: (row) => row.entityId ? <span className="font-mono text-xs">{row.entityId.slice(0, 8)}…</span> : "—" },
    { key: "ipAddress", label: "IP", render: (row) => row.ipAddress ?? "—" },
    { key: "createdAt", label: "Time", render: (row) => fmt(row.createdAt) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Audit Logs" title="Security & Audit Trail" subtitle="Every administrative and clinical action is recorded." badge="Live API" />
      <DataTable columns={columns} data={items} total={total} page={page} limit={25} onPageChange={setPage} loading={query.isLoading} searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search by action, actor..." emptyMessage="No audit records yet." />
    </div>
  );
}

function fmt(v) { return v ? new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short", year: "numeric" }).format(new Date(v)) : "—"; }
