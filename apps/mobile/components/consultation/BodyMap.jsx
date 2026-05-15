import React from 'react'
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native'
import Svg, { Path, G, Circle } from 'react-native-svg'
import { doctorTheme as t } from '../../constants/doctorTheme'

const { width } = Dimensions.get('window')

export function BodyMap({ view = 'front', onRegionPress, selectedRegions = [] }) {
  // Simplified professional medical body paths
  // These are symbolic representations for the UI
  const regions = {
    front: [
      { id: 'head', name: 'Head/Neck', d: 'M100 20c-10 0-18 8-18 18s8 18 18 18 18-8 18-18-8-18-18-18zm0 36c-5 0-9 4-9 9v5h18v-5c0-5-4-9-9-9z' },
      { id: 'chest', name: 'Chest', d: 'M85 75h30l5 35h-40l5-35z' },
      { id: 'abdomen', name: 'Abdomen', d: 'M88 115h24l3 25h-30l3-25z' },
      { id: 'arm_l', name: 'Left Arm', d: 'M78 78l-15 45 5 5 15-45-5-5z' },
      { id: 'arm_r', name: 'Right Arm', d: 'M122 78l15 45-5 5-15-45 5-5z' },
      { id: 'leg_l', name: 'Left Leg', d: 'M90 145l-5 60 10 2 5-62z' },
      { id: 'leg_r', name: 'Right Leg', d: 'M110 145l5 60-10 2-5-62z' },
    ],
    back: [
      { id: 'head_b', name: 'Head (Back)', d: 'M100 20c-10 0-18 8-18 18s8 18 18 18 18-8 18-18-8-18-18-18zm0 36c-5 0-9 4-9 9v5h18v-5c0-5-4-9-9-9z' },
      { id: 'back_u', name: 'Upper Back', d: 'M85 75h30l5 35h-40l5-35z' },
      { id: 'back_l', name: 'Lower Back', d: 'M88 115h24l3 25h-30l3-25z' },
    ]
  }

  const activeRegions = regions[view] || regions.front

  return (
    <View style={styles.container}>
      <Svg width={200} height={250} viewBox="0 0 200 250">
        <G>
          {/* Base Shadow silhouette */}
          <Path
            d="M100 15c-15 0-25 10-25 25s10 25 25 25 25-10 25-25-10-25-25-25zm0 55c-20 0-35 15-35 35l-20 60c-5 15 10 25 20 15l10-30v80l-10 70h20l15-70 15 70h20l-10-70v-80l10 30c10 10 25 0 20-15l-20-60c0-20-15-35-35-35z"
            fill={t.bg.tertiary}
            opacity={0.3}
          />
          
          {activeRegions.map((region) => {
            const isSelected = selectedRegions.includes(region.id)
            return (
              <Path
                key={region.id}
                d={region.d}
                fill={isSelected ? t.brand.teal : t.brand.indigo}
                fillOpacity={isSelected ? 0.8 : 0.2}
                stroke={isSelected ? t.brand.teal : t.brand.indigo}
                strokeWidth={1}
                onPress={() => onRegionPress(region.id)}
              />
            )
          })}
        </G>
      </Svg>
      
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>{view.toUpperCase()} VIEW</Text>
        <View style={styles.regionList}>
          {activeRegions.map(r => (
            <View key={r.id} style={styles.pill}>
              <Text style={[styles.pillText, selectedRegions.includes(r.id) && styles.pillActive]}>
                {r.name}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 16,
    borderWidth: 1,
    borderColor: t.border.subtle
  },
  legend: { marginTop: 16, width: '100%' },
  legendTitle: { ...t.typography.caption, color: t.text.muted, textAlign: 'center', marginBottom: 8 },
  regionList: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  pill: { backgroundColor: t.bg.tertiary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  pillText: { ...t.typography.caption, color: t.text.secondary, fontSize: 10 },
  pillActive: { color: t.brand.teal, fontWeight: '700' },
})
