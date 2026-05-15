import { useState, useCallback, useEffect } from 'react'
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { doctorTheme as t } from '../../../constants/doctorTheme'
import { useConsultationStore } from '../../../store/consultationStore'
import { useAuthStore } from '../../../store/authStore'
import { consultationService } from '../../../services/consultationService'
import { QRScannerOverlay } from '../../../components/consultation/QRScannerOverlay'

export default function NewConsultationScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [scanning, setScanning] = useState(true)
  const [processing, setProcessing] = useState(false)
  const initSession = useConsultationStore((s) => s.initSession)
  const setPatient = useConsultationStore((s) => s.setPatient)
  const user = useAuthStore((s) => s.user)

  // Request permissions on mount
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission()
    }
  }, [permission])

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

  const handleBarcodeScanned = ({ data }) => {
    if (scanning && !processing) {
      handleScan(data)
    }
  }

  const handleManualEntry = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    handleScan('ABHA_0987654321')
  }, [handleScan])

  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: '#000000' }} />
  }

  if (!permission.granted) {
    return (
      <View style={{ flex: 1, backgroundColor: t.bg.primary, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Ionicons name="camera-outline" size={64} color={t.text.muted} />
        <Text style={{ ...t.typography.h2, color: t.text.primary, marginTop: 16, textAlign: 'center' }}>
          Camera Permission Required
        </Text>
        <Text style={{ ...t.typography.body, color: t.text.secondary, marginTop: 8, textAlign: 'center', marginBottom: 24 }}>
          We need access to your camera to scan patient QR codes.
        </Text>
        <Pressable
          onPress={requestPermission}
          style={{ backgroundColor: t.brand.teal, paddingHorizontal: 32, paddingVertical: 14, borderRadius: t.radius.btn }}
        >
          <Text style={{ ...t.typography.bodySemi, color: '#FFFFFF' }}>Grant Permission</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      {/* Camera View */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />

      {/* Back button */}
      <View style={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back() }}
          style={{
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: 'rgba(0,0,0,0.4)',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Ionicons name="close" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

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
