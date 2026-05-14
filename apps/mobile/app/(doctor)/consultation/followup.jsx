import { useState, useEffect, useCallback, useRef } from 'react'
import { View, Text, Pressable, Animated, Easing } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { doctorTheme as t } from '../../../constants/doctorTheme'
import { useConsultationStore } from '../../../store/consultationStore'
import { appointmentService } from '../../../services/appointmentService'
import { FollowUpScheduler } from '../../../components/consultation/FollowUpScheduler'

export default function FollowUpScreen() {
  const [scheduled, setScheduled] = useState(false)
  const patient = useConsultationStore((s) => s.patient)
  const followUpSuggestions = useConsultationStore((s) => s.followUpSuggestions)
  const setFollowUpSuggestions = useConsultationStore((s) => s.setFollowUpSuggestions)
  const setFollowUp = useConsultationStore((s) => s.setFollowUp)
  const resetSession = useConsultationStore((s) => s.resetSession)
  const checkScale = useRef(new Animated.Value(0)).current
  const checkOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    loadSuggestions()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadSuggestions = async () => {
    const sug = await appointmentService.getAISuggestions(patient?.id, 'angina')
    setFollowUpSuggestions(sug)
  }

  const handleSchedule = useCallback(async (data) => {
    try {
      await appointmentService.scheduleAppointment({
        patientId: patient?.id,
        doctorId: 'doc_001',
        date: data.date,
        type: 'Follow-up',
      })
      for (const rm of data.reminders) {
        await appointmentService.setReminder('apt_001', rm)
      }
      setFollowUp({ date: data.date, urgency: data.urgency, reminders: data.reminders })
      setScheduled(true)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

      // Animate checkmark
      Animated.parallel([
        Animated.spring(checkScale, { toValue: 1, tension: 200, friction: 10, useNativeDriver: true }),
        Animated.timing(checkOpacity, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start()
    } catch (e) {
      // handle error
    }
  }, [patient, setFollowUp, checkScale, checkOpacity])

  const handleFinish = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    resetSession()
    router.replace('/(doctor)/home')
  }

  if (scheduled) {
    return (
      <View style={{ flex: 1, backgroundColor: t.bg.primary, alignItems: 'center', justifyContent: 'center', padding: t.space.xl }}>
        <Animated.View style={{ transform: [{ scale: checkScale }], opacity: checkOpacity, alignItems: 'center', gap: 16 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: t.semantic.successDim, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="checkmark-circle" size={48} color={t.semantic.success} />
          </View>
          <Text style={{ ...t.typography.h1, color: t.text.primary, textAlign: 'center' }}>Consultation Complete</Text>
          <Text style={{ ...t.typography.body, color: t.text.secondary, textAlign: 'center' }}>
            Follow-up scheduled. Report saved and synced.
          </Text>
          <Pressable
            onPress={handleFinish}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 24,
              backgroundColor: t.brand.teal, paddingHorizontal: 32, paddingVertical: 14, borderRadius: t.radius.btn,
              shadowColor: t.shadow.floating, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 8,
            }}
          >
            <Ionicons name="home-outline" size={18} color="#FFFFFF" />
            <Text style={{ ...t.typography.h3, color: '#FFFFFF' }}>Back to Home</Text>
          </Pressable>
        </Animated.View>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: t.space.base, paddingVertical: t.space.sm, gap: t.space.sm, borderBottomWidth: 1, borderBottomColor: t.border.subtle }}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back() }}
          style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: t.bg.tertiary, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="arrow-back" size={18} color={t.text.primary} />
        </Pressable>
        <Text style={{ ...t.typography.h2, color: t.text.primary, flex: 1 }}>Follow-up Appointment</Text>
      </View>

      <FollowUpScheduler suggestions={followUpSuggestions} onSchedule={handleSchedule} />
    </View>
  )
}
