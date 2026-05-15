import { apiRequest } from './httpClient'

export const appointmentService = {
  async getAISuggestions(patientId, diagnosis) {
    return apiRequest('/appointments/ai-suggestions', {
      method: 'POST',
      body: { patientProfileId: patientId, diagnosis },
    })
  },

  async scheduleAppointment(data) {
    return apiRequest('/appointments', {
      method: 'POST',
      body: {
        patientProfileId: data.patientId ?? data.patientProfileId,
        doctorId: data.doctorId,
        nurseId: data.nurseId,
        scheduledStart: data.scheduledStart ?? `${data.date}T${data.time ?? '10:00'}:00.000Z`,
        scheduledEnd: data.scheduledEnd ?? `${data.date}T${data.endTime ?? '10:30'}:00.000Z`,
        type: data.type ?? 'FOLLOW_UP',
        urgency: data.urgency?.toUpperCase?.() ?? 'ROUTINE',
        reason: data.reason,
        reminderChannels: data.reminderChannels,
      },
    })
  },

  async setReminder(appointmentId, type) {
    return apiRequest(`/appointments/${appointmentId}/reminders`, {
      method: 'POST',
      body: { channel: type },
    })
  },
}
