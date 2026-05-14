// apps/mobile/app/(nurse)/home.jsx
// Nurse Dashboard — ward overview + shift management
import { useMemo, useRef, useEffect, useState } from 'react'
import {
  View, Text, Pressable, ScrollView, Animated, Easing,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useAuthStore } from '../../store/authStore'
import { doctorTheme as t } from '../../constants/doctorTheme'

const SHIFT_INFO = { type: 'Day Shift', time: '7:00 AM — 3:00 PM', ward: 'General Ward A' }

const MOCK_PATIENTS = [
  { id: '1', name: 'Priya Sharma',  bed: 'A-12', status: 'stable',   vitals: 'Due in 30m', color: t.semantic.success },
  { id: '2', name: 'Mohan Kumar',   bed: 'A-08', status: 'critical', vitals: 'Overdue',     color: t.semantic.error },
  { id: '3', name: 'Aarti Joshi',   bed: 'A-15', status: 'stable',   vitals: 'Done',        color: t.semantic.success },
  { id: '4', name: 'Rajesh Patel',  bed: 'A-03', status: 'monitor',  vitals: 'Due in 1h',   color: t.semantic.warning },
]

const MOCK_TASKS = [
  { id: '1', task: 'Administer Insulin — Bed A-08', time: '10:30 AM', priority: 'high',   done: false },
  { id: '2', task: 'BP Check — All Ward A patients', time: '11:00 AM', priority: 'medium', done: false },
  { id: '3', task: 'Dressing change — Bed A-12',     time: '9:00 AM',  priority: 'low',    done: true },
]

const MOCK_ALERTS = [
  { id: '1', text: 'Mohan Kumar — SpO2 dropped to 91%', time: '2m ago', level: 'critical' },
  { id: '2', text: 'Rajesh Patel — IV fluid running low', time: '15m ago', level: 'warning' },
]

const STATUS_COLORS = { stable: t.semantic.success, critical: t.semantic.error, monitor: t.semantic.warning }
const PRIORITY_COLORS = { high: t.semantic.error, medium: t.semantic.warning, low: t.text.muted }

