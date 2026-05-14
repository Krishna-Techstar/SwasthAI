import { View, Text, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { doctorTheme as t } from '../../constants/doctorTheme'

export function PatientTimeline({ patient }) {
  if (!patient) return null

  const Section = ({ title, icon, children }) => (
    <View style={{ marginBottom: t.space.base }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: t.space.sm }}>
        <Ionicons name={icon} size={14} color={t.brand.teal} />
        <Text style={{ ...t.typography.bodySemi, color: t.text.primary, fontSize: 13 }}>{title}</Text>
      </View>
      {children}
    </View>
  )

  const TimelineItem = ({ date, title, subtitle, flagged }) => (
    <View style={{ flexDirection: 'row', gap: 10, paddingVertical: 6 }}>
      <View style={{ alignItems: 'center', width: 12, paddingTop: 4 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: flagged ? t.semantic.warning : t.brand.teal + '60' }} />
        <View style={{ width: 1, flex: 1, backgroundColor: t.border.subtle, marginTop: 2 }} />
      </View>
      <View style={{ flex: 1, paddingBottom: 8 }}>
        <Text style={{ ...t.typography.caption, color: t.text.muted }}>{date}</Text>
        <Text style={{ ...t.typography.bodyMed, color: t.text.primary, marginTop: 2 }}>{title}</Text>
        {subtitle && <Text style={{ ...t.typography.caption, color: t.text.secondary, marginTop: 1 }}>{subtitle}</Text>}
      </View>
    </View>
  )

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ padding: t.space.base }}>
      {/* Allergies */}
      <Section title="Allergies" icon="warning-outline">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {(patient.allergies || []).map((a, i) => (
            <View key={i} style={{ backgroundColor: t.semantic.errorDim, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
              <Text style={{ ...t.typography.bodyMed, fontSize: 11, color: t.semantic.error }}>{a}</Text>
            </View>
          ))}
        </View>
      </Section>

      {/* Current Medications */}
      <Section title="Active Medications" icon="medical-outline">
        {(patient.activemedications || []).map((med, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 }}>
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: t.semantic.success }} />
            <Text style={{ ...t.typography.body, color: t.text.primary, flex: 1 }}>{med.name}</Text>
            <Text style={{ ...t.typography.caption, color: t.text.muted }}>{med.dosage}</Text>
          </View>
        ))}
      </Section>

      {/* Previous Reports */}
      <Section title="Previous Reports" icon="document-text-outline">
        {(patient.previousReports || []).map((rpt) => (
          <TimelineItem key={rpt.id} date={rpt.date} title={rpt.type} subtitle={rpt.summary} flagged={rpt.flagged} />
        ))}
      </Section>

      {/* Scan History */}
      <Section title="Scan History" icon="scan-outline">
        {(patient.scanHistory || []).map((scan) => (
          <TimelineItem key={scan.id} date={scan.date} title={scan.type} subtitle={scan.finding} />
        ))}
        {(!patient.scanHistory || patient.scanHistory.length === 0) && (
          <Text style={{ ...t.typography.body, color: t.text.muted }}>No scan history</Text>
        )}
      </Section>

      {/* AI Flags */}
      <Section title="AI History" icon="sparkles-outline">
        {(patient.aiHistory || []).map((ai, i) => (
          <TimelineItem key={i} date={ai.date} title={ai.type} subtitle={ai.summary} flagged />
        ))}
      </Section>

      {/* Doctor History */}
      <Section title="Doctor Visits" icon="people-outline">
        {(patient.doctorHistory || []).map((doc, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: t.border.subtle + '40' }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: t.bg.tertiary, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ ...t.typography.bodySemi, fontSize: 10, color: t.brand.teal }}>
                {doc.doctorName.split(' ').pop()?.[0] || 'D'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ ...t.typography.bodyMed, color: t.text.primary }}>{doc.doctorName}</Text>
              <Text style={{ ...t.typography.caption, color: t.text.muted }}>{doc.specialty} · {doc.visits} visits</Text>
            </View>
            <Text style={{ ...t.typography.caption, color: t.text.muted }}>{doc.lastVisit}</Text>
          </View>
        ))}
      </Section>

      <View style={{ height: 40 }} />
    </ScrollView>
  )
}
