// apps/mobile/store/consultationStore.js
// ============================================================
// SWASTHAI CONSULTATION STORE — Central state for the entire
// AI consultation workflow
// ============================================================
import { create } from 'zustand'

const INITIAL_SOAP = { subjective: '', objective: '', assessment: '', plan: '' }

export const useConsultationStore = create((set, get) => ({
  // ── Session ─────────────────────────────────────────────────────────────────
  sessionId: null,
  status: 'idle', // idle | scanning | verifying | consent | active | reporting | complete
  startedAt: null,
  workflowType: null, // 'consultation' | 'radiology'
  doctorId: null,
  patientId: null,

  // ── Consent ─────────────────────────────────────────────────────────────────
  consentCaptured: false,
  consentTimestamp: null,
  consentVersion: null,
  consentDeviceInfo: null,

  // ── Patient (fetched after QR scan) ─────────────────────────────────────────
  patient: null,
  verificationConfidence: 0,

  // ── Transcription (LLM1 audio pipeline) ─────────────────────────────────────
  isListening: false,
  transcript: [],          // [{ id, speaker, text, timestamp, entities[] }]
  speakerLabels: [],       // ['Doctor', 'Patient']
  medicalEntities: [],     // [{ text, type, confidence }]
  detectedSymptoms: [],
  detectedMedications: [],
  streamBuffer: '',

  // ── Doctor Notes ────────────────────────────────────────────────────────────
  doctorNotes: '',
  quickTags: [],           // [{ id, label, color, addedAt }]
  urgentItems: [],
  autoSaveStatus: 'saved', // saved | saving | error
  lastSavedAt: null,
  mergedContext: '',        // voice + typed combined for AI processing

  // ── Body Map ────────────────────────────────────────────────────────────────
  bodyMarkers: [],          // [{ id, regionId, position, severity, type, radius, notes }]
  activeBodyView: 'front',  // 'front' | 'back'

  // ── SOAP ────────────────────────────────────────────────────────────────────
  soapNote: { ...INITIAL_SOAP },
  soapAiConfidence: { subjective: 0, objective: 0, assessment: 0, plan: 0 },
  soapGenerated: false,
  soapEdited: false,
  icdCodes: [],

  // ── Clinical Suggestions ────────────────────────────────────────────────────
  clinicalSuggestions: {
    conditions: [],         // [{ name, confidence, evidence, icdCode }]
    treatments: [],
    tests: [],
    risks: [],
    differentialDiagnosis: [],
  },
  suggestionsLoading: false,

  // ── Report ──────────────────────────────────────────────────────────────────
  report: null,
  reportStatus: 'draft',   // draft | review | signed | exported
  reportPdfUri: null,
  reportVersionHistory: [],

  // ── Follow-up ───────────────────────────────────────────────────────────────
  followUp: null,           // { date, urgency, reminderType, aiSuggested }
  followUpSuggestions: [],

  // ── Generating flags ────────────────────────────────────────────────────────
  isGenerating: false,
  generatingLabel: '',

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Session ─────────────────────────────────────────────────────────────────
  initSession: (doctorId) =>
    set({
      sessionId: 'sess_' + Date.now(),
      status: 'scanning',
      startedAt: new Date().toISOString(),
      doctorId,
      workflowType: null,
      consentCaptured: false,
      patient: null,
      transcript: [],
      doctorNotes: '',
      quickTags: [],
      urgentItems: [],
      bodyMarkers: [],
      soapNote: { ...INITIAL_SOAP },
      soapGenerated: false,
      soapEdited: false,
      icdCodes: [],
      clinicalSuggestions: { conditions: [], treatments: [], tests: [], risks: [], differentialDiagnosis: [] },
      report: null,
      reportStatus: 'draft',
      followUp: null,
      isListening: false,
      isGenerating: false,
    }),

  setStatus: (status) => set({ status }),
  setWorkflowType: (type) => set({ workflowType: type }),

  // ── Patient ─────────────────────────────────────────────────────────────────
  setPatient: (patient, confidence = 98) =>
    set({ patient, patientId: patient?.id, verificationConfidence: confidence, status: 'verifying' }),

  // ── Consent ─────────────────────────────────────────────────────────────────
  captureConsent: (version, deviceInfo) =>
    set({
      consentCaptured: true,
      consentTimestamp: new Date().toISOString(),
      consentVersion: version,
      consentDeviceInfo: deviceInfo,
      status: 'consent',
    }),

  // ── Transcription ───────────────────────────────────────────────────────────
  setListening: (val) => set({ isListening: val }),
  appendTranscriptEntry: (entry) =>
    set((s) => ({
      transcript: [...s.transcript, { ...entry, id: 'tr_' + Date.now(), timestamp: new Date().toISOString() }],
    })),
  setMedicalEntities: (entities) => set({ medicalEntities: entities }),
  setDetectedSymptoms: (symptoms) => set({ detectedSymptoms: symptoms }),
  setDetectedMedications: (meds) => set({ detectedMedications: meds }),
  setStreamBuffer: (buf) => set({ streamBuffer: buf }),

  // ── Notes ───────────────────────────────────────────────────────────────────
  setDoctorNotes: (notes) => set({ doctorNotes: notes, autoSaveStatus: 'saving' }),
  addQuickTag: (tag) =>
    set((s) => {
      if (s.quickTags.some((t) => t.id === tag.id)) return {}
      return { quickTags: [...s.quickTags, { ...tag, addedAt: new Date().toISOString() }] }
    }),
  removeQuickTag: (tagId) =>
    set((s) => ({ quickTags: s.quickTags.filter((t) => t.id !== tagId) })),
  addUrgentItem: (item) =>
    set((s) => ({ urgentItems: [...s.urgentItems, item] })),
  setAutoSaveStatus: (status) => set({ autoSaveStatus: status, lastSavedAt: status === 'saved' ? new Date().toISOString() : undefined }),
  updateMergedContext: () => {
    const s = get()
    const transcriptText = s.transcript.map((t) => `[${t.speaker}] ${t.text}`).join('\n')
    set({ mergedContext: `${transcriptText}\n\n--- Doctor Notes ---\n${s.doctorNotes}` })
  },

  // ── Body Map ────────────────────────────────────────────────────────────────
  addBodyMarker: (marker) =>
    set((s) => ({
      bodyMarkers: [...s.bodyMarkers, { ...marker, id: 'bm_' + Date.now() }],
    })),
  removeBodyMarker: (markerId) =>
    set((s) => ({ bodyMarkers: s.bodyMarkers.filter((m) => m.id !== markerId) })),
  updateBodyMarker: (markerId, updates) =>
    set((s) => ({
      bodyMarkers: s.bodyMarkers.map((m) => (m.id === markerId ? { ...m, ...updates } : m)),
    })),
  setActiveBodyView: (view) => set({ activeBodyView: view }),

  // ── SOAP ────────────────────────────────────────────────────────────────────
  updateSOAP: (section, value) =>
    set((s) => ({
      soapNote: { ...s.soapNote, [section]: value },
      soapEdited: true,
    })),
  setSOAP: (soap, confidence) =>
    set({
      soapNote: soap,
      soapAiConfidence: confidence || { subjective: 0, objective: 0, assessment: 0, plan: 0 },
      soapGenerated: true,
      soapEdited: false,
    }),
  setIcdCodes: (codes) => set({ icdCodes: codes }),

  // ── Clinical Suggestions ────────────────────────────────────────────────────
  setClinicalSuggestions: (suggestions) => set({ clinicalSuggestions: suggestions, suggestionsLoading: false }),
  setSuggestionsLoading: (val) => set({ suggestionsLoading: val }),

  // ── Report ──────────────────────────────────────────────────────────────────
  setReport: (report) => set({ report }),
  setReportStatus: (status) => set({ reportStatus: status }),
  setReportPdfUri: (uri) => set({ reportPdfUri: uri }),
  addReportVersion: (version) =>
    set((s) => ({ reportVersionHistory: [...s.reportVersionHistory, version] })),

  // ── Follow-up ───────────────────────────────────────────────────────────────
  setFollowUp: (followUp) => set({ followUp }),
  setFollowUpSuggestions: (suggestions) => set({ followUpSuggestions: suggestions }),

  // ── Generating ──────────────────────────────────────────────────────────────
  setGenerating: (val, label = '') => set({ isGenerating: val, generatingLabel: label }),

  // ── Full reset ──────────────────────────────────────────────────────────────
  resetSession: () =>
    set({
      sessionId: null,
      status: 'idle',
      startedAt: null,
      workflowType: null,
      doctorId: null,
      patientId: null,
      consentCaptured: false,
      consentTimestamp: null,
      consentVersion: null,
      consentDeviceInfo: null,
      patient: null,
      verificationConfidence: 0,
      isListening: false,
      transcript: [],
      speakerLabels: [],
      medicalEntities: [],
      detectedSymptoms: [],
      detectedMedications: [],
      streamBuffer: '',
      doctorNotes: '',
      quickTags: [],
      urgentItems: [],
      autoSaveStatus: 'saved',
      lastSavedAt: null,
      mergedContext: '',
      bodyMarkers: [],
      activeBodyView: 'front',
      soapNote: { ...INITIAL_SOAP },
      soapAiConfidence: { subjective: 0, objective: 0, assessment: 0, plan: 0 },
      soapGenerated: false,
      soapEdited: false,
      icdCodes: [],
      clinicalSuggestions: { conditions: [], treatments: [], tests: [], risks: [], differentialDiagnosis: [] },
      suggestionsLoading: false,
      report: null,
      reportStatus: 'draft',
      reportPdfUri: null,
      reportVersionHistory: [],
      followUp: null,
      followUpSuggestions: [],
      isGenerating: false,
      generatingLabel: '',
    }),
}))
