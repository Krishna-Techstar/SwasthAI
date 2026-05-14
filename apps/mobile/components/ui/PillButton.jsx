import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { doctorTheme as t } from '../../constants/doctorTheme'

export function PillButton({ label, onPress, disabled = false, variant = 'primary', style }) {
  const isPrimary   = variant === 'primary'
  const isSecondary = variant === 'secondary'
  const isGhost     = variant === 'ghost'

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={[
        {
          paddingHorizontal: 24,
          paddingVertical: 16,
          borderRadius: t.radius.btn,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isPrimary
            ? t.brand.teal
            : isSecondary
            ? t.brand.lavender + '40'
            : 'transparent',
          borderWidth: isGhost ? 1 : 0,
          borderColor: t.border.subtle,
          opacity: disabled ? 0.5 : 1,
          shadowColor: isPrimary ? t.shadow.floating : 'transparent',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isPrimary ? 1 : 0,
          shadowRadius: 12,
          elevation: isPrimary ? 4 : 0,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: t.typography.bodySemi.fontFamily,
          fontSize: 16,
          color: isPrimary
            ? '#FFFFFF'
            : isSecondary
            ? t.brand.teal
            : t.text.secondary,
        }}
      >
        {label}
      </Text>
    </Pressable>
  )
}
