import { useState } from 'react'
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { doctorTheme as t } from '../../constants/doctorTheme'
import { DRUG_RISK_LEVELS } from '../../constants/medicalConstants'

export function DrugSafetyPanel({ prescriptions, interactions, alerts, alternatives, safetyScore, onAddDrug, onRemoveDrug, onCheckSafety, isChecking }) {
  const [drugInput, setDrugInput] = useState('')

  const scoreColor = safetyScore > 80 ? t.semantic.success : safetyScore > 50 ? t.semantic.warning : t.semantic.error

  return (
    <ScrollView contentContainerStyle={{ padding: t.space.base, gap: t.space.base }} showsVerticalScrollIndicator={false}>
      {/* Safety score */}
      {safetyScore !== null && safetyScore !== undefined && (
        <View style={{ backgroundColor: scoreColor + '10', borderRadius: t.radius.card, padding: t.space.base, borderWidth: 1, borderColor: scoreColor + '30', alignItems: 'center' }}>
          <Text style={{ ...t.typography.chipValue, fontSize: 36, color: scoreColor }}>{safetyScore}</Text>
          <Text style={{ ...t.typography.bodyMed, color: scoreColor }}>Safety Score</Text>
        </View>
      )}

      {/* Drug input */}
      <View>
        <Text style={{ ...t.typography.bodySemi, color: t.text.primary, marginBottom: t.space.sm }}>Add Prescription</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            value={drugInput}
            onChangeText={setDrugInput}
            placeholder="Search drug name..."
            placeholderTextColor={t.text.muted}
            style={{
              flex: 1, height: 44, borderRadius: t.radius.input, backgroundColor: t.bg.tertiary,
              borderWidth: 1, borderColor: t.border.subtle, paddingHorizontal: 14,
              fontFamily: t.typography.body.fontFamily, fontSize: 13, color: t.text.primary,
            }}
          />
          <Pressable
            onPress={() => {
              if (!drugInput.trim()) return
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              onAddDrug?.({ drugName: drugInput.trim(), dosage: '', frequency: '' })
              setDrugInput('')
            }}
            style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: t.brand.teal, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      {/* Current prescriptions */}
      {prescriptions?.length > 0 && (
        <View>
          <Text style={{ ...t.typography.bodySemi, color: t.text.primary, marginBottom: t.space.sm }}>Prescriptions ({prescriptions.length})</Text>
          {prescriptions.map((rx) => (
            <View key={rx.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: t.bg.secondary, borderRadius: 14, padding: 10, marginBottom: 6, borderWidth: 1, borderColor: t.border.subtle }}>
              <Ionicons name="medical" size={16} color={t.brand.teal} />
              <Text style={{ ...t.typography.bodyMed, color: t.text.primary, flex: 1 }}>{rx.drugName}</Text>
              <Pressable onPress={() => onRemoveDrug?.(rx.id)}>
                <Ionicons name="trash-outline" size={16} color={t.text.muted} />
              </Pressable>
            </View>
          ))}
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onCheckSafety?.() }}
            disabled={isChecking}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
              backgroundColor: isChecking ? t.bg.tertiary : t.brand.teal,
              borderRadius: t.radius.btn, paddingVertical: 12, marginTop: t.space.sm,
            }}
          >
            <Ionicons name={isChecking ? 'hourglass-outline' : 'shield-checkmark'} size={18} color={isChecking ? t.text.muted : '#FFFFFF'} />
            <Text style={{ ...t.typography.bodyMed, color: isChecking ? t.text.muted : '#FFFFFF' }}>
              {isChecking ? 'Checking...' : 'Check Drug Safety'}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Alerts */}
      {alerts?.length > 0 && (
        <View>
          <Text style={{ ...t.typography.h3, color: t.semantic.error, marginBottom: t.space.sm }}>⚠️ Safety Alerts</Text>
          {alerts.map((alert) => {
            const config = DRUG_RISK_LEVELS[alert.level] || DRUG_RISK_LEVELS.MODERATE
            return (
              <View key={alert.id} style={{ backgroundColor: config.bgColor, borderRadius: 16, padding: t.space.base, marginBottom: t.space.sm, borderWidth: 1, borderColor: config.color + '30' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Ionicons name={config.icon} size={16} color={config.color} />
                  <Text style={{ ...t.typography.bodySemi, color: config.color }}>{alert.title}</Text>
                </View>
                <Text style={{ ...t.typography.body, color: t.text.secondary }}>{alert.description}</Text>
              </View>
            )
          })}
        </View>
      )}

      {/* Interactions */}
      {interactions?.length > 0 && (
        <View>
          <Text style={{ ...t.typography.h3, color: t.text.primary, marginBottom: t.space.sm }}>Drug Interactions</Text>
          {interactions.map((int) => {
            const config = DRUG_RISK_LEVELS[int.severity] || DRUG_RISK_LEVELS.MODERATE
            return (
              <View key={int.id} style={{ backgroundColor: t.bg.secondary, borderRadius: 16, padding: t.space.base, marginBottom: t.space.sm, borderWidth: 1, borderColor: config.color + '30' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                  <View style={{ backgroundColor: config.color + '18', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                    <Text style={{ ...t.typography.bodySemi, fontSize: 10, color: config.color }}>{int.severity}</Text>
                  </View>
                  <Text style={{ ...t.typography.bodyMed, color: t.text.primary }}>{int.drugA} ↔ {int.drugB}</Text>
                </View>
                <Text style={{ ...t.typography.body, color: t.text.secondary, marginBottom: 4 }}>{int.description}</Text>
                <Text style={{ ...t.typography.bodyMed, fontSize: 12, color: t.semantic.success }}>💡 {int.recommendation}</Text>
              </View>
            )
          })}
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  )
}
