"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

export function ConfirmationModal({ open, onClose, onConfirm, title, description, confirmLabel = "Confirm", variant = "brand", loading = false }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-glass backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {variant === "error" && (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-error-dim">
                    <AlertTriangle className="h-5 w-5 text-error" />
                  </div>
                )}
                <div>
                  <h3 className="text-base font-semibold text-txt-primary">{title}</h3>
                  {description && <p className="mt-1.5 text-sm text-txt-secondary leading-relaxed">{description}</p>}
                </div>
              </div>
              <button onClick={onClose} className="rounded-lg p-1 text-txt-muted hover:bg-card-hover hover:text-txt-primary transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-txt-secondary hover:bg-card-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white-text transition-all disabled:opacity-50 ${
                  variant === "error"
                    ? "bg-error shadow-[0_4px_12px_rgba(239,68,68,0.25)] hover:brightness-110"
                    : "bg-brand shadow-[0_4px_12px_rgba(139,92,246,0.25)] hover:brightness-110"
                }`}
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white mx-4" />
                ) : (
                  confirmLabel
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
