import { View, Text, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { doctorTheme as t } from '../../constants/doctorTheme'

function SuggestionCard({ title, confidence, evidence, icdCode }) {
  const barColor = confidence >= 70 ? t.semantic.error : confidence >= 40 ? t.semantic.warning : t.semantic.success
  return (
    <View style={{ backgroundColor: t.bg.secondary, borderRadius: 16, padding: t.space.base, borderWidth: 1, borderColor: t.border.subtle, marginBottom: t.space.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ ...t.typography.bodySemi, color: t.text.primary, flex: 1 }}>{title}</Text>
        <View style={{ backgroundColor: barColor + '18', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
          <Text style={{ ...t.typography.bodySemi, fontSize: 11, color: barColor }}>{confidence}%</Text>
        </View>
      </View>
      <View style={{ height: 3, borderRadius: 1.5, backgroundColor: t.border.subtle, marginBottom: 8 }}>
        <View style={{ height: '100%', width: `${confidence}%`, borderRadius: 1.5, backgroundColor: barColor }} />
      </View>
      <Text style={{ ...t.typography.body, color: t.text.secondary, lineHeight: 18 }}>{evidence}</Text>
      {icdCode && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
          <Ionicons name="code-outline" size={10} color={t.text.muted} />
          <Text style={{ ...t.typography.caption, color: t.text.muted }}>ICD: {icdCode}</Text>
        </View>
      )}
    </View>
  )
}

export function ClinicalSuggestions({ suggestions, loading }) {
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <Ionicons name="sparkles" size={32} color={t.brand.teal + '40'} />
        <Text style={{ ...t.typography.body, color: t.text.muted }}>AI analyzing...</Text>
      </View>
    )
  }
  if (!suggestions?.conditions?.length) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: t.space.lg }}>
        <Ionicons name="sparkles-outline" size={28} color={t.text.muted} />
        <Text style={{ ...t.typography.body, color: t.text.muted, textAlign: 'center' }}>
          Suggestions appear after transcription
        </Text>
      </View>
    )
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: t.space.base }} showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: t.brand.teal + '08', borderRadius: 12, padding: 10, marginBottom: t.space.base, borderWidth: 1, borderColor: t.brand.teal + '20' }}>
        <Text style={{ ...t.typography.caption, color: t.brand.teal, textAlign: 'center' }}>
          AI suggestions — Does not override doctor authority
        </Text>
      </View>

      {suggestions.conditions?.length > 0 && (
        <View style={{ marginBottom: t.space.base }}>
          <Text style={{ ...t.typography.h3, color: t.text.primary, marginBottom: t.space.sm }}>Possible Conditions</Text>
          {suggestions.conditions.map((c, i) => (
            <SuggestionCard key={i} title={c.name} confidence={c.confidence} evidence={c.evidence} icdCode={c.icdCode} />
          ))}
        </View>
      )}

      {suggestions.tests?.length > 0 && (
        <View style={{ marginBottom: t.space.base }}>
          <Text style={{ ...t.typography.h3, color: t.text.primary, marginBottom: t.space.sm }}>Recommended Tests</Text>
          {suggestions.tests.map((test, i) => {
            const uc = test.urgency === 'STAT' ? t.semantic.error : t.semantic.warning
            return (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: t.border.subtle + '40' }}>
                <View style={{ backgroundColor: uc + '18', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                  <Text style={{ ...t.typography.bodySemi, fontSize: 9, color: uc }}>{test.urgency}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ ...t.typography.bodyMed, color: t.text.primary }}>{test.name}</Text>
                  <Text style={{ ...t.typography.caption, color: t.text.muted }}>{test.reason}</Text>
                </View>
              </View>
            )
          })}
        </View>
      )}

      {suggestions.differentialDiagnosis?.length > 0 && (
        <View style={{ marginBottom: t.space.base }}>
          <Text style={{ ...t.typography.h3, color: t.text.primary, marginBottom: t.space.sm }}>Differential Diagnosis</Text>
          {suggestions.differentialDiagnosis.map((d, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 }}>
              <Text style={{ ...t.typography.body, color: t.text.primary, flex: 1 }}>{d.condition}</Text>
              <View style={{ backgroundColor: t.bg.tertiary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                <Text style={{ ...t.typography.caption, color: t.text.secondary }}>{d.likelihood}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  )
}
