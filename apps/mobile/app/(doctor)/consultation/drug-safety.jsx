import { useCallback } from 'react'
import { View, Text, Pressable } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { doctorTheme as t } from '../../../constants/doctorTheme'
import { useConsultationStore } from '../../../store/consultationStore'
import { useDrugSafetyStore } from '../../../store/drugSafetyStore'
import { drugSafetyService } from '../../../services/drugSafetyService'
import { DrugSafetyPanel } from '../../../components/consultation/DrugSafetyPanel'

export default function DrugSafetyScreen() {
  const patient = useConsultationStore((s) => s.patient)
  const prescriptions = useDrugSafetyStore((s) => s.prescriptions)
  const interactions = useDrugSafetyStore((s) => s.interactions)
  const alerts = useDrugSafetyStore((s) => s.alerts)
  const alternatives = useDrugSafetyStore((s) => s.alternatives)
  const safetyScore = useDrugSafetyStore((s) => s.overallSafetyScore)
  const isChecking = useDrugSafetyStore((s) => s.isChecking)
  const addPrescription = useDrugSafetyStore((s) => s.addPrescription)
  const removePrescription = useDrugSafetyStore((s) => s.removePrescription)
  const setInteractions = useDrugSafetyStore((s) => s.setInteractions)
  const setAlerts = useDrugSafetyStore((s) => s.setAlerts)
  const setScore = useDrugSafetyStore((s) => s.setOverallSafetyScore)
  const setChecking = useDrugSafetyStore((s) => s.setChecking)

  const handleCheckSafety = useCallback(async () => {
    setChecking(true)
    try {
      const result = await drugSafetyService.checkInteractions(prescriptions, patient)
      setInteractions(result.interactions)
      setAlerts(result.alerts)
      setScore(result.overallSafetyScore)
    } catch (e) {
      // handle error
    } finally {
      setChecking(false)
    }
  }, [prescriptions, patient, setChecking, setInteractions, setAlerts, setScore])

  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: t.space.base, paddingVertical: t.space.sm, gap: t.space.sm, borderBottomWidth: 1, borderBottomColor: t.border.subtle }}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back() }}
          style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: t.bg.tertiary, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="arrow-back" size={18} color={t.text.primary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ ...t.typography.h2, color: t.text.primary }}>Drug Safety Engine</Text>
          <Text style={{ ...t.typography.caption, color: t.text.muted }}>{patient?.name || 'Patient'}</Text>
        </View>
        <Ionicons name="shield-checkmark-outline" size={22} color={t.brand.teal} />
      </View>

      {/* Panel */}
      <DrugSafetyPanel
        prescriptions={prescriptions}
        interactions={interactions}
        alerts={alerts}
        alternatives={alternatives}
        safetyScore={safetyScore}
        onAddDrug={addPrescription}
        onRemoveDrug={removePrescription}
        onCheckSafety={handleCheckSafety}
        isChecking={isChecking}
      />

      {/* Proceed */}
      <View style={{ paddingHorizontal: t.space.base, paddingBottom: t.space.lg, paddingTop: t.space.sm, borderTopWidth: 1, borderTopColor: t.border.subtle }}>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/(doctor)/consultation/report') }}
          style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            backgroundColor: t.brand.teal, borderRadius: t.radius.btn, paddingVertical: 14,
            shadowColor: t.shadow.floating, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 8,
          }}
        >
          <Text style={{ ...t.typography.h3, color: '#FFFFFF' }}>Generate Report</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  )
}
