// Patient — Appointments stub
import { View, Text, Pressable, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { doctorTheme as t } from '../../constants/doctorTheme'

const APPOINTMENTS = [
  { id: '1', doctor: 'Dr. Anjali Mehta', spec: 'Cardiologist', date: 'Today', time: '10:30 AM', type: 'In-Clinic', color: t.brand.indigo },
  { id: '2', doctor: 'Dr. Priya Sharma', spec: 'Dermatologist', date: 'Tomorrow', time: '3:00 PM', type: 'Tele-Consult', color: t.semantic.success },
  { id: '3', doctor: 'Dr. Rajesh Gupta', spec: 'Orthopedics', date: 'May 20', time: '11:00 AM', type: 'In-Clinic', color: '#F59E0B' },
]

export default function PatientAppointments() {
  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 52 }}>
        <Text style={{ ...t.typography.h1, color: t.text.primary, marginBottom: 4 }}>Appointments</Text>
        <Text style={{ ...t.typography.body, color: t.text.secondary, marginBottom: 24 }}>Your upcoming consultations</Text>

        {APPOINTMENTS.map((apt) => (
          <View key={apt.id} style={{
            backgroundColor: t.bg.secondary, borderWidth: 1, borderColor: t.border.subtle,
            borderRadius: t.radius.card, padding: 16, marginBottom: 12,
            shadowColor: t.shadow.card, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: apt.color + '18', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="person" size={22} color={apt.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ ...t.typography.bodySemi, color: t.text.primary }}>{apt.doctor}</Text>
                <Text style={{ ...t.typography.caption, color: t.text.secondary }}>{apt.spec}</Text>
              </View>
              <View style={{ backgroundColor: apt.color + '18', paddingHorizontal: 10, paddingVertical: 4, borderRadius: t.radius.chip }}>
                <Text style={{ ...t.typography.caption, color: apt.color, fontFamily: t.typography.bodySemi.fontFamily }}>{apt.type}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: t.border.subtle }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="calendar-outline" size={14} color={t.text.muted} />
                <Text style={{ ...t.typography.bodyMed, color: t.text.secondary, fontSize: 13 }}>{apt.date}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="time-outline" size={14} color={t.text.muted} />
                <Text style={{ ...t.typography.bodyMed, color: t.text.secondary, fontSize: 13 }}>{apt.time}</Text>
              </View>
            </View>
          </View>
        ))}

        {/* Book appointment CTA */}
        <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
          <View style={{
            backgroundColor: t.brand.tealDim, borderWidth: 1, borderColor: t.brand.teal + '40',
            borderRadius: t.radius.card, paddingVertical: 18,
            alignItems: 'center', justifyContent: 'center', marginTop: 8,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="add-circle-outline" size={20} color={t.brand.teal} />
              <Text style={{ ...t.typography.bodySemi, color: t.brand.teal }}>Book New Appointment</Text>
            </View>
          </View>
        </Pressable>
      </ScrollView>
    </View>
  )
}
