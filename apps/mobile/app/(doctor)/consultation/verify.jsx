import { View, Text, Pressable, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { doctorTheme as t } from '../../../constants/doctorTheme'
import { useConsultationStore } from '../../../store/consultationStore'
import { PatientVerifyCard } from '../../../components/consultation/PatientVerifyCard'

export default function VerifyScreen() {
  const patient = useConsultationStore((s) => s.patient)
  const confidence = useConsultationStore((s) => s.verificationConfidence)
  const setStatus = useConsultationStore((s) => s.setStatus)

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setStatus('consent')
    router.push('/(doctor)/consultation/consent')
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: t.space.base, paddingVertical: t.space.md, gap: t.space.sm }}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back() }}
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: t.bg.tertiary, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="arrow-back" size={20} color={t.text.primary} />
        </Pressable>
        <Text style={{ ...t.typography.h2, color: t.text.primary, flex: 1 }}>Patient Verification</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: t.space.base, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <PatientVerifyCard patient={patient} confidence={confidence} />
      </ScrollView>

      {/* Continue CTA */}
      <View style={{ paddingHorizontal: t.space.base, paddingBottom: t.space.lg, paddingTop: t.space.sm, backgroundColor: t.bg.primary, borderTopWidth: 1, borderTopColor: t.border.subtle }}>
        <Pressable
          onPress={handleContinue}
          style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            backgroundColor: t.brand.teal, borderRadius: t.radius.btn, paddingVertical: 16,
            shadowColor: t.shadow.floating, shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 1, shadowRadius: 12, elevation: 8,
          }}
        >
          <Text style={{ ...t.typography.h3, color: '#FFFFFF' }}>Continue to Consent</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  )
}
