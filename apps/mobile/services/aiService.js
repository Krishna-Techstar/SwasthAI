import axios from 'axios'
import { apiRequest } from './httpClient'

const ML_SERVICE_URL = process.env.EXPO_PUBLIC_ML_SERVICE_URL || 'http://localhost:8501'

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

  async analyzeXrayML(imageUri) {
    if (!imageUri) throw new Error('imageUri is required for ML analysis')
    
    const formData = new FormData()
    const fileName = imageUri.split('/').pop()
    const type = 'image/jpeg' // Default to jpeg
    
    formData.append('file', {
      uri: imageUri,
      name: fileName,
      type,
    })

    try {
      const response = await axios.post(`${ML_SERVICE_URL}/predict`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // ML models can take time
      })
      return response.data
    } catch (error) {
      console.error('[ML Service] Analysis failed:', error.message)
      throw new Error('ML Analysis failed. Please try again.')
    }
  },
}
