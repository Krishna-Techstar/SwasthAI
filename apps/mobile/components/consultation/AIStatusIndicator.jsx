import { useRef, useEffect } from 'react'
import { View, Text, Animated, Easing } from 'react-native'
import { doctorTheme as t } from '../../constants/doctorTheme'

const STATUS_CONFIG = {
  idle:       { color: t.text.muted,        label: 'AI Ready',       icon: '○' },
  listening:  { color: t.semantic.success,   label: 'Listening',      icon: '●' },
  processing: { color: t.brand.teal,         label: 'Processing',     icon: '◉' },
  generating: { color: '#A78BFA',            label: 'Generating',     icon: '◎' },
  error:      { color: t.semantic.error,     label: 'Error',          icon: '✕' },
}

export function AIStatusIndicator({ status = 'idle', label }) {
  const pulseAnim = useRef(new Animated.Value(1)).current
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.idle

  useEffect(() => {
    if (status === 'listening' || status === 'processing' || status === 'generating') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.4, duration: 600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ])
      )
      loop.start()
      return () => loop.stop()
    } else {
      pulseAnim.setValue(1)
    }
  }, [status, pulseAnim])

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: config.color + '18', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}>
      <Animated.View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: config.color, opacity: pulseAnim }} />
      <Text style={{ ...t.typography.bodySemi, fontSize: 11, color: config.color }}>
        {label || config.label}
      </Text>
    </View>
  )
}
