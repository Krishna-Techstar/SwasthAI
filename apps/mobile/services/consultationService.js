import { apiRequest } from './httpClient'

async function resolvePatient(query) {
  const search = await apiRequest(`/patients/search?q=${encodeURIComponent(query)}&limit=1`)
  const patient = search.items?.[0]
  if (!patient) {
    throw new Error('Patient not found')
  }
  const context = await apiRequest(`/patients/${patient.id}/context`)
  return { patient: context, verificationConfidence: 100, source: 'PostgreSQL' }
}

export const consultationService = {
  async startSession(doctorId, patientId) {
    const res = await apiRequest('/consultations', {
      method: 'POST',
      body: { patientProfileId: patientId },
    })
    return {
      sessionId: res.id,
      doctorId: res.doctorId ?? doctorId,
      patientId: res.patientProfileId,
      startedAt: res.startedAt,
      status: res.status?.toLowerCase?.() ?? 'active',
    }
  },

  async fetchPatientData(qrPayload) {
    return resolvePatient(qrPayload)
  },

  async fetchPatientByManualId(_idType, idValue) {
    return resolvePatient(idValue)
  },

  async captureConsent(sessionData) {
    return apiRequest('/consents', {
      method: 'POST',
      body: {
        patientProfileId: sessionData.patientId ?? sessionData.patientProfileId,
        consultationId: sessionData.sessionId ?? sessionData.consultationId,
        consentVersion: sessionData.consentVersion,
        scope: sessionData.scope ?? { aiConsultation: true, radiology: true },
        sessionInfo: sessionData,
      },
    })
  },

  async saveNotes(sessionId, notes) {
    return apiRequest(`/consultations/${sessionId}/notes`, {
      method: 'POST',
      body: { noteType: 'doctor_note', content: notes },
    })
  },

  async saveBodyMarkers(sessionId, markers) {
    return apiRequest(`/consultations/${sessionId}/body-map`, {
      method: 'POST',
      body: {
        points: markers.map((marker) => ({
          region: marker.region ?? marker.regionId ?? 'unspecified',
          side: marker.side,
          x: marker.x ?? marker.position?.x,
          y: marker.y ?? marker.position?.y,
          painScore: marker.painScore ?? marker.severity,
          metadata: marker,
        })),
      },
    })
  },

  async endSession(sessionId) {
    return apiRequest(`/consultations/${sessionId}/end`, { method: 'PATCH' })
  },
}
