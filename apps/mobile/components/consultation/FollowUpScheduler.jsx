import { useState } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { doctorTheme as t } from '../../constants/doctorTheme'
import { FOLLOWUP_URGENCY, REMINDER_TYPES } from '../../constants/medicalConstants'

export function FollowUpScheduler({ suggestions, onSchedule }) {
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedUrgency, setSelectedUrgency] = useState('routine')
  const [selectedReminders, setSelectedReminders] = useState(['push'])

  const toggleReminder = (id) => {
    setSelectedReminders((prev) => prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id])
  }

  return (
    <ScrollView contentContainerStyle={{ padding: t.space.base, gap: t.space.lg }} showsVerticalScrollIndicator={false}>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: t.brand.teal + '15', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="calendar-outline" size={28} color={t.brand.teal} />
        </View>
        <Text style={{ ...t.typography.h1, color: t.text.primary }}>Schedule Follow-up</Text>
      </View>

      {/* AI suggestions */}
      {suggestions?.length > 0 && (
        <View>
          <Text style={{ ...t.typography.bodySemi, color: t.text.primary, marginBottom: t.space.sm }}>AI Suggested Dates</Text>
          {suggestions.map((s, i) => (
            <Pressable
              key={i}
              onPress={() => { Haptics.selectionAsync(); setSelectedDate(s.date); setSelectedUrgency(s.urgency) }}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 10,
                backgroundColor: selectedDate === s.date ? t.brand.teal + '12' : t.bg.secondary,
                borderRadius: 16, padding: t.space.base, marginBottom: t.space.sm,
                borderWidth: 1.5, borderColor: selectedDate === s.date ? t.brand.teal + '40' : t.border.subtle,
              }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: t.bg.tertiary, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="calendar" size={20} color={t.brand.teal} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ ...t.typography.bodyMed, color: t.text.primary }}>{s.date}</Text>
                <Text style={{ ...t.typography.caption, color: t.text.secondary }}>{s.reason}</Text>
              </View>
              <View style={{ backgroundColor: (FOLLOWUP_URGENCY.find((u) => u.id === s.urgency)?.color || t.text.muted) + '18', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                <Text style={{ ...t.typography.bodySemi, fontSize: 10, color: FOLLOWUP_URGENCY.find((u) => u.id === s.urgency)?.color }}>{s.urgency}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {/* Urgency */}
      <View>
        <Text style={{ ...t.typography.bodySemi, color: t.text.primary, marginBottom: t.space.sm }}>Priority</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {FOLLOWUP_URGENCY.map((u) => (
            <Pressable
              key={u.id}
              onPress={() => { Haptics.selectionAsync(); setSelectedUrgency(u.id) }}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 4,
                paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14,
                backgroundColor: selectedUrgency === u.id ? u.color + '18' : t.bg.tertiary,
                borderWidth: 1, borderColor: selectedUrgency === u.id ? u.color + '40' : 'transparent',
              }}
            >
              <Ionicons name={u.icon} size={14} color={selectedUrgency === u.id ? u.color : t.text.muted} />
              <Text style={{ ...t.typography.bodyMed, fontSize: 12, color: selectedUrgency === u.id ? u.color : t.text.secondary }}>{u.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Reminder type */}
      <View>
        <Text style={{ ...t.typography.bodySemi, color: t.text.primary, marginBottom: t.space.sm }}>Reminders</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {REMINDER_TYPES.map((rm) => {
            const active = selectedReminders.includes(rm.id)
            return (
              <Pressable
                key={rm.id}
                onPress={() => { Haptics.selectionAsync(); toggleReminder(rm.id) }}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 6,
                  paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14,
                  backgroundColor: active ? t.brand.teal + '12' : t.bg.tertiary,
                  borderWidth: 1, borderColor: active ? t.brand.teal + '40' : t.border.subtle,
                }}
              >
                <Ionicons name={rm.icon} size={16} color={active ? t.brand.teal : t.text.muted} />
                <Text style={{ ...t.typography.bodyMed, fontSize: 12, color: active ? t.brand.teal : t.text.secondary }}>{rm.label}</Text>
              </Pressable>
            )
          })}
        </View>
      </View>

      {/* Schedule button */}
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          onSchedule?.({ date: selectedDate, urgency: selectedUrgency, reminders: selectedReminders })
        }}
        disabled={!selectedDate}
        style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
          backgroundColor: selectedDate ? t.brand.teal : t.border.subtle,
          borderRadius: t.radius.btn, paddingVertical: 16,
          shadowColor: selectedDate ? t.shadow.floating : 'transparent',
          shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 8,
        }}
      >
        <Ionicons name="checkmark-circle" size={20} color={selectedDate ? '#FFFFFF' : t.text.muted} />
        <Text style={{ ...t.typography.h3, color: selectedDate ? '#FFFFFF' : t.text.muted }}>Schedule Appointment</Text>
      </Pressable>
      <View style={{ height: 40 }} />
    </ScrollView>
  )
}
