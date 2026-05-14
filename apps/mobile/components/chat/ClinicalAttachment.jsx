// apps/mobile/components/chat/ClinicalAttachment.jsx
import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { doctorTheme as t } from '../../constants/doctorTheme'

const CARD_CONFIGS = {
  PATIENT_CARD: {
    icon: 'person-outline',
    label: 'PATIENT SUMMARY',
    accent: '#8B5CF6',
    bg: '#8B5CF610',
    border: '#8B5CF630',
  },
  PRESCRIPTION: {
    icon: 'medical-outline',
    label: 'PRESCRIPTION',
    accent: '#22C55E',
    bg: '#22C55E10',
    border: '#22C55E30',
  },
  LAB_REPORT: {
    icon: 'flask-outline',
    label: 'LAB REPORT',
    accent: '#F59E0B',
    bg: '#F59E0B10',
    border: '#F59E0B30',
  },
  CLINICAL_NOTE: {
    icon: 'document-text-outline',
    label: 'CLINICAL NOTE',
    accent: '#3B82F6',
    bg: '#3B82F610',
    border: '#3B82F630',
  },
  ICD_CODE: {
    icon: 'business-outline',
    label: 'BILLING CODE',
    accent: '#A78BFA',
    bg: '#A78BFA10',
    border: '#A78BFA30',
  },
}

function CardWrapper({ type, onPress, children }) {
  const cfg = CARD_CONFIGS[type] ?? CARD_CONFIGS.CLINICAL_NOTE
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: cfg.bg,
        borderWidth: 1,
        borderColor: cfg.border,
        borderRadius: t.radius.card - 4,
        overflow: 'hidden',
        minWidth: 240,
        maxWidth: 280,
      }}
    >
      {/* Header strip */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderBottomWidth: 1,
          borderBottomColor: cfg.border,
        }}
      >
        <Ionicons name={cfg.icon} size={13} color={cfg.accent} />
        <Text style={{ ...t.typography.caption, letterSpacing: 0.8, color: cfg.accent }}>
          {cfg.label}
        </Text>
      </View>

      {/* Body */}
      <View style={{ paddingHorizontal: 12, paddingVertical: 10 }}>
        {children}
      </View>
    </Pressable>
  )
}

// ── 1. Patient Card ───────────────────────────────────────────────────────────

export function PatientCard({ metadata, onPress }) {
  return (
    <CardWrapper type="PATIENT_CARD" onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <Text style={{ ...t.typography.bodySemi, color: t.text.primary, fontSize: 14 }}>
          {metadata.patientName}
        </Text>
        {metadata.abhaVerified && (
          <View style={{ backgroundColor: '#22C55E20', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 }}>
            <Text style={{ fontSize: 9, color: '#22C55E', fontFamily: t.typography.bodySemi.fontFamily }}>✓ ABHA</Text>
          </View>
        )}
      </View>
      <Text style={{ ...t.typography.body, color: t.text.secondary, marginBottom: 2 }}>
        {metadata.age}{metadata.gender} · {metadata.diagnosis}
      </Text>
      {metadata.lastBP && (
        <Text style={{ ...t.typography.caption, color: t.text.muted }}>
          Last BP: {metadata.lastBP}
        </Text>
      )}
      {metadata.medications?.length > 0 && (
        <Text style={{ ...t.typography.caption, color: t.text.muted, marginTop: 2 }}>
          {metadata.medications.join(' · ')}
        </Text>
      )}
      <Text style={{ ...t.typography.link, color: '#8B5CF6', marginTop: 8, textAlign: 'right' }}>
        View Full →
      </Text>
    </CardWrapper>
  )
}

// ── 2. Prescription Card ──────────────────────────────────────────────────────

