import { useState, useCallback } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { doctorTheme as t } from '../../../constants/doctorTheme'
import { useRadiologyStore } from '../../../store/radiologyStore'
import { useConsultationStore } from '../../../store/consultationStore'
import { aiService } from '../../../services/aiService'
import { AIStatusIndicator } from '../../../components/consultation/AIStatusIndicator'
import { RadiologyUploader } from '../../../components/consultation/RadiologyUploader'
import { RadiologyResults } from '../../../components/consultation/RadiologyResults'
import { SHAPExplainability } from '../../../components/consultation/SHAPExplainability'

export default function RadiologyScreen() {
  const [activeView, setActiveView] = useState('upload') // upload | results | shap
  const [uploadError, setUploadError] = useState(null)
  const patient = useConsultationStore((s) => s.patient)
  const consultationId = useConsultationStore((s) => s.sessionId)

  const uploads = useRadiologyStore((s) => s.uploads)
  const removeUpload = useRadiologyStore((s) => s.removeUpload)
  const results = useRadiologyStore((s) => s.analysisResults)
  const setResults = useRadiologyStore((s) => s.setAnalysisResults)
  const isAnalyzing = useRadiologyStore((s) => s.isAnalyzing)
  const setAnalyzing = useRadiologyStore((s) => s.setAnalyzing)
  const shap = useRadiologyStore((s) => s.shapExplanation)
  const setSHAP = useRadiologyStore((s) => s.setSHAPExplanation)

  const handlePickImage = useCallback((scanType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setUploadError(`Real ${scanType.toUpperCase()} upload requires a signed file upload result. Unsigned local scans are disabled.`)
  }, [])

  const handleAnalyze = useCallback(async () => {
    setAnalyzing(true, 0)
    try {
      const upload = uploads.find((item) => item.fileId)
      if (!upload) {
        throw new Error('No registered fileId found for radiology analysis')
      }
      const res = await aiService.analyzeImage({
        fileId: upload.fileId,
        patientProfileId: patient?.id ?? patient?.patientProfileId,
        consultationId,
        scanType: upload.scanType,
        bodyRegion: upload.bodyRegion,
      })
      setResults(res)
      setSHAP(null)
      setActiveView('results')
    } catch (e) {
      setUploadError(e.message)
      setAnalyzing(false, 0)
    }
  }, [consultationId, patient?.id, patient?.patientProfileId, setAnalyzing, setResults, setSHAP, uploads])

  const VIEWS = [
    { id: 'upload', label: 'Upload', icon: 'cloud-upload-outline' },
    { id: 'results', label: 'Results', icon: 'analytics-outline' },
    { id: 'shap', label: 'SHAP', icon: 'eye-outline' },
  ]

  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: t.space.base, paddingVertical: t.space.sm, gap: t.space.sm, borderBottomWidth: 1, borderBottomColor: t.border.subtle }}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back() }}
          style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: t.bg.tertiary, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="arrow-back" size={18} color={t.text.primary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ ...t.typography.bodySemi, color: t.text.primary }}>Radiology AI Analysis</Text>
          <Text style={{ ...t.typography.caption, color: t.text.muted }}>{patient?.name || 'Patient'}</Text>
        </View>
        <AIStatusIndicator status={isAnalyzing ? 'processing' : results ? 'idle' : 'idle'} />
      </View>

      {/* View tabs */}
      <View style={{ flexDirection: 'row', paddingHorizontal: t.space.base, paddingVertical: t.space.sm, gap: 6 }}>
        {VIEWS.map((v) => (
          <Pressable
            key={v.id}
            onPress={() => { Haptics.selectionAsync(); setActiveView(v.id) }}
            style={{
              flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
              paddingVertical: 8, borderRadius: 12,
              backgroundColor: activeView === v.id ? t.brand.teal + '15' : t.bg.tertiary,
              borderWidth: 1, borderColor: activeView === v.id ? t.brand.teal + '40' : 'transparent',
            }}
          >
            <Ionicons name={v.icon} size={14} color={activeView === v.id ? t.brand.teal : t.text.muted} />
            <Text style={{ ...t.typography.bodyMed, fontSize: 11, color: activeView === v.id ? t.brand.teal : t.text.secondary }}>{v.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {activeView === 'upload' ? (
          <ScrollView contentContainerStyle={{ padding: t.space.base }} showsVerticalScrollIndicator={false}>
            <RadiologyUploader
              uploads={uploads}
              onPickImage={handlePickImage}
              onRemoveUpload={removeUpload}
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
              error={uploadError}
            />
          </ScrollView>
        ) : activeView === 'results' ? (
          <RadiologyResults results={results} />
        ) : (
          <SHAPExplainability explanation={shap} />
        )}
      </View>

      {/* Proceed button */}
      {results && (
        <View style={{ paddingHorizontal: t.space.base, paddingBottom: t.space.lg, paddingTop: t.space.sm, borderTopWidth: 1, borderTopColor: t.border.subtle }}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/(doctor)/consultation/drug-safety') }}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
              backgroundColor: t.brand.teal, borderRadius: t.radius.btn, paddingVertical: 14,
              shadowColor: t.shadow.floating, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 8,
            }}
          >
            <Text style={{ ...t.typography.h3, color: '#FFFFFF' }}>Proceed to Drug Safety</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      )}
    </View>
  )
}
