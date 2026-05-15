import { apiRequest } from './httpClient'

export const drugSafetyService = {
  async searchDrug(query) {
    const res = await apiRequest(`/drug-safety/medications?q=${encodeURIComponent(query)}&limit=20`)
    return res.items ?? []
  },

  async checkInteractions(drugs, patientProfile) {
    return apiRequest('/drug-safety/check', {
      method: 'POST',
      body: {
        patientProfileId: patientProfile.id ?? patientProfile.patientProfileId,
        drugs: drugs.map((drug) => ({
          medicationId: drug.medicationId ?? drug.id,
          drugName: drug.drugName ?? drug.name,
        })),
      },
    })
  },

  async getAlternatives(drugName, reason) {
    const res = await apiRequest(`/drug-safety/medications?q=${encodeURIComponent(reason ?? drugName)}&limit=10`)
    return res.items ?? []
  },
}
