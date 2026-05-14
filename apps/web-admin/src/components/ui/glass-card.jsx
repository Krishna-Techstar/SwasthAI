"use client";

import { cn } from "@/lib/utils";

export function GlassCard({ children, className, hover = false, glow, onClick }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "glass rounded-xl p-5 transition-all duration-300",
        hover && "glass-hover cursor-pointer",
        glow === "brand" && "hover:glow-brand",
        glow === "purple" && "hover:glow-purple",
        glow === "sky" && "hover:glow-sky",
        className
      )}
    >
      {children}
    </div>
  );
}

export function StatsCard({ label, value, change, changeType = "up", icon, iconBg, delay = 0 }) {
  return (
    <div
      className="glass rounded-xl p-5 hover:border-border-active transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium text-txt-muted uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-txt-primary mt-1.5 tracking-tight">{value}</p>
          {change && (
            <p
              className={cn(
                "text-xs font-medium mt-1",
                changeType === "up" && "text-success",
                changeType === "down" && "text-error",
                changeType === "neutral" && "text-txt-muted"
              )}
            >
              {changeType === "up" && "+"}
              {changeType === "down" && "-"} {change}
            </p>
          )}
        </div>
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconBg || "bg-brand-dim")}>
          {icon}
        </div>
      </div>
    </div>
  );
}

const BADGE_STYLES = {
  success: "bg-success-dim text-success",
  warning: "bg-warning-dim text-warning",
  error: "bg-error-dim text-error",
  info: "bg-info-dim text-info",
  brand: "bg-brand-dim text-brand",
  purple: "bg-purple-dim text-purple",
  neutral: "bg-input text-txt-secondary",
};

export function StatusBadge({ label, variant = "neutral", dot = false }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold", BADGE_STYLES[variant])}>
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            variant === "success" && "bg-success animate-pulse",
            variant === "error" && "bg-error",
            variant === "warning" && "bg-warning",
            variant === "info" && "bg-info",
            variant === "brand" && "bg-brand"
          )}
        />
      )}
      {label}
    </span>
  );
}
