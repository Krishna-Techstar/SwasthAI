import { useState, useEffect, useCallback } from 'react'
import { View, Text, Pressable } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { doctorTheme as t } from '../../../constants/doctorTheme'
import { useConsultationStore } from '../../../store/consultationStore'
import { useDrugSafetyStore } from '../../../store/drugSafetyStore'
import { reportService } from '../../../services/reportService'
import { ReportBuilder } from '../../../components/consultation/ReportBuilder'

export default function ReportScreen() {
  const patient = useConsultationStore((s) => s.patient)
  const soapNote = useConsultationStore((s) => s.soapNote)
  const bodyMarkers = useConsultationStore((s) => s.bodyMarkers)
  const doctorNotes = useConsultationStore((s) => s.doctorNotes)
  const suggestions = useConsultationStore((s) => s.clinicalSuggestions)
  const report = useConsultationStore((s) => s.report)
  const setReport = useConsultationStore((s) => s.setReport)
  const reportStatus = useConsultationStore((s) => s.reportStatus)
  const setReportStatus = useConsultationStore((s) => s.setReportStatus)
  const prescriptions = useDrugSafetyStore((s) => s.prescriptions)
  const alerts = useDrugSafetyStore((s) => s.alerts)

  useEffect(() => {
    if (!report) {
      generateReport()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const generateReport = useCallback(async () => {
    try {
      const rpt = await reportService.generateReport({
        patient,
        soapNote,
        prescriptions,
        bodyMarkers,
        doctorNotes,
        clinicalSuggestions: suggestions,
        drugAlerts: alerts,
      })
      setReport(rpt)
    } catch (e) {
      // handle error
    }
  }, [patient, soapNote, prescriptions, bodyMarkers, doctorNotes, suggestions, alerts, setReport])

  const handleSignOff = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    await reportService.signOff(report?.id, 'doc_001')
    setReportStatus('signed')
  }, [report, setReportStatus])

  const handleExportPDF = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    await reportService.exportPDF(report?.id)
  }, [report])

  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: t.space.base, paddingVertical: t.space.sm, gap: t.space.sm, borderBottomWidth: 1, borderBottomColor: t.border.subtle }}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back() }}
          style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: t.bg.tertiary, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="arrow-back" size={18} color={t.text.primary} />
        </Pressable>
        <Text style={{ ...t.typography.h2, color: t.text.primary, flex: 1 }}>Final Report</Text>
      </View>

      <ReportBuilder report={report} onSignOff={handleSignOff} onExportPDF={handleExportPDF} reportStatus={reportStatus} />

      {/* Schedule follow-up */}
      <View style={{ paddingHorizontal: t.space.base, paddingBottom: t.space.lg, paddingTop: t.space.sm, borderTopWidth: 1, borderTopColor: t.border.subtle }}>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/(doctor)/consultation/followup') }}
          style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            backgroundColor: t.brand.teal, borderRadius: t.radius.btn, paddingVertical: 14,
            shadowColor: t.shadow.floating, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 8,
          }}
        >
          <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
          <Text style={{ ...t.typography.h3, color: '#FFFFFF' }}>Schedule Follow-up</Text>
        </Pressable>
      </View>
    </View>
  )
}
