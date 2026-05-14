"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Command, LogOut, Search, Settings, User } from "lucide-react";
import { useAdminStore } from "@/store/admin-store";
import { cn } from "@/lib/utils";

export function Header() {
  const { user, sidebarCollapsed } = useAdminStore();
  const [showSearch, setShowSearch] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: "1", text: "Dr. Mehta verification pending", time: "2m ago", type: "warning" },
    { id: "2", text: "AI flagged critical scan - ID #4891", time: "8m ago", type: "error" },
    { id: "3", text: "Revenue milestone: INR 10L this month", time: "1h ago", type: "success" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-16 border-b border-border bg-glass backdrop-blur-xl transition-all duration-300",
        sidebarCollapsed ? "left-[72px]" : "left-[260px]"
      )}
    >
      <div className="flex items-center justify-between h-full px-6">
        <button
          onClick={() => setShowSearch(true)}
          className="flex items-center gap-3 px-4 py-2 rounded-lg bg-input border border-border hover:border-border-active transition-colors max-w-md w-80"
        >
          <Search className="w-4 h-4 text-txt-muted" />
          <span className="text-sm text-txt-muted flex-1 text-left">Search anything...</span>
          <div className="flex items-center gap-1 text-[10px] text-txt-muted border border-border rounded px-1.5 py-0.5">
            <Command className="w-3 h-3" /> K
          </div>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success-dim border border-border">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[11px] font-medium text-success">All Systems Online</span>
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfile(false);
              }}
              className="relative w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center hover:border-border-active hover:bg-brand-dim transition-colors"
            >
              <Bell className="w-4 h-4 text-txt-secondary" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-error text-[9px] text-white-text flex items-center justify-center font-bold">
                3
              </span>
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-xl shadow-[0_18px_45px_rgba(15,23,42,0.05)] overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-border">
                    <h3 className="text-sm font-semibold text-txt-primary">Notifications</h3>
                  </div>
                  {notifications.map((notification) => (
                    <div key={notification.id} className="px-4 py-3 border-b border-border hover:bg-card-hover cursor-pointer transition-colors">
                      <p className="text-[13px] text-txt-primary">{notification.text}</p>
                      <p className="text-[11px] text-txt-muted mt-1">{notification.time}</p>
                    </div>
                  ))}
                  <button className="w-full px-4 py-2.5 text-xs text-brand font-medium hover:bg-card-hover transition-colors">
                    View All Notifications
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-brand-dim transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-dim border border-border flex items-center justify-center">
                <span className="text-xs font-bold text-purple">DA</span>
              </div>
              {!sidebarCollapsed && (
                <div className="text-left hidden lg:block">
                  <p className="text-[13px] font-medium text-txt-primary leading-none">{user?.name}</p>
                  <p className="text-[10px] text-txt-muted mt-0.5">{user?.role}</p>
                </div>
              )}
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-52 bg-surface border border-border rounded-xl shadow-[0_18px_45px_rgba(15,23,42,0.05)] overflow-hidden z-50"
                >
                  {[
                    { icon: User, label: "Profile" },
                    { icon: Settings, label: "Settings" },
                    { icon: LogOut, label: "Logout", danger: true },
                  ].map((item) => (
                    <button
                      key={item.label}
                      className={cn(
                        "flex items-center gap-3 w-full px-4 py-2.5 text-[13px] transition-colors",
                        item.danger ? "text-error hover:bg-error-dim" : "text-txt-secondary hover:bg-card-hover hover:text-txt-primary"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 bg-glass backdrop-blur-sm"
            onClick={() => setShowSearch(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              className="mx-auto mt-24 w-full max-w-xl rounded-xl border border-border bg-surface p-3 shadow-[0_18px_45px_rgba(15,23,42,0.05)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center gap-3 rounded-lg border border-border bg-input px-3 py-2 focus-within:border-border-active">
                <Search className="h-4 w-4 text-txt-muted" />
                <input autoFocus className="flex-1 bg-transparent text-sm text-txt-primary outline-none placeholder:text-txt-muted" placeholder="Search patients, claims, doctors..." />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
