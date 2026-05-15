"use client";

import { ROLE_PERMISSIONS } from "@/lib/constants";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAdminStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      sidebarCollapsed: false,
      _hydrated: false,

      login: (user, token, refreshToken) =>
        set({ user, token, refreshToken, isAuthenticated: true }),
      setUser: (user) => set({ user }),
      setTokens: (token, refreshToken) =>
        set({ token, refreshToken, isAuthenticated: Boolean(token) }),
      logout: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
      setLoading: (isLoading) => set({ isLoading }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),

      hasPermission: (module) => {
        const { user } = get();
        if (!user) return false;
        const permissions = ROLE_PERMISSIONS[user.role] || [];
        return permissions.includes("*") || permissions.includes(module);
      },
    }),
    {
      name: "swasthai-admin",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
      onRehydrateStorage: () => {
        return () => {
          // MUST use setState — direct mutation won't trigger React re-render
          useAdminStore.setState({ _hydrated: true });
        };
      },
    },
  ),
);
