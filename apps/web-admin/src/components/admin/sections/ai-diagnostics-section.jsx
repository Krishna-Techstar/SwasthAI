"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminDataApi } from "@/lib/admin-api";
import { adminQueryKeys } from "@/lib/query-client";
import { DataTable, FilterChip } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/glass-card";

const STATUS_FILTERS = ["ALL", "QUEUED", "RUNNING", "SUCCEEDED", "FAILED", "CANCELLED"];

export function AiDiagnosticsSection() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const query = useQuery({ queryKey: adminQueryKeys.aiJobs, queryFn: () => adminDataApi.aiJobs(), refetchInterval: 15_000 });
  const filtered = (query.data?.items ?? []).filter((j) => statusFilter === "ALL" ? true : j.status === statusFilter);
  const statusCounts = (query.data?.items ?? []).reduce((acc, j) => { acc[j.status] = (acc[j.status] ?? 0) + 1; return acc; }, {});
  const statusVariant = (s) => ({ QUEUED: "brand", RUNNING: "info", SUCCEEDED: "success", FAILED: "error", CANCELLED: "warning" }[s] ?? "neutral");

  const columns = [
    { key: "jobType", label: "Job Type", render: (row) => <span className="font-medium">{row.jobType}</span> },
    { key: "patient", label: "Patient", render: (row) => row.patient?.user?.fullName ?? "—" },
    { key: "status", label: "Status", render: (row) => <StatusBadge label={row.status} variant={statusVariant(row.status)} /> },
    { key: "scanType", label: "Scan Type", render: (row) => row.radiologyUpload?.scanType ?? "N/A" },
    { key: "createdAt", label: "Created", render: (row) => fmt(row.createdAt) },
    { key: "error", label: "Error", render: (row) => row.errorMessage ? <span className="text-xs text-error max-w-[200px] truncate block">{row.errorMessage}</span> : "—" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="AI Diagnostics" title="AI Inference Queue" subtitle="Clinical and radiology AI processing jobs." badge="Live API" />
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((s) => <FilterChip key={s} label={s === "ALL" ? `All (${query.data?.items?.length ?? 0})` : `${s} (${statusCounts[s] ?? 0})`} active={statusFilter === s} onClick={() => setStatusFilter(s)} />)}
      </div>
      <DataTable columns={columns} data={filtered} total={filtered.length} page={1} limit={100} loading={query.isLoading} emptyMessage="No AI jobs found." />
    </div>
  );
}

function fmt(v) { return v ? new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" }).format(new Date(v)) : "—"; }
