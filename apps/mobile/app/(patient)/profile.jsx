// Shared Profile Screen — Patient
import { useState } from 'react'
import { View, Text, Pressable, ScrollView, Modal } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useAuthStore } from '../../store/authStore'
import { VerificationBadge } from '../../components/ui/VerificationBadge'
import { PillButton } from '../../components/ui/PillButton'
import { doctorTheme as t } from '../../constants/doctorTheme'

function LogoutModal({ visible, onClose, onConfirm }) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }} onPress={onClose}>
        <Pressable onPress={() => {}}>
          <View style={{
            backgroundColor: t.bg.secondary, borderRadius: t.radius.card,
            padding: 24, width: 300, alignItems: 'center',
            shadowColor: t.shadow.floating, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 24, elevation: 12,
          }}>
            <View style={{
              width: 56, height: 56, borderRadius: 16,
              backgroundColor: t.semantic.errorDim,
              alignItems: 'center', justifyContent: 'center', marginBottom: 16,
            }}>
              <Ionicons name="log-out-outline" size={28} color={t.semantic.error} />
            </View>
            <Text style={{ ...t.typography.h2, color: t.text.primary, textAlign: 'center', marginBottom: 8 }}>
              Log Out?
            </Text>
            <Text style={{ ...t.typography.body, color: t.text.secondary, textAlign: 'center', marginBottom: 24 }}>
              You will need to sign in again to access your account.
            </Text>
            <View style={{ width: '100%', gap: 10 }}>
              <PillButton label="Log Out" onPress={onConfirm} />
              <Pressable onPress={onClose} style={{ alignItems: 'center', paddingVertical: 10 }}>
                <Text style={{ ...t.typography.bodySemi, color: t.text.secondary }}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

export default function PatientProfile() {
  const { user, role, verificationStatus, logout } = useAuthStore()
  const [showLogout, setShowLogout] = useState(false)

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    logout()
    setShowLogout(false)
    router.replace('/onboarding/welcome')
  }

  const MENU_ITEMS = [
    { icon: 'person-outline',       label: 'Edit Profile',     action: () => {} },
    { icon: 'shield-checkmark-outline', label: 'Privacy & Security', action: () => {} },
    { icon: 'notifications-outline', label: 'Notifications',   action: () => {} },
    { icon: 'language-outline',     label: 'Language',         action: () => {} },
    { icon: 'help-circle-outline',  label: 'Help & Support',   action: () => {} },
    { icon: 'document-text-outline', label: 'Terms & Privacy', action: () => {} },
  ]

  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 52 }}>
        {/* Avatar + Name */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={{
            width: 80, height: 80, borderRadius: 24,
            backgroundColor: t.brand.tealDim,
            borderWidth: 2, borderColor: t.brand.teal + '60',
            alignItems: 'center', justifyContent: 'center', marginBottom: 12,
          }}>
            <Text style={{ ...t.typography.display, color: t.brand.teal, fontSize: 28 }}>
              {user?.avatarInitials ?? '?'}
            </Text>
          </View>
          <Text style={{ ...t.typography.h2, color: t.text.primary }}>{user?.name ?? 'Guest'}</Text>
          <Text style={{ ...t.typography.body, color: t.text.secondary, marginTop: 2 }}>{user?.email}</Text>
          <View style={{ marginTop: 8, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <View style={{ backgroundColor: t.brand.tealDim, paddingHorizontal: 12, paddingVertical: 4, borderRadius: t.radius.chip }}>
              <Text style={{ ...t.typography.bodySemi, fontSize: 12, color: t.brand.teal }}>{role}</Text>
            </View>
            <VerificationBadge status={verificationStatus} size="sm" />
          </View>
        </View>

        {/* Menu items */}
        <View style={{
          backgroundColor: t.bg.secondary, borderWidth: 1, borderColor: t.border.subtle,
          borderRadius: t.radius.card, overflow: 'hidden', marginBottom: 24,
        }}>
          {MENU_ITEMS.map((item, i) => (
            <Pressable key={item.label} onPress={item.action}>
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 14,
                paddingHorizontal: 16, paddingVertical: 14,
                borderBottomWidth: i < MENU_ITEMS.length - 1 ? 1 : 0,
                borderBottomColor: t.border.subtle,
              }}>
                <Ionicons name={item.icon} size={20} color={t.text.secondary} />
                <Text style={{ ...t.typography.bodyMed, color: t.text.primary, flex: 1 }}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={t.text.muted} />
              </View>
            </Pressable>
          ))}
        </View>

        {/* Logout */}
        <Pressable onPress={() => setShowLogout(true)}>
          <View style={{
            backgroundColor: t.semantic.errorDim, borderRadius: t.radius.card,
            paddingVertical: 14, alignItems: 'center',
            flexDirection: 'row', justifyContent: 'center', gap: 8,
          }}>
            <Ionicons name="log-out-outline" size={20} color={t.semantic.error} />
            <Text style={{ ...t.typography.bodySemi, color: t.semantic.error }}>Log Out</Text>
          </View>
        </Pressable>

        {/* App version */}
        <Text style={{ ...t.typography.caption, color: t.text.muted, textAlign: 'center', marginTop: 20 }}>
          SwasthAI v1.0.0 · Powered by AI
        </Text>
      </ScrollView>

      <LogoutModal visible={showLogout} onClose={() => setShowLogout(false)} onConfirm={handleLogout} />
    </View>
  )
}
