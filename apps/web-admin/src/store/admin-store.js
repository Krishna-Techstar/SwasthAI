"use client";

import { create } from "zustand";
import { ROLE_PERMISSIONS } from "@/lib/constants";

export const useAdminStore = create((set, get) => ({
  user: {
    id: "admin_001",
    name: "Dr. Admin",
    email: "admin@swasthai.com",
    role: "Super Admin",
    hospital: "SwasthAI Central",
    lastLogin: new Date().toISOString(),
  },
  token: "mock_admin_token",
  isAuthenticated: true,
  isLoading: false,
  sidebarCollapsed: false,

  login: (user, token) => set({ user, token, isAuthenticated: true }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
  setLoading: (isLoading) => set({ isLoading }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),

  hasPermission: (module) => {
    const { user } = get();
    if (!user) return false;
    const permissions = ROLE_PERMISSIONS[user.role] || [];
    return permissions.includes("*") || permissions.includes(module);
  },
}));
