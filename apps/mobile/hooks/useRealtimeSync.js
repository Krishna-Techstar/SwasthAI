import { useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'
import { useAuthStore } from '../store/authStore'
import { useConsultationStore } from '../store/consultationStore'
import { createRealtimeSocket, subscribeConsultation, subscribePatient } from '../services/realtimeClient'
import { queryClient } from '../services/queryClient'

export function useRealtimeSync() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const patientId = useConsultationStore((state) => state.patientId)
  const consultationId = useConsultationStore((state) => state.sessionId)
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!accessToken) {
      socketRef.current?.disconnect()
      socketRef.current = null
      setConnected(false)
      return undefined
    }

    const socket = createRealtimeSocket(accessToken)
    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      subscribePatient(socket, patientId)
      subscribeConsultation(socket, consultationId)
      queryClient.invalidateQueries()
    })
    socket.on('disconnect', () => setConnected(false))
    socket.on('connect_error', () => setConnected(false))

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [accessToken])

  useEffect(() => {
    subscribePatient(socketRef.current, patientId)
  }, [patientId])

  useEffect(() => {
    subscribeConsultation(socketRef.current, consultationId)
  }, [consultationId])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && accessToken) {
        socketRef.current?.connect()
        queryClient.invalidateQueries()
      }
    })

    return () => subscription.remove()
  }, [accessToken])

  return { connected, socket: socketRef.current }
}
