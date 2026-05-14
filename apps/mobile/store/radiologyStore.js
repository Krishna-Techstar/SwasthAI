// apps/mobile/store/radiologyStore.js
// ============================================================
// SWASTHAI RADIOLOGY STORE — Image upload, AI analysis state
// Separated from consultationStore for performance (heavy images)
// ============================================================
import { create } from 'zustand'

export const useRadiologyStore = create((set, get) => ({
  // ── Uploads ─────────────────────────────────────────────────────────────────
  uploads: [],
  // [{ id, uri, fileName, fileSize, scanType, uploadProgress, status, metadata, previewUri }]
  // status: 'pending' | 'uploading' | 'processing' | 'analyzed' | 'error'

  // ── Analysis ────────────────────────────────────────────────────────────────
  activeUploadId: null,
  analysisResults: null,
  // { classification, anomalies[], severity, confidence, heatmapUri, segmentationMask }

  heatmapOverlayOpacity: 0.5,
  activeLayer: 'original',    // 'original' | 'heatmap' | 'contour' | 'segmentation'
  comparisonMode: false,

  // ── SHAP Explainability ─────────────────────────────────────────────────────
  shapExplanation: null,
  // { influentialRegions[], featureImportance[], uncertainty, reasoning }

  // ── Radiology Report ────────────────────────────────────────────────────────
  radiologyReport: null,
  // { findings, impression, severity, recommendations[], urgentAlerts[] }
  reportStatus: 'draft',    // draft | reviewed | approved | rejected
  doctorAnnotations: [],

  // ── Loading ─────────────────────────────────────────────────────────────────
  isAnalyzing: false,
  analysisProgress: 0,

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  addUpload: (upload) =>
    set((s) => ({
      uploads: [...s.uploads, {
        ...upload,
        id: 'up_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        uploadProgress: 0,
        status: 'pending',
      }],
    })),

  updateUploadProgress: (uploadId, progress) =>
    set((s) => ({
      uploads: s.uploads.map((u) =>
        u.id === uploadId ? { ...u, uploadProgress: progress, status: progress < 1 ? 'uploading' : 'processing' } : u
      ),
    })),

  setUploadStatus: (uploadId, status) =>
    set((s) => ({
      uploads: s.uploads.map((u) => (u.id === uploadId ? { ...u, status } : u)),
    })),

  removeUpload: (uploadId) =>
    set((s) => ({
      uploads: s.uploads.filter((u) => u.id !== uploadId),
      activeUploadId: s.activeUploadId === uploadId ? null : s.activeUploadId,
    })),

  setActiveUpload: (uploadId) => set({ activeUploadId: uploadId }),

  setAnalysisResults: (results) =>
    set({ analysisResults: results, isAnalyzing: false, analysisProgress: 1 }),

  setHeatmapOverlayOpacity: (opacity) => set({ heatmapOverlayOpacity: opacity }),
  setActiveLayer: (layer) => set({ activeLayer: layer }),
  toggleComparisonMode: () => set((s) => ({ comparisonMode: !s.comparisonMode })),

  setSHAPExplanation: (explanation) => set({ shapExplanation: explanation }),

  setRadiologyReport: (report) => set({ radiologyReport: report }),
  setReportStatus: (status) => set({ reportStatus: status }),
  addAnnotation: (annotation) =>
    set((s) => ({
      doctorAnnotations: [...s.doctorAnnotations, { ...annotation, id: 'ann_' + Date.now() }],
    })),

  setAnalyzing: (val, progress = 0) => set({ isAnalyzing: val, analysisProgress: progress }),

  resetRadiology: () =>
    set({
      uploads: [],
      activeUploadId: null,
      analysisResults: null,
      heatmapOverlayOpacity: 0.5,
      activeLayer: 'original',
      comparisonMode: false,
      shapExplanation: null,
      radiologyReport: null,
      reportStatus: 'draft',
      doctorAnnotations: [],
      isAnalyzing: false,
      analysisProgress: 0,
    }),
}))
