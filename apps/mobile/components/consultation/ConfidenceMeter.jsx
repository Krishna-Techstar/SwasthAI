import { useRef, useEffect } from 'react'
import { View, Text, Animated, Easing } from 'react-native'
import { doctorTheme as t } from '../../constants/doctorTheme'

export function ConfidenceMeter({ value = 0, size = 80, label = 'Confidence', color }) {
  const animValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: value,
      duration: 1500,
      delay: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start()
  }, [value, animValue])

  const meterColor = color || (value >= 80 ? t.semantic.success : value >= 50 ? t.semantic.warning : t.semantic.error)

  return (
    <View style={{ alignItems: 'center', gap: 6 }}>
      <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 4, borderColor: t.border.subtle, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {/* Animated fill arc (simplified as a circular progress) */}
        <Animated.View
          style={{
            position: 'absolute',
            width: size - 8,
            height: size - 8,
            borderRadius: (size - 8) / 2,
            borderWidth: 3,
            borderColor: meterColor,
            borderTopColor: 'transparent',
            transform: [{
              rotate: animValue.interpolate({
                inputRange: [0, 100],
                outputRange: ['0deg', '360deg'],
              }),
            }],
          }}
        />
        <Animated.Text style={{ ...t.typography.chipValue, fontSize: size * 0.28, color: meterColor }}>
          {Math.round(value)}
        </Animated.Text>
        <Text style={{ ...t.typography.caption, fontSize: size * 0.12, color: t.text.muted }}>%</Text>
      </View>
      <Text style={{ ...t.typography.bodyMed, fontSize: 11, color: t.text.secondary }}>{label}</Text>
    </View>
  )
}
