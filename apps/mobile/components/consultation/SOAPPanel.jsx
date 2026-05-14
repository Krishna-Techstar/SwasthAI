import { useState } from 'react'
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { doctorTheme as t } from '../../constants/doctorTheme'
import { SOAP_SECTIONS } from '../../constants/medicalConstants'
import { ConfidenceMeter } from './ConfidenceMeter'

export function SOAPPanel({ soapNote, soapConfidence, soapGenerated, onUpdate, onGenerate, isGenerating }) {
  const [expandedSection, setExpandedSection] = useState('subjective')

  const SoapSection = ({ sectionKey, config }) => {
    const isExpanded = expandedSection === config.key
    const content = soapNote?.[config.key] || ''
    const confidence = soapConfidence?.[config.key] || 0

    return (
      <View style={{
        backgroundColor: t.bg.secondary, borderRadius: t.radius.card,
        borderWidth: 1, borderColor: isExpanded ? t.brand.teal + '30' : t.border.subtle,
        marginBottom: t.space.sm, overflow: 'hidden',
      }}>
        <Pressable
          onPress={() => { Haptics.selectionAsync(); setExpandedSection(isExpanded ? null : config.key) }}
          style={{ flexDirection: 'row', alignItems: 'center', padding: t.space.base, gap: 10 }}
        >
          <View style={{
            width: 36, height: 36, borderRadius: 10,
            backgroundColor: t.brand.teal + '12', alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ ...t.typography.h2, color: t.brand.teal }}>{sectionKey}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ ...t.typography.bodySemi, color: t.text.primary }}>{config.title}</Text>
            <Text style={{ ...t.typography.caption, color: t.text.muted }}>{config.subtitle}</Text>
          </View>
          {soapGenerated && confidence > 0 && (
            <View style={{ backgroundColor: (confidence > 85 ? t.semantic.success : t.semantic.warning) + '18', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
              <Text style={{ ...t.typography.bodySemi, fontSize: 10, color: confidence > 85 ? t.semantic.success : t.semantic.warning }}>{confidence}%</Text>
            </View>
          )}
          <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={t.text.muted} />
        </Pressable>

        {isExpanded && (
          <View style={{ paddingHorizontal: t.space.base, paddingBottom: t.space.base }}>
            <TextInput
              value={content}
              onChangeText={(text) => onUpdate?.(config.key, text)}
              placeholder={config.placeholder}
              placeholderTextColor={t.text.muted}
              multiline
              textAlignVertical="top"
              style={{
                fontFamily: t.typography.body.fontFamily, fontSize: 13,
                color: t.text.primary, lineHeight: 20,
                minHeight: 100, backgroundColor: t.bg.tertiary,
                borderRadius: 12, padding: 12,
                borderWidth: 1, borderColor: t.border.subtle,
              }}
            />
          </View>
        )}
      </View>
    )
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: t.space.base }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space.base }}>
        <View>
          <Text style={{ ...t.typography.h2, color: t.text.primary }}>SOAP Notes</Text>
          <Text style={{ ...t.typography.caption, color: t.text.muted }}>
            {soapGenerated ? 'AI-generated · Editable' : 'Tap generate to create'}
          </Text>
        </View>
        {!soapGenerated && (
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onGenerate?.() }}
            disabled={isGenerating}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
              backgroundColor: isGenerating ? t.bg.tertiary : t.brand.teal,
              paddingHorizontal: 14, paddingVertical: 8, borderRadius: t.radius.btn,
            }}
          >
            <Ionicons name={isGenerating ? 'hourglass-outline' : 'sparkles'} size={16} color={isGenerating ? t.text.muted : '#FFFFFF'} />
            <Text style={{ ...t.typography.bodyMed, color: isGenerating ? t.text.muted : '#FFFFFF' }}>
              {isGenerating ? 'Generating...' : 'Generate SOAP'}
            </Text>
          </Pressable>
        )}
      </View>

      {/* SOAP sections */}
      {Object.entries(SOAP_SECTIONS).map(([key, config]) => (
        <SoapSection key={key} sectionKey={key} config={config} />
      ))}

      {/* ICD codes (if generated) */}
      {soapGenerated && (
        <View style={{ marginTop: t.space.sm }}>
          <Text style={{ ...t.typography.bodySemi, color: t.text.primary, marginBottom: t.space.sm }}>ICD-10 Codes</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {[{ code: 'I20.0', label: 'Unstable angina' }, { code: 'E11.9', label: 'T2DM' }, { code: 'I10', label: 'HTN' }].map((icd) => (
              <View key={icd.code} style={{ backgroundColor: t.bg.tertiary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: t.border.subtle }}>
                <Text style={{ ...t.typography.bodySemi, fontSize: 11, color: t.brand.teal }}>{icd.code}</Text>
                <Text style={{ ...t.typography.caption, fontSize: 9, color: t.text.muted }}>{icd.label}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  )
}
