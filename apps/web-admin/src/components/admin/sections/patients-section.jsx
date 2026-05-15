"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminDataApi } from "@/lib/admin-api";
import { adminQueryKeys } from "@/lib/query-client";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/glass-card";

export function PatientsSection() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: adminQueryKeys.users({ role: "PATIENT", page, search }),
    queryFn: () => adminDataApi.users({ role: "PATIENT", page, limit: 25, search: search || undefined }),
    keepPreviousData: true,
  });

  const columns = [
    { key: "fullName", label: "Patient Name", render: (row) => (
      <div>
        <span className="font-medium">{row.fullName}</span>
        <span className="block text-xs text-txt-muted mt-0.5">{row.email}</span>
      </div>
    )},
    { key: "phone", label: "Phone", render: (row) => row.phone ?? "—" },
    { key: "gender", label: "Gender", render: (row) => row.patientProfile?.gender ?? "—" },
    { key: "bloodGroup", label: "Blood Group", render: (row) => (
      row.patientProfile?.bloodGroup ? (
        <span className="inline-flex items-center rounded-full bg-error-dim px-2 py-0.5 text-[11px] font-semibold text-error">{row.patientProfile.bloodGroup}</span>
      ) : "—"
    )},
    { key: "dob", label: "Date of Birth", render: (row) => row.patientProfile?.dateOfBirth ? new Date(row.patientProfile.dateOfBirth).toLocaleDateString("en-IN") : "—" },
    { key: "status", label: "Status", render: (row) => <StatusBadge label={row.status} variant={row.status === "ACTIVE" ? "success" : "warning"} /> },
    { key: "createdAt", label: "Registered", render: (row) => formatTime(row.createdAt) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Patients"
        title="Patient Directory"
        subtitle="Search and view all registered patients from the database."
        badge="Live API"
      />
      <DataTable
        columns={columns}
        data={query.data?.items ?? []}
        total={query.data?.total ?? 0}
        page={page}
        limit={25}
        onPageChange={setPage}
        loading={query.isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email, ABHA ID..."
        emptyMessage="No patients registered yet."
      />
    </div>
  );
}

function formatTime(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}
