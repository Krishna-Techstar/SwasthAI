// apps/mobile/app/onboarding/otp.jsx
// OTP Verification screen — shared by all roles
import { useState, useCallback, useEffect, useRef } from 'react'
import {
  View, Text, Pressable, SafeAreaView, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useOnboardingStore } from '../../store/useOnboardingStore'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../services/authService'
import { OTPInput } from '../../components/ui/OTPInput'
import { PillButton } from '../../components/ui/PillButton'
import { doctorTheme as t } from '../../constants/doctorTheme'

export default function OTPScreen() {
  const { role, basicDetails, roleDetails } = useOnboardingStore()
  const { completeLogin, setOTPVerified, setLoading, isLoading } = useAuthStore()
  const [otp,       setOtp]       = useState('')
  const [error,     setError]     = useState(null)
  const [countdown, setCountdown] = useState(45)
  const timerRef = useRef(null)

  const phone = basicDetails?.phone ?? '+91 ••••• •••••'

  // Countdown timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  const handleResend = async () => {
    if (countdown > 0) return
    setCountdown(45)
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0 }
        return prev - 1
      })
    }, 1000)
    try {
      await authService.sendOTP(phone)
    } catch {}
  }

  const handleVerify = useCallback(async () => {
    if (otp.length !== 6 || isLoading) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setLoading(true)
    setError(null)

    try {
      await authService.verifyOTP(phone, otp)
      setOTPVerified(true)

      // Complete signup
      const result = await authService.signup({ role, basicDetails, roleDetails })
      completeLogin(result)

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

      // Route based on role
      if (role === 'Doctor' || role === 'Nurse') {
        router.replace('/onboarding/pending')
      } else {
        const home = useAuthStore.getState().getHomeRoute()
        router.replace(home)
      }
    } catch (err) {
      setError(err.message || 'Verification failed')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    } finally {
      setLoading(false)
    }
  }, [otp, isLoading, role, basicDetails, roleDetails, completeLogin, setOTPVerified, setLoading, phone])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg.primary }}>
      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        {/* Back */}
        <Pressable onPress={() => router.back()} style={{ marginTop: 16, marginBottom: 24 }}>
          <Ionicons name="arrow-back" size={22} color={t.text.primary} />
        </Pressable>

        {/* Shield icon */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={{
            width: 64, height: 64, borderRadius: 20,
            backgroundColor: t.semantic.successDim,
            alignItems: 'center', justifyContent: 'center', marginBottom: 16,
          }}>
            <Ionicons name="shield-checkmark" size={32} color={t.semantic.success} />
          </View>
          <Text style={{ ...t.typography.h1, color: t.text.primary, textAlign: 'center' }}>
            Verify Phone
          </Text>
          <Text style={{ ...t.typography.body, color: t.text.secondary, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
            We sent a 6-digit secure code to{'\n'}
            <Text style={{ color: t.brand.teal, fontFamily: t.typography.bodySemi.fontFamily }}>{phone}</Text>
          </Text>
        </View>

        {/* OTP Input */}
        <OTPInput value={otp} onChange={setOtp} error={error} />

        {/* Resend */}
        <Pressable onPress={handleResend} disabled={countdown > 0} style={{ alignItems: 'center', marginTop: 20 }}>
          <Text style={{
            ...t.typography.bodyMed,
            color: countdown > 0 ? t.text.muted : t.brand.teal,
          }}>
            {countdown > 0 ? `Resend Code in 00:${countdown.toString().padStart(2, '0')}` : 'Resend Code'}
          </Text>
        </Pressable>

        {/* Security note */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 8,
          backgroundColor: t.bg.tertiary, borderRadius: 12,
          paddingHorizontal: 14, paddingVertical: 10, marginTop: 32,
        }}>
          <Ionicons name="lock-closed" size={16} color={t.brand.teal} />
          <Text style={{ ...t.typography.caption, color: t.text.muted, flex: 1 }}>
            End-to-end secured verification. Your data is protected under ABHA compliance.
          </Text>
        </View>

        <View style={{ flex: 1 }} />
      </View>

      {/* Verify button */}
      <View style={{ paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1, borderTopColor: t.border.subtle, backgroundColor: t.bg.secondary }}>
        <PillButton
          label={isLoading ? 'Verifying...' : 'Verify & Secure Account'}
          onPress={handleVerify}
          disabled={otp.length !== 6 || isLoading}
        />
      </View>
    </SafeAreaView>
  )
}
