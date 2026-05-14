// apps/mobile/services/consultationService.js
// ============================================================
// Consultation Service — Session, patient data, consent
// Backend-ready: swap mock implementations for real HTTP calls
// ============================================================

const API_BASE = process.env.EXPO_PUBLIC_CONSULTATION_API_URL ?? 'http://localhost:3002'

function mockDelay(ms = 800) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ── Mock patient database ─────────────────────────────────────────────────────

const MOCK_PATIENTS = {
  ABHA_1234567890: {
    id: 'pat_001',
    abhaId: 'ABHA_1234567890',
    name: 'Mohan Kumar',
    age: 58,
    gender: 'Male',
    dob: '1968-03-15',
    bloodGroup: 'B+',
    phone: '+91 98765 43210',
    email: 'mohan.kumar@gmail.com',
    address: '42 Gandhi Nagar, Sector 12, Jaipur, Rajasthan 302001',
    photo: null,
    allergies: ['Penicillin', 'Sulfa drugs', 'Dust mites'],
    chronicDiseases: ['Type 2 Diabetes', 'Hypertension', 'Hyperlipidemia'],
    activemedications: [
      { name: 'Metformin 500mg', dosage: '2x daily', prescribedBy: 'Dr. Sharma', since: '2022-01-10' },
      { name: 'Amlodipine 5mg', dosage: '1x daily', prescribedBy: 'Dr. Patel', since: '2023-06-15' },
      { name: 'Atorvastatin 20mg', dosage: '1x bedtime', prescribedBy: 'Dr. Sharma', since: '2022-03-20' },
    ],
    previousReports: [
      { id: 'rpt_01', type: 'Blood Test', date: '2026-04-10', summary: 'HbA1c: 7.2%, Fasting glucose: 142 mg/dL', flagged: true },
      { id: 'rpt_02', type: 'ECG', date: '2026-03-22', summary: 'Normal sinus rhythm, no ST changes', flagged: false },
      { id: 'rpt_03', type: 'Lipid Panel', date: '2026-02-14', summary: 'LDL: 145 mg/dL (elevated), HDL: 38 mg/dL (low)', flagged: true },
    ],
    scanHistory: [
      { id: 'scan_01', type: 'Chest X-Ray', date: '2026-01-05', finding: 'Mild cardiomegaly, clear lung fields' },
      { id: 'scan_02', type: 'Abdominal Ultrasound', date: '2025-10-18', finding: 'Fatty liver grade II, no gallstones' },
    ],
    emergencyContacts: [
      { name: 'Priya Kumar', relation: 'Wife', phone: '+91 98765 43211' },
      { name: 'Rahul Kumar', relation: 'Son', phone: '+91 87654 32109' },
    ],
    aiHistory: [
      { date: '2026-04-10', type: 'Consultation', summary: 'AI flagged elevated HbA1c trend — recommended medication adjustment' },
      { date: '2026-01-05', type: 'Radiology', summary: 'AI detected mild cardiomegaly — recommended echocardiogram' },
    ],
    doctorHistory: [
      { doctorName: 'Dr. Rajan Kumar', specialty: 'General Medicine', lastVisit: '2026-04-10', visits: 8 },
      { doctorName: 'Dr. Anita Sharma', specialty: 'Endocrinology', lastVisit: '2026-02-14', visits: 3 },
      { doctorName: 'Dr. Vikram Patel', specialty: 'Cardiology', lastVisit: '2026-01-05', visits: 2 },
    ],
    insuranceInfo: { provider: 'Star Health', policyNumber: 'SH-MK-2024-78901', validTill: '2027-03-31' },
  },
  DEFAULT: {
    id: 'pat_002',
    abhaId: 'ABHA_0987654321',
    name: 'Priya Sharma',
    age: 32,
    gender: 'Female',
    dob: '1994-07-22',
    bloodGroup: 'O+',
    phone: '+91 87654 32100',
    email: 'priya.sharma@gmail.com',
    address: '15 MG Road, Koramangala, Bengaluru, Karnataka 560034',
    photo: null,
    allergies: ['Aspirin'],
    chronicDiseases: ['Asthma (mild intermittent)'],
    activemedications: [
      { name: 'Salbutamol inhaler', dosage: 'As needed', prescribedBy: 'Dr. Reddy', since: '2024-08-01' },
    ],
    previousReports: [
      { id: 'rpt_04', type: 'CBC', date: '2026-05-01', summary: 'All values within normal range', flagged: false },
    ],
    scanHistory: [],
    emergencyContacts: [
      { name: 'Rajesh Sharma', relation: 'Husband', phone: '+91 87654 32101' },
    ],
    aiHistory: [],
    doctorHistory: [
      { doctorName: 'Dr. Rajan Kumar', specialty: 'General Medicine', lastVisit: '2026-05-01', visits: 2 },
    ],
    insuranceInfo: null,
  },
}

export const consultationService = {
  /**
   * Start a new consultation session
   */
  async startSession(doctorId, patientId) {
    await mockDelay(600)
    return {
      sessionId: 'sess_' + Date.now(),
      doctorId,
      patientId,
      startedAt: new Date().toISOString(),
      status: 'active',
    }
  },

  /**
   * Fetch patient data from QR scan payload
   */
  async fetchPatientData(qrPayload) {
    await mockDelay(1200)
    const key = qrPayload?.includes('1234567890') ? 'ABHA_1234567890' : 'DEFAULT'
    const patient = MOCK_PATIENTS[key]
    return {
      patient,
      verificationConfidence: 98.5,
      source: key === 'ABHA_1234567890' ? 'ABHA Registry' : 'Hospital Database',
    }
  },

  /**
   * Fetch patient by manual ID entry
   */
  async fetchPatientByManualId(idType, idValue) {
    await mockDelay(1000)
    return {
      patient: MOCK_PATIENTS.DEFAULT,
      verificationConfidence: 92.3,
      source: 'Manual Lookup',
    }
  },

  /**
   * Capture and store consent
   */
  async captureConsent(sessionData) {
    await mockDelay(500)
    return {
      consentId: 'consent_' + Date.now(),
      timestamp: new Date().toISOString(),
      version: sessionData.consentVersion,
      status: 'captured',
    }
  },

  /**
   * Auto-save clinical notes
   */
  async saveNotes(sessionId, notes) {
    await mockDelay(300)
    return {
      savedAt: new Date().toISOString(),
      version: Date.now(),
      status: 'saved',
    }
  },

  /**
   * Save body map markers
   */
  async saveBodyMarkers(sessionId, markers) {
    await mockDelay(400)
    return { saved: true, count: markers.length }
  },

  /**
   * End consultation session
   */
  async endSession(sessionId) {
    await mockDelay(600)
    return {
      sessionId,
      endedAt: new Date().toISOString(),
      status: 'completed',
      duration: '32 min',
    }
  },
}
