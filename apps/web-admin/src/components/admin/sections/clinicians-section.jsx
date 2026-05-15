"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle } from "lucide-react";
import { adminDataApi } from "@/lib/admin-api";
import { adminQueryKeys } from "@/lib/query-client";
import { DataTable, FilterChip } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/glass-card";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

export function DoctorsSection() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("roster");
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: adminQueryKeys.users({ role: "DOCTOR", page, search }),
    queryFn: () => adminDataApi.users({ role: "DOCTOR", page, limit: 25, search: search || undefined }),
    keepPreviousData: true,
  });

  const approvalsQuery = useQuery({
    queryKey: adminQueryKeys.approvals({ role: "DOCTOR", status: "PENDING" }),
    queryFn: () => adminDataApi.approvals({ role: "DOCTOR", status: "PENDING", limit: 50 }),
  });

  const [approvalTarget, setApprovalTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

  const approveMutation = useMutation({
    mutationFn: (id) => adminDataApi.approveApproval(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      setApprovalTarget(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => adminDataApi.rejectApproval(id, "Rejected by admin"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      setRejectTarget(null);
    },
  });

  const pendingCount = approvalsQuery.data?.total ?? 0;

  const rosterColumns = [
    { key: "fullName", label: "Name", render: (row) => (
      <div>
        <span className="font-medium">{row.fullName}</span>
        <span className="block text-xs text-txt-muted mt-0.5">{row.email}</span>
      </div>
    )},
    { key: "specialization", label: "Specialization", render: (row) => row.doctorProfile?.specialization ?? "—" },
    { key: "registrationNumber", label: "Reg. No.", render: (row) => row.doctorProfile?.registrationNumber ?? "—" },
    { key: "status", label: "Status", render: (row) => <StatusBadge label={row.status} variant={row.status === "ACTIVE" ? "success" : "warning"} /> },
    { key: "approvalStatus", label: "Approval", render: (row) => <StatusBadge label={row.approvalStatus} variant={row.approvalStatus === "APPROVED" ? "success" : row.approvalStatus === "PENDING" ? "warning" : "error"} /> },
    { key: "lastLoginAt", label: "Last Login", render: (row) => row.lastLoginAt ? formatTime(row.lastLoginAt) : "Never" },
  ];

  const approvalColumns = [
    { key: "fullName", label: "Name", render: (row) => (
      <div>
        <span className="font-medium">{row.user?.fullName}</span>
        <span className="block text-xs text-txt-muted mt-0.5">{row.user?.email}</span>
      </div>
    )},
    { key: "specialization", label: "Specialization", render: (row) => row.user?.doctorProfile?.specialization ?? "—" },
    { key: "regNumber", label: "Reg. No.", render: (row) => row.user?.doctorProfile?.registrationNumber ?? "—" },
    { key: "submittedAt", label: "Submitted", render: (row) => formatTime(row.submittedAt) },
    { key: "status", label: "Status", render: (row) => <StatusBadge label={row.status} variant="warning" /> },
    { key: "actions", label: "Actions", render: (row) => (
      <div className="flex items-center gap-2">
        <button onClick={() => setApprovalTarget(row)} className="flex items-center gap-1 rounded-lg bg-success/10 px-2.5 py-1.5 text-xs font-medium text-success hover:bg-success/20 transition-colors">
          <CheckCircle2 className="h-3 w-3" /> Approve
        </button>
        <button onClick={() => setRejectTarget(row)} className="flex items-center gap-1 rounded-lg bg-error/10 px-2.5 py-1.5 text-xs font-medium text-error hover:bg-error/20 transition-colors">
          <XCircle className="h-3 w-3" /> Reject
        </button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Doctors"
        title="Doctor Management"
        subtitle="Full doctor roster and credential approval workflow from the database."
        badge="Live API"
      />

      <div className="flex items-center gap-2">
        <FilterChip label="All Doctors" active={tab === "roster"} onClick={() => setTab("roster")} />
        <FilterChip label={`Pending Approvals (${pendingCount})`} active={tab === "approvals"} onClick={() => setTab("approvals")} />
      </div>

      {tab === "roster" ? (
        <DataTable
          columns={rosterColumns}
          data={usersQuery.data?.items ?? []}
          total={usersQuery.data?.total ?? 0}
          page={page}
          limit={25}
          onPageChange={setPage}
          loading={usersQuery.isLoading}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by name, email..."
          emptyMessage="No doctors registered yet."
        />
      ) : (
        <DataTable
          columns={approvalColumns}
          data={approvalsQuery.data?.items ?? []}
          total={approvalsQuery.data?.total ?? 0}
          page={1}
          limit={50}
          loading={approvalsQuery.isLoading}
          emptyMessage="No pending doctor approvals."
        />
      )}

      <ConfirmationModal
        open={!!approvalTarget}
        onClose={() => setApprovalTarget(null)}
        onConfirm={() => approveMutation.mutate(approvalTarget?.id)}
        title="Approve Doctor"
        description={`Are you sure you want to approve ${approvalTarget?.user?.fullName}? They will be able to log in and conduct consultations.`}
        confirmLabel="Approve"
        loading={approveMutation.isPending}
      />

      <ConfirmationModal
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={() => rejectMutation.mutate(rejectTarget?.id)}
        title="Reject Doctor"
        description={`Are you sure you want to reject ${rejectTarget?.user?.fullName}'s application?`}
        confirmLabel="Reject"
        variant="error"
        loading={rejectMutation.isPending}
      />
    </div>
  );
}

export function NursesSection() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("roster");
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: adminQueryKeys.users({ role: "NURSE", page, search }),
    queryFn: () => adminDataApi.users({ role: "NURSE", page, limit: 25, search: search || undefined }),
    keepPreviousData: true,
  });

  const approvalsQuery = useQuery({
    queryKey: adminQueryKeys.approvals({ role: "NURSE", status: "PENDING" }),
    queryFn: () => adminDataApi.approvals({ role: "NURSE", status: "PENDING", limit: 50 }),
  });

  const [approvalTarget, setApprovalTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

  const approveMutation = useMutation({
    mutationFn: (id) => adminDataApi.approveApproval(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin"] }); setApprovalTarget(null); },
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => adminDataApi.rejectApproval(id, "Rejected by admin"),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin"] }); setRejectTarget(null); },
  });

  const pendingCount = approvalsQuery.data?.total ?? 0;

  const rosterColumns = [
    { key: "fullName", label: "Name", render: (row) => (
      <div>
        <span className="font-medium">{row.fullName}</span>
        <span className="block text-xs text-txt-muted mt-0.5">{row.email}</span>
      </div>
    )},
    { key: "department", label: "Department", render: (row) => row.nurseProfile?.department ?? "—" },
    { key: "licenseNumber", label: "License No.", render: (row) => row.nurseProfile?.licenseNumber ?? "—" },
    { key: "status", label: "Status", render: (row) => <StatusBadge label={row.status} variant={row.status === "ACTIVE" ? "success" : "warning"} /> },
    { key: "approvalStatus", label: "Approval", render: (row) => <StatusBadge label={row.approvalStatus} variant={row.approvalStatus === "APPROVED" ? "success" : row.approvalStatus === "PENDING" ? "warning" : "error"} /> },
    { key: "lastLoginAt", label: "Last Login", render: (row) => row.lastLoginAt ? formatTime(row.lastLoginAt) : "Never" },
  ];

  const approvalColumns = [
    { key: "fullName", label: "Name", render: (row) => (
      <div>
        <span className="font-medium">{row.user?.fullName}</span>
        <span className="block text-xs text-txt-muted mt-0.5">{row.user?.email}</span>
      </div>
    )},
    { key: "department", label: "Department", render: (row) => row.user?.nurseProfile?.department ?? "—" },
    { key: "licenseNumber", label: "License No.", render: (row) => row.user?.nurseProfile?.licenseNumber ?? "—" },
    { key: "submittedAt", label: "Submitted", render: (row) => formatTime(row.submittedAt) },
    { key: "status", label: "Status", render: (row) => <StatusBadge label={row.status} variant="warning" /> },
    { key: "actions", label: "Actions", render: (row) => (
      <div className="flex items-center gap-2">
        <button onClick={() => setApprovalTarget(row)} className="flex items-center gap-1 rounded-lg bg-success/10 px-2.5 py-1.5 text-xs font-medium text-success hover:bg-success/20 transition-colors">
          <CheckCircle2 className="h-3 w-3" /> Approve
        </button>
        <button onClick={() => setRejectTarget(row)} className="flex items-center gap-1 rounded-lg bg-error/10 px-2.5 py-1.5 text-xs font-medium text-error hover:bg-error/20 transition-colors">
          <XCircle className="h-3 w-3" /> Reject
        </button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Nurses" title="Nurse Management" subtitle="Nurse roster and verification workflow." badge="Live API" />
      <div className="flex items-center gap-2">
        <FilterChip label="All Nurses" active={tab === "roster"} onClick={() => setTab("roster")} />
        <FilterChip label={`Pending Approvals (${pendingCount})`} active={tab === "approvals"} onClick={() => setTab("approvals")} />
      </div>
      {tab === "roster" ? (
        <DataTable columns={rosterColumns} data={usersQuery.data?.items ?? []} total={usersQuery.data?.total ?? 0} page={page} limit={25} onPageChange={setPage} loading={usersQuery.isLoading} searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search by name, email..." emptyMessage="No nurses registered yet." />
      ) : (
        <DataTable columns={approvalColumns} data={approvalsQuery.data?.items ?? []} total={approvalsQuery.data?.total ?? 0} page={1} limit={50} loading={approvalsQuery.isLoading} emptyMessage="No pending nurse approvals." />
      )}
      <ConfirmationModal open={!!approvalTarget} onClose={() => setApprovalTarget(null)} onConfirm={() => approveMutation.mutate(approvalTarget?.id)} title="Approve Nurse" description={`Approve ${approvalTarget?.user?.fullName}?`} confirmLabel="Approve" loading={approveMutation.isPending} />
      <ConfirmationModal open={!!rejectTarget} onClose={() => setRejectTarget(null)} onConfirm={() => rejectMutation.mutate(rejectTarget?.id)} title="Reject Nurse" description={`Reject ${rejectTarget?.user?.fullName}?`} confirmLabel="Reject" variant="error" loading={rejectMutation.isPending} />
    </div>
  );
}

function formatTime(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}
