"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminDataApi } from "@/lib/admin-api";
import { adminQueryKeys } from "@/lib/query-client";
import { DataTable, FilterChip } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/glass-card";

const STATUS_FILTERS = ["ALL", "SCHEDULED", "CHECKED_IN", "COMPLETED", "CANCELLED", "NO_SHOW"];
const TYPE_FILTERS = ["ALL", "CONSULTATION", "FOLLOW_UP", "RADIOLOGY", "LAB_REVIEW", "TELEHEALTH"];

export function AppointmentsSection() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const query = useQuery({
    queryKey: adminQueryKeys.appointments({ page, status: statusFilter, type: typeFilter }),
    queryFn: () => adminDataApi.appointments({
      page,
      limit: 25,
      status: statusFilter === "ALL" ? undefined : statusFilter,
      type: typeFilter === "ALL" ? undefined : typeFilter,
    }),
    keepPreviousData: true,
  });

  const statusVariant = (s) => {
    const map = { SCHEDULED: "brand", CHECKED_IN: "info", COMPLETED: "success", CANCELLED: "error", NO_SHOW: "warning", REQUESTED: "neutral" };
    return map[s] ?? "neutral";
  };

  const columns = [
    { key: "patient", label: "Patient", render: (row) => (
      <div>
        <span className="font-medium">{row.patient?.user?.fullName ?? "—"}</span>
        <span className="block text-xs text-txt-muted mt-0.5">{row.patient?.user?.email}</span>
      </div>
    )},
    { key: "doctor", label: "Doctor", render: (row) => row.doctor?.fullName ?? "—" },
    { key: "type", label: "Type", render: (row) => <StatusBadge label={row.type} variant="brand" /> },
    { key: "scheduledStart", label: "Scheduled", render: (row) => formatDateTime(row.scheduledStart) },
    { key: "urgency", label: "Urgency", render: (row) => {
      const map = { ROUTINE: "success", MODERATE: "info", HIGH: "warning", EMERGENCY: "error" };
      return <StatusBadge label={row.urgency} variant={map[row.urgency] ?? "neutral"} />;
    }},
    { key: "status", label: "Status", render: (row) => <StatusBadge label={row.status} variant={statusVariant(row.status)} /> },
    { key: "hospital", label: "Hospital", render: (row) => row.hospital?.name ?? "—" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Appointments" title="Appointment Management" subtitle="All appointments with scheduling status and urgency levels." badge="Live API" />
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((s) => (
          <FilterChip key={s} label={s === "ALL" ? "All Statuses" : s.replace("_", " ")} active={statusFilter === s} onClick={() => { setStatusFilter(s); setPage(1); }} />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {TYPE_FILTERS.map((type) => (
          <FilterChip
            key={type}
            label={type === "ALL" ? "All Types" : type.replace("_", " ")}
            active={typeFilter === type}
            onClick={() => {
              setTypeFilter(type);
              setPage(1);
            }}
          />
        ))}
      </div>
      <DataTable
        columns={columns}
        data={query.data?.items ?? []}
        total={query.data?.total ?? 0}
        page={page}
        limit={25}
        onPageChange={setPage}
        loading={query.isLoading}
        emptyMessage="No appointments found."
      />
    </div>
  );
}

function formatDateTime(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
