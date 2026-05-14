"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  Bell,
  Brain,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Heart,
  LayoutDashboard,
  MessageSquare,
  ScrollText,
  Search,
  Settings,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import { SIDEBAR_NAV } from "@/lib/constants";
import { useAdminStore } from "@/store/admin-store";
import { cn } from "@/lib/utils";

const ICON_MAP = {
  LayoutDashboard,
  Stethoscope,
  Heart,
  Users,
  Brain,
  Calendar,
  CreditCard,
  BarChart3,
  ShieldCheck,
  Bell,
  MessageSquare,
  ScrollText,
  Settings,
};

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, hasPermission } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNav = SIDEBAR_NAV.filter((item) => hasPermission(item.id)).filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-sidebar/95 border-r border-border shadow-[0_18px_45px_rgba(15,23,42,0.05)]"
    >
      <div className="flex items-center h-16 px-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[linear-gradient(135deg,#8B5CF6_0%,#A78BFA_50%,#C4B5FD_100%)] flex items-center justify-center shrink-0 shadow-[0_14px_32px_rgba(139,92,246,0.12)]">
            <Activity className="w-5 h-5 text-white-text" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <span className="text-sm font-bold text-txt-primary tracking-wide">SwasthAI</span>
                <span className="text-[10px] text-txt-muted block -mt-0.5">Admin Console</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 pt-3 overflow-hidden"
          >
            <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-input border border-border focus-within:border-border-active">
              <Search className="w-3.5 h-3.5 text-txt-muted" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search..."
                className="flex-1 bg-transparent text-xs text-txt-primary placeholder:text-txt-muted outline-none"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {filteredNav.map((item, index) => {
          const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;
          const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);

          return (
            <Link key={item.id} href={item.path}>
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={cn(
                  "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-brand-dim text-brand shadow-[0_12px_28px_rgba(139,92,246,0.12)]"
                    : "text-txt-secondary hover:bg-brand-dim hover:text-txt-primary"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand rounded-r-full"
                  />
                )}

                <Icon className={cn("w-[18px] h-[18px] shrink-0", isActive && "text-brand")} />

                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-[13px] font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {item.badge > 0 && (
                  <span
                    className={cn(
                      "ml-auto text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center",
                      isActive ? "bg-brand text-white-text" : "bg-error-dim text-error",
                      sidebarCollapsed && "absolute -top-0.5 -right-0.5 ml-0"
                    )}
                  >
                    {item.badge}
                  </span>
                )}

                {sidebarCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-elevated text-txt-primary text-xs rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-border shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                    {item.label}
                  </div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-2">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-txt-muted hover:text-txt-primary hover:bg-brand-dim transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs">
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
