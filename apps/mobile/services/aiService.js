import { apiRequest } from './httpClient'

export const aiService = {
  async saveTranscriptChunk(sessionId, chunk) {
    return apiRequest(`/consultations/${sessionId}/transcripts`, {
      method: 'POST',
      body: {
        sequence: chunk.sequence,
        speakerRole: chunk.speakerRole ?? chunk.speaker ?? 'DOCTOR',
        text: chunk.text,
        language: chunk.language ?? 'en',
        isFinal: chunk.isFinal ?? false,
        confidence: chunk.confidence,
        aiProvider: chunk.aiProvider,
      },
    })
  },

  async generateSOAP(context) {
    if (!context?.consultationId) throw new Error('consultationId is required for SOAP generation')
    return apiRequest(`/consultations/${context.consultationId}/soap-reports/generate-ai`, {
      method: 'POST',
      body: { modelName: context.modelName },
    })
  },

  async getClinicalSuggestions(context) {
    return apiRequest('/appointments/ai-suggestions', {
      method: 'POST',
      body: {
        patientProfileId: context.patientProfileId ?? context.patientId,
        diagnosis: context.diagnosis ?? context.assessment ?? context.notes,
      },
    })
  },

  async analyzeImage({ fileId, patientProfileId, consultationId, scanType, bodyRegion }) {
    if (!fileId || !patientProfileId) {
      throw new Error('fileId and patientProfileId are required for radiology AI analysis')
    }
    return apiRequest('/radiology/uploads', {
      method: 'POST',
      body: {
        fileId,
        patientProfileId,
        consultationId,
        scanType: scanType?.toUpperCase?.() ?? scanType,
        bodyRegion,
        queueAi: true,
      },
    })
  },

  async getSHAPExplanation(reportId) {
    if (!reportId) throw new Error('reportId is required for SHAP explainability')
    return apiRequest(`/reports/radiology/${reportId}`)
  },
}
