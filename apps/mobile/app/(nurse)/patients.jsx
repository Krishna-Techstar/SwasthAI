// Nurse — Patients list
import { View, Text, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { doctorTheme as t } from '../../constants/doctorTheme'

const PATIENTS = [
  { name: 'Priya Sharma',  bed: 'A-12', condition: 'Post-Op Recovery',    status: 'stable' },
  { name: 'Mohan Kumar',   bed: 'A-08', condition: 'Acute MI Monitoring', status: 'critical' },
  { name: 'Aarti Joshi',   bed: 'A-15', condition: 'Fracture — Day 3',   status: 'stable' },
  { name: 'Rajesh Patel',  bed: 'A-03', condition: 'Diabetic Ketoacidosis', status: 'monitor' },
  { name: 'Sunita Devi',   bed: 'A-19', condition: 'Pneumonia',          status: 'monitor' },
]

const SC = { stable: t.semantic.success, critical: t.semantic.error, monitor: t.semantic.warning }

export default function NursePatients() {
  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 52 }}>
        <Text style={{ ...t.typography.h1, color: t.text.primary, marginBottom: 4 }}>Assigned Patients</Text>
        <Text style={{ ...t.typography.body, color: t.text.secondary, marginBottom: 20 }}>{PATIENTS.length} patients in your ward</Text>
        {PATIENTS.map((pt, i) => (
          <View key={i} style={{
            backgroundColor: t.bg.secondary, borderWidth: 1, borderColor: t.border.subtle,
            borderRadius: t.radius.card, padding: 16, marginBottom: 10,
            flexDirection: 'row', alignItems: 'center', gap: 12,
          }}>
            <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: (SC[pt.status] ?? t.text.muted) + '18', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ ...t.typography.bodySemi, color: SC[pt.status], fontSize: 12 }}>{pt.bed}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ ...t.typography.bodySemi, color: t.text.primary }}>{pt.name}</Text>
              <Text style={{ ...t.typography.caption, color: t.text.secondary }}>{pt.condition}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: SC[pt.status] }} />
              <Text style={{ ...t.typography.caption, color: SC[pt.status], textTransform: 'capitalize' }}>{pt.status}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}
