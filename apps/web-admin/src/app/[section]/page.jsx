import { Activity, AlertTriangle, BadgeCheck, CalendarClock, CreditCard, FileText, HeartPulse, ShieldCheck, Stethoscope, Users } from "lucide-react";
import { AdminShell } from "@/components/layout/admin-shell";
import { GlassCard, StatsCard, StatusBadge } from "@/components/ui/glass-card";
import { SIDEBAR_NAV } from "@/lib/constants";

const sectionCopy = {
  doctors: {
    title: "Doctors",
    subtitle: "Credential checks, roster coverage, and specialist onboarding.",
    primaryMetric: "1,284",
    secondaryMetric: "42 pending reviews",
  },
  nurses: {
    title: "Nurses",
    subtitle: "Care-team staffing, task coverage, and nurse verification.",
    primaryMetric: "3,921",
    secondaryMetric: "98.4% shift coverage",
  },
  patients: {
    title: "Patients",
    subtitle: "Patient growth, care risk, and active episode monitoring.",
    primaryMetric: "68,420",
    secondaryMetric: "2,104 high-touch cases",
  },
  "ai-diagnostics": {
    title: "AI Diagnostics",
    subtitle: "Flagged predictions, triage confidence, and review throughput.",
    primaryMetric: "12 flagged",
    secondaryMetric: "91.8% model agreement",
  },
  appointments: {
    title: "Appointments",
    subtitle: "Booking volume, delayed consultations, and provider utilization.",
    primaryMetric: "8,719",
    secondaryMetric: "312 today",
  },
  billing: {
    title: "Billing",
    subtitle: "Claims, invoices, collection status, and monthly revenue.",
    primaryMetric: "INR 42.8L",
    secondaryMetric: "96 claims need action",
  },
  analytics: {
    title: "Analytics",
    subtitle: "Operational KPIs across clinical, support, and finance workflows.",
    primaryMetric: "24 live KPIs",
    secondaryMetric: "6 above target",
  },
  verification: {
    title: "Verification Queue",
    subtitle: "Medical identity checks and pending onboarding approvals.",
    primaryMetric: "48",
    secondaryMetric: "11 urgent reviews",
  },
  notifications: {
    title: "Notifications",
    subtitle: "System alerts, patient nudges, and care-team broadcast health.",
    primaryMetric: "98.7%",
    secondaryMetric: "delivery success",
  },
  support: {
    title: "Support",
    subtitle: "Open tickets, escalation queues, and service-level adherence.",
    primaryMetric: "173",
    secondaryMetric: "21 escalated",
  },
  "audit-logs": {
    title: "Audit Logs",
    subtitle: "Administrative actions, clinical access trails, and security events.",
    primaryMetric: "18,492",
    secondaryMetric: "events this week",
  },
  settings: {
    title: "Settings",
    subtitle: "Admin roles, operational thresholds, integrations, and compliance rules.",
    primaryMetric: "5 roles",
    secondaryMetric: "14 active policies",
  },
};

const statCards = [
  { label: "Active Patients", value: "68.4K", change: "12.8% this month", icon: <Users className="h-5 w-5 text-brand" />, delay: 0 },
  { label: "Verified Clinicians", value: "5,205", change: "148 added", icon: <BadgeCheck className="h-5 w-5 text-success" />, iconBg: "bg-success-dim", delay: 80 },
  { label: "AI Review Queue", value: "127", change: "18 urgent", changeType: "down", icon: <AlertTriangle className="h-5 w-5 text-warning" />, iconBg: "bg-warning-dim", delay: 160 },
  { label: "Monthly Revenue", value: "INR 42.8L", change: "8.4% over plan", icon: <CreditCard className="h-5 w-5 text-purple" />, iconBg: "bg-purple-dim", delay: 240 },
];

const queueItems = [
  { label: "Doctor verification", owner: "Clinical Ops", value: "42", status: "Needs review", variant: "warning" },
  { label: "Critical AI flags", owner: "Diagnostics", value: "12", status: "Live", variant: "error" },
  { label: "Support escalations", owner: "Care Support", value: "21", status: "SLA watch", variant: "info" },
  { label: "Billing exceptions", owner: "Finance", value: "96", status: "In progress", variant: "brand" },
];

const recentActivity = [
  "Dr. A. Mehta submitted cardiology credentials",
  "AI scan #4891 escalated to radiology reviewer",
  "North Region crossed 10,000 completed consultations",
  "Claims batch SWA-26-0514 reconciled successfully",
];

