"use client";

import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  Brain,
  CalendarClock,
  FileText,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { GlassCard, StatsCard, StatusBadge } from "@/components/ui/glass-card";
import { adminDataApi } from "@/lib/admin-api";
import { adminQueryKeys } from "@/lib/query-client";

// Section imports
import { DoctorsSection, NursesSection } from "@/components/admin/sections/clinicians-section";
import { PatientsSection } from "@/components/admin/sections/patients-section";
import { AiDiagnosticsSection } from "@/components/admin/sections/ai-diagnostics-section";
import { AppointmentsSection } from "@/components/admin/sections/appointments-section";
import { AnalyticsSection } from "@/components/admin/sections/analytics-section";
import { VerificationSection } from "@/components/admin/sections/verification-section";
import { NotificationsSection } from "@/components/admin/sections/notifications-section";
import { AuditLogsSection } from "@/components/admin/sections/audit-logs-section";
import { SettingsSection } from "@/components/admin/sections/settings-section";
import { BillingSection } from "@/components/admin/sections/billing-section";
import { SupportSection } from "@/components/admin/sections/support-section";

const SECTION_MAP = {
  doctors: DoctorsSection,
  nurses: NursesSection,
  patients: PatientsSection,
  "ai-diagnostics": AiDiagnosticsSection,
  appointments: AppointmentsSection,
  analytics: AnalyticsSection,
  verification: VerificationSection,
  notifications: NotificationsSection,
  "audit-logs": AuditLogsSection,
  settings: SettingsSection,
  billing: BillingSection,
  support: SupportSection,
};

export function LiveAdminSection({ section }) {
  const activeSection = section in SECTION_MAP || section === "dashboard" ? section : "dashboard";

  if (activeSection === "dashboard") {
    return <Dashboard />;
  }

  const SectionComponent = SECTION_MAP[activeSection];
  return SectionComponent ? <SectionComponent /> : <Dashboard />;
}

function Dashboard() {
  const dashboardQuery = useQuery({
    queryKey: adminQueryKeys.dashboard,
    queryFn: adminDataApi.dashboard,
    refetchInterval: 30_000,
  });
  const realtimeQuery = useQuery({
    queryKey: adminQueryKeys.realtimeHealth,
    queryFn: adminDataApi.realtimeHealth,
    refetchInterval: 15_000,
  });

  const data = dashboardQuery.data;
  const realtime = realtimeQuery.data;
  const metrics = data?.metrics ?? {};
  const queues = data?.queues ?? {};
  const loading = dashboardQuery.isLoading;
  const error = dashboardQuery.error;

  const statCards = [
    { label: "Active Patients", value: dn(metrics.activePatients), change: "PostgreSQL user records", icon: <Users className="h-5 w-5 text-brand" /> },
    { label: "Verified Clinicians", value: dn(metrics.verifiedClinicians), change: "Approved doctors and nurses", icon: <BadgeCheck className="h-5 w-5 text-success" />, iconBg: "bg-success-dim", delay: 80 },
    { label: "AI Queue", value: dn(queues.pendingAiJobs), change: `${dn(queues.failedAiJobs)} failed jobs`, changeType: queues.failedAiJobs ? "down" : "up", icon: <Brain className="h-5 w-5 text-warning" />, iconBg: "bg-warning-dim", delay: 160 },
    { label: "Reports In Review", value: dn(queues.reportsUnderReview), change: "SOAP and radiology", icon: <FileText className="h-5 w-5 text-purple" />, iconBg: "bg-purple-dim", delay: 240 },
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Command Center</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-txt-primary">SwasthAI Admin Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-txt-secondary">
            Live healthcare operations, approvals, AI queues, reports, and realtime delivery from the NestJS API.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
          <Activity className="h-4 w-4 text-brand" />
          <span className="text-xs font-medium text-txt-secondary">{loading ? "Loading live data" : `Updated ${formatTime(data?.generatedAt)}`}</span>
        </div>
      </section>

      {error ? <ErrorBanner error={error} /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => <StatsCard key={card.label} {...card} />)}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <GlassCard className="min-h-[320px]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-txt-primary">Live System State</h2>
              <p className="mt-1 text-xs text-txt-muted">Counts are read directly from backend tables.</p>
            </div>
            <StatusBadge label={realtime?.status ?? "Unknown"} variant={realtime?.status === "DEGRADED" ? "warning" : "success"} dot />
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <MetricRow label="Doctors" value={metrics.doctors} icon={<Stethoscope className="h-4 w-4" />} />
            <MetricRow label="Nurses" value={metrics.nurses} icon={<HeartPulse className="h-4 w-4" />} />
            <MetricRow label="Active consultations" value={metrics.activeConsultations} icon={<Activity className="h-4 w-4" />} />
            <MetricRow label="Appointments today" value={metrics.todaysAppointments} icon={<CalendarClock className="h-4 w-4" />} />
            <MetricRow label="Notifications 24h" value={metrics.notificationsLast24h} icon={<AlertTriangle className="h-4 w-4" />} />
            <MetricRow label="Realtime pending" value={realtime?.outbox?.pending} icon={<ShieldCheck className="h-4 w-4" />} />
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-txt-primary">Priority Queues</h2>
            <ShieldCheck className="h-4 w-4 text-brand" />
          </div>
          <div className="mt-4 space-y-3">
            <QueueItem label="Pending approvals" owner="Clinical Ops" value={queues.pendingApprovals} variant="warning" />
            <QueueItem label="Pending AI jobs" owner="AI Gateway" value={queues.pendingAiJobs} variant="brand" />
            <QueueItem label="Failed AI jobs" owner="Model Ops" value={queues.failedAiJobs} variant={queues.failedAiJobs ? "error" : "success"} />
            <QueueItem label="Realtime failures" owner="Socket.io Outbox" value={realtime?.outbox?.failed} variant={realtime?.outbox?.failed ? "error" : "success"} />
          </div>
        </GlassCard>
      </section>

      <GlassCard>
        <h2 className="text-base font-semibold text-txt-primary">Recent Activity</h2>
        <div className="mt-4 divide-y divide-border">
          {(data?.recentActivity ?? []).length ? (
            data.recentActivity.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-3">
                <span className="h-2 w-2 rounded-full bg-brand" />
                <p className="text-sm text-txt-secondary">
                  {item.label} <span className="text-txt-muted">by {item.actor}</span>
                </p>
              </div>
            ))
          ) : (
            <p className="py-6 text-sm text-txt-muted">No audit activity returned by the API yet.</p>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

function MetricRow({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-2 text-txt-secondary">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-semibold text-txt-primary">{dn(value)}</span>
    </div>
  );
}

function QueueItem({ label, owner, value, variant }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-txt-primary">{label}</p>
          <p className="mt-1 text-xs text-txt-muted">{owner}</p>
        </div>
        <span className="text-lg font-bold text-txt-primary">{dn(value)}</span>
      </div>
      <div className="mt-3">
        <StatusBadge label={Number(value ?? 0) > 0 ? "Needs attention" : "Clear"} variant={variant} />
      </div>
    </div>
  );
}

function ErrorBanner({ error }) {
  return (
    <div className="rounded-lg border border-error/20 bg-error/5 p-4 text-sm text-error">
      {error.message}
    </div>
  );
}

function dn(value) {
  if (value === undefined || value === null) return "--";
  return new Intl.NumberFormat("en-IN").format(value);
}

function formatTime(value) {
  if (!value) return "pending";
  return new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" }).format(new Date(value));
}
