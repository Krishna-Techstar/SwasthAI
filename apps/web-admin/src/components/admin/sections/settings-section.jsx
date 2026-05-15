"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus } from "lucide-react";
import { adminDataApi } from "@/lib/admin-api";
import { adminQueryKeys } from "@/lib/query-client";
import { GlassCard } from "@/components/ui/glass-card";
import { PageHeader } from "@/components/ui/page-header";

export function SettingsSection() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: adminQueryKeys.hospitals, queryFn: adminDataApi.hospitals });
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", city: "", state: "", address: "" });

  const createMutation = useMutation({
    mutationFn: (data) => adminDataApi.createHospital(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: adminQueryKeys.hospitals }); setShowCreate(false); setForm({ name: "", code: "", city: "", state: "", address: "" }); },
  });

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Settings" title="System Settings" subtitle="Hospital management and system configuration." badge="Live API">
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white-text shadow-[0_4px_12px_rgba(139,92,246,0.25)] hover:brightness-110 transition-all">
          <Plus className="h-4 w-4" /> Add Hospital
        </button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(query.data?.items ?? []).map((hospital) => (
          <GlassCard key={hospital.id} hover>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-dim">
                <Building2 className="h-5 w-5 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-txt-primary truncate">{hospital.name}</p>
                <p className="text-xs text-txt-muted mt-0.5">{hospital.city ?? "City not set"} · Code: {hospital.code}</p>
                <div className="mt-3 flex items-center gap-4 text-xs text-txt-secondary">
                  <span>{hospital._count?.doctorProfiles ?? 0} doctors</span>
                  <span>{hospital._count?.nurseProfiles ?? 0} nurses</span>
                  <span>{hospital._count?.appointments ?? 0} appointments</span>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
        {query.isLoading && Array.from({ length: 3 }).map((_, i) => (
          <GlassCard key={i}><div className="skeleton h-16 rounded" /></GlassCard>
        ))}
        {!query.isLoading && (query.data?.items ?? []).length === 0 && (
          <GlassCard><p className="text-sm text-txt-muted py-4">No hospitals configured yet.</p></GlassCard>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-glass backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-txt-primary mb-4">Create Hospital</h3>
            <div className="space-y-3">
              {[["name", "Hospital Name"], ["code", "Code"], ["city", "City"], ["state", "State"], ["address", "Address"]].map(([key, label]) => (
                <div key={key}>
                  <label className="text-xs font-medium text-txt-secondary mb-1 block">{label}</label>
                  <input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-txt-primary outline-none focus:border-border-active" />
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="rounded-lg border border-border px-4 py-2 text-sm text-txt-secondary hover:bg-card-hover">Cancel</button>
              <button onClick={() => createMutation.mutate(form)} disabled={!form.name || !form.code || createMutation.isPending} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white-text hover:brightness-110 disabled:opacity-50">
                {createMutation.isPending ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
