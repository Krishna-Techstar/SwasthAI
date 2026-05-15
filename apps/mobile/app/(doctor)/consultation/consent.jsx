import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated'
import { doctorTheme as t } from '../../../constants/doctorTheme'
import { useConsultationStore } from '../../../store/consultationStore'

export default function ConsentScreen() {
  const [agreed, setAgreed] = useState(false)
  const { captureConsent, setWorkflowType, patient } = useConsultationStore()

  const handleSelectWorkflow = (type) => {
    if (!agreed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      return
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    captureConsent('1.0.0-ISO', { platform: 'Mobile', device: 'Authenticated Dr Terminal' })
    setWorkflowType(type)
    
    if (type === 'consultation') {
      router.push('/(doctor)/consultation/active')
    } else {
      router.push('/(doctor)/consultation/radiology')
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={t.text.primary} />
        </Pressable>
        <Text style={styles.title}>Legal & Workflow</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(200)} style={styles.consentCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="document-text-outline" size={24} color={t.brand.indigo} />
          </View>
          <Text style={styles.consentTitle}>AI Diagnostic Consent</Text>
          <Text style={styles.consentText}>
            This consultation will utilize SwasthAI LLM-1 (Clinical Intelligence) and/or LLM-2 (Radiological Vision).
            By proceeding, you acknowledge that:
            {'\n\n'}• AI outputs are suggestions and must be verified by a registered practitioner.
            {'\n'}• Audio/Visual data will be processed in a secure, HIPAA/ISO compliant environment.
            {'\n'}• Clinical notes will be auto-generated based on the dual-stream input.
          </Text>

          <Pressable 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              setAgreed(!agreed)
            }}
            style={styles.checkboxRow}
          >
            <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
              {agreed && <Ionicons name="checkmark" size={16} color="#FFF" />}
            </View>
            <Text style={styles.checkboxLabel}>I confirm patient consent and professional responsibility.</Text>
          </Pressable>
        </Animated.View>

        <Text style={styles.sectionLabel}>CHOOSE DIAGNOSTIC WORKFLOW</Text>

        <View style={styles.workflowGrid}>
          {/* Option A: Clinical */}
          <Animated.View entering={FadeInRight.delay(400)}>
            <Pressable 
              onPress={() => handleSelectWorkflow('consultation')}
              style={[styles.workflowCard, !agreed && styles.cardDisabled]}
            >
              <View style={[styles.workflowIcon, { backgroundColor: t.brand.tealDim }]}>
                <Ionicons name="mic-outline" size={30} color={t.brand.teal} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Clinical Consultation</Text>
                <Text style={styles.cardDesc}>Voice AI + Real-time SOAP Notes + Body Map</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={t.text.muted} />
            </Pressable>
          </Animated.View>

          {/* Option B: Radiology */}
          <Animated.View entering={FadeInRight.delay(600)}>
            <Pressable 
              onPress={() => handleSelectWorkflow('radiology')}
              style={[styles.workflowCard, !agreed && styles.cardDisabled]}
            >
              <View style={[styles.workflowIcon, { backgroundColor: t.brand.lavender + '40' }]}>
                <Ionicons name="scan-outline" size={30} color={t.brand.indigo} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Radiology Analysis</Text>
                <Text style={styles.cardDesc}>X-Ray/CT/MRI Vision AI + Contour Heatmaps</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={t.text.muted} />
            </Pressable>
          </Animated.View>
        </View>

        <View style={styles.patientPreview}>
          <Text style={styles.previewLabel}>Active Patient Context</Text>
          <View style={styles.patientRow}>
             <View style={styles.miniAvatar}>
               <Text style={styles.miniAvatarText}>{patient?.name?.[0] || 'P'}</Text>
             </View>
             <View>
               <Text style={styles.miniName}>{patient?.name || 'Select Patient'}</Text>
               <Text style={styles.miniId}>{patient?.abhaId || 'Verification Required'}</Text>
             </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg.primary },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20,
    height: 60
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { ...t.typography.h3, color: t.text.primary },
  scrollContent: { padding: 20 },
  consentCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 24, 
    padding: 24, 
    borderWidth: 1, 
    borderColor: t.border.subtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 32
  },
  iconCircle: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    backgroundColor: t.brand.lavender + '20', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 16
  },
  consentTitle: { ...t.typography.h2, color: t.text.primary, marginBottom: 12 },
  consentText: { ...t.typography.body, color: t.text.secondary, lineHeight: 22, marginBottom: 24 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkbox: { 
    width: 24, 
    height: 24, 
    borderRadius: 6, 
    borderWidth: 2, 
    borderColor: t.brand.indigo,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkboxActive: { backgroundColor: t.brand.indigo },
  checkboxLabel: { ...t.typography.bodySemi, color: t.text.primary, flex: 1, fontSize: 13 },
  sectionLabel: { ...t.typography.caption, color: t.text.muted, letterSpacing: 1.5, marginBottom: 16, paddingLeft: 4 },
  workflowGrid: { gap: 16 },
  workflowCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    padding: 16, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: t.border.subtle,
    gap: 16
  },
  cardDisabled: { opacity: 0.5 },
  workflowIcon: { 
    width: 60, 
    height: 60, 
    borderRadius: 15, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  cardContent: { flex: 1 },
  cardTitle: { ...t.typography.h3, color: t.text.primary, fontSize: 16 },
  cardDesc: { ...t.typography.caption, color: t.text.muted, marginTop: 4, lineHeight: 16 },
  patientPreview: { marginTop: 40, borderTopWidth: 1, borderTopColor: t.border.subtle, paddingTop: 20 },
  previewLabel: { ...t.typography.caption, color: t.text.muted, marginBottom: 12 },
  patientRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  miniAvatar: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: t.brand.tealDim, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  miniAvatarText: { ...t.typography.bodySemi, color: t.brand.teal },
  miniName: { ...t.typography.bodySemi, color: t.text.primary },
  miniId: { ...t.typography.caption, color: t.text.muted },
})