export default function NurseHome() {
  const user = useAuthStore((s) => s.user)
  const displayName = user?.name ?? 'Nurse'
  const now = useMemo(() => new Date(), [])
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  const fadeAnim = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start()
  }, [fadeAnim])

  return (
    <Animated.View style={{ flex: 1, backgroundColor: t.bg.primary, opacity: fadeAnim }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 52, paddingBottom: 12 }}>
          <Text style={{ ...t.typography.caption, color: t.text.muted, letterSpacing: 0.8 }}>
            {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
          </Text>
          <Text style={{ ...t.typography.h1, color: t.text.primary, fontSize: 24, marginTop: 4 }}>
            {greeting},
          </Text>
          <Text style={{ ...t.typography.display, color: t.brand.teal }}>
            {displayName}
          </Text>
        </View>

        {/* Shift Card */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <View style={{
            backgroundColor: t.brand.tealDim,
            borderWidth: 1, borderColor: t.brand.teal + '40',
            borderRadius: t.radius.card,
            paddingVertical: 16, paddingHorizontal: 18,
            flexDirection: 'row', alignItems: 'center', gap: 14,
          }}>
            <View style={{
              width: 48, height: 48, borderRadius: 14,
              backgroundColor: t.brand.teal + '30',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Ionicons name="time-outline" size={24} color={t.brand.teal} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ ...t.typography.bodySemi, color: t.brand.teal, fontSize: 14 }}>
                {SHIFT_INFO.type}
              </Text>
              <Text style={{ ...t.typography.caption, color: t.text.secondary, marginTop: 2 }}>
                {SHIFT_INFO.time} · {SHIFT_INFO.ward}
              </Text>
            </View>
            <View style={{
              backgroundColor: t.semantic.successDim,
              paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
            }}>
              <Text style={{ ...t.typography.caption, color: t.semantic.success, fontFamily: t.typography.bodySemi.fontFamily }}>Active</Text>
            </View>
          </View>
        </View>

        {/* Emergency Alerts */}
        {MOCK_ALERTS.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <Text style={{ ...t.typography.h3, color: t.text.primary, marginBottom: 10 }}>Emergency Alerts</Text>
            {MOCK_ALERTS.map((alert) => (
              <Pressable key={alert.id} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
                <View style={{
                  backgroundColor: alert.level === 'critical' ? t.semantic.errorDim : t.semantic.warningDim,
                  borderWidth: 1,
                  borderColor: alert.level === 'critical' ? t.semantic.error + '40' : t.semantic.warning + '40',
                  borderRadius: t.radius.card - 4,
                  paddingVertical: 12, paddingHorizontal: 14,
                  marginBottom: 8,
                  flexDirection: 'row', alignItems: 'center', gap: 10,
                }}>
                  <Ionicons
                    name={alert.level === 'critical' ? 'alert-circle' : 'warning-outline'}
                    size={20}
                    color={alert.level === 'critical' ? t.semantic.error : t.semantic.warning}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...t.typography.bodyMed, color: t.text.primary, fontSize: 13 }}>{alert.text}</Text>
                    <Text style={{ ...t.typography.caption, color: t.text.muted, marginTop: 2 }}>{alert.time}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Assigned Patients */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ ...t.typography.h3, color: t.text.primary }}>Assigned Patients</Text>
            <View style={{ backgroundColor: t.brand.tealDim, paddingHorizontal: 10, paddingVertical: 4, borderRadius: t.radius.chip }}>
              <Text style={{ ...t.typography.bodySemi, fontSize: 12, color: t.brand.teal }}>{MOCK_PATIENTS.length} patients</Text>
            </View>
          </View>
          {MOCK_PATIENTS.map((pt) => (
            <View key={pt.id} style={{
              backgroundColor: t.bg.secondary, borderWidth: 1, borderColor: t.border.subtle,
              borderRadius: t.radius.card, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 8,
              flexDirection: 'row', alignItems: 'center', gap: 12,
              shadowColor: t.shadow.card, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2,
            }}>
              {/* Bed badge */}
              <View style={{
                width: 44, height: 44, borderRadius: 14,
                backgroundColor: pt.color + '18',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ ...t.typography.bodySemi, color: pt.color, fontSize: 12 }}>{pt.bed}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ ...t.typography.bodySemi, color: t.text.primary, fontSize: 14 }}>{pt.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: STATUS_COLORS[pt.status] ?? t.text.muted }} />
                  <Text style={{ ...t.typography.caption, color: t.text.secondary, textTransform: 'capitalize' }}>{pt.status}</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{
                  ...t.typography.caption,
                  color: pt.vitals === 'Overdue' ? t.semantic.error : pt.vitals === 'Done' ? t.semantic.success : t.text.muted,
                  fontFamily: t.typography.bodySemi.fontFamily,
                }}>
                  {pt.vitals}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Tasks */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text style={{ ...t.typography.h3, color: t.text.primary, marginBottom: 10 }}>Today's Tasks</Text>
          {MOCK_TASKS.map((task) => (
            <View key={task.id} style={{
              backgroundColor: t.bg.secondary, borderWidth: 1, borderColor: t.border.subtle,
              borderRadius: t.radius.card - 4, paddingVertical: 12, paddingHorizontal: 14, marginBottom: 8,
              flexDirection: 'row', alignItems: 'center', gap: 12,
              opacity: task.done ? 0.5 : 1,
            }}>
              {/* Checkbox */}
              <View style={{
                width: 22, height: 22, borderRadius: 6,
                backgroundColor: task.done ? t.brand.teal : t.bg.tertiary,
                borderWidth: task.done ? 0 : 1.5, borderColor: t.border.subtle,
                alignItems: 'center', justifyContent: 'center',
              }}>
                {task.done && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  ...t.typography.bodyMed, color: t.text.primary, fontSize: 13,
                  textDecorationLine: task.done ? 'line-through' : 'none',
                }}>{task.task}</Text>
                <Text style={{ ...t.typography.caption, color: t.text.muted, marginTop: 2 }}>{task.time}</Text>
              </View>
              {/* Priority dot */}
              {!task.done && (
                <View style={{
                  width: 8, height: 8, borderRadius: 4,
                  backgroundColor: PRIORITY_COLORS[task.priority] ?? t.text.muted,
                }} />
              )}
            </View>
          ))}
        </View>

        {/* Ward Summary */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ ...t.typography.h3, color: t.text.primary, marginBottom: 10 }}>Ward Status</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[
              { label: 'Total Beds', value: '20', icon: 'bed-outline', color: t.brand.teal },
              { label: 'Occupied', value: '16', icon: 'people-outline', color: t.brand.indigo },
              { label: 'Critical', value: '1', icon: 'alert-circle-outline', color: t.semantic.error },
            ].map((stat) => (
              <View key={stat.label} style={{
                flex: 1,
                backgroundColor: t.bg.secondary, borderWidth: 1, borderColor: t.border.subtle,
                borderRadius: t.radius.card, padding: 14, alignItems: 'center',
                shadowColor: t.shadow.card, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2,
              }}>
                <Ionicons name={stat.icon} size={20} color={stat.color} />
                <Text style={{ ...t.typography.chipValue, color: t.text.primary, fontSize: 22, marginTop: 6 }}>{stat.value}</Text>
                <Text style={{ ...t.typography.caption, color: t.text.muted, marginTop: 2, textAlign: 'center' }}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  )
}
