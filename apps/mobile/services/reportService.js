import { apiRequest } from './httpClient'

export const reportService = {
  async generateReport(sessionData) {
    return apiRequest(`/consultations/${sessionData.sessionId ?? sessionData.consultationId}/soap-reports`, {
      method: 'POST',
      body: {
        subjective: sessionData.soapNote?.subjective,
        objective: sessionData.soapNote?.objective,
        assessment: sessionData.soapNote?.assessment,
        plan: sessionData.soapNote?.plan,
        aiGenerated: false,
      },
    })
  },

  async exportPDF(reportId) {
    return apiRequest(`/reports/soap/${reportId}`)
  },

  async signOff(reportId) {
    return apiRequest(`/consultations/soap-reports/${reportId}/sign`, { method: 'PATCH' })
  },

  async getVersionHistory(reportId) {
    const report = await apiRequest(`/reports/soap/${reportId}`)
    return report?.changes ?? []
  },
}
