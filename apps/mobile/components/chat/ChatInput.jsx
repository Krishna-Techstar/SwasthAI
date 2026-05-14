// apps/mobile/components/chat/ChatInput.jsx
import { useState, useRef, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  Animated,
  Easing,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { doctorTheme as t } from '../../constants/doctorTheme'

const ATTACH_OPTIONS = [
  { icon: 'document-text-outline', label: 'Clinical Note', type: 'CLINICAL_NOTE' },
  { icon: 'medical-outline',       label: 'Prescription',  type: 'PRESCRIPTION' },
  { icon: 'flask-outline',         label: 'Lab Report',    type: 'LAB_REPORT' },
  { icon: 'person-outline',        label: 'Patient Card',  type: 'PATIENT_CARD' },
  { icon: 'camera-outline',        label: 'Camera',        type: 'IMAGE' },
  { icon: 'folder-outline',        label: 'File',          type: 'FILE' },
]

export function ChatInput({ onSend, onTyping, replyTo, onCancelReply }) {
  const [text,          setText]          = useState('')
  const [showAttach,    setShowAttach]    = useState(false)
  const attachAnim = useRef(new Animated.Value(0)).current
  const hasText = text.trim().length > 0

  const toggleAttach = () => {
    const toValue = showAttach ? 0 : 1
    Animated.spring(attachAnim, { toValue, useNativeDriver: true, damping: 14 }).start()
    setShowAttach(!showAttach)
  }

  const handleChangeText = useCallback((val) => {
    setText(val)
    onTyping?.(val.length > 0)
  }, [onTyping])

  const handleSend = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSend?.(trimmed, 'TEXT')
    setText('')
    onTyping?.(false)
    if (showAttach) { setShowAttach(false); attachAnim.setValue(0) }
  }, [text, onSend, onTyping, showAttach, attachAnim])

  const handleAttachOption = (type) => {
    setShowAttach(false)
    attachAnim.setValue(0)
    onSend?.('', type) // parent handles clinical attachment modal
  }

  const attachSlide = attachAnim.interpolate({ inputRange: [0, 1], outputRange: [120, 0] })
  const attachOpacity = attachAnim

  return (
    <View style={{ backgroundColor: t.bg.secondary, borderTopWidth: 1, borderTopColor: t.border.subtle }}>

      {/* ── Reply preview ── */}
      {replyTo && (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: t.space.base,
          paddingTop: 8,
          gap: 8,
        }}>
          <View style={{ flex: 1, borderLeftWidth: 3, borderLeftColor: t.brand.teal, paddingLeft: 8 }}>
            <Text style={{ ...t.typography.caption, color: t.brand.teal, marginBottom: 2 }}>
              Replying to {replyTo.senderId === 'me' ? 'yourself' : replyTo.senderName ?? 'Doctor'}
            </Text>
            <Text style={{ ...t.typography.caption, color: t.text.muted }} numberOfLines={1}>
              {replyTo.content ?? '📎 Attachment'}
            </Text>
          </View>
          <Pressable onPress={onCancelReply}>
            <Ionicons name="close-outline" size={20} color={t.text.muted} />
          </Pressable>
        </View>
      )}

      {/* ── Attach sheet ── */}
      {showAttach && (
        <Animated.View style={{
          opacity: attachOpacity,
          transform: [{ translateY: attachSlide }],
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: t.space.sm,
          paddingHorizontal: t.space.base,
          paddingTop: 12,
          paddingBottom: 4,
        }}>
          {ATTACH_OPTIONS.map((opt) => (
            <Pressable
              key={opt.type}
              onPress={() => handleAttachOption(opt.type)}
              style={{
                alignItems: 'center',
                gap: 5,
                width: 72,
              }}
            >
              <View style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                backgroundColor: t.bg.tertiary,
                borderWidth: 1,
                borderColor: t.border.subtle,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Ionicons name={opt.icon} size={22} color={t.brand.teal} />
              </View>
              <Text style={{ ...t.typography.caption, color: t.text.secondary, textAlign: 'center', fontSize: 10 }}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </Animated.View>
      )}

      {/* ── Input row ── */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: t.space.base,
        paddingVertical: t.space.sm,
        gap: t.space.sm,
      }}>
        {/* Attach button */}
        <Pressable onPress={toggleAttach}>
          <View style={{
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: showAttach ? t.brand.tealDim : t.bg.tertiary,
            borderWidth: 1, borderColor: showAttach ? t.brand.teal + '60' : t.border.subtle,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Ionicons name={showAttach ? 'close-outline' : 'attach-outline'} size={20} color={showAttach ? t.brand.teal : t.text.muted} />
          </View>
        </Pressable>

        {/* Text field */}
        <TextInput
          style={{
            flex: 1,
            minHeight: 40,
            maxHeight: 110,
            backgroundColor: t.bg.tertiary,
            borderWidth: 1,
            borderColor: t.border.subtle,
            borderRadius: t.radius.input,
            paddingHorizontal: 14,
            paddingVertical: Platform.OS === 'ios' ? 10 : 8,
            fontFamily: t.typography.body.fontFamily,
            fontSize: 14,
            color: t.text.primary,
            lineHeight: 20,
          }}
          value={text}
          onChangeText={handleChangeText}
          placeholder="Type a message..."
          placeholderTextColor={t.text.muted}
          multiline
          maxLength={2000}
          returnKeyType="default"
        />

        {/* Send / Mic */}
        <Pressable onPress={hasText ? handleSend : undefined}>
          <View style={{
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: hasText ? t.brand.teal : t.bg.tertiary,
            borderWidth: 1, borderColor: hasText ? t.brand.teal : t.border.subtle,
            alignItems: 'center', justifyContent: 'center',
            shadowColor: hasText ? t.shadow.floating : 'transparent',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 1, shadowRadius: 8, elevation: hasText ? 6 : 0,
          }}>
            <Ionicons
              name={hasText ? 'send' : 'mic-outline'}
              size={18}
              color={hasText ? '#FFFFFF' : t.text.muted}
            />
          </View>
        </Pressable>
      </View>
    </View>
  )
}
