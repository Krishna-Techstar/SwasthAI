import { useState } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { doctorTheme as t } from '../../constants/doctorTheme'
import { CONSENT_ITEMS, CONSENT_VERSION } from '../../constants/medicalConstants'

export function ConsentModal({ onAccept, onDecline }) {
  const [checked, setChecked] = useState({})
  const allChecked = CONSENT_ITEMS.filter((c) => c.required).every((c) => checked[c.id])

  const toggleItem = (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      {/* Header */}
      <View style={{ alignItems: 'center', paddingTop: 16, paddingBottom: 20, gap: 8 }}>
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: t.brand.teal + '18', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="shield-checkmark-outline" size={28} color={t.brand.teal} />
        </View>
        <Text style={{ ...t.typography.h1, color: t.text.primary, textAlign: 'center' }}>AI Consent Required</Text>
        <Text style={{ ...t.typography.body, color: t.text.secondary, textAlign: 'center', maxWidth: 300 }}>
          Please review and acknowledge the following before proceeding with AI-assisted consultation.
        </Text>
        <View style={{ backgroundColor: t.bg.tertiary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
          <Text style={{ ...t.typography.caption, color: t.text.muted }}>Consent Version {CONSENT_VERSION}</Text>
        </View>
      </View>

      {/* Consent items */}
      <ScrollView style={{ flex: 1, paddingHorizontal: t.space.base }} showsVerticalScrollIndicator={false}>
        {CONSENT_ITEMS.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => toggleItem(item.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 12,
              backgroundColor: t.bg.secondary,
              borderRadius: t.radius.card,
              padding: t.space.base,
              marginBottom: t.space.sm,
              borderWidth: 1,
              borderColor: checked[item.id] ? t.brand.teal + '50' : t.border.subtle,
            }}
          >
            {/* Checkbox */}
            <View style={{
              width: 24, height: 24, borderRadius: 6,
              borderWidth: 2,
              borderColor: checked[item.id] ? t.brand.teal : t.border.subtle,
              backgroundColor: checked[item.id] ? t.brand.teal : 'transparent',
              alignItems: 'center', justifyContent: 'center',
              marginTop: 2,
            }}>
              {checked[item.id] && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ ...t.typography.bodySemi, color: t.text.primary, marginBottom: 4 }}>
                {item.title}
                {item.required && <Text style={{ color: t.semantic.error }}> *</Text>}
              </Text>
              <Text style={{ ...t.typography.body, color: t.text.secondary, lineHeight: 18 }}>
                {item.description}
              </Text>
            </View>
          </Pressable>
        ))}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Actions */}
      <View style={{ paddingHorizontal: t.space.base, paddingBottom: t.space.lg, gap: t.space.sm, backgroundColor: t.bg.primary, borderTopWidth: 1, borderTopColor: t.border.subtle, paddingTop: t.space.base }}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
            onAccept({ version: CONSENT_VERSION, items: checked, timestamp: new Date().toISOString() })
          }}
          disabled={!allChecked}
          style={{
            backgroundColor: allChecked ? t.brand.teal : t.border.subtle,
            borderRadius: t.radius.btn,
            paddingVertical: 16,
            alignItems: 'center',
            shadowColor: allChecked ? t.shadow.floating : 'transparent',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: allChecked ? 1 : 0,
            shadowRadius: 12,
            elevation: allChecked ? 8 : 0,
          }}
        >
          <Text style={{ ...t.typography.h3, color: allChecked ? '#FFFFFF' : t.text.muted }}>
            I Acknowledge & Consent
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            onDecline()
          }}
          style={{ alignItems: 'center', paddingVertical: 12 }}
        >
          <Text style={{ ...t.typography.bodyMed, color: t.text.muted }}>Decline & Go Back</Text>
        </Pressable>
      </View>
    </View>
  )
}
