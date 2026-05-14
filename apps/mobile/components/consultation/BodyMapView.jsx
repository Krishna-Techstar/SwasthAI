import { useState, useCallback } from 'react'
import { View, Text, Pressable, Dimensions, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { doctorTheme as t } from '../../constants/doctorTheme'
import { BODY_REGIONS_FRONT, BODY_REGIONS_BACK, PAIN_SEVERITY, MARKER_TYPES } from '../../constants/medicalConstants'
import { useConsultationStore } from '../../store/consultationStore'
import { HeatMarker } from './HeatMarker'

const BODY_WIDTH = Dimensions.get('window').width - 80

export function BodyMapView() {
  const bodyMarkers = useConsultationStore((s) => s.bodyMarkers)
  const activeView = useConsultationStore((s) => s.activeBodyView)
  const setActiveView = useConsultationStore((s) => s.setActiveBodyView)
  const addMarker = useConsultationStore((s) => s.addBodyMarker)
  const removeMarker = useConsultationStore((s) => s.removeBodyMarker)
  const [selectedSeverity, setSelectedSeverity] = useState(2)
  const [selectedType, setSelectedType] = useState('pain')

  const BODY_HEIGHT = BODY_WIDTH * 1.8
  const regions = activeView === 'front' ? BODY_REGIONS_FRONT : BODY_REGIONS_BACK

  const handleBodyTap = useCallback((evt) => {
    const { locationX, locationY } = evt.nativeEvent
    const tapX = locationX / BODY_WIDTH
    const tapY = locationY / BODY_HEIGHT

    // Find nearest region
    let nearest = null
    let minDist = Infinity
    regions.forEach((region) => {
      const dx = region.x - tapX
      const dy = region.y - tapY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < region.radius * 1.5 && dist < minDist) {
        minDist = dist
        nearest = region
      }
    })

    if (nearest) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      addMarker({
        regionId: nearest.id,
        regionLabel: nearest.label,
        position: { x: nearest.x, y: nearest.y },
        severity: selectedSeverity,
        type: selectedType,
        radius: nearest.radius * BODY_WIDTH,
        view: activeView,
      })
    }
  }, [regions, selectedSeverity, selectedType, activeView, addMarker])

  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      {/* View toggle */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.space.sm, paddingVertical: t.space.sm }}>
        {['front', 'back'].map((view) => (
          <Pressable
            key={view}
            onPress={() => { Haptics.selectionAsync(); setActiveView(view) }}
            style={{
              paddingHorizontal: 16, paddingVertical: 6, borderRadius: 14,
              backgroundColor: activeView === view ? t.brand.teal : t.bg.tertiary,
            }}
          >
            <Text style={{ ...t.typography.bodyMed, fontSize: 12, color: activeView === view ? '#FFFFFF' : t.text.secondary }}>
              {view === 'front' ? 'Front' : 'Back'}
            </Text>
          </Pressable>
        ))}
        {bodyMarkers.length > 0 && (
          <View style={{ backgroundColor: t.brand.teal + '18', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 }}>
            <Text style={{ ...t.typography.caption, color: t.brand.teal }}>{bodyMarkers.length} markers</Text>
          </View>
        )}
      </View>

      {/* Severity selector */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, paddingBottom: t.space.sm }}>
        {PAIN_SEVERITY.map((sev) => (
          <Pressable
            key={sev.level}
            onPress={() => { Haptics.selectionAsync(); setSelectedSeverity(sev.level) }}
            style={{
              paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
              backgroundColor: selectedSeverity === sev.level ? sev.color + '30' : 'transparent',
              borderWidth: 1, borderColor: selectedSeverity === sev.level ? sev.color : t.border.subtle,
            }}
          >
            <Text style={{ ...t.typography.caption, color: sev.color }}>{sev.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Body silhouette area */}
      <View style={{ alignItems: 'center', flex: 1 }}>
        <Pressable onPress={handleBodyTap}>
          <View style={{
            width: BODY_WIDTH, height: BODY_HEIGHT,
            backgroundColor: t.bg.tertiary,
            borderRadius: t.radius.card,
            borderWidth: 1, borderColor: t.border.subtle,
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Simplified body outline using shapes */}
            {/* Head */}
            <View style={{ position: 'absolute', left: BODY_WIDTH * 0.42, top: BODY_HEIGHT * 0.02, width: BODY_WIDTH * 0.16, height: BODY_WIDTH * 0.16, borderRadius: BODY_WIDTH * 0.08, backgroundColor: t.border.subtle + '80' }} />
            {/* Neck */}
            <View style={{ position: 'absolute', left: BODY_WIDTH * 0.46, top: BODY_HEIGHT * 0.11, width: BODY_WIDTH * 0.08, height: BODY_HEIGHT * 0.03, backgroundColor: t.border.subtle + '80' }} />
            {/* Torso */}
            <View style={{ position: 'absolute', left: BODY_WIDTH * 0.32, top: BODY_HEIGHT * 0.14, width: BODY_WIDTH * 0.36, height: BODY_HEIGHT * 0.28, borderRadius: 12, backgroundColor: t.border.subtle + '60' }} />
            {/* Left arm */}
            <View style={{ position: 'absolute', left: BODY_WIDTH * 0.18, top: BODY_HEIGHT * 0.16, width: BODY_WIDTH * 0.12, height: BODY_HEIGHT * 0.28, borderRadius: 8, backgroundColor: t.border.subtle + '50', transform: [{ rotate: '5deg' }] }} />
            {/* Right arm */}
            <View style={{ position: 'absolute', right: BODY_WIDTH * 0.18, top: BODY_HEIGHT * 0.16, width: BODY_WIDTH * 0.12, height: BODY_HEIGHT * 0.28, borderRadius: 8, backgroundColor: t.border.subtle + '50', transform: [{ rotate: '-5deg' }] }} />
            {/* Left leg */}
            <View style={{ position: 'absolute', left: BODY_WIDTH * 0.34, top: BODY_HEIGHT * 0.44, width: BODY_WIDTH * 0.13, height: BODY_HEIGHT * 0.42, borderRadius: 8, backgroundColor: t.border.subtle + '50' }} />
            {/* Right leg */}
            <View style={{ position: 'absolute', right: BODY_WIDTH * 0.34, top: BODY_HEIGHT * 0.44, width: BODY_WIDTH * 0.13, height: BODY_HEIGHT * 0.42, borderRadius: 8, backgroundColor: t.border.subtle + '50' }} />

            {/* Region hit zones (subtle dots) */}
            {regions.map((region) => (
              <View
                key={region.id}
                style={{
                  position: 'absolute',
                  left: region.x * BODY_WIDTH - 3,
                  top: region.y * BODY_HEIGHT - 3,
                  width: 6, height: 6, borderRadius: 3,
                  backgroundColor: t.brand.teal + '30',
                }}
              />
            ))}

            {/* Heat markers */}
            {bodyMarkers
              .filter((m) => m.view === activeView)
              .map((marker) => (
                <HeatMarker
                  key={marker.id}
                  x={marker.position.x}
                  y={marker.position.y}
                  severity={marker.severity}
                  radius={marker.radius || 16}
                  containerWidth={BODY_WIDTH}
                  containerHeight={BODY_HEIGHT}
                />
              ))}

            {/* Tap instruction */}
            <View style={{ position: 'absolute', bottom: 12, left: 0, right: 0, alignItems: 'center' }}>
              <Text style={{ ...t.typography.caption, color: t.text.muted }}>Tap to mark pain points</Text>
            </View>
          </View>
        </Pressable>
      </View>

      {/* Marker list */}
      {bodyMarkers.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 52, paddingHorizontal: t.space.base }} contentContainerStyle={{ gap: 6, alignItems: 'center' }}>
          {bodyMarkers.map((m) => (
            <Pressable
              key={m.id}
              onLongPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); removeMarker(m.id) }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: PAIN_SEVERITY[m.severity - 1]?.color + '18', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 }}
            >
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: PAIN_SEVERITY[m.severity - 1]?.color }} />
              <Text style={{ ...t.typography.caption, color: t.text.primary }}>{m.regionLabel}</Text>
              <Text style={{ ...t.typography.caption, color: t.text.muted }}>·</Text>
              <Text style={{ ...t.typography.caption, color: PAIN_SEVERITY[m.severity - 1]?.color }}>{PAIN_SEVERITY[m.severity - 1]?.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  )
}
