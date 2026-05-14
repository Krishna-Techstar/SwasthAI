// apps/mobile/app/(patient)/_layout.jsx
import { View, Text, Pressable } from 'react-native'
import { Stack, router, usePathname } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { doctorTheme as t } from '../../constants/doctorTheme'
import { ROLE_TABS } from '../../constants/permissions'

const TABS = ROLE_TABS.Patient

function segmentActive(pathname, segment) {
  const p = pathname.replace(/\/$/, '') || '/'
  if (segment === 'home') return p === '/home' || p.endsWith('/home')
  return p.includes('/' + segment)
}

function PatientBottomBar() {
  const pathname = usePathname()
  const insets   = useSafeAreaInsets()

  return (
    <View style={{
      backgroundColor: t.bg.secondary, borderTopWidth: 1, borderTopColor: t.border.subtle,
      paddingBottom: insets.bottom,
    }}>
      <View style={{ flexDirection: 'row', minHeight: 56, paddingHorizontal: t.space.sm }}>
        {TABS.map((tab) => {
          const isActive = segmentActive(pathname, tab.segment)
          const iconName = isActive ? tab.icon : `${tab.icon}-outline`
          return (
            <Pressable
              key={tab.name}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                router.push(`/(patient)/${tab.segment}`)
              }}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 6, gap: 2 }}
            >
              <Ionicons name={iconName} size={22} color={isActive ? t.brand.teal : t.text.muted} />
              <Text style={{
                fontFamily: isActive ? t.typography.tab.fontFamily : t.typography.tabInactive.fontFamily,
                fontSize: 10, color: isActive ? t.brand.teal : t.text.muted,
              }}>{tab.name}</Text>
              {isActive && (
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: t.brand.teal }} />
              )}
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

export default function PatientLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="home" />
        <Stack.Screen name="reports" />
        <Stack.Screen name="appointments" />
        <Stack.Screen name="ai" />
        <Stack.Screen name="profile" />
      </Stack>
      <PatientBottomBar />
    </View>
  )
}
