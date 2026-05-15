// apps/mobile/app/onboarding/login.jsx
import { useState, useRef } from 'react'
import {
  View, Text, TextInput, Pressable, SafeAreaView,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../services/authService'
import { SecurePasswordInput } from '../../components/ui/SecurePasswordInput'
import { PillButton } from '../../components/ui/PillButton'
import { doctorTheme as t } from '../../constants/doctorTheme'

export default function LoginScreen() {
  const { completeLogin, setLoading, isLoading } = useAuthStore()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState(null)
  const [remember, setRemember] = useState(true)

  const emailRef = useRef(null)
  const passwordRef = useRef(null)

  const canSubmit = email.trim().length > 0 && password.length >= 6

  const handleLogin = async () => {
    if (!canSubmit || isLoading) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setLoading(true)
    setError(null)

    try {
      const result = await authService.login({ email, password })
      completeLogin(result)
      const home = useAuthStore.getState().getHomeRoute()
      router.replace(home)
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg.primary }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back button */}
          <Pressable onPress={() => router.back()} style={{ marginTop: 16, marginBottom: 16 }}>
            <Ionicons name="arrow-back" size={22} color={t.text.primary} />
          </Pressable>

          {/* Brand header */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <View style={{
              width: 64, height: 64, borderRadius: 20,
              backgroundColor: t.brand.tealDim,
              alignItems: 'center', justifyContent: 'center', marginBottom: 16,
            }}>
              <Ionicons name="shield-checkmark" size={32} color={t.brand.teal} />
            </View>
            <Text style={{ ...t.typography.h1, color: t.text.primary, textAlign: 'center' }}>
              Welcome Back
            </Text>
            <Text style={{ ...t.typography.body, color: t.text.secondary, textAlign: 'center', marginTop: 6 }}>
              Sign in to your SwasthAI account
            </Text>
          </View>

          {/* Email / Phone */}
          <Text style={{ ...t.typography.bodyMed, color: t.text.secondary, marginBottom: 6 }}>
            Email or Phone
          </Text>
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: t.bg.tertiary,
            borderWidth: 1.5, borderColor: t.border.subtle,
            borderRadius: t.radius.input, paddingHorizontal: 14, gap: 10, marginBottom: 14,
          }}>
            <Ionicons name="mail-outline" size={18} color={t.text.muted} />
            <TextInput
              ref={emailRef}
              value={email}
              onChangeText={setEmail}
              placeholder="doctor@swasthai.com"
              placeholderTextColor={t.text.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
              style={{
                flex: 1, height: 48,
                fontFamily: t.typography.body.fontFamily,
                fontSize: 14, color: t.text.primary,
              }}
            />
          </View>

          {/* Password */}
          <SecurePasswordInput
            inputRef={passwordRef}
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          {/* Spacing to prevent accidental taps */}
          <View style={{ height: 10 }} />

          {/* Remember + Forgot */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Pressable
              onPress={() => setRemember(!remember)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
              <View style={{
                width: 20, height: 20, borderRadius: 6,
                backgroundColor: remember ? t.brand.teal : t.bg.tertiary,
                borderWidth: remember ? 0 : 1.5, borderColor: t.border.subtle,
                alignItems: 'center', justifyContent: 'center',
              }}>
                {remember && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
              </View>
              <Text style={{ ...t.typography.body, color: t.text.secondary }}>Remember me</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/onboarding/forgot-password')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={{ ...t.typography.link, color: t.brand.teal }}>Forgot password?</Text>
            </Pressable>
          </View>

          {/* Error */}
          {error && (
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 8,
              backgroundColor: t.semantic.errorDim, borderRadius: 12,
              paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16,
            }}>
              <Ionicons name="alert-circle" size={18} color={t.semantic.error} />
              <Text style={{ ...t.typography.body, color: t.semantic.error, flex: 1 }}>{error}</Text>
            </View>
          )}

          {/* Login button */}
          <PillButton
            label={isLoading ? '' : 'Sign In'}
            onPress={handleLogin}
            disabled={!canSubmit || isLoading}
          />
          {isLoading && (
            <ActivityIndicator color={t.brand.teal} style={{ position: 'absolute', alignSelf: 'center', bottom: 12 }} />
          )}

          {/* Biometric placeholder */}
          <Pressable style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 }}>
            <Ionicons name="finger-print-outline" size={22} color={t.text.muted} />
            <Text style={{ ...t.typography.bodyMed, color: t.text.muted }}>Use Biometric Login</Text>
          </Pressable>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: t.border.subtle }} />
            <Text style={{ ...t.typography.caption, color: t.text.muted, marginHorizontal: 12 }}>or</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: t.border.subtle }} />
          </View>

          {/* Social login placeholders */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 32 }}>
            {['logo-google', 'logo-apple', 'call-outline'].map((icon) => (
              <Pressable
                key={icon}
                style={{
                  width: 52, height: 52, borderRadius: 16,
                  backgroundColor: t.bg.secondary,
                  borderWidth: 1, borderColor: t.border.subtle,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Ionicons name={icon} size={22} color={t.text.secondary} />
              </Pressable>
            ))}
          </View>

          {/* Sign up link */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 32 }}>
            <Text style={{ ...t.typography.body, color: t.text.secondary }}>
              New to SwasthAI?{' '}
            </Text>
            <Pressable onPress={() => router.push('/onboarding/welcome')}>
              <Text style={{ ...t.typography.bodySemi, color: t.brand.teal }}>Create Account</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
