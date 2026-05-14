import { View, Text, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { doctorTheme as t } from '../../constants/doctorTheme'

export function SHAPExplainability({ explanation }) {
  if (!explanation) return null
  return (
    <ScrollView contentContainerStyle={{ padding: t.space.base, gap: t.space.base }} showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: t.bg.secondary, borderRadius: t.radius.card, padding: t.space.base, borderWidth: 1, borderColor: t.brand.teal + '20' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Ionicons name="eye-outline" size={18} color={t.brand.teal} />
          <Text style={{ ...t.typography.h3, color: t.text.primary }}>AI Explainability (SHAP)</Text>
        </View>
        <Text style={{ ...t.typography.body, color: t.text.secondary, lineHeight: 20 }}>{explanation.reasoning}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
          <Text style={{ ...t.typography.caption, color: t.text.muted }}>Uncertainty:</Text>
          <Text style={{ ...t.typography.bodySemi, fontSize: 11, color: explanation.uncertainty < 0.2 ? t.semantic.success : t.semantic.warning }}>
            {Math.round(explanation.uncertainty * 100)}%
          </Text>
        </View>
      </View>

      {/* Feature importance bars */}
      <View>
        <Text style={{ ...t.typography.bodySemi, color: t.text.primary, marginBottom: t.space.sm }}>Feature Importance</Text>
        {(explanation.featureImportance || []).map((f, i) => (
          <View key={i} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ ...t.typography.bodyMed, fontSize: 12, color: t.text.primary }}>{f.feature}</Text>
              <Text style={{ ...t.typography.bodySemi, fontSize: 11, color: t.brand.teal }}>{Math.round(f.value * 100)}%</Text>
            </View>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: t.border.subtle }}>
              <View style={{ height: '100%', width: `${f.value * 100}%`, borderRadius: 3, backgroundColor: t.brand.teal, shadowColor: t.brand.teal, shadowOpacity: 0.4, shadowRadius: 4 }} />
            </View>
          </View>
        ))}
      </View>

      {/* Influential regions */}
      <View>
        <Text style={{ ...t.typography.bodySemi, color: t.text.primary, marginBottom: t.space.sm }}>Influential Regions</Text>
        {(explanation.influentialRegions || []).map((r, i) => (
          <View key={i} style={{ backgroundColor: t.bg.secondary, borderRadius: 12, padding: 10, marginBottom: 6, borderWidth: 1, borderColor: t.border.subtle }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
              <Text style={{ ...t.typography.bodyMed, color: t.text.primary }}>{r.region}</Text>
              <Text style={{ ...t.typography.bodySemi, fontSize: 11, color: t.brand.teal }}>{Math.round(r.importance * 100)}%</Text>
            </View>
            <Text style={{ ...t.typography.caption, color: t.text.secondary }}>{r.description}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
