// apps/mobile/services/reportService.js
// ============================================================
// Report Service — Unified report generation, PDF export
// ============================================================

function mockDelay(ms = 800) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const reportService = {
  async generateReport(sessionData) {
    await mockDelay(2000)
    return {
      id: 'rpt_' + Date.now(),
      createdAt: new Date().toISOString(),
      status: 'draft',
      sections: {
        patientInfo: sessionData.patient,
        soapNotes: sessionData.soapNote,
        prescriptions: sessionData.prescriptions || [],
        imagingFindings: sessionData.radiologyReport || null,
        aiInsights: sessionData.clinicalSuggestions || null,
        bodyMap: sessionData.bodyMarkers || [],
        drugSafetyAlerts: sessionData.drugAlerts || [],
        followUpPlan: sessionData.followUp || null,
        doctorComments: sessionData.doctorNotes || '',
      },
      version: 1,
    }
  },

  async exportPDF(reportId) {
    await mockDelay(1500)
    return { pdfUri: `file:///reports/${reportId}.pdf`, exportedAt: new Date().toISOString() }
  },

  async signOff(reportId, doctorId) {
    await mockDelay(600)
    return {
      reportId, doctorId,
      signedAt: new Date().toISOString(),
      status: 'signed',
      digitalSignature: 'sig_' + Date.now(),
    }
  },

  async getVersionHistory(reportId) {
    await mockDelay(500)
    return [
      { version: 1, editedAt: new Date(Date.now() - 600000).toISOString(), editedBy: 'AI System', changes: 'Initial generation' },
      { version: 2, editedAt: new Date(Date.now() - 300000).toISOString(), editedBy: 'Dr. Rajan Kumar', changes: 'Updated assessment section' },
    ]
  },
}
