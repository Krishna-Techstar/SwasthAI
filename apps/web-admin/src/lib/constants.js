export const theme = {
  colors: {
    bg: {
      primary: "#FAFAFC",
      sidebar: "#FFFFFF",
      card: "#FFFFFF",
      cardHover: "#F5F3FF",
      section: "#F3F0FF",
      glass: "rgba(255,255,255,0.65)",
      input: "#F9FAFB",
    },
    brand: {
      primary: "#8B5CF6",
      deep: "#7C3AED",
      soft: "#C4B5FD",
      ultraLight: "#F5F3FF",
      glow: "rgba(139,92,246,0.35)",
    },
    accents: {
      pink: "#FBCFE8",
      peach: "#FED7AA",
      mint: "#BBF7D0",
      sky: "#CFFAFE",
    },
    semantic: {
      success: "#22C55E",
      warning: "#FACC15",
      error: "#EF4444",
      neutral: "#94A3B8",
    },
    text: {
      primary: "#111827",
      secondary: "#6B7280",
      muted: "#9CA3AF",
      white: "#FFFFFF",
    },
    border: {
      input: "#E5E7EB",
      active: "#8B5CF6",
    },
    shadow: {
      purple: "rgba(139, 92, 246, 0.12)",
      floating: "rgba(124, 58, 237, 0.28)",
      card: "rgba(15, 23, 42, 0.05)",
    },
  },
};

export const ADMIN_ROLES = {
  SUPER_ADMIN: "Super Admin",
  HOSPITAL_ADMIN: "Hospital Admin",
  MEDICAL_VERIFIER: "Medical Verifier",
  FINANCE_ADMIN: "Finance Admin",
  SUPPORT_ADMIN: "Support Admin",
};

export const ROLE_PERMISSIONS = {
  "Super Admin": ["*"],
  "Hospital Admin": [
    "dashboard",
    "doctors",
    "nurses",
    "patients",
    "appointments",
    "analytics",
    "settings",
  ],
  "Medical Verifier": ["dashboard", "doctors", "nurses", "verification"],
  "Finance Admin": ["dashboard", "billing", "analytics"],
  "Support Admin": ["dashboard", "support", "notifications"],
};

export const SIDEBAR_NAV = [
  { id: "dashboard", label: "Dashboard", icon: "LayoutDashboard", path: "/dashboard", badge: 0 },
  { id: "doctors", label: "Doctors", icon: "Stethoscope", path: "/doctors", badge: 3 },
  { id: "nurses", label: "Nurses", icon: "Heart", path: "/nurses", badge: 0 },
  { id: "patients", label: "Patients", icon: "Users", path: "/patients", badge: 0 },
  { id: "ai-diagnostics", label: "AI Diagnostics", icon: "Brain", path: "/ai-diagnostics", badge: 12 },
  { id: "appointments", label: "Appointments", icon: "Calendar", path: "/appointments", badge: 0 },
  { id: "billing", label: "Billing", icon: "CreditCard", path: "/billing", badge: 0 },
  { id: "analytics", label: "Analytics", icon: "BarChart3", path: "/analytics", badge: 0 },
  { id: "verification", label: "Verification Queue", icon: "ShieldCheck", path: "/verification", badge: 5 },
  { id: "notifications", label: "Notifications", icon: "Bell", path: "/notifications", badge: 8 },
  { id: "support", label: "Support", icon: "MessageSquare", path: "/support", badge: 2 },
  { id: "audit-logs", label: "Audit Logs", icon: "ScrollText", path: "/audit-logs", badge: 0 },
  { id: "settings", label: "Settings", icon: "Settings", path: "/settings", badge: 0 },
];
