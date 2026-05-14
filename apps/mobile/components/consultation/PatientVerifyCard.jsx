import { useRef, useEffect } from 'react'
import { View, Text, ScrollView, Animated, Easing } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { doctorTheme as t } from '../../constants/doctorTheme'
import { ConfidenceMeter } from './ConfidenceMeter'

function InfoRow({ icon, label, value, flagged }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: t.border.subtle + '40' }}>
      <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: t.bg.tertiary, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={14} color={t.brand.teal} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ ...t.typography.caption, color: t.text.muted, marginBottom: 2 }}>{label}</Text>
        <Text style={{ ...t.typography.bodyMed, color: flagged ? t.semantic.error : t.text.primary, fontSize: 13 }}>{value}</Text>
      </View>
      {flagged && <Ionicons name="warning" size={14} color={t.semantic.warning} />}
    </View>
  )
}

function TagList({ items, color }) {
  if (!items || items.length === 0) return <Text style={{ ...t.typography.body, color: t.text.muted }}>None recorded</Text>
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
      {items.map((item, i) => (
        <View key={i} style={{ backgroundColor: (color || t.semantic.warning) + '18', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
          <Text style={{ ...t.typography.bodyMed, fontSize: 11, color: color || t.semantic.warning }}>{typeof item === 'string' ? item : item.name}</Text>
        </View>
      ))}
    </View>
  )
}

export function PatientVerifyCard({ patient, confidence = 98 }) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const checkScale = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start()

    setTimeout(() => {
      Animated.spring(checkScale, { toValue: 1, tension: 200, friction: 10, useNativeDriver: true }).start()
    }, 600)
  }, [fadeAnim, slideAnim, checkScale])

  if (!patient) return null

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      {/* Verified badge */}
      <Animated.View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        marginBottom: 16, transform: [{ scale: checkScale }],
      }}>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: t.semantic.successDim, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="shield-checkmark" size={20} color={t.semantic.success} />
        </View>
        <View>
          <Text style={{ ...t.typography.h3, color: t.semantic.success }}>Verified Patient</Text>
          <Text style={{ ...t.typography.caption, color: t.text.muted }}>Encrypted · End-to-end secured</Text>
        </View>
      </Animated.View>

      {/* Main card */}
      <View style={{ backgroundColor: t.bg.secondary, borderRadius: t.radius.card, padding: t.space.base, borderWidth: 1, borderColor: t.border.subtle, shadowColor: t.shadow.card, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 3 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: t.border.subtle }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: t.brand.teal + '18', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: t.brand.teal + '40' }}>
            <Text style={{ ...t.typography.h2, color: t.brand.teal }}>
              {patient.name?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ ...t.typography.h2, color: t.text.primary }}>{patient.name}</Text>
            <Text style={{ ...t.typography.body, color: t.text.secondary }}>
              {patient.age}yrs · {patient.gender} · {patient.bloodGroup}
            </Text>
            {patient.abhaId && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <Ionicons name="qr-code-outline" size={10} color={t.text.muted} />
                <Text style={{ ...t.typography.caption, color: t.text.muted }}>{patient.abhaId}</Text>
              </View>
            )}
          </View>
          <ConfidenceMeter value={confidence} size={52} label="Trust" />
        </View>

        {/* Details */}
        <InfoRow icon="call-outline" label="Phone" value={patient.phone} />
        <InfoRow icon="mail-outline" label="Email" value={patient.email} />

        {/* Allergies */}
        <View style={{ marginTop: 12 }}>
          <Text style={{ ...t.typography.bodySemi, color: t.text.primary, marginBottom: 6 }}>
            <Ionicons name="warning-outline" size={13} color={t.semantic.warning} /> Allergies
          </Text>
          <TagList items={patient.allergies} color={t.semantic.error} />
        </View>

        {/* Chronic diseases */}
        <View style={{ marginTop: 12 }}>
          <Text style={{ ...t.typography.bodySemi, color: t.text.primary, marginBottom: 6 }}>
            <Ionicons name="heart-outline" size={13} color={t.semantic.error} /> Chronic Conditions
          </Text>
          <TagList items={patient.chronicDiseases} color={t.brand.teal} />
        </View>

        {/* Active medications */}
        <View style={{ marginTop: 12 }}>
          <Text style={{ ...t.typography.bodySemi, color: t.text.primary, marginBottom: 6 }}>
            <Ionicons name="medical-outline" size={13} color={t.semantic.success} /> Active Medications
          </Text>
          {patient.activemedications?.length > 0 ? (
            patient.activemedications.map((med, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 }}>
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: t.semantic.success }} />
                <Text style={{ ...t.typography.body, color: t.text.primary, flex: 1 }}>{med.name}</Text>
                <Text style={{ ...t.typography.caption, color: t.text.muted }}>{med.dosage}</Text>
              </View>
            ))
          ) : (
            <Text style={{ ...t.typography.body, color: t.text.muted }}>No active medications</Text>
          )}
        </View>

        {/* Emergency contact */}
        {patient.emergencyContacts?.[0] && (
          <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: t.border.subtle }}>
            <InfoRow
              icon="call-outline"
              label="Emergency Contact"
              value={`${patient.emergencyContacts[0].name} (${patient.emergencyContacts[0].relation}) — ${patient.emergencyContacts[0].phone}`}
            />
          </View>
        )}
      </View>
    </Animated.View>
  )
}
