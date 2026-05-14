import { useState, useRef, useEffect, useCallback } from 'react'
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { doctorTheme as t } from '../../constants/doctorTheme'
import { QUICK_TAGS } from '../../constants/medicalConstants'
import { useConsultationStore } from '../../store/consultationStore'

export function LiveNotesEditor() {
  const notes = useConsultationStore((s) => s.doctorNotes)
  const setNotes = useConsultationStore((s) => s.setDoctorNotes)
  const addTag = useConsultationStore((s) => s.addQuickTag)
  const removeTag = useConsultationStore((s) => s.removeQuickTag)
  const tags = useConsultationStore((s) => s.quickTags)
  const autoSaveStatus = useConsultationStore((s) => s.autoSaveStatus)
  const setAutoSaveStatus = useConsultationStore((s) => s.setAutoSaveStatus)
  const saveTimerRef = useRef(null)

  const handleTextChange = useCallback((text) => {
    setNotes(text)
    // Auto-save debounce
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      setAutoSaveStatus('saved')
    }, 1500)
  }, [setNotes, setAutoSaveStatus])

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: t.space.base, paddingVertical: t.space.sm }}>
        <Text style={{ ...t.typography.h3, color: t.text.primary }}>Clinical Notes</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: autoSaveStatus === 'saved' ? t.semantic.success : autoSaveStatus === 'saving' ? t.semantic.warning : t.semantic.error }} />
          <Text style={{ ...t.typography.caption, color: t.text.muted }}>
            {autoSaveStatus === 'saved' ? 'Saved' : autoSaveStatus === 'saving' ? 'Saving...' : 'Error'}
          </Text>
        </View>
      </View>

      {/* Quick tags */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 40, paddingHorizontal: t.space.base }} contentContainerStyle={{ gap: 6, alignItems: 'center' }}>
        {QUICK_TAGS.map((tag) => {
          const isActive = tags.some((t2) => t2.id === tag.id)
          return (
            <Pressable
              key={tag.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                isActive ? removeTag(tag.id) : addTag(tag)
              }}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 4,
                backgroundColor: isActive ? tag.color + '20' : t.bg.tertiary,
                paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14,
                borderWidth: 1, borderColor: isActive ? tag.color + '40' : 'transparent',
              }}
            >
              <Text style={{ fontSize: 11 }}>{tag.label}</Text>
            </Pressable>
          )
        })}
      </ScrollView>

      {/* Active tags display */}
      {tags.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, paddingHorizontal: t.space.base, paddingTop: t.space.sm }}>
          {tags.map((tag) => (
            <View key={tag.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: tag.color + '18', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}>
              <Text style={{ ...t.typography.caption, color: tag.color }}>{tag.label}</Text>
              <Pressable onPress={() => removeTag(tag.id)}>
                <Ionicons name="close" size={12} color={tag.color} />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {/* Notes area */}
      <TextInput
        value={notes}
        onChangeText={handleTextChange}
        placeholder="Start typing clinical observations, symptoms, findings...&#10;&#10;AI will intelligently parse and merge with voice transcription."
        placeholderTextColor={t.text.muted}
        multiline
        textAlignVertical="top"
        style={{
          flex: 1,
          fontFamily: t.typography.body.fontFamily,
          fontSize: 14,
          color: t.text.primary,
          lineHeight: 22,
          paddingHorizontal: t.space.base,
          paddingTop: t.space.md,
          paddingBottom: t.space.xl,
        }}
      />
    </View>
  )
}
