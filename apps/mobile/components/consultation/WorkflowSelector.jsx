import { useRef, useEffect } from 'react'
import { View, Text, Pressable, Animated, Easing } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { doctorTheme as t } from '../../constants/doctorTheme'

export function WorkflowSelector({ onSelect }) {
  const fadeA = useRef(new Animated.Value(0)).current
  const fadeB = useRef(new Animated.Value(0)).current
  const slideA = useRef(new Animated.Value(40)).current
  const slideB = useRef(new Animated.Value(40)).current

  useEffect(() => {
    Animated.stagger(150, [
      Animated.parallel([
        Animated.timing(fadeA, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(slideA, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(fadeB, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(slideB, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start()
  }, [fadeA, fadeB, slideA, slideB])

  const WorkflowCard = ({ type, title, subtitle, icon, features, gradient, animFade, animSlide }) => (
    <Animated.View style={{ opacity: animFade, transform: [{ translateY: animSlide }] }}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          onSelect(type)
        }}
        style={{
          backgroundColor: t.bg.secondary,
          borderRadius: t.radius.card,
          padding: t.space.lg,
          borderWidth: 1.5,
          borderColor: t.border.subtle,
          shadowColor: t.shadow.card,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 1,
          shadowRadius: 16,
          elevation: 4,
        }}
      >
        {/* Icon + Title */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <View style={{
            width: 48, height: 48, borderRadius: 16,
            backgroundColor: t.brand.teal + '15',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Ionicons name={icon} size={24} color={t.brand.teal} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ ...t.typography.h2, color: t.text.primary }}>{title}</Text>
            <Text style={{ ...t.typography.caption, color: t.text.secondary }}>{subtitle}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={t.text.muted} />
        </View>

        {/* Feature pills */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {features.map((f, i) => (
            <View key={i} style={{ backgroundColor: t.bg.tertiary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
              <Text style={{ ...t.typography.caption, color: t.text.secondary }}>{f}</Text>
            </View>
          ))}
        </View>
      </Pressable>
    </Animated.View>
  )

  return (
    <View style={{ gap: t.space.base }}>
      <View style={{ alignItems: 'center', marginBottom: t.space.sm }}>
        <Text style={{ ...t.typography.h1, color: t.text.primary }}>Choose Workflow</Text>
        <Text style={{ ...t.typography.body, color: t.text.secondary, marginTop: 4 }}>Select the type of consultation</Text>
      </View>

      <WorkflowCard
        type="consultation"
        title="AI Consultation"
        subtitle="Voice + Notes + SOAP + Clinical AI"
        icon="mic-outline"
        features={['Voice Capture', 'SOAP Notes', 'Body Map', 'AI Suggestions', 'Prescriptions']}
        animFade={fadeA}
        animSlide={slideA}
      />

      <WorkflowCard
        type="radiology"
        title="Radiology AI"
        subtitle="Image Upload + AI Analysis + SHAP"
        icon="scan-outline"
        features={['X-Ray', 'CT/MRI', 'Heatmaps', 'SHAP Explainability', 'Findings Report']}
        animFade={fadeB}
        animSlide={slideB}
      />

      {/* Divider note */}
      <View style={{ alignItems: 'center', paddingTop: t.space.sm }}>
        <Text style={{ ...t.typography.caption, color: t.text.muted, textAlign: 'center' }}>
          Both workflows converge into Drug Safety → Report → Follow-up
        </Text>
      </View>
    </View>
  )
}
