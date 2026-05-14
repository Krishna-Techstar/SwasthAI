import { useState, useCallback } from 'react'
import { View, Text, Pressable, Alert } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { doctorTheme as t } from '../../../constants/doctorTheme'
import { useConsultationStore } from '../../../store/consultationStore'
import { useAuthStore } from '../../../store/authStore'
import { consultationService } from '../../../services/consultationService'
import { QRScannerOverlay } from '../../../components/consultation/QRScannerOverlay'

export default function NewConsultationScreen() {
  const [scanning, setScanning] = useState(true)
  const [processing, setProcessing] = useState(false)
  const initSession = useConsultationStore((s) => s.initSession)
  const setPatient = useConsultationStore((s) => s.setPatient)
  const user = useAuthStore((s) => s.user)

  const handleScan = useCallback(async (payload) => {
    if (processing) return
    setProcessing(true)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

    try {
      initSession(user?.id || 'doc_001')
      const result = await consultationService.fetchPatientData(payload || 'ABHA_1234567890')
      setPatient(result.patient, result.verificationConfidence)
      router.push('/(doctor)/consultation/verify')
    } catch (err) {
      Alert.alert('Scan Error', 'Could not fetch patient data. Please try again.')
      setProcessing(false)
    }
  }, [processing, initSession, setPatient, user])

  const handleManualEntry = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    // For demo, simulate a scan with default patient
    handleScan('ABHA_0987654321')
  }, [handleScan])

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      {/* Back button */}
      <View style={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back() }}
          style={{
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.15)',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Ionicons name="close" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Torch button */}
      <View style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
        <Pressable
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          style={{
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.15)',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Ionicons name="flashlight-outline" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Camera placeholder (dark background simulates camera) */}
      <View style={{ flex: 1, backgroundColor: '#1A1A2E' }} />

      {/* Scanner overlay */}
      <QRScannerOverlay onManualEntry={handleManualEntry} scanning={scanning} />

      {/* Quick scan button (for demo — simulates successful scan) */}
      <View style={{ position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center', zIndex: 10 }}>
        <Pressable
          onPress={() => handleScan('ABHA_1234567890')}
          disabled={processing}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 8,
            backgroundColor: processing ? 'rgba(255,255,255,0.1)' : t.brand.teal,
            paddingHorizontal: 24, paddingVertical: 14, borderRadius: t.radius.btn,
            shadowColor: t.brand.teal, shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
          }}
        >
          <Ionicons name={processing ? 'hourglass-outline' : 'qr-code'} size={18} color="#FFFFFF" />
          <Text style={{ ...t.typography.bodyMed, color: '#FFFFFF' }}>
            {processing ? 'Fetching patient...' : 'Demo: Scan Patient'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
