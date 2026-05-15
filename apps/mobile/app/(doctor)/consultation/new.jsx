import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Pressable, SafeAreaView, Animated, Platform } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { doctorTheme as t } from '../../../constants/doctorTheme'
import { useConsultationStore } from '../../../store/consultationStore'

export default function NewConsultationScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const slideAnim = React.useRef(new Animated.Value(600)).current
  
  const { initSession, setPatient, setStatus } = useConsultationStore()

  // Mock patient database based on user requirements
  const MOCK_PATIENTS = [
    { id: 'p1', name: 'Krishna', age: 32, gender: 'Male', abhaId: '91-2345-6789-0123', history: 'Hypertension' },
    { id: 'p2', name: 'Krishnakant', age: 45, gender: 'Male', abhaId: '91-8888-9999-1111', history: 'Post-CABG' },
    { id: 'p3', name: 'Yash', age: 28, gender: 'Male', abhaId: '91-7777-6666-5555', history: 'Arrhythmia' },
    { id: 'p4', name: 'Jayganesh', age: 50, gender: 'Male', abhaId: '91-4444-3333-2222', history: 'Diabetes Type 2' },
    { id: 'p5', name: 'Ram', age: 62, gender: 'Male', abhaId: '91-1111-2222-3333', history: 'Stable Angina' },
  ]

  useEffect(() => {
    if (!permission) requestPermission()
  }, [])

  const handleBarCodeScanned = ({ data }) => {
    if (scanned || isVerifying) return
    setScanned(true)
    setIsVerifying(true)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

    // Simulate database lookup by ABHA ID or Name
    setTimeout(() => {
      const patient = MOCK_PATIENTS.find(p => data === p.abhaId || data.includes(p.name)) || MOCK_PATIENTS[0]
      
      setPatient(patient)
      setIsVerifying(false)
      
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8
      }).start()
    }, 1500)
  }

  const startConsultation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setStatus('consent')
    router.push('/(doctor)/consultation/consent')
  }

  if (!permission) return <View style={styles.container} />
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera permission required to scan QR</Text>
        <Pressable onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />

      {/* Overlay UI */}
      <View style={styles.overlay}>
        <SafeAreaView style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="close" size={24} color="#FFF" />
          </Pressable>
          <Text style={styles.title}>Scan Patient QR</Text>
          <View style={{ width: 40 }} />
        </SafeAreaView>

        <View style={styles.scanContainer}>
          <View style={styles.scanSquare}>
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
            
            {isVerifying && (
               <View style={styles.verifyingOverlay}>
                 <Text style={styles.verifyingText}>Verifying ABHA ID...</Text>
               </View>
            )}
          </View>
          <Text style={styles.hintText}>Position QR code within the frame</Text>
        </View>
      </View>

      {/* Patient Verification Card */}
      <Animated.View style={[styles.patientCard, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.handle} />
        <View style={styles.successBadge}>
          <Ionicons name="checkmark-circle" size={24} color={t.brand.teal} />
          <Text style={styles.successText}>Patient Identity Verified</Text>
        </View>

        <View style={styles.patientInfo}>
          <View style={styles.avatarLarge}>
             <Text style={styles.avatarText}>{MOCK_PATIENTS[0].name[0]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.patientName}>{MOCK_PATIENTS[0].name}</Text>
            <Text style={styles.patientSub}>ABHA: {MOCK_PATIENTS[0].abhaId}</Text>
            <View style={styles.tagRow}>
              <View style={styles.tag}><Text style={styles.tagText}>{MOCK_PATIENTS[0].age}y</Text></View>
              <View style={styles.tag}><Text style={styles.tagText}>{MOCK_PATIENTS[0].gender}</Text></View>
            </View>
          </View>
        </View>

        <View style={styles.historyBox}>
          <Text style={styles.historyTitle}>Primary Condition</Text>
          <Text style={styles.historyText}>{MOCK_PATIENTS[0].history}</Text>
        </View>

        <Pressable onPress={startConsultation} style={styles.confirmBtn}>
          <Text style={styles.confirmBtnText}>Start Consultation</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </Pressable>
        
        <Pressable 
          onPress={() => {
            setScanned(false)
            slideAnim.setValue(600)
          }}
          style={styles.retryBtn}
        >
          <Text style={styles.retryText}>Rescan</Text>
        </Pressable>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  message: { color: '#FFF', textAlign: 'center', marginBottom: 20 },
  button: { backgroundColor: t.brand.teal, padding: 16, borderRadius: 12 },
  buttonText: { color: '#FFF', fontWeight: '700' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: Platform.OS === 'android' ? 40 : 0
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  title: { ...t.typography.h3, color: '#FFF' },
  scanContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scanSquare: { 
    width: 250, 
    height: 250, 
    borderWidth: 0,
    position: 'relative'
  },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: t.brand.teal, borderWidth: 4 },
  tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  hintText: { ...t.typography.body, color: 'rgba(255,255,255,0.7)', marginTop: 40 },
  verifyingOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    alignItems: 'center', 
    justifyContent: 'center',
    borderRadius: 8
  },
  verifyingText: { ...t.typography.bodySemi, color: t.brand.teal },
  patientCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  handle: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  successBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  successText: { ...t.typography.bodySemi, color: t.brand.teal },
  patientInfo: { flexDirection: 'row', gap: 16, alignItems: 'center', marginBottom: 24 },
  avatarLarge: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: t.brand.tealDim, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  avatarText: { ...t.typography.h2, color: t.brand.teal },
  patientName: { ...t.typography.h2, color: t.text.primary },
  patientSub: { ...t.typography.caption, color: t.text.muted, marginTop: 2 },
  tagRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  tag: { backgroundColor: t.bg.tertiary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  tagText: { ...t.typography.caption, color: t.text.secondary },
  historyBox: { backgroundColor: t.bg.tertiary, padding: 16, borderRadius: 12, marginBottom: 24 },
  historyTitle: { ...t.typography.caption, color: t.text.muted, textTransform: 'uppercase', marginBottom: 4 },
  historyText: { ...t.typography.bodyMed, color: t.text.primary },
  confirmBtn: { 
    backgroundColor: t.brand.indigo, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 18, 
    borderRadius: 16, 
    gap: 10 
  },
  confirmBtnText: { ...t.typography.bodySemi, color: '#FFF', fontSize: 16 },
  retryBtn: { alignSelf: 'center', marginTop: 16 },
  retryText: { ...t.typography.body, color: t.text.muted },
})
