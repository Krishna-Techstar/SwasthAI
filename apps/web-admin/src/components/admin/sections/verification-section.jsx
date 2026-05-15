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

export function VerificationSection() {
  const [roleFilter, setRoleFilter] = useState("ALL");
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: adminQueryKeys.approvals({ role: roleFilter === "ALL" ? undefined : roleFilter, status: "PENDING" }),
    queryFn: () => adminDataApi.approvals({ role: roleFilter === "ALL" ? undefined : roleFilter, status: "PENDING", limit: 50 }),
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

  const columns = [
    { key: "name", label: "Applicant", render: (row) => (
      <div><span className="font-medium">{row.user?.fullName}</span><span className="block text-xs text-txt-muted mt-0.5">{row.user?.email}</span></div>
    )},
    { key: "role", label: "Role", render: (row) => <StatusBadge label={row.role} variant="brand" /> },
    { key: "hospital", label: "Hospital", render: (row) => row.hospital?.name ?? "—" },
    { key: "submittedAt", label: "Submitted", render: (row) => fmt(row.submittedAt) },
    { key: "status", label: "Status", render: (row) => <StatusBadge label={row.status} variant="warning" /> },
    { key: "actions", label: "Actions", render: (row) => (
      <div className="flex items-center gap-2">
        <button onClick={() => setApprovalTarget(row)} className="flex items-center gap-1 rounded-lg bg-success/10 px-2.5 py-1.5 text-xs font-medium text-success hover:bg-success/20"><CheckCircle2 className="h-3 w-3" /> Approve</button>
        <button onClick={() => setRejectTarget(row)} className="flex items-center gap-1 rounded-lg bg-error/10 px-2.5 py-1.5 text-xs font-medium text-error hover:bg-error/20"><XCircle className="h-3 w-3" /> Reject</button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader eyebrow="Verification" title="Verification Queue" subtitle="Doctor and nurse credential approvals requiring admin action." badge="Live API" />
        <button 
          onClick={async () => {
            await adminDataApi.seedDoctor();
            queryClient.invalidateQueries({ queryKey: ["admin"] });
          }}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90"
        >
          Seed Demo Doctor
        </button>
      </div>
      <div className="flex items-center gap-2">
        <FilterChip label="All" active={roleFilter === "ALL"} onClick={() => setRoleFilter("ALL")} />
        <FilterChip label="Doctors" active={roleFilter === "DOCTOR"} onClick={() => setRoleFilter("DOCTOR")} />
        <FilterChip label="Nurses" active={roleFilter === "NURSE"} onClick={() => setRoleFilter("NURSE")} />
      </div>
      <DataTable columns={columns} data={query.data?.items ?? []} total={query.data?.total ?? 0} page={1} limit={50} loading={query.isLoading} emptyMessage="No pending verifications." />
      <ConfirmationModal open={!!approvalTarget} onClose={() => setApprovalTarget(null)} onConfirm={() => approveMutation.mutate(approvalTarget?.id)} title="Approve Credential" description={`Approve ${approvalTarget?.user?.fullName}?`} confirmLabel="Approve" loading={approveMutation.isPending} />
      <ConfirmationModal open={!!rejectTarget} onClose={() => setRejectTarget(null)} onConfirm={() => rejectMutation.mutate(rejectTarget?.id)} title="Reject Credential" description={`Reject ${rejectTarget?.user?.fullName}?`} confirmLabel="Reject" variant="error" loading={rejectMutation.isPending} />
    </div>
  );
}

function fmt(v) { return v ? new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" }).format(new Date(v)) : "—"; }
