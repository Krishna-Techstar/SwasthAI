import { useRef, useEffect } from 'react'
import { View, Text, Pressable, Animated, Easing } from 'react-native'
import { usePathname, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useConsultationStore } from '../../store/consultationStore'
import { useChatStore } from '../../store/chatStore'
import { doctorTheme as t } from '../../constants/doctorTheme'

const TABS = [
  { name: 'Home', icon: 'home', segment: 'home' },
  { name: 'Patients', icon: 'people', segment: 'patients' },
  { name: 'Analytics', icon: 'bar-chart', segment: 'analytics' },
  { name: 'Chat', icon: 'chatbubbles', segment: 'inbox' },
]

function segmentActive(pathname, segment) {
  const p = pathname.replace(/\/$/, '') || '/'
  if (segment === 'home') return p === '/home' || p.endsWith('/home')
  if (segment === 'patients') return p.includes('/patients')
  if (segment === 'analytics') return p.includes('/analytics')
  if (segment === 'inbox') return p.includes('/inbox')
  return false
}

function hrefForSegment(segment) {
  if (segment === 'home') return '/(doctor)/home'
  if (segment === 'patients') return '/(doctor)/patients'
  if (segment === 'analytics') return '/(doctor)/analytics'
  if (segment === 'inbox') return '/(doctor)/inbox'
  return '/(doctor)/home'
}

export function DoctorBottomBar() {
  const pathname    = usePathname()
  const insets      = useSafeAreaInsets()
  const isListening = useConsultationStore((s) => s.isListening)
  const totalUnread = useChatStore((s) => s.conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0))
  const fabPulse    = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (!isListening) {
      fabPulse.setValue(1)
      return undefined
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(fabPulse, {
          toValue: 0.7,
          duration: 750,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(fabPulse, {
          toValue: 1,
          duration: 750,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [isListening, fabPulse])

  const handleFAB = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    if (isListening) {
      router.push('/(doctor)/consultation/active')
    } else {
      router.push('/(doctor)/consultation/new')
    }
  }

  return (
    <View
      style={{
        backgroundColor: t.bg.secondary,
        borderTopWidth: 1,
        borderTopColor: t.border.subtle,
        paddingBottom: insets.bottom,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          minHeight: 64,
          paddingHorizontal: t.space.sm,
        }}
      >
        {TABS.slice(0, 2).map((tab) => (
          <TabItem key={tab.name} tab={tab} pathname={pathname} />
        ))}

        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingTop: 4,
          }}
        >
          <Pressable onPress={handleFAB}>
            <Animated.View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: t.brand.teal,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: -20,
                shadowColor: t.brand.teal,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.5,
                shadowRadius: 12,
                elevation: 12,
                opacity: fabPulse,
              }}
            >
              <Ionicons
                name={isListening ? 'radio-outline' : 'mic-outline'}
                size={24}
                color={t.text.inverse}
              />
            </Animated.View>
          </Pressable>
          <Text
            style={[
              t.typography.fabLabel,
              { color: isListening ? t.brand.teal : t.text.muted, marginTop: 2 },
            ]}
          >
            {isListening ? '● LIVE' : 'New Consult'}
          </Text>
        </View>

        {TABS.slice(2).map((tab) => (
          <TabItem key={tab.name} tab={tab} pathname={pathname} badge={tab.segment === 'inbox' ? totalUnread : 0} />
        ))}
      </View>
    </View>
  )
}

function TabItem({ tab, pathname, badge = 0 }) {
  const isActive = segmentActive(pathname, tab.segment)
  const iconName = isActive ? tab.icon : `${tab.icon}-outline`

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        router.push(hrefForSegment(tab.segment))
      }}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: t.space.sm,
        gap: 3,
      }}
    >
      <View style={{ position: 'relative' }}>
        <Ionicons
          name={iconName}
          size={22}
          color={isActive ? t.brand.teal : t.text.muted}
        />
        {badge > 0 && (
          <View style={{
            position: 'absolute', top: -4, right: -8,
            backgroundColor: t.semantic.error,
            borderRadius: 8, minWidth: 16, height: 16,
            alignItems: 'center', justifyContent: 'center',
            paddingHorizontal: 3,
          }}>
            <Text style={{ fontFamily: t.typography.bodySemi.fontFamily, fontSize: 9, color: '#FFFFFF' }}>
              {badge > 99 ? '99+' : badge}
            </Text>
          </View>
        )}
      </View>
          <Text
            style={[
              isActive ? t.typography.tab : t.typography.tabInactive,
              { color: isActive ? t.brand.teal : t.text.muted },
            ]}
          >
        {tab.name}
      </Text>
      {isActive && (
        <View
          style={{
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: t.brand.teal,
            marginTop: 1,
          }}
        />
      )}
    </Pressable>
  )
}
