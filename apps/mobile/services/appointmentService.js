// apps/mobile/services/appointmentService.js
// ============================================================
// Appointment Service — Follow-up scheduling + AI suggestions
// ============================================================

function mockDelay(ms = 800) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const appointmentService = {
  async getAISuggestions(patientId, diagnosis) {
    await mockDelay(1200)
    const now = Date.now()
    return [
      { date: new Date(now + 7 * 86400000).toISOString().split('T')[0], reason: 'Review troponin results and ECG follow-up', urgency: 'high', confidence: 0.92 },
      { date: new Date(now + 14 * 86400000).toISOString().split('T')[0], reason: 'Medication compliance check + repeat BP', urgency: 'moderate', confidence: 0.85 },
      { date: new Date(now + 30 * 86400000).toISOString().split('T')[0], reason: 'Monthly routine follow-up', urgency: 'routine', confidence: 0.78 },
    ]
  },

  async scheduleAppointment(data) {
    await mockDelay(800)
    return {
      appointmentId: 'apt_' + Date.now(),
      patientId: data.patientId,
      doctorId: data.doctorId,
      date: data.date,
      time: data.time || '10:00 AM',
      type: data.type || 'Follow-up',
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    }
  },

  async setReminder(appointmentId, type) {
    await mockDelay(400)
    return { appointmentId, reminderType: type, status: 'set', message: `${type} reminder scheduled` }
  },
}
