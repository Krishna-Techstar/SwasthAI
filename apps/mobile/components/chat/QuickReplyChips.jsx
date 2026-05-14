// apps/mobile/components/chat/QuickReplyChips.jsx
import { View, Text, Pressable, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { doctorTheme as t } from '../../constants/doctorTheme'

const DEFAULT_SUGGESTIONS = [
  "Will review and respond shortly",
  "Can you share the report?",
  "Noted, I will follow up",
]

export function QuickReplyChips({ suggestions = DEFAULT_SUGGESTIONS, onSelect, onDismiss }) {
  if (!suggestions?.length) return null

  return (
    <View style={{ paddingBottom: 8 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: t.space.base, marginBottom: 6 }}>
        <Ionicons name="sparkles" size={12} color={t.brand.teal} />
        <Text style={{ ...t.typography.caption, color: t.brand.teal, marginLeft: 4, letterSpacing: 0.5 }}>
          AI Suggested
        </Text>
        <Pressable onPress={onDismiss} style={{ marginLeft: 'auto' }}>
          <Ionicons name="close-outline" size={16} color={t.text.muted} />
        </Pressable>
      </View>

      {/* Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: t.space.base, gap: 8 }}
      >
        {suggestions.map((text, i) => (
          <Pressable
            key={i}
            onPress={() => onSelect?.(text)}
            style={{
              backgroundColor: t.bg.secondary,
              borderWidth: 1,
              borderColor: t.border.subtle,
              borderRadius: t.radius.chip,
              paddingHorizontal: 14,
              paddingVertical: 8,
              shadowColor: t.shadow.card,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 1,
              shadowRadius: 3,
              elevation: 1,
            }}
          >
            <Text style={{ ...t.typography.bodyMed, color: t.text.secondary, fontSize: 12 }}>
              {text}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
}
