import { io } from 'socket.io-client'
import { API_BASE } from './httpClient'
import { invalidateRealtimePayload } from './queryClient'

const EVENT_NAMES = [
  'admin.approval.created',
  'admin.approval.updated',
  'ai.soap.queued',
  'ai.soap.completed',
  'ai.radiology.queued',
  'consultation.started',
  'consultation.completed',
  'consultation.note.saved',
  'consultation.transcript.updated',
  'consultation.body_map.updated',
  'patient.vitals.updated',
  'report.soap.updated',
  'report.soap.signed',
  'radiology.upload.created',
  'radiology.ai.completed',
  'radiology.report.updated',
  'appointment.created',
  'appointment.updated',
  'notification.created',
  'file.registered',
]

export function createRealtimeSocket(accessToken) {
  const url = process.env.EXPO_PUBLIC_REALTIME_URL ?? API_BASE.replace(/\/api\/v1\/?$/, '')
  const socket = io(`${url}/sync`, {
    transports: ['websocket'],
    auth: { token: accessToken },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 8_000,
  })

  EVENT_NAMES.forEach((eventName) => {
    socket.on(eventName, invalidateRealtimePayload)
  })

  socket.on('connect', () => {
    socket.emit('client.ready', { connectedAt: new Date().toISOString() })
  })

  return socket
}

export function subscribePatient(socket, patientProfileId) {
  if (socket?.connected && patientProfileId) {
    socket.emit('patient:subscribe', { patientProfileId })
  }
}

export function subscribeConsultation(socket, consultationId) {
  if (socket?.connected && consultationId) {
    socket.emit('consultation:subscribe', { consultationId })
  }
}
