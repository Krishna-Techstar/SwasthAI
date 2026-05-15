"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart3, Brain, Calendar, FileText, Stethoscope, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { adminDataApi } from "@/lib/admin-api";
import { adminQueryKeys } from "@/lib/query-client";
import { GlassCard, StatsCard } from "@/components/ui/glass-card";
import { PageHeader } from "@/components/ui/page-header";

export function AnalyticsSection() {
  const summary = useQuery({ queryKey: adminQueryKeys.analyticsSummary, queryFn: adminDataApi.analyticsSummary, refetchInterval: 60_000 });
  const trends = useQuery({
    queryKey: adminQueryKeys.analyticsTrends({ days: 30 }),
    queryFn: () => adminDataApi.analyticsTrends({ days: 30 }),
    refetchInterval: 60_000,
  });
  const t = summary.data?.totals ?? {};
  const r = summary.data?.recent ?? {};
  const trendRows = normalizeTrends(trends.data);

  const cards = [
    { label: "Total Patients", value: dn(t.totalPatients), change: "All registered patients", icon: <Users className="h-5 w-5 text-brand" /> },
    { label: "Total Doctors", value: dn(t.totalDoctors), change: "Registered doctors", icon: <Stethoscope className="h-5 w-5 text-success" />, iconBg: "bg-success-dim", delay: 80 },
    { label: "Total Nurses", value: dn(t.totalNurses), change: "Registered nurses", icon: <Users className="h-5 w-5 text-purple" />, iconBg: "bg-purple-dim", delay: 160 },
    { label: "Consultations", value: dn(t.totalConsultations), change: `${dn(r.consultationsLast7)} in last 7 days`, icon: <BarChart3 className="h-5 w-5 text-brand" />, delay: 240 },
    { label: "Appointments", value: dn(t.totalAppointments), change: `${dn(r.appointmentsLast7)} in last 7 days`, icon: <Calendar className="h-5 w-5 text-warning" />, iconBg: "bg-warning-dim", delay: 320 },
    { label: "Signed Reports", value: dn(t.signedReports), change: "SOAP reports signed", icon: <FileText className="h-5 w-5 text-success" />, iconBg: "bg-success-dim", delay: 400 },
    { label: "AI Jobs Completed", value: dn(t.aiJobsCompleted), change: `${dn(t.aiJobsFailed)} failed`, changeType: t.aiJobsFailed > 0 ? "down" : "up", icon: <Brain className="h-5 w-5 text-brand" />, delay: 480 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Analytics" title="Operational Analytics" subtitle="KPIs computed from production database tables." badge="Live API" />
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card) => <StatsCard key={card.label} {...card} />)}
      </section>
      <section className="grid gap-4 xl:grid-cols-2">
        <GlassCard className="min-h-[340px]">
          <h2 className="text-base font-semibold text-txt-primary">Registration & Consultation Trend</h2>
          <p className="mt-1 text-xs text-txt-muted">Daily patient registrations and consultations over the last 30 days.</p>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendRows}>
                <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6B7280" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB" }} />
                <Line type="monotone" dataKey="patients" stroke="#8B5CF6" strokeWidth={2} dot={false} name="Patients" />
                <Line type="monotone" dataKey="consultations" stroke="#22C55E" strokeWidth={2} dot={false} name="Consultations" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="min-h-[340px]">
          <h2 className="text-base font-semibold text-txt-primary">Appointment Volume</h2>
          <p className="mt-1 text-xs text-txt-muted">Scheduled appointment counts grouped by day.</p>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendRows}>
                <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6B7280" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB" }} />
                <Bar dataKey="appointments" fill="#FACC15" radius={[6, 6, 0, 0]} name="Appointments" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}

function dn(v) { return v === undefined || v === null ? "--" : new Intl.NumberFormat("en-IN").format(v); }

function normalizeTrends(data) {
  const rows = new Map();
  const add = (key, source = []) => {
    source.forEach((item) => {
      const date = new Date(item.day);
      const id = date.toISOString().slice(0, 10);
      const existing = rows.get(id) ?? {
        id,
        label: new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(date),
        patients: 0,
        consultations: 0,
        appointments: 0,
      };
      existing[key] = Number(item.count ?? 0);
      rows.set(id, existing);
    });
  };

  add("patients", data?.patients);
  add("consultations", data?.consultations);
  add("appointments", data?.appointments);

  return [...rows.values()].sort((a, b) => a.id.localeCompare(b.id));
}
