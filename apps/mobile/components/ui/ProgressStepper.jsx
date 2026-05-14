// apps/mobile/components/ui/ProgressStepper.jsx
import { View, Text, Animated } from 'react-native'
import { useEffect, useRef } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { doctorTheme as t } from '../../constants/doctorTheme'

/**
 * Multi-step progress stepper
 * @param {number} currentStep - 0-indexed current step
 * @param {Array<{ label: string }>} steps
 */
export function ProgressStepper({ currentStep = 0, steps = [] }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
      {steps.map((step, i) => {
        const isDone = i < currentStep
        const isCurrent = i === currentStep
        const isLast = i === steps.length - 1

        return (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', flex: isLast ? 0 : 1 }}>
            {/* Circle */}
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: isDone
                  ? t.brand.teal
                  : isCurrent
                  ? t.brand.tealDim
                  : t.bg.tertiary,
                borderWidth: isCurrent ? 2 : 1,
                borderColor: isDone
                  ? t.brand.teal
                  : isCurrent
                  ? t.brand.teal
                  : t.border.subtle,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isDone ? (
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              ) : (
                <Text
                  style={{
                    fontFamily: t.typography.bodySemi.fontFamily,
                    fontSize: 11,
                    color: isCurrent ? t.brand.teal : t.text.muted,
                  }}
                >
                  {i + 1}
                </Text>
              )}
            </View>

            {/* Connector line */}
            {!isLast && (
              <View
                style={{
                  flex: 1,
                  height: 2,
                  backgroundColor: isDone ? t.brand.teal : t.border.subtle,
                  marginHorizontal: 4,
                  borderRadius: 1,
                }}
              />
            )}
          </View>
        )
      })}
    </View>
  )
}

/**
 * Simple progress bar (continuous)
 * @param {number} progress - 0 to 1
 */
export function ProgressBar({ progress = 0, label }) {
  const widthAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: progress,
      duration: 600,
      useNativeDriver: false,
    }).start()
  }, [progress, widthAnim])

  return (
    <View style={{ marginVertical: 8 }}>
      {label && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={{ ...t.typography.caption, color: t.text.secondary }}>{label}</Text>
          <Text style={{ ...t.typography.caption, color: t.brand.teal }}>{Math.round(progress * 100)}%</Text>
        </View>
      )}
      <View style={{ height: 4, borderRadius: 2, backgroundColor: t.bg.tertiary, overflow: 'hidden' }}>
        <Animated.View
          style={{
            height: '100%',
            borderRadius: 2,
            backgroundColor: t.brand.teal,
            width: widthAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          }}
        />
      </View>
    </View>
  )
}
