// Patient — Reports stub
import { View, Text, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { doctorTheme as t } from '../../constants/doctorTheme'

export default function PatientReports() {
  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 52 }}>
        <Text style={{ ...t.typography.h1, color: t.text.primary, marginBottom: 4 }}>Medical Reports</Text>
        <Text style={{ ...t.typography.body, color: t.text.secondary, marginBottom: 24 }}>Your uploaded lab results and diagnostics</Text>
        {['Blood Panel — May 12', 'Lipid Profile — May 08', 'HbA1c — Apr 20'].map((report, i) => (
          <View key={i} style={{
            backgroundColor: t.bg.secondary, borderWidth: 1, borderColor: t.border.subtle,
            borderRadius: t.radius.card, paddingVertical: 16, paddingHorizontal: 16, marginBottom: 10,
            flexDirection: 'row', alignItems: 'center', gap: 12,
          }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F59E0B18', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="document-text-outline" size={20} color="#F59E0B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ ...t.typography.bodySemi, color: t.text.primary }}>{report}</Text>
              <Text style={{ ...t.typography.caption, color: t.text.muted }}>Metropolis Labs</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={t.text.muted} />
          </View>
        ))}
      </ScrollView>
    </View>
  )
}
