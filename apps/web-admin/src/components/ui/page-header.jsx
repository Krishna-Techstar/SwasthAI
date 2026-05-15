"use client";

import { StatusBadge } from "@/components/ui/glass-card";

export function PageHeader({ eyebrow, title, subtitle, badge, children }) {
  return (
    <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-txt-primary">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-sm leading-6 text-txt-secondary">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {badge && <StatusBadge label={badge} variant="success" dot />}
        {children}
      </div>
    </section>
  );
}
