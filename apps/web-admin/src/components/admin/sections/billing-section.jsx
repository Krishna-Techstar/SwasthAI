"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, CreditCard, ReceiptText, Stethoscope } from "lucide-react";
import { adminDataApi } from "@/lib/admin-api";
import { adminQueryKeys } from "@/lib/query-client";
import { DataTable } from "@/components/ui/data-table";
import { GlassCard, StatsCard } from "@/components/ui/glass-card";
import { PageHeader } from "@/components/ui/page-header";

export function BillingSection() {
  const query = useQuery({
    queryKey: adminQueryKeys.billingSummary,
    queryFn: adminDataApi.billingSummary,
    refetchInterval: 60_000,
  });
  const totals = query.data?.totals ?? {};
  const currency = query.data?.currency ?? "INR";

  const columns = [
    {
      key: "doctorName",
      label: "Clinician",
      render: (row) => (
        <div>
          <span className="font-medium">{row.doctorName}</span>
          <span className="mt-0.5 block text-xs text-txt-muted">{row.email}</span>
        </div>
      ),
    },
    { key: "hospitalName", label: "Hospital", render: (row) => row.hospitalName ?? "-" },
    { key: "consultationFee", label: "Consultation Fee", render: (row) => money(row.consultationFee, currency) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Billing"
        title="Billing & Revenue"
        subtitle="Revenue estimates from completed appointments and configured doctor consultation fees."
        badge="Live API"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Revenue Last 30 Days"
          value={money(totals.estimatedRevenueLast30, currency)}
          change={`${dn(totals.completedAppointmentsLast30)} completed appointments`}
          icon={<CreditCard className="h-5 w-5 text-brand" />}
        />
        <StatsCard
          label="Lifetime Estimate"
          value={money(totals.estimatedLifetimeRevenue, currency)}
          change={`${dn(totals.completedAppointments)} completed appointments`}
          icon={<ReceiptText className="h-5 w-5 text-success" />}
          iconBg="bg-success-dim"
          delay={80}
        />
        <StatsCard
          label="Average Fee"
          value={money(totals.averageConsultationFee, currency)}
          change={`${dn(totals.doctorsWithFees)} doctors with fees`}
          icon={<Stethoscope className="h-5 w-5 text-purple" />}
          iconBg="bg-purple-dim"
          delay={160}
        />
        <StatsCard
          label="Scheduled Pipeline"
          value={dn(totals.scheduledAppointments)}
          change={`${dn(totals.signedReports)} signed reports`}
          icon={<CalendarCheck className="h-5 w-5 text-warning" />}
          iconBg="bg-warning-dim"
          delay={240}
        />
      </section>

      <GlassCard>
        <h2 className="text-base font-semibold text-txt-primary">Fee Roster</h2>
        <p className="mt-1 text-sm text-txt-muted">
          These values are read from doctor profiles. Dedicated invoices and claims can build on this without schema churn.
        </p>
        <div className="mt-4">
          <DataTable
            columns={columns}
            data={query.data?.feeRoster ?? []}
            total={query.data?.feeRoster?.length ?? 0}
            page={1}
            limit={25}
            loading={query.isLoading}
            emptyMessage="No consultation fees configured yet."
          />
        </div>
      </GlassCard>
    </div>
  );
}

function dn(value) {
  return value === undefined || value === null ? "--" : new Intl.NumberFormat("en-IN").format(value);
}

function money(value, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}
