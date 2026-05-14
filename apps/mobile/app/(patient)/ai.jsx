// Patient — AI Assistant stub
import { useState } from 'react'
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { doctorTheme as t } from '../../constants/doctorTheme'

const SUGGESTIONS = ['I have a headache', 'Chest pain when breathing', 'Feeling dizzy lately', 'Skin rash on arms']

export default function PatientAI() {
  const [query, setQuery] = useState('')

  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, paddingTop: 52 }}>
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <View style={{
              width: 64, height: 64, borderRadius: 20,
              backgroundColor: t.brand.tealDim,
              alignItems: 'center', justifyContent: 'center', marginBottom: 16,
            }}>
              <Ionicons name="sparkles" size={32} color={t.brand.teal} />
            </View>
            <Text style={{ ...t.typography.h1, color: t.text.primary, textAlign: 'center' }}>AI Health Assistant</Text>
            <Text style={{ ...t.typography.body, color: t.text.secondary, textAlign: 'center', marginTop: 6 }}>
              Describe your symptoms and get AI-powered health insights
            </Text>
          </View>

          {/* Suggestion chips */}
          <Text style={{ ...t.typography.bodyMed, color: t.text.secondary, marginBottom: 10 }}>Try asking about:</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {SUGGESTIONS.map((s) => (
              <Pressable key={s} onPress={() => { setQuery(s); Haptics.selectionAsync() }}>
                <View style={{
                  paddingHorizontal: 14, paddingVertical: 8, borderRadius: t.radius.chip,
                  backgroundColor: t.bg.secondary, borderWidth: 1, borderColor: t.border.subtle,
                }}>
                  <Text style={{ ...t.typography.bodyMed, color: t.text.secondary, fontSize: 12 }}>{s}</Text>
                </View>
              </Pressable>
            ))}
          </View>

          {/* Disclaimer */}
          <View style={{
            backgroundColor: t.semantic.warningDim, borderRadius: 12,
            paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', gap: 8, alignItems: 'center',
          }}>
            <Ionicons name="information-circle" size={18} color={t.semantic.warning} />
            <Text style={{ ...t.typography.caption, color: t.text.secondary, flex: 1 }}>
              AI suggestions are not a substitute for professional medical advice. Consult a doctor for diagnosis.
            </Text>
          </View>

          <View style={{ flex: 1 }} />
        </ScrollView>

        {/* Input */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, borderTopColor: t.border.subtle, backgroundColor: t.bg.secondary }}>
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 10,
            backgroundColor: t.bg.tertiary, borderWidth: 1, borderColor: t.border.subtle,
            borderRadius: t.radius.input, paddingHorizontal: 14,
          }}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Describe your symptoms..."
              placeholderTextColor={t.text.muted}
              style={{ flex: 1, height: 44, fontFamily: t.typography.body.fontFamily, fontSize: 14, color: t.text.primary }}
            />
            <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} disabled={!query.trim()}>
              <View style={{
                width: 34, height: 34, borderRadius: 10,
                backgroundColor: query.trim() ? t.brand.teal : t.bg.tertiary,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Ionicons name="arrow-up" size={18} color={query.trim() ? '#FFFFFF' : t.text.muted} />
              </View>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}
