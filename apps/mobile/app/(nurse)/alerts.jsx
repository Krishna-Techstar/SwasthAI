// Nurse — Alerts
import { View, Text, ScrollView, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { doctorTheme as t } from '../../constants/doctorTheme'

const ALERTS = [
  { id: '1', text: 'Mohan Kumar — SpO2 dropped to 91%',    time: '2 min ago',  level: 'critical' },
  { id: '2', text: 'Rajesh Patel — IV fluid running low',   time: '15 min ago', level: 'warning' },
  { id: '3', text: 'Bed A-15 — Call button pressed',        time: '22 min ago', level: 'info' },
  { id: '4', text: 'Priya Sharma — Post-op vitals stable',  time: '40 min ago', level: 'success' },
  { id: '5', text: 'Sunita Devi — Fever spike 101.2F',      time: '1h ago',     level: 'warning' },
  { id: '6', text: 'Ward A — Shift handover reminder',      time: '2h ago',     level: 'info' },
]

const LEVEL_CONFIG = {
  critical: { icon: 'alert-circle',    color: t.semantic.error,   bg: t.semantic.errorDim },
  warning:  { icon: 'warning-outline', color: t.semantic.warning, bg: t.semantic.warningDim },
  info:     { icon: 'information-circle-outline', color: t.brand.teal, bg: t.brand.tealDim },
  success:  { icon: 'checkmark-circle-outline',   color: t.semantic.success, bg: t.semantic.successDim },
}

export default function NurseAlerts() {
  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 52 }}>
        <Text style={{ ...t.typography.h1, color: t.text.primary, marginBottom: 4 }}>Alerts</Text>
        <Text style={{ ...t.typography.body, color: t.text.secondary, marginBottom: 20 }}>Real-time ward notifications</Text>

        {ALERTS.map((alert) => {
          const cfg = LEVEL_CONFIG[alert.level] ?? LEVEL_CONFIG.info
          return (
            <Pressable key={alert.id} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <View style={{
                backgroundColor: cfg.bg, borderRadius: t.radius.card - 4,
                paddingVertical: 14, paddingHorizontal: 14, marginBottom: 8,
                flexDirection: 'row', alignItems: 'center', gap: 12,
                borderWidth: 1, borderColor: cfg.color + '30',
              }}>
                <Ionicons name={cfg.icon} size={22} color={cfg.color} />
                <View style={{ flex: 1 }}>
                  <Text style={{ ...t.typography.bodyMed, color: t.text.primary, fontSize: 13 }}>{alert.text}</Text>
                  <Text style={{ ...t.typography.caption, color: t.text.muted, marginTop: 3 }}>{alert.time}</Text>
                </View>
              </View>
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}
