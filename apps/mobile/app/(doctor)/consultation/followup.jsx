import React, { useState, useEffect } from 'react'
import { 
  View, Text, StyleSheet, ScrollView, Pressable, 
  SafeAreaView, Animated, ActivityIndicator, Alert
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { doctorTheme as t } from '../../../constants/doctorTheme'
import { useConsultationStore } from '../../../store/consultationStore'

export default function FollowupSummaryScreen() {
  const { 
    soapNote, soapAiConfidence, setGenerating, isGenerating,
    patient, safetyAlerts, setSafetyAlerts, resetSession
  } = useConsultationStore()

  const [isCheckingSafety, setIsCheckingSafety] = useState(false)
  const [safetyVerified, setSafetyVerified] = useState(false)
  const checkScale = React.useRef(new Animated.Value(0)).current
  const checkOpacity = React.useRef(new Animated.Value(0)).current

  // Simulate Safety Check on Load
  useEffect(() => {
    setIsCheckingSafety(true)
    setTimeout(() => {
      // Simulate finding a potential interaction
      const alerts = [
        { type: 'interaction', severity: 'high', message: 'Aspirin + Warfarin: Increased risk of bleeding.', drugs: ['Aspirin', 'Warfarin'] }
      ]
      setSafetyAlerts(alerts)
      setIsCheckingSafety(false)
      
      Animated.parallel([
        Animated.spring(checkScale, { toValue: 1, useNativeDriver: true }),
        Animated.timing(checkOpacity, { toValue: 1, duration: 400, useNativeDriver: true })
      ]).start()
    }, 2000)
  }, [])

  const handleFinalSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    Alert.alert(
      "Report Finalized",
      "The clinical report has been signed and synced to ABHA and SwasthAI databases.",
      [{ text: "Done", onPress: () => {
        resetSession()
        router.replace('/(doctor)/home')
      }}]
    )
  }

  const renderSoapSection = (title, content, confidence) => (
    <View style={styles.soapCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <View style={styles.confBadge}>
          <Text style={styles.confText}>AI Confidence: {(confidence * 100).toFixed(0)}%</Text>
        </View>
      </View>
      <Text style={styles.cardBody}>{content}</Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={t.text.primary} />
        </Pressable>
        <Text style={styles.title}>Review & Finalize</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Safety Check Area */}
        <View style={[styles.safetyBox, safetyVerified && { borderColor: t.brand.teal }]}>
          <View style={styles.safetyHeader}>
            {isCheckingSafety ? (
               <ActivityIndicator color={t.brand.indigo} size="small" />
            ) : (
               <Ionicons name="shield-checkmark" size={20} color={safetyAlerts.length > 0 ? t.semantic.error : t.brand.teal} />
            )}
            <Text style={styles.safetyTitle}>DRUG-DRUG INTERACTION CHECK</Text>
          </View>
          
          {isCheckingSafety ? (
            <Text style={styles.safetyStatus}>Cross-referencing prescription with patient profile...</Text>
          ) : (
            <View>
               {safetyAlerts.map((alert, i) => (
                 <View key={i} style={styles.alertBox}>
                   <Ionicons name="warning" size={18} color={t.semantic.error} />
                   <Text style={styles.alertText}>{alert.message}</Text>
                 </View>
               ))}
               {!safetyAlerts.length && (
                 <Text style={styles.safeText}>No critical interactions or allergies detected.</Text>
               )}
            </View>
          )}
        </View>

        <Text style={styles.sectionLabel}>AUTO-GENERATED SOAP REPORT</Text>
        
        {renderSoapSection('Subjective', soapNote.subjective, soapAiConfidence.subjective)}
        {renderSoapSection('Objective', soapNote.objective, soapAiConfidence.objective)}
        {renderSoapSection('Assessment', soapNote.assessment, soapAiConfidence.assessment)}
        {renderSoapSection('Plan', soapNote.plan, soapAiConfidence.plan)}

        <View style={styles.appointmentBox}>
           <Text style={styles.sectionLabel}>NEXT APPOINTMENT</Text>
           <Pressable style={styles.datePicker}>
             <Ionicons name="calendar-outline" size={20} color={t.brand.indigo} />
             <Text style={styles.dateText}>Thursday, 22 May 2026</Text>
             <Ionicons name="chevron-forward" size={16} color={t.text.muted} />
           </Pressable>
        </View>

        <View style={styles.footer}>
          <Pressable onPress={handleFinalSave} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Sign & Sync Report</Text>
            <Ionicons name="cloud-upload" size={20} color="#FFF" />
          </Pressable>
          <Text style={styles.disclaimer}>By signing, you take full clinical responsibility for this AI-assisted record.</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 60 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { ...t.typography.h3, color: t.text.primary },
  scrollContent: { padding: 20 },
  safetyBox: { 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 16, 
    borderWidth: 1, 
    borderColor: t.border.subtle,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  safetyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  safetyTitle: { ...t.typography.caption, color: t.text.muted, letterSpacing: 1.5, fontWeight: '700' },
  safetyStatus: { ...t.typography.body, color: t.text.secondary, fontStyle: 'italic' },
  alertBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: t.semantic.errorDim, padding: 12, borderRadius: 12 },
  alertText: { ...t.typography.bodyMed, color: t.semantic.error, flex: 1, fontSize: 13 },
  safeText: { ...t.typography.bodyMed, color: t.brand.teal },
  sectionLabel: { ...t.typography.caption, color: t.text.muted, letterSpacing: 1.5, marginBottom: 12, paddingLeft: 4 },
  soapCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: t.border.subtle, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { ...t.typography.h3, color: t.text.primary, fontSize: 16 },
  confBadge: { backgroundColor: t.bg.tertiary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  confText: { ...t.typography.caption, color: t.text.muted, fontSize: 9 },
  cardBody: { ...t.typography.body, color: t.text.secondary, lineHeight: 22 },
  appointmentBox: { marginTop: 16, marginBottom: 40 },
  datePicker: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    padding: 16, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: t.border.subtle,
    gap: 12
  },
  dateText: { ...t.typography.bodyMed, color: t.text.primary, flex: 1 },
  footer: { alignItems: 'center', gap: 16, marginBottom: 40 },
  saveBtn: { 
    backgroundColor: t.brand.indigo, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 20, 
    borderRadius: 20, 
    width: '100%',
    gap: 12,
    shadowColor: t.brand.indigo,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8
  },
  saveBtnText: { ...t.typography.bodySemi, color: '#FFF', fontSize: 18 },
  disclaimer: { ...t.typography.caption, color: t.text.muted, textAlign: 'center', paddingHorizontal: 20 },
})
