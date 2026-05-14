import { create } from 'zustand';

export const useOnboardingStore = create((set) => ({
  role: null, // 'Patient' | 'Doctor' | 'Nurse' | 'Billing' | 'Admin'
  basicDetails: null,
  roleDetails: null,
  preferences: null,

  setRole: (role) => set({ role }),
  setBasicDetails: (details) => set({ basicDetails: details }),
  setRoleDetails: (details) => set({ roleDetails: details }),
  setPreferences: (preferences) => set({ preferences }),
  
  reset: () => set({ role: null, basicDetails: null, roleDetails: null, preferences: null })
}));
