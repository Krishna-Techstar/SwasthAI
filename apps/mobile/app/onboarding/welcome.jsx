// apps/mobile/app/onboarding/welcome.jsx
import { useRef, useEffect } from 'react'
import { View, Text, SafeAreaView, Pressable, Animated, Easing } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useOnboardingStore } from '../../store/useOnboardingStore'
import { ROLE_SIGNUP_ROUTE } from '../../constants/permissions'
import { doctorTheme as t } from '../../constants/doctorTheme'

const ROLES = [
  {
    role: 'Patient',
    icon: 'person-outline',
    description: 'Book appointments, track health, get AI-powered insights',
    color: t.brand.teal,
  },
  {
    role: 'Doctor',
    icon: 'medkit-outline',
    description: 'Manage patients, AI diagnosis tools, clinical workflows',
    color: t.brand.indigo,
  },
  {
    role: 'Nurse',
    icon: 'heart-outline',
    description: 'Ward management, vitals tracking, shift coordination',
    color: t.semantic.success,
  },
]

function AnimatedRoleCard({ item, index }) {
  const fadeAnim  = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, delay: 200 + index * 120, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, delay: 200 + index * 120, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start()
  }, [fadeAnim, slideAnim, index])

  const { setRole } = useOnboardingStore()

  const handleSelect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setRole(item.role)
    const signupRoute = ROLE_SIGNUP_ROUTE[item.role]
    if (signupRoute) {
      router.push(signupRoute)
    }
  }

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <Pressable onPress={handleSelect}>
        <View style={{
          backgroundColor: t.bg.secondary,
          borderWidth: 1.5,
          borderColor: t.border.subtle,
          borderRadius: t.radius.card,
          paddingVertical: 20,
          paddingHorizontal: 18,
          marginBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
          shadowColor: t.shadow.card,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 8,
          elevation: 2,
        }}>
          {/* Icon */}
          <View style={{
            width: 52, height: 52, borderRadius: 16,
            backgroundColor: item.color + '18',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Ionicons name={item.icon} size={24} color={item.color} />
          </View>

          {/* Content */}
          <View style={{ flex: 1 }}>
            <Text style={{ ...t.typography.h3, color: t.text.primary, marginBottom: 3 }}>
              {item.role}
            </Text>
            <Text style={{ ...t.typography.body, color: t.text.secondary, lineHeight: 18 }}>
              {item.description}
            </Text>
          </View>

          {/* Arrow */}
          <Ionicons name="chevron-forward" size={18} color={t.text.muted} />
        </View>
      </Pressable>
    </Animated.View>
  )
}

export default function WelcomeScreen() {
  const logoScale = useRef(new Animated.Value(0.5)).current
  const logoFade  = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, damping: 12, useNativeDriver: true }),
      Animated.timing(logoFade,  { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start()
  }, [logoScale, logoFade])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg.primary }}>
      <View style={{ flex: 1, paddingHorizontal: 24 }}>

        {/* Logo + Brand */}
        <Animated.View style={{
          alignItems: 'center', marginTop: 40, marginBottom: 32,
          opacity: logoFade, transform: [{ scale: logoScale }],
        }}>
          <View style={{
            width: 72, height: 72, borderRadius: 22,
            backgroundColor: t.brand.tealDim,
            alignItems: 'center', justifyContent: 'center', marginBottom: 16,
            shadowColor: t.shadow.floating,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 1, shadowRadius: 20,
          }}>
            <Ionicons name="pulse" size={36} color={t.brand.teal} />
          </View>
          <Text style={{ ...t.typography.display, color: t.text.primary }}>SwasthAI</Text>
          <Text style={{ ...t.typography.body, color: t.text.secondary, textAlign: 'center', marginTop: 6 }}>
            AI-powered healthcare platform
          </Text>
        </Animated.View>

        {/* Role Selection */}
        <Text style={{ ...t.typography.h2, color: t.text.primary, marginBottom: 4 }}>
          Choose Your Role
        </Text>
        <Text style={{ ...t.typography.body, color: t.text.muted, marginBottom: 16 }}>
          Select how you will use SwasthAI
        </Text>

        {ROLES.map((item, index) => (
          <AnimatedRoleCard key={item.role} item={item} index={index} />
        ))}

        <View style={{ flex: 1 }} />

        {/* Login link */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', paddingVertical: 20 }}>
          <Text style={{ ...t.typography.body, color: t.text.secondary }}>
            Already have an account?{' '}
          </Text>
          <Pressable onPress={() => router.push('/onboarding/login')}>
            <Text style={{ ...t.typography.bodySemi, color: t.brand.teal }}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}
