import { View, Text, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { doctorTheme as t } from '../../constants/doctorTheme'
import { ConfidenceMeter } from './ConfidenceMeter'

export function RadiologyResults({ results }) {
  if (!results) return null
  return (
    <ScrollView contentContainerStyle={{ padding: t.space.base, gap: t.space.base }} showsVerticalScrollIndicator={false}>
      {/* Classification header */}
      <View style={{ backgroundColor: t.bg.secondary, borderRadius: t.radius.card, padding: t.space.base, borderWidth: 1, borderColor: t.brand.teal + '30' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ConfidenceMeter value={Math.round((results.overallConfidence || 0) * 100)} size={60} label="AI Conf." />
          <View style={{ flex: 1 }}>
            <Text style={{ ...t.typography.caption, color: t.text.muted }}>AI Classification</Text>
            <Text style={{ ...t.typography.h3, color: t.text.primary, marginTop: 2 }}>{results.classification}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: results.severity === 'moderate' ? t.semantic.warning : results.severity === 'mild' ? t.semantic.success : t.semantic.error }} />
              <Text style={{ ...t.typography.bodyMed, fontSize: 11, color: t.text.secondary }}>Severity: {results.severity}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Anomalies */}
      <View>
        <Text style={{ ...t.typography.h3, color: t.text.primary, marginBottom: t.space.sm }}>Detected Anomalies</Text>
        {(results.anomalies || []).map((a, i) => {
          const sc = a.severity === 'normal' ? t.semantic.success : a.severity === 'mild' ? t.semantic.warning : t.semantic.error
          return (
            <View key={i} style={{ backgroundColor: t.bg.secondary, borderRadius: 16, padding: t.space.base, marginBottom: t.space.sm, borderWidth: 1, borderColor: t.border.subtle }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ ...t.typography.bodySemi, color: t.text.primary }}>{a.region}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: sc }} />
                  <Text style={{ ...t.typography.caption, color: sc }}>{a.severity} · {Math.round(a.confidence * 100)}%</Text>
                </View>
              </View>
              <Text style={{ ...t.typography.body, color: t.text.secondary }}>{a.finding}</Text>
            </View>
          )
        })}
      </View>

      {/* Heatmap info */}
      {results.heatmapData?.hotspots?.length > 0 && (
        <View>
          <Text style={{ ...t.typography.h3, color: t.text.primary, marginBottom: t.space.sm }}>Heatmap Regions</Text>
          {results.heatmapData.hotspots.map((hs, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: t.border.subtle + '40' }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: `rgba(239,68,68,${hs.intensity})` }} />
              <Text style={{ ...t.typography.bodyMed, color: t.text.primary, flex: 1 }}>{hs.label}</Text>
              <Text style={{ ...t.typography.caption, color: t.text.muted }}>{Math.round(hs.intensity * 100)}%</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  )
}
