// apps/mobile/app/onboarding/forgot-password.jsx
import { useState } from 'react'
import {
  View, Text, TextInput, Pressable, SafeAreaView,
  KeyboardAvoidingView, Platform,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { authService } from '../../services/authService'
import { PillButton } from '../../components/ui/PillButton'
import { doctorTheme as t } from '../../constants/doctorTheme'

export default function ForgotPasswordScreen() {
  const [email,   setEmail]   = useState('')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const handleSend = async () => {
    if (!email.trim() || loading) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setLoading(true)
    setError(null)
    try {
      await authService.forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.bg.primary }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <View style={{
            width: 72, height: 72, borderRadius: 22,
            backgroundColor: t.semantic.successDim,
            alignItems: 'center', justifyContent: 'center', marginBottom: 24,
          }}>
            <Ionicons name="mail-open" size={36} color={t.semantic.success} />
          </View>
          <Text style={{ ...t.typography.h1, color: t.text.primary, textAlign: 'center' }}>
            Check Your Inbox
          </Text>
          <Text style={{ ...t.typography.body, color: t.text.secondary, textAlign: 'center', marginTop: 12, lineHeight: 20 }}>
            We sent a password reset link to{'\n'}
            <Text style={{ color: t.brand.teal, fontFamily: t.typography.bodySemi.fontFamily }}>{email}</Text>
          </Text>
          <View style={{ marginTop: 32, width: '100%' }}>
            <PillButton label="Back to Login" onPress={() => router.replace('/onboarding/login')} />
          </View>
          <Pressable onPress={() => { setSent(false); setEmail('') }} style={{ marginTop: 16 }}>
            <Text style={{ ...t.typography.link, color: t.text.muted }}>Try a different email</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg.primary }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: 24 }}>
          <Pressable onPress={() => router.back()} style={{ marginTop: 16, marginBottom: 24 }}>
            <Ionicons name="arrow-back" size={22} color={t.text.primary} />
          </Pressable>

          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <View style={{
              width: 64, height: 64, borderRadius: 20,
              backgroundColor: t.brand.tealDim,
              alignItems: 'center', justifyContent: 'center', marginBottom: 16,
            }}>
              <Ionicons name="key-outline" size={32} color={t.brand.teal} />
            </View>
            <Text style={{ ...t.typography.h1, color: t.text.primary, textAlign: 'center' }}>
              Reset Password
            </Text>
            <Text style={{ ...t.typography.body, color: t.text.secondary, textAlign: 'center', marginTop: 8 }}>
              Enter your email and we will send you a reset link.
            </Text>
          </View>

          <Text style={{ ...t.typography.bodyMed, color: t.text.secondary, marginBottom: 6 }}>Email Address</Text>
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: t.bg.tertiary, borderWidth: 1.5, borderColor: t.border.subtle,
            borderRadius: t.radius.input, paddingHorizontal: 14, gap: 10, marginBottom: 16,
          }}>
            <Ionicons name="mail-outline" size={18} color={t.text.muted} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={t.text.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{ flex: 1, height: 48, fontFamily: t.typography.body.fontFamily, fontSize: 14, color: t.text.primary }}
            />
          </View>

          {error && (
            <View style={{ flexDirection: 'row', gap: 8, backgroundColor: t.semantic.errorDim, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16 }}>
              <Ionicons name="alert-circle" size={18} color={t.semantic.error} />
              <Text style={{ ...t.typography.body, color: t.semantic.error, flex: 1 }}>{error}</Text>
            </View>
          )}

          <PillButton label={loading ? 'Sending...' : 'Send Reset Link'} onPress={handleSend} disabled={!email.trim() || loading} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
