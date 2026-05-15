import { View, Text, Pressable, Alert } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useAuthStore } from '../../store/authStore'
import { useNotificationStore } from '../../store/notificationStore'
import { doctorTheme as t } from '../../constants/doctorTheme'

export function DoctorTopBar() {
  const user = useAuthStore((s) => s.user)
  const unreadCount = useNotificationStore((s) => s.unreadCount)

  const initials =
    user?.name
      ?.split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ?? 'DR'

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: 64,
        paddingHorizontal: t.space.base,
        gap: t.space.sm,
        backgroundColor: t.bg.primary,
      }}
    >
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          router.push('/(doctor)/settings/profile')
        }}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: t.bg.tertiary,
          borderWidth: 1.5,
          borderColor: t.brand.tealGlow,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <Text
          style={[
            t.typography.bodySemi,
            {
              fontSize: 13,
              color: t.brand.teal,
            },
          ]}
        >
          {initials}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          router.push('/(doctor)/patients/search')
        }}
        style={{
          flex: 1,
          height: 40,
          borderRadius: 20,
          backgroundColor: t.bg.tertiary,
          borderWidth: 1,
          borderColor: t.border.subtle,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 14,
          gap: t.space.sm,
        }}
      >
        <Ionicons name="search-outline" size={16} color={t.text.muted} />
        <Text style={[t.typography.body, { fontSize: 13, color: t.text.muted }]}>
          Search patients...
        </Text>
      </Pressable>

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          router.push('/(doctor)/consultation/new')
        }}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: t.bg.tertiary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="camera-outline" size={20} color={t.text.secondary} />
      </Pressable>

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          router.push('/(doctor)/notifications')
        }}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: t.bg.tertiary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="notifications-outline" size={20} color={t.text.secondary} />
        {unreadCount > 0 && (
          <View
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: t.semantic.error,
              borderWidth: 1.5,
              borderColor: t.bg.primary,
            }}
          />
        )}
      </Pressable>
    </View>
  )
}
