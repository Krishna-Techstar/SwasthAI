// apps/mobile/components/ui/SecurePasswordInput.jsx
import { useState, useMemo } from 'react'
import { View, Text, TextInput, Pressable, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { doctorTheme as t } from '../../constants/doctorTheme'

function getStrength(password) {
  if (!password) return { score: 0, label: '', color: t.text.muted }
  let score = 0
  if (password.length >= 8) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  if (password.length >= 12) score++

  const levels = [
    { label: '', color: t.text.muted },
    { label: 'Weak', color: t.semantic.error },
    { label: 'Fair', color: t.semantic.warning },
    { label: 'Good', color: '#F59E0B' },
    { label: 'Strong', color: t.semantic.success },
    { label: 'Excellent', color: t.brand.teal },
  ]
  return { score, ...levels[Math.min(score, levels.length - 1)] }
}

export function SecurePasswordInput({
  value = '',
  onChangeText,
  placeholder = 'Password',
  showStrength = false,
  error,
  label,
  inputRef,
  returnKeyType,
  onSubmitEditing,
  blurOnSubmit,
}) {
  const [visible, setVisible] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const strength = useMemo(() => getStrength(value), [value])

  const handleContainerPress = () => {
    inputRef?.current?.focus()
  }

  return (
    <View style={{ marginBottom: 14 }}>
      {/* Label */}
      {label && (
        <Text style={{ ...t.typography.bodyMed, color: t.text.secondary, marginBottom: 6 }}>
          {label}
        </Text>
      )}

      {/* Input container */}
      <Pressable
        onPress={handleContainerPress}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: t.bg.tertiary,
          borderWidth: 1.5,
          borderColor: error
            ? t.semantic.error
            : isFocused
            ? t.brand.teal
            : t.border.subtle,
          borderRadius: t.radius.input,
          paddingHorizontal: 14,
          gap: 10,
          shadowColor: isFocused ? t.shadow.soft : 'transparent',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 1,
          shadowRadius: 10,
          elevation: isFocused ? 3 : 0,
        }}
      >
        <Ionicons name="lock-closed-outline" size={18} color={isFocused ? t.brand.teal : t.text.muted} />

        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={t.text.muted}
          secureTextEntry={!visible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={blurOnSubmit}
          style={{
            flex: 1,
            height: 48,
            fontFamily: t.typography.body.fontFamily,
            fontSize: 14,
            color: t.text.primary,
          }}
        />

        {/* Toggle visibility */}
        <Pressable onPress={() => setVisible(!visible)} hitSlop={10}>
          <Ionicons name={visible ? 'eye-outline' : 'eye-off-outline'} size={20} color={t.text.muted} />
        </Pressable>
      </Pressable>

      {/* Strength meter */}
      {showStrength && value.length > 0 && (
        <View style={{ marginTop: 8 }}>
          <View style={{ flexDirection: 'row', gap: 3, marginBottom: 4 }}>
            {[1, 2, 3, 4, 5].map((level) => (
              <View
                key={level}
                style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: level <= strength.score ? strength.color : t.bg.tertiary,
                }}
              />
            ))}
          </View>
          <Text style={{ ...t.typography.caption, color: strength.color }}>
            {strength.label}
          </Text>
        </View>
      )}

      {/* Error */}
      {error && (
        <Text style={{ ...t.typography.caption, color: t.semantic.error, marginTop: 4 }}>
          {error}
        </Text>
      )}
    </View>
  )
}