export default async function SectionPage({ params }) {
  const { section } = await params;
  const activeSection = sectionCopy[section] ? section : "dashboard";

  return (
    <AdminShell>
      {activeSection === "dashboard" ? <Dashboard /> : <ModulePage section={activeSection} />}
    </AdminShell>
  );
}

function Dashboard() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Command Center</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-txt-primary">SwasthAI Admin Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-txt-secondary">
            Monitor clinical operations, verification queues, diagnostics, billing, and support from one web console.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
          <Activity className="h-4 w-4 text-brand" />
          <span className="text-xs font-medium text-txt-secondary">Updated just now</span>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatsCard key={card.label} {...card} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <GlassCard className="min-h-[360px]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-txt-primary">Operational Throughput</h2>
              <p className="mt-1 text-xs text-txt-muted">Consultations, triage reviews, and closures by day</p>
            </div>
            <StatusBadge label="Healthy" variant="success" dot />
          </div>
          <div className="mt-8 flex h-56 items-end gap-3">
            {[52, 68, 61, 76, 88, 80, 94, 86, 103, 118, 112, 126].map((height, index) => (
              <div key={height + index} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg bg-[linear-gradient(180deg,rgba(139,92,246,0.35)_0%,rgba(139,92,246,0.03)_100%)]"
                  style={{ height: `${height}%`, maxHeight: 210 }}
                />
                <span className="text-[10px] text-txt-muted">{index + 1}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-txt-primary">Priority Queues</h2>
            <ShieldCheck className="h-4 w-4 text-brand" />
          </div>
          <div className="mt-4 space-y-3">
            {queueItems.map((item) => (
              <div key={item.label} className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-txt-primary">{item.label}</p>
                    <p className="mt-1 text-xs text-txt-muted">{item.owner}</p>
                  </div>
                  <span className="text-lg font-bold text-txt-primary">{item.value}</span>
                </div>
                <div className="mt-3">
                  <StatusBadge label={item.status} variant={item.variant} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <h2 className="text-base font-semibold text-txt-primary">Recent Activity</h2>
          <div className="mt-4 divide-y divide-border">
            {recentActivity.map((item) => (
              <div key={item} className="flex items-center gap-3 py-3">
                <span className="h-2 w-2 rounded-full bg-brand" />
                <p className="text-sm text-txt-secondary">{item}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-base font-semibold text-txt-primary">Care Network</h2>
          <div className="mt-5 space-y-4">
            {[
              ["Hospitals online", "312", "success"],
              ["Doctors on shift", "1,846", "brand"],
              ["Nurses available", "4,108", "purple"],
            ].map(([label, value, variant]) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-txt-secondary">{label}</span>
                <StatusBadge label={value} variant={variant} />
              </div>
            ))}
          </div>
        </GlassCard>
      </section>
    </div>
  );
}

function ModulePage({ section }) {
  const nav = SIDEBAR_NAV.find((item) => item.id === section);
  const copy = sectionCopy[section];
  const Icon = section === "billing" ? CreditCard : section === "appointments" ? CalendarClock : section === "nurses" ? HeartPulse : section === "doctors" ? Stethoscope : FileText;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">{nav?.label || copy.title}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-txt-primary">{copy.title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-txt-secondary">{copy.subtitle}</p>
        </div>
        <StatusBadge label="Feature active" variant="success" dot />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatsCard label="Primary Metric" value={copy.primaryMetric} change={copy.secondaryMetric} icon={<Icon className="h-5 w-5 text-brand" />} />
        <StatsCard label="Open Work" value={nav?.badge || 18} change="Synced with admin queue" icon={<AlertTriangle className="h-5 w-5 text-warning" />} iconBg="bg-warning-dim" delay={80} />
        <StatsCard label="Access Policy" value="Enabled" change="RBAC permission active" icon={<ShieldCheck className="h-5 w-5 text-success" />} iconBg="bg-success-dim" delay={160} />
      </section>

      <GlassCard>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-txt-primary">{copy.title} Workspace</h2>
            <p className="mt-1 text-xs text-txt-muted">This module is switched on and ready for API-backed tables, forms, and workflows.</p>
          </div>
          <StatusBadge label="Mock data" variant="info" />
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {["Review queue", "Live metrics", "Admin actions"].map((label) => (
            <div key={label} className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm font-medium text-txt-primary">{label}</p>
              <p className="mt-2 text-xs leading-5 text-txt-muted">
                Placeholder operational surface is available while backend contracts are connected.
              </p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