export function PrescriptionCard({ metadata, onPress }) {
  return (
    <CardWrapper type="PRESCRIPTION" onPress={onPress}>
      {metadata.drugs?.map((d, i) => (
        <Text key={i} style={{ ...t.typography.body, color: t.text.primary, marginBottom: 2 }}>
          {d.name} · <Text style={{ color: t.text.secondary }}>{d.dosage} · {d.days} days</Text>
        </Text>
      ))}
      <Text style={{ ...t.typography.caption, color: t.text.muted, marginTop: 6 }}>
        {metadata.doctor} · {metadata.date}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        <Text style={{ ...t.typography.link, color: '#22C55E' }}>View PDF</Text>
        <Text style={{ ...t.typography.link, color: '#22C55E' }}>WhatsApp →</Text>
      </View>
    </CardWrapper>
  )
}

// ── 3. Lab Report Card ────────────────────────────────────────────────────────

export function LabReportCard({ metadata, onPress }) {
  return (
    <CardWrapper type="LAB_REPORT" onPress={onPress}>
      <Text style={{ ...t.typography.bodySemi, color: t.text.primary, marginBottom: 3 }}>
        {metadata.title}
      </Text>
      <Text style={{ ...t.typography.caption, color: t.text.secondary }}>
        {metadata.lab} · {metadata.date}
      </Text>
      {metadata.flag && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 }}>
          <Ionicons name="warning-outline" size={12} color="#F59E0B" />
          <Text style={{ ...t.typography.caption, color: '#F59E0B' }}>{metadata.flag}</Text>
        </View>
      )}
      <Text style={{ ...t.typography.link, color: '#F59E0B', marginTop: 8, textAlign: 'right' }}>
        Open Report →
      </Text>
    </CardWrapper>
  )
}

// ── 4. Clinical Note Card ─────────────────────────────────────────────────────

export function ClinicalNoteCard({ metadata, onPress }) {
  return (
    <CardWrapper type="CLINICAL_NOTE" onPress={onPress}>
      {[
        { key: 'S', value: metadata.subjective },
        { key: 'O', value: metadata.objective },
        { key: 'A', value: metadata.assessment },
        { key: 'P', value: metadata.plan },
      ].filter(l => l.value).map((line) => (
        <Text key={line.key} style={{ ...t.typography.body, color: t.text.primary, marginBottom: 2 }}>
          <Text style={{ color: '#3B82F6', fontFamily: t.typography.bodySemi.fontFamily }}>{line.key}: </Text>
          {line.value}
        </Text>
      ))}
      <Text style={{ ...t.typography.link, color: '#3B82F6', marginTop: 8, textAlign: 'right' }}>
        Full Note →
      </Text>
    </CardWrapper>
  )
}

// ── 5. ICD Code Card ──────────────────────────────────────────────────────────

export function ICDCodeCard({ metadata, onPress }) {
  return (
    <CardWrapper type="ICD_CODE" onPress={onPress}>
      <Text style={{ ...t.typography.h3, color: '#A78BFA', fontSize: 15 }}>
        {metadata.code}
      </Text>
      <Text style={{ ...t.typography.body, color: t.text.primary, marginTop: 2 }}>
        {metadata.description}
      </Text>
      <Text style={{ ...t.typography.caption, color: t.text.muted, marginTop: 4 }}>
        Confidence: {metadata.confidence}% · Auto-coded by AI
      </Text>
    </CardWrapper>
  )
}

// ── Dispatcher ────────────────────────────────────────────────────────────────

export function ClinicalAttachment({ type, metadata, onPress }) {
  switch (type) {
    case 'PATIENT_CARD':   return <PatientCard    metadata={metadata} onPress={onPress} />
    case 'PRESCRIPTION':   return <PrescriptionCard metadata={metadata} onPress={onPress} />
    case 'LAB_REPORT':     return <LabReportCard  metadata={metadata} onPress={onPress} />
    case 'CLINICAL_NOTE':  return <ClinicalNoteCard metadata={metadata} onPress={onPress} />
    case 'ICD_CODE':       return <ICDCodeCard    metadata={metadata} onPress={onPress} />
    default:               return null
  }
}
