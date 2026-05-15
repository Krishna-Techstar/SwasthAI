"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function DataTable({ columns, data = [], total = 0, page = 1, limit = 25, onPageChange, loading, searchValue, onSearchChange, searchPlaceholder = "Search...", emptyMessage = "No records found.", actions }) {
  return (
    <div className="glass rounded-xl overflow-hidden">
      {/* Toolbar */}
      {(onSearchChange || actions) && (
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3">
          {onSearchChange ? (
            <div className="flex items-center gap-2 flex-1 max-w-sm rounded-lg border border-border bg-input px-3 py-2 focus-within:border-border-active transition-colors">
              <Search className="h-3.5 w-3.5 text-txt-muted" />
              <input
                value={searchValue ?? ""}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="flex-1 bg-transparent text-xs text-txt-primary outline-none placeholder:text-txt-muted"
              />
            </div>
          ) : <div />}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-section/50">
              {columns.map((col) => (
                <th key={col.key} className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-txt-muted whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-4">
                      <div className="skeleton h-4 w-24 rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-sm text-txt-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={row.id ?? idx} className="border-b border-border hover:bg-card-hover transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-3.5 text-sm text-txt-primary whitespace-nowrap">
                      {col.render ? col.render(row) : row[col.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <span className="text-xs text-txt-muted">
            Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange?.(page - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-txt-muted hover:bg-card-hover hover:text-txt-primary disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-xs font-medium text-txt-secondary">
              {page} / {Math.ceil(total / limit) || 1}
            </span>
            <button
              disabled={page >= Math.ceil(total / limit)}
              onClick={() => onPageChange?.(page + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-txt-muted hover:bg-card-hover hover:text-txt-primary disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-medium transition-all border",
        active
          ? "bg-brand text-white-text border-brand shadow-[0_4px_12px_rgba(139,92,246,0.25)]"
          : "bg-card text-txt-secondary border-border hover:bg-card-hover hover:text-txt-primary"
      )}
    >
      {label}
    </button>
  );
}
