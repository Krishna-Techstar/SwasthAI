import { useState, useRef, useCallback } from 'react'
import { View, Text, Pressable, Dimensions } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { doctorTheme as t } from '../../../constants/doctorTheme'
import { useConsultationStore } from '../../../store/consultationStore'
import { aiService } from '../../../services/aiService'
import { AIStatusIndicator } from '../../../components/consultation/AIStatusIndicator'
import { PatientTimeline } from '../../../components/consultation/PatientTimeline'
import { LiveNotesEditor } from '../../../components/consultation/LiveNotesEditor'
import { VoiceControlBar } from '../../../components/consultation/VoiceControlBar'
import { TranscriptionFeed } from '../../../components/consultation/TranscriptionFeed'
import { BodyMapView } from '../../../components/consultation/BodyMapView'
import { SOAPPanel } from '../../../components/consultation/SOAPPanel'
import { ClinicalSuggestions } from '../../../components/consultation/ClinicalSuggestions'

const TABS = [
  { id: 'timeline', label: 'Timeline', icon: 'time-outline' },
  { id: 'notes', label: 'Notes', icon: 'create-outline' },
  { id: 'transcript', label: 'Transcript', icon: 'mic-outline' },
  { id: 'soap', label: 'SOAP', icon: 'clipboard-outline' },
  { id: 'ai', label: 'AI Insights', icon: 'sparkles-outline' },
]

export default function ActiveConsultationScreen() {
  const [activeTab, setActiveTab] = useState('notes')
  const [bodyMapVisible, setBodyMapVisible] = useState(false)
  const transcriptionRef = useRef(null)

  const patient = useConsultationStore((s) => s.patient)
  const isListening = useConsultationStore((s) => s.isListening)
  const setListening = useConsultationStore((s) => s.setListening)
  const transcript = useConsultationStore((s) => s.transcript)
  const appendEntry = useConsultationStore((s) => s.appendTranscriptEntry)
  const soapNote = useConsultationStore((s) => s.soapNote)
  const soapConfidence = useConsultationStore((s) => s.soapAiConfidence)
  const soapGenerated = useConsultationStore((s) => s.soapGenerated)
  const updateSOAP = useConsultationStore((s) => s.updateSOAP)
  const setSOAP = useConsultationStore((s) => s.setSOAP)
  const setIcdCodes = useConsultationStore((s) => s.setIcdCodes)
  const suggestions = useConsultationStore((s) => s.clinicalSuggestions)
  const suggestionsLoading = useConsultationStore((s) => s.suggestionsLoading)
  const setSuggestions = useConsultationStore((s) => s.setClinicalSuggestions)
  const setSuggestionsLoading = useConsultationStore((s) => s.setSuggestionsLoading)
  const isGenerating = useConsultationStore((s) => s.isGenerating)
  const setGenerating = useConsultationStore((s) => s.setGenerating)

  const toggleListening = useCallback(() => {
    if (isListening) {
      transcriptionRef.current?.stop()
      transcriptionRef.current = null
      setListening(false)
    } else {
      setListening(true)
      transcriptionRef.current = aiService.startTranscription('session', (chunk) => {
        appendEntry({ speaker: chunk.speaker, text: chunk.text, entities: chunk.entities })
      })
    }
  }, [isListening, setListening, appendEntry])

  const handleGenerateSOAP = useCallback(async () => {
    setGenerating(true, 'Generating SOAP...')
    try {
      const result = await aiService.generateSOAP({ transcript, notes: '' })
      setSOAP(result.soap, result.confidence)
      setIcdCodes(result.icdCodes)
      // Also fetch suggestions
      setSuggestionsLoading(true)
      const sug = await aiService.getClinicalSuggestions({ transcript })
      setSuggestions(sug)
    } catch (e) {
      // handle error
    } finally {
      setGenerating(false)
    }
  }, [transcript, setGenerating, setSOAP, setIcdCodes, setSuggestionsLoading, setSuggestions])

  const handleProceed = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    if (transcriptionRef.current) { transcriptionRef.current.stop() }
    setListening(false)
    router.push('/(doctor)/consultation/drug-safety')
  }

  const aiStatus = isGenerating ? 'generating' : isListening ? 'listening' : 'idle'

  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: t.space.base, paddingVertical: t.space.sm, gap: t.space.sm, borderBottomWidth: 1, borderBottomColor: t.border.subtle }}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back() }}
          style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: t.bg.tertiary, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="arrow-back" size={18} color={t.text.primary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ ...t.typography.bodySemi, color: t.text.primary }} numberOfLines={1}>{patient?.name || 'Patient'}</Text>
          <Text style={{ ...t.typography.caption, color: t.text.muted }}>{patient?.age}yrs · {patient?.gender}</Text>
        </View>
        <AIStatusIndicator status={aiStatus} />
        <Pressable onPress={handleProceed}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: t.brand.teal, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 }}>
          <Text style={{ ...t.typography.bodyMed, fontSize: 11, color: '#FFFFFF' }}>Next</Text>
          <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Tab bar */}
      <View style={{ flexDirection: 'row', paddingHorizontal: t.space.sm, paddingVertical: t.space.xs, backgroundColor: t.bg.primary, borderBottomWidth: 1, borderBottomColor: t.border.subtle }}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.id}
            onPress={() => { Haptics.selectionAsync(); setActiveTab(tab.id) }}
            style={{
              flex: 1, alignItems: 'center', paddingVertical: 8, gap: 2,
              borderBottomWidth: 2, borderBottomColor: activeTab === tab.id ? t.brand.teal : 'transparent',
            }}
          >
            <Ionicons name={tab.icon} size={16} color={activeTab === tab.id ? t.brand.teal : t.text.muted} />
            <Text style={{ ...t.typography.caption, fontSize: 9, color: activeTab === tab.id ? t.brand.teal : t.text.muted }}>{tab.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Content area */}
      <View style={{ flex: 1 }}>
        {bodyMapVisible ? (
          <BodyMapView />
        ) : activeTab === 'timeline' ? (
          <PatientTimeline patient={patient} />
        ) : activeTab === 'notes' ? (
          <LiveNotesEditor />
        ) : activeTab === 'transcript' ? (
          <TranscriptionFeed transcript={transcript} />
        ) : activeTab === 'soap' ? (
          <SOAPPanel
            soapNote={soapNote}
            soapConfidence={soapConfidence}
            soapGenerated={soapGenerated}
            onUpdate={updateSOAP}
            onGenerate={handleGenerateSOAP}
            isGenerating={isGenerating}
          />
        ) : activeTab === 'ai' ? (
          <ClinicalSuggestions suggestions={suggestions} loading={suggestionsLoading} />
        ) : null}
      </View>

      {/* Voice control bar */}
      <VoiceControlBar
        onToggleListening={toggleListening}
        onToggleBodyMap={() => setBodyMapVisible(!bodyMapVisible)}
        bodyMapVisible={bodyMapVisible}
      />
    </View>
  )
}
