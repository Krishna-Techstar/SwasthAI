import { useState } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { doctorTheme as t } from '../../constants/doctorTheme'
import { SCAN_TYPES } from '../../constants/medicalConstants'

export function RadiologyUploader({ uploads, onPickImage, onRemoveUpload, onAnalyze, isAnalyzing, error }) {
  const [selectedType, setSelectedType] = useState('xray')

  return (
    <View style={{ gap: t.space.base }}>
      {/* Scan type selector */}
      <View>
        <Text style={{ ...t.typography.bodySemi, color: t.text.primary, marginBottom: t.space.sm }}>Scan Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {SCAN_TYPES.map((st) => (
            <Pressable
              key={st.id}
              onPress={() => { Haptics.selectionAsync(); setSelectedType(st.id) }}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 6,
                paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14,
                backgroundColor: selectedType === st.id ? t.brand.teal + '15' : t.bg.tertiary,
                borderWidth: 1, borderColor: selectedType === st.id ? t.brand.teal + '40' : 'transparent',
              }}
            >
              <Ionicons name={st.icon} size={16} color={selectedType === st.id ? t.brand.teal : t.text.secondary} />
              <Text style={{ ...t.typography.bodyMed, fontSize: 12, color: selectedType === st.id ? t.brand.teal : t.text.secondary }}>{st.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Upload zone */}
      <Pressable
        onPress={() => onPickImage?.(selectedType)}
        style={{
          borderWidth: 2, borderColor: t.brand.teal + '30', borderStyle: 'dashed',
          borderRadius: t.radius.card, padding: t.space.xl, alignItems: 'center', gap: 10,
          backgroundColor: t.brand.teal + '05',
        }}
      >
        <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: t.brand.teal + '15', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="cloud-upload-outline" size={26} color={t.brand.teal} />
        </View>
        <Text style={{ ...t.typography.bodyMed, color: t.text.primary }}>Upload Medical Images</Text>
        <Text style={{ ...t.typography.caption, color: t.text.muted, textAlign: 'center' }}>
          X-Ray · CT · MRI · DICOM · PNG/JPG
        </Text>
      </Pressable>
      {error ? (
        <Text style={{ ...t.typography.caption, color: t.semantic.error, textAlign: 'center' }}>
          {error}
        </Text>
      ) : null}

      {/* Uploaded files */}
      {uploads?.length > 0 && (
        <View style={{ gap: t.space.sm }}>
          <Text style={{ ...t.typography.bodySemi, color: t.text.primary }}>Uploaded ({uploads.length})</Text>
          {uploads.map((up) => (
            <View key={up.id} style={{
              flexDirection: 'row', alignItems: 'center', gap: 10,
              backgroundColor: t.bg.secondary, borderRadius: 16, padding: 12,
              borderWidth: 1, borderColor: t.border.subtle,
            }}>
              <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: t.bg.tertiary, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="image-outline" size={22} color={t.brand.teal} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ ...t.typography.bodyMed, color: t.text.primary }} numberOfLines={1}>{up.fileName || 'Medical scan'}</Text>
                <Text style={{ ...t.typography.caption, color: t.text.muted }}>{up.scanType?.toUpperCase()} · {up.status}</Text>
                {up.status === 'uploading' && (
                  <View style={{ height: 3, borderRadius: 1.5, backgroundColor: t.border.subtle, marginTop: 4 }}>
                    <View style={{ height: '100%', width: `${(up.uploadProgress || 0) * 100}%`, borderRadius: 1.5, backgroundColor: t.brand.teal }} />
                  </View>
                )}
              </View>
              <Pressable onPress={() => onRemoveUpload?.(up.id)}>
                <Ionicons name="close-circle-outline" size={20} color={t.text.muted} />
              </Pressable>
            </View>
          ))}

          {/* Analyze button */}
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onAnalyze?.() }}
            disabled={isAnalyzing}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
              backgroundColor: isAnalyzing ? t.bg.tertiary : t.brand.teal,
              borderRadius: t.radius.btn, paddingVertical: 14,
              shadowColor: isAnalyzing ? 'transparent' : t.shadow.floating,
              shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 6,
            }}
          >
            <Ionicons name={isAnalyzing ? 'hourglass-outline' : 'sparkles'} size={18} color={isAnalyzing ? t.text.muted : '#FFFFFF'} />
            <Text style={{ ...t.typography.h3, color: isAnalyzing ? t.text.muted : '#FFFFFF' }}>
              {isAnalyzing ? 'Analyzing...' : 'Run AI Analysis'}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}
