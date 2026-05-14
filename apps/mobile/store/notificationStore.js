import { create } from 'zustand'

export const useNotificationStore = create((set) => ({
  unreadCount: 3,
  setUnreadCount: (count) => set({ unreadCount: count }),
}))
