import { View, Text, ScrollView, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { doctorTheme as t } from '../../constants/doctorTheme'

export function ReportBuilder({ report, onSignOff, onExportPDF, reportStatus }) {
  if (!report) return null
  const s = report.sections || {}

  const Section = ({ title, icon, children }) => (
    <View style={{ backgroundColor: t.bg.secondary, borderRadius: t.radius.card, padding: t.space.base, borderWidth: 1, borderColor: t.border.subtle, marginBottom: t.space.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: t.space.sm }}>
        <Ionicons name={icon} size={16} color={t.brand.teal} />
        <Text style={{ ...t.typography.bodySemi, color: t.text.primary }}>{title}</Text>
      </View>
      {children}
    </View>
  )

  return (
    <ScrollView contentContainerStyle={{ padding: t.space.base }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space.base }}>
        <Text style={{ ...t.typography.h2, color: t.text.primary }}>Patient Report</Text>
        <View style={{ backgroundColor: reportStatus === 'signed' ? t.semantic.successDim : t.brand.teal + '18', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
          <Text style={{ ...t.typography.bodySemi, fontSize: 11, color: reportStatus === 'signed' ? t.semantic.success : t.brand.teal }}>{reportStatus?.toUpperCase() || 'DRAFT'}</Text>
        </View>
      </View>

      {s.patientInfo && (
        <Section title="Patient" icon="person-outline">
          <Text style={{ ...t.typography.bodyMed, color: t.text.primary }}>{s.patientInfo.name}, {s.patientInfo.age}yrs</Text>
        </Section>
      )}

      {s.soapNotes && (
        <Section title="SOAP Notes" icon="clipboard-outline">
          {Object.entries(s.soapNotes).filter(([, v]) => v).map(([k, v]) => (
            <View key={k} style={{ marginBottom: 8 }}>
              <Text style={{ ...t.typography.bodySemi, fontSize: 11, color: t.brand.teal }}>{k.charAt(0).toUpperCase() + k.slice(1)}</Text>
              <Text style={{ ...t.typography.body, color: t.text.primary, lineHeight: 18 }}>{v}</Text>
            </View>
          ))}
        </Section>
      )}

      {s.prescriptions?.length > 0 && (
        <Section title="Prescriptions" icon="medical-outline">
          {s.prescriptions.map((rx, i) => (
            <Text key={i} style={{ ...t.typography.body, color: t.text.primary, paddingVertical: 2 }}>• {rx.drugName}</Text>
          ))}
        </Section>
      )}

      <View style={{ gap: t.space.sm, marginTop: t.space.sm }}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onSignOff?.() }}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: t.brand.teal, borderRadius: t.radius.btn, paddingVertical: 14 }}>
          <Ionicons name="create-outline" size={20} color="#FFFFFF" />
          <Text style={{ ...t.typography.h3, color: '#FFFFFF' }}>{reportStatus === 'signed' ? 'Signed ✓' : 'Sign Off'}</Text>
        </Pressable>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onExportPDF?.() }}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: t.bg.tertiary, borderRadius: t.radius.btn, paddingVertical: 14, borderWidth: 1, borderColor: t.border.subtle }}>
          <Ionicons name="download-outline" size={18} color={t.text.primary} />
          <Text style={{ ...t.typography.bodyMed, color: t.text.primary }}>Export PDF</Text>
        </Pressable>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  )
}
