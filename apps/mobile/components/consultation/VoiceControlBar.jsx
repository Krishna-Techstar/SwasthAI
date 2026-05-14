import { useRef, useEffect } from 'react'
import { View, Text, Pressable, Animated, Easing } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { doctorTheme as t } from '../../constants/doctorTheme'
import { useConsultationStore } from '../../store/consultationStore'

function WaveformBar({ index, isActive }) {
  const height = useRef(new Animated.Value(4)).current

  useEffect(() => {
    if (isActive) {
      const loop = Animated.loop(Animated.sequence([
        Animated.timing(height, { toValue: 8 + Math.random() * 16, duration: 120 + Math.random() * 100, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
        Animated.timing(height, { toValue: 4 + Math.random() * 6, duration: 120 + Math.random() * 100, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      ]))
      loop.start()
      return () => loop.stop()
    } else {
      Animated.timing(height, { toValue: 4, duration: 300, useNativeDriver: false }).start()
    }
  }, [isActive, height])

  return (
    <Animated.View style={{ width: 3, borderRadius: 1.5, backgroundColor: isActive ? t.brand.teal : t.text.muted + '40', height }} />
  )
}

export function VoiceControlBar({ onToggleListening, onToggleBodyMap, bodyMapVisible }) {
  const isListening = useConsultationStore((s) => s.isListening)

  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: t.space.base, paddingVertical: t.space.sm,
      backgroundColor: t.bg.secondary,
      borderTopWidth: 1, borderTopColor: t.border.subtle,
      gap: t.space.sm,
    }}>
      {/* Mic button */}
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          onToggleListening?.()
        }}
        style={{
          width: 44, height: 44, borderRadius: 22,
          backgroundColor: isListening ? t.semantic.error : t.brand.teal,
          alignItems: 'center', justifyContent: 'center',
          shadowColor: isListening ? t.semantic.error : t.brand.teal,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
        }}
      >
        <Ionicons name={isListening ? 'stop' : 'mic'} size={22} color="#FFFFFF" />
      </Pressable>

      {/* Waveform */}
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2, height: 28 }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <WaveformBar key={i} index={i} isActive={isListening} />
        ))}
      </View>

      {/* Speaker indicator */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8 }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isListening ? t.semantic.success : t.text.muted }} />
        <Text style={{ ...t.typography.caption, color: isListening ? t.semantic.success : t.text.muted }}>
          {isListening ? 'LIVE' : 'OFF'}
        </Text>
      </View>

      {/* Body map toggle */}
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          onToggleBodyMap?.()
        }}
        style={{
          width: 40, height: 40, borderRadius: 12,
          backgroundColor: bodyMapVisible ? t.brand.teal + '20' : t.bg.tertiary,
          alignItems: 'center', justifyContent: 'center',
          borderWidth: 1, borderColor: bodyMapVisible ? t.brand.teal + '40' : 'transparent',
        }}
      >
        <Ionicons name="body-outline" size={20} color={bodyMapVisible ? t.brand.teal : t.text.secondary} />
      </Pressable>
    </View>
  )
}
