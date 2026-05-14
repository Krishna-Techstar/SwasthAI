// apps/mobile/store/drugSafetyStore.js
// ============================================================
// SWASTHAI DRUG SAFETY STORE — Prescription + Interaction state
// ============================================================
import { create } from 'zustand'

export const useDrugSafetyStore = create((set, get) => ({
  // ── Prescriptions ───────────────────────────────────────────────────────────
  prescriptions: [],
  // [{ id, drugName, dosage, frequency, duration, route, notes, addedAt }]

  // ── Search ──────────────────────────────────────────────────────────────────
  searchQuery: '',
  searchResults: [],
  isSearching: false,

  // ── Interactions / Alerts ───────────────────────────────────────────────────
  interactions: [],
  // [{ id, type, severity, drugA, drugB, description, recommendation }]
  alerts: [],
  // [{ id, level, title, description, affectedDrugs[] }]

  // ── Alternatives ────────────────────────────────────────────────────────────
  alternatives: [],
  // [{ originalDrug, alternatives: [{ name, reason, safetyScore }] }]

  // ── Safety Score ────────────────────────────────────────────────────────────
  overallSafetyScore: null,  // 0-100
  isChecking: false,

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  addPrescription: (drug) =>
    set((s) => ({
      prescriptions: [...s.prescriptions, {
        ...drug,
        id: 'rx_' + Date.now(),
        addedAt: new Date().toISOString(),
      }],
    })),

  removePrescription: (drugId) =>
    set((s) => ({
      prescriptions: s.prescriptions.filter((d) => d.id !== drugId),
    })),

  updatePrescription: (drugId, updates) =>
    set((s) => ({
      prescriptions: s.prescriptions.map((d) => (d.id === drugId ? { ...d, ...updates } : d)),
    })),

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchResults: (results) => set({ searchResults: results, isSearching: false }),
  setSearching: (val) => set({ isSearching: val }),

  setInteractions: (interactions) => set({ interactions }),
  setAlerts: (alerts) => set({ alerts }),
  setAlternatives: (alternatives) => set({ alternatives }),
  setOverallSafetyScore: (score) => set({ overallSafetyScore: score }),
  setChecking: (val) => set({ isChecking: val }),

  resetDrugSafety: () =>
    set({
      prescriptions: [],
      searchQuery: '',
      searchResults: [],
      isSearching: false,
      interactions: [],
      alerts: [],
      alternatives: [],
      overallSafetyScore: null,
      isChecking: false,
    }),
}))
