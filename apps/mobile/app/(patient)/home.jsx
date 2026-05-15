import { useMemo, useRef, useEffect, useState } from 'react'
import {
  View, Text, Pressable, ScrollView, Animated, Easing, Modal, Dimensions
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import QRCode from 'react-native-qrcode-svg'
import { useAuthStore } from '../../store/authStore'
import { doctorTheme as t } from '../../constants/doctorTheme'

const { width } = Dimensions.get('window')

const QUICK_ACTIONS = [
  { icon: 'qr-code-outline',      label: 'My QR ID',      color: t.brand.indigo, id: 'qr' },
  { icon: 'search-outline',       label: 'Find Doctor',   color: t.brand.teal,   id: 'find' },
  { icon: 'calendar-outline',     label: 'Appointments',  color: '#F59E0B',      id: 'apt' },
  { icon: 'document-text-outline', label: 'My Reports',   color: t.semantic.success, id: 'rep' },
]

const MOCK_APPOINTMENTS = [
  { id: '1', doctor: 'Dr. Anjali Mehta', specialty: 'Cardiologist', time: '10:30 AM', date: 'Today', avatarColor: t.brand.indigo },
  { id: '2', doctor: 'Dr. Priya Sharma', specialty: 'Dermatologist', time: '3:00 PM', date: 'Tomorrow', avatarColor: t.semantic.success },
]

const HEALTH_METRICS = [
  { label: 'Heart Rate', value: '72', unit: 'bpm', icon: 'heart', color: t.semantic.error, trend: 'Normal' },
  { label: 'Blood Pressure', value: '120/80', unit: 'mmHg', icon: 'fitness', color: t.brand.teal, trend: 'Healthy' },
  { label: 'SpO2', value: '98', unit: '%', icon: 'water', color: '#3B82F6', trend: 'Normal' },
  { label: 'Steps', value: '6,432', unit: 'today', icon: 'walk', color: t.semantic.success, trend: '+12%' },
]

export default function PatientHome() {
  const user = useAuthStore((s) => s.user)
  const [showQR, setShowQR] = useState(false)
  const displayName = user?.name ?? 'Krishna'
  const ABHA_ID = "91-2345-6789-0123"
  
  const now = useMemo(() => new Date(), [])
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  const fadeAnim = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start()
  }, [fadeAnim])

  return (
    <Animated.View style={{ flex: 1, backgroundColor: t.bg.primary, opacity: fadeAnim }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16 }}>
          <Text style={{ ...t.typography.caption, color: t.text.muted, letterSpacing: 0.8 }}>
            {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
          </Text>
          <Text style={{ ...t.typography.h1, color: t.text.primary, fontSize: 24, marginTop: 4 }}>
            {greeting},
          </Text>
          <Text style={{ ...t.typography.display, color: t.brand.teal }}>
            {displayName}
          </Text>
        </View>

        {/* AI Symptom Checker CTA */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <View style={{
              backgroundColor: t.brand.tealDim,
              borderWidth: 1, borderColor: t.brand.teal + '40',
              borderRadius: t.radius.card,
              paddingVertical: 18, paddingHorizontal: 18,
              flexDirection: 'row', alignItems: 'center', gap: 14,
            }}>
              <View style={{
                width: 48, height: 48, borderRadius: 14,
                backgroundColor: t.brand.teal + '30',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Ionicons name="sparkles" size={24} color={t.brand.teal} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ ...t.typography.bodySemi, color: t.brand.teal, fontSize: 14 }}>
                  AI Symptom Checker
                </Text>
                <Text style={{ ...t.typography.caption, color: t.text.secondary, marginTop: 2 }}>
                  Describe symptoms, get AI-powered insights
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={t.brand.teal} />
            </View>
          </Pressable>
        </View>

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text style={{ ...t.typography.h3, color: t.text.primary, marginBottom: 12 }}>Quick Actions</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {QUICK_ACTIONS.map((action) => (
              <Pressable 
                key={action.label} 
                style={{ flex: 1, alignItems: 'center' }} 
                onPress={() => {
                  Haptics.selectionAsync()
                  if (action.id === 'qr') setShowQR(true)
                }}
              >
                <View style={{
                  width: '100%', aspectRatio: 1, borderRadius: t.radius.card - 4,
                  backgroundColor: t.bg.secondary,
                  borderWidth: 1, borderColor: t.border.subtle,
                  alignItems: 'center', justifyContent: 'center',
                  shadowColor: t.shadow.card, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2,
                }}>
                  <View style={{
                    width: 40, height: 40, borderRadius: 12,
                    backgroundColor: action.color + '18',
                    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
                  }}>
                    <Ionicons name={action.icon} size={20} color={action.color} />
                  </View>
                  <Text style={{ ...t.typography.caption, color: t.text.secondary, textAlign: 'center', fontSize: 10 }}>
                    {action.label}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Health Metrics */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text style={{ ...t.typography.h3, color: t.text.primary, marginBottom: 12 }}>Health Overview</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {HEALTH_METRICS.map((m) => (
              <View key={m.label} style={{
                width: '48%',
                backgroundColor: t.bg.secondary,
                borderWidth: 1, borderColor: t.border.subtle,
                borderRadius: t.radius.card, padding: 16,
                shadowColor: t.shadow.card, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Ionicons name={m.icon} size={16} color={m.color} />
                  <Text style={{ ...t.typography.caption, color: t.text.muted }}>{m.label}</Text>
                </View>
                <Text style={{ ...t.typography.chipValue, color: t.text.primary, fontSize: 22 }}>
                  {m.value} <Text style={{ ...t.typography.caption, color: t.text.muted }}>{m.unit}</Text>
                </Text>
                <Text style={{ ...t.typography.caption, color: m.color, marginTop: 4 }}>{m.trend}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Upcoming Appointments */}
        <View style={{ paddingHorizontal: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ ...t.typography.h3, color: t.text.primary }}>Upcoming Appointments</Text>
            <Pressable><Text style={{ ...t.typography.link, color: t.brand.teal }}>View all →</Text></Pressable>
          </View>
          {MOCK_APPOINTMENTS.map((apt) => (
            <View key={apt.id} style={{
              backgroundColor: t.bg.secondary, borderWidth: 1, borderColor: t.border.subtle,
              borderRadius: t.radius.card, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 10,
              flexDirection: 'row', alignItems: 'center', gap: 14,
              shadowColor: t.shadow.card, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2,
            }}>
              <View style={{
                width: 44, height: 44, borderRadius: 14,
                backgroundColor: apt.avatarColor + '18',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Ionicons name="person" size={20} color={apt.avatarColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ ...t.typography.bodySemi, color: t.text.primary }}>{apt.doctor}</Text>
                <Text style={{ ...t.typography.caption, color: t.text.secondary }}>{apt.specialty}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ ...t.typography.bodyMed, color: t.brand.teal, fontSize: 13 }}>{apt.time}</Text>
                <Text style={{ ...t.typography.caption, color: t.text.muted }}>{apt.date}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* QR Modal */}
      <Modal visible={showQR} transparent animationType="fade" onRequestClose={() => setShowQR(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowQR(false)}>
          <View style={styles.qrCard}>
            <Text style={styles.qrTitle}>DIGITAL IDENTITY</Text>
            <Text style={styles.qrName}>{displayName}</Text>
            <Text style={styles.qrAbha}>ABHA: {ABHA_ID}</Text>
            <View style={styles.qrWrapper}>
              <QRCode value={ABHA_ID} size={200} color={t.brand.indigo} backgroundColor="#FFF" />
            </View>
            <Text style={styles.qrHint}>Present this code at any SwasthAI terminal for instant clinical check-in.</Text>
            <Pressable onPress={() => setShowQR(false)} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>Done</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </Animated.View>
  )
}

const styles = {
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  qrCard: { backgroundColor: '#FFF', borderRadius: 30, padding: 32, alignItems: 'center', width: width * 0.85 },
  qrTitle: { ...t.typography.caption, color: t.text.muted, letterSpacing: 1.5, marginBottom: 12 },
  qrName: { ...t.typography.h2, color: t.text.primary, marginBottom: 4 },
  qrAbha: { ...t.typography.bodyMed, color: t.brand.indigo, marginBottom: 24 },
  qrWrapper: { padding: 20, backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: t.border.subtle },
  qrHint: { ...t.typography.caption, color: t.text.muted, textAlign: 'center', marginTop: 24, lineHeight: 16 },
  closeBtn: { marginTop: 32, backgroundColor: t.brand.indigo, paddingHorizontal: 40, paddingVertical: 14, borderRadius: 16 },
  closeBtnText: { ...t.typography.bodySemi, color: '#FFF' },
}
