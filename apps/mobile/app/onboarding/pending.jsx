// apps/mobile/app/onboarding/pending.jsx
// Verification Pending screen — shown to Doctor/Nurse after signup
import { useEffect, useRef, useState } from 'react'
import {
  View, Text, SafeAreaView, Pressable, Animated, Easing,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../services/authService'
import { VerificationBadge } from '../../components/ui/VerificationBadge'
import { PillButton } from '../../components/ui/PillButton'
import { doctorTheme as t } from '../../constants/doctorTheme'

export default function PendingScreen() {
  const { user, verificationStatus, setVerificationStatus, logout } = useAuthStore()
  const [checking, setChecking] = useState(false)

  // Floating animation for the icon
  const floatAnim = useRef(new Animated.Value(0)).current
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -10, duration: 1500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0,   duration: 1500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [floatAnim])

  const handleCheckStatus = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setChecking(true)
    try {
      const result = await authService.checkVerificationStatus(user?.id)
      setVerificationStatus(result.status)
      if (result.status === 'approved') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        const home = useAuthStore.getState().getHomeRoute()
        router.replace(home)
      }
    } catch {}
    setChecking(false)
  }

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    logout()
    router.replace('/onboarding/welcome')
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg.primary }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>

        {/* Floating icon */}
        <Animated.View style={{
          transform: [{ translateY: floatAnim }],
          width: 96, height: 96, borderRadius: 28,
          backgroundColor: t.brand.tealDim,
          alignItems: 'center', justifyContent: 'center', marginBottom: 28,
          shadowColor: t.shadow.soft,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 1, shadowRadius: 20,
        }}>
          <Ionicons name="hourglass-outline" size={44} color={t.brand.teal} />
        </Animated.View>

        <Text style={{ ...t.typography.h1, color: t.text.primary, textAlign: 'center' }}>
          Verification in Progress
        </Text>
        <Text style={{ ...t.typography.body, color: t.text.secondary, textAlign: 'center', marginTop: 12, lineHeight: 20 }}>
          Your account is under review. Our team will verify your documents within{' '}
          <Text style={{ color: t.brand.teal, fontFamily: t.typography.bodySemi.fontFamily }}>24 hours</Text>.
        </Text>

        {/* Status badge */}
        <View style={{ marginTop: 24, marginBottom: 32 }}>
          <VerificationBadge status={verificationStatus} />
        </View>

        {/* Timeline */}
        <View style={{
          backgroundColor: t.bg.secondary,
          borderWidth: 1, borderColor: t.border.subtle,
          borderRadius: t.radius.card, padding: 20,
          width: '100%', marginBottom: 32,
        }}>
          {[
            { icon: 'person-add', label: 'Account Created',      done: true },
            { icon: 'document-text', label: 'Documents Uploaded',    done: true },
            { icon: 'eye',          label: 'Under Admin Review',    done: verificationStatus === 'review_pending' || verificationStatus === 'approved' },
            { icon: 'shield-checkmark', label: 'Account Verified', done: verificationStatus === 'approved' },
          ].map((item, i, arr) => (
            <View key={item.label} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: i < arr.length - 1 ? 0 : 0 }}>
              {/* Dot + line */}
              <View style={{ alignItems: 'center', width: 24 }}>
                <View style={{
                  width: 24, height: 24, borderRadius: 12,
                  backgroundColor: item.done ? t.brand.teal : t.bg.tertiary,
                  borderWidth: item.done ? 0 : 1.5, borderColor: t.border.subtle,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  {item.done && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                </View>
                {i < arr.length - 1 && (
                  <View style={{
                    width: 2, height: 28,
                    backgroundColor: item.done ? t.brand.teal : t.border.subtle,
                    marginVertical: 2,
                  }} />
                )}
              </View>

              {/* Label */}
              <View style={{ flex: 1, paddingBottom: i < arr.length - 1 ? 12 : 0 }}>
                <Text style={{
                  ...t.typography.bodyMed,
                  color: item.done ? t.text.primary : t.text.muted,
                  fontSize: 14,
                }}>
                  {item.label}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Check status button */}
        <PillButton
          label={checking ? 'Checking...' : 'Check Status'}
          onPress={handleCheckStatus}
          disabled={checking}
        />

        {/* Logout */}
        <Pressable onPress={handleLogout} style={{ marginTop: 20 }}>
          <Text style={{ ...t.typography.link, color: t.text.muted }}>Logout & Return</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}
