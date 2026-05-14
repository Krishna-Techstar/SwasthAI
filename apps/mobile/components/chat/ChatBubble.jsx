// apps/mobile/components/chat/ChatBubble.jsx
import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ClinicalAttachment } from './ClinicalAttachment'
import { doctorTheme as t } from '../../constants/doctorTheme'

const CLINICAL_TYPES = ['PATIENT_CARD', 'PRESCRIPTION', 'LAB_REPORT', 'CLINICAL_NOTE', 'ICD_CODE']

// ── Tick / Read Receipts ──────────────────────────────────────────────────────

function StatusTick({ status }) {
  if (status === 'sending') {
    return <Ionicons name="time-outline" size={11} color="rgba(155,155,175,0.7)" />
  }
  if (status === 'sent') {
    return <Ionicons name="checkmark-outline" size={11} color="rgba(155,155,175,0.7)" />
  }
  if (status === 'delivered') {
    return <Ionicons name="checkmark-done-outline" size={11} color="rgba(155,155,175,0.7)" />
  }
  if (status === 'read') {
    return <Ionicons name="checkmark-done-outline" size={11} color={t.brand.teal} />
  }
  if (status === 'failed') {
    return <Ionicons name="alert-circle-outline" size={11} color={t.semantic.error} />
  }
  return null
}

function formatTime(iso) {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

// ── Emoji Reactions row ────────────────────────────────────────────────────────

function ReactionsRow({ reactions, myUserId = 'me', onReact }) {
  if (!reactions?.length) return null
  const grouped = {}
  reactions.forEach(({ emoji, userId }) => {
    if (!grouped[emoji]) grouped[emoji] = { emoji, count: 0, mine: false }
    grouped[emoji].count++
    if (userId === myUserId) grouped[emoji].mine = true
  })
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
      {Object.values(grouped).map(({ emoji, count, mine }) => (
        <Pressable
          key={emoji}
          onPress={() => onReact?.(emoji)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 3,
            paddingHorizontal: 7,
            paddingVertical: 3,
            borderRadius: 12,
            backgroundColor: mine ? t.brand.tealDim : t.bg.tertiary,
            borderWidth: 1,
            borderColor: mine ? t.brand.teal + '60' : t.border.subtle,
          }}
        >
          <Text style={{ fontSize: 13 }}>{emoji}</Text>
          {count > 1 && (
            <Text style={{ ...t.typography.caption, color: t.text.secondary, fontSize: 10 }}>{count}</Text>
          )}
        </Pressable>
      ))}
    </View>
  )
}

// ── Reply preview (inside bubble) ─────────────────────────────────────────────

function ReplyPreview({ replyTo }) {
  if (!replyTo) return null
  return (
    <View
      style={{
        borderLeftWidth: 3,
        borderLeftColor: t.brand.teal,
        paddingLeft: 8,
        marginBottom: 6,
        opacity: 0.8,
      }}
    >
      <Text style={{ ...t.typography.caption, color: t.brand.teal, marginBottom: 2 }}>
        {replyTo.senderId === 'me' ? 'You' : replyTo.senderName ?? 'Doctor'}
      </Text>
      <Text style={{ ...t.typography.caption, color: t.text.secondary }} numberOfLines={1}>
        {replyTo.content ?? '📎 Attachment'}
      </Text>
    </View>
  )
}

// ── Main ChatBubble ───────────────────────────────────────────────────────────

export function ChatBubble({ message, onLongPress, onReact }) {
  const isMine    = message.senderId === 'me'
  const isClinical = CLINICAL_TYPES.includes(message.type)

  if (isClinical) {
    return (
      <View style={{ alignItems: isMine ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
        <ClinicalAttachment type={message.type} metadata={message.metadata} onPress={() => {}} />
        <Text style={{ ...t.typography.caption, color: t.text.muted, marginTop: 3 }}>
          {formatTime(message.createdAt)}
        </Text>
      </View>
    )
  }

  const bubbleStyle = isMine
    ? {
        backgroundColor: '#8B5CF615',
        borderWidth: 1,
        borderColor: '#8B5CF640',
        borderRadius: 18,
        borderBottomRightRadius: 4,
        alignSelf: 'flex-end',
        maxWidth: '78%',
        paddingHorizontal: 14,
        paddingVertical: 10,
      }
    : {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: t.border.subtle,
        borderRadius: 18,
        borderBottomLeftRadius: 4,
        alignSelf: 'flex-start',
        maxWidth: '78%',
        paddingHorizontal: 14,
        paddingVertical: 10,
        shadowColor: t.shadow.card,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 1,
      }

  return (
    <Pressable
      onLongPress={() => onLongPress?.(message)}
      style={{ marginBottom: 6, alignItems: isMine ? 'flex-end' : 'flex-start', paddingHorizontal: t.space.base }}
    >
      <View style={bubbleStyle}>
        <ReplyPreview replyTo={message.replyTo} />

        <Text style={{ ...t.typography.body, color: t.text.primary, lineHeight: 20 }}>
          {message.content}
        </Text>

        {/* Time + status */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 4 }}>
          <Text style={{ ...t.typography.caption, color: t.text.muted, fontSize: 10 }}>
            {formatTime(message.createdAt)}
          </Text>
          {isMine && <StatusTick status={message.status} />}
        </View>
      </View>

      {/* Reactions below bubble */}
      <ReactionsRow reactions={message.reactions} onReact={(emoji) => onReact?.(message.id, emoji)} />
    </Pressable>
  )
}

// ── Date separator ────────────────────────────────────────────────────────────

export function DateSeparator({ date }) {
  const label = (() => {
    const d = new Date(date)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    if (d.toDateString() === today.toDateString()) return 'Today'
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  })()

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 12, paddingHorizontal: t.space.base }}>
      <View style={{ flex: 1, height: 1, backgroundColor: t.border.subtle }} />
      <Text style={{ ...t.typography.caption, color: t.text.muted, marginHorizontal: 12, fontSize: 11 }}>
        {label}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: t.border.subtle }} />
    </View>
  )
}

// ── Reaction Picker (shown on long press) ─────────────────────────────────────

const QUICK_EMOJIS = ['❤️', '👍', '😮', '🙏', '✅', '🚨']

export function ReactionPicker({ visible, onSelect, onClose }) {
  if (!visible) return null
  return (
    <View style={{
      position: 'absolute',
      bottom: 80,
      alignSelf: 'center',
      flexDirection: 'row',
      gap: 8,
      backgroundColor: '#FFFFFF',
      borderRadius: 32,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: t.border.subtle,
      shadowColor: t.shadow.soft,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 1,
      shadowRadius: 20,
      elevation: 12,
      zIndex: 99,
    }}>
      {QUICK_EMOJIS.map((e) => (
        <Pressable key={e} onPress={() => { onSelect(e); onClose() }}>
          <Text style={{ fontSize: 26 }}>{e}</Text>
        </Pressable>
      ))}
    </View>
  )
}
