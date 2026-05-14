// apps/mobile/components/ui/OTPInput.jsx
import { useRef, useState } from 'react'
import { View, TextInput, Pressable, Text, Animated, Easing } from 'react-native'
import { doctorTheme as t } from '../../constants/doctorTheme'

const CELL_COUNT = 6

export function OTPInput({ value = '', onChange, error }) {
  const inputRef = useRef(null)
  const shakeAnim = useRef(new Animated.Value(0)).current

  const cells = value.padEnd(CELL_COUNT, ' ').split('').slice(0, CELL_COUNT)
  const focusIndex = value.length < CELL_COUNT ? value.length : CELL_COUNT - 1

  const handleChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, CELL_COUNT)
    onChange?.(cleaned)
  }

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start()
  }

  return (
    <View>
      {/* Hidden real input */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={CELL_COUNT}
        style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }}
        autoFocus
      />

      {/* Visual cells */}
      <Pressable onPress={() => inputRef.current?.focus()}>
        <Animated.View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, transform: [{ translateX: shakeAnim }] }}>
          {cells.map((digit, i) => {
            const isFocused = i === focusIndex && value.length < CELL_COUNT
            const isFilled = digit.trim() !== ''
            return (
              <View
                key={i}
                style={{
                  width: 48,
                  height: 56,
                  borderRadius: 14,
                  backgroundColor: isFilled ? t.brand.tealDim : t.bg.tertiary,
                  borderWidth: 2,
                  borderColor: error
                    ? t.semantic.error
                    : isFocused
                    ? t.brand.teal
                    : isFilled
                    ? t.brand.lavender
                    : t.border.subtle,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: isFocused ? t.shadow.soft : 'transparent',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 1,
                  shadowRadius: 12,
                  elevation: isFocused ? 4 : 0,
                }}
              >
                <Text
                  style={{
                    fontFamily: t.typography.h1.fontFamily,
                    fontSize: 24,
                    color: isFilled ? t.text.primary : t.text.muted,
                  }}
                >
                  {isFilled ? digit : isFocused ? '|' : ''}
                </Text>
              </View>
            )
          })}
        </Animated.View>
      </Pressable>

      {/* Error */}
      {error && (
        <Text style={{ ...t.typography.caption, color: t.semantic.error, textAlign: 'center', marginTop: 10 }}>
          {error}
        </Text>
      )}
    </View>
  )
}
