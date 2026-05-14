// apps/mobile/components/chat/ConversationItem.jsx
import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { AvatarOnlineDot } from './OnlineIndicator'
import { doctorTheme as t } from '../../constants/doctorTheme'

const ROLE_ICONS = {
  doctor:   { name: 'stethoscope', lib: 'ionicon', icon: '🩺' },
  patient:  { icon: '👤' },
  lab:      { icon: '🧪' },
  pharmacy: { icon: '💊' },
}

const TYPE_RING_COLOR = {
  DOCTOR_DOCTOR:   '#7C3AED',  // deep purple
  DOCTOR_PATIENT:  '#8B5CF6',  // brand purple
  DOCTOR_LAB:      '#F59E0B',  // amber
  DOCTOR_PHARMACY: '#22C55E',  // green
  GROUP:           '#3B82F6',  // blue
}

function formatRelativeTime(iso) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins   = Math.floor(diffMs / 60000)
  if (mins < 1)  return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

export function ConversationItem({ conversation, onPress }) {
  const { type, participants, lastMessage, lastMessageAt, unreadCount } = conversation
  const other      = participants[0]
  const ringColor  = TYPE_RING_COLOR[type] ?? t.brand.teal
  const roleIcon   = ROLE_ICONS[other?.role]?.icon ?? '💬'
  const hasUnread  = unreadCount > 0

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: t.space.base,
        paddingVertical: 13,
        backgroundColor: pressed ? t.bg.tertiary : t.bg.secondary,
        borderBottomWidth: 1,
        borderBottomColor: t.border.subtle,
      })}
    >
      {/* Avatar with ring + online dot */}
      <View style={{ marginRight: t.space.md, position: 'relative' }}>
        <View style={{
          width: 48, height: 48, borderRadius: 24,
          backgroundColor: other.avatarColor + '20',
          borderWidth: 2, borderColor: ringColor + '60',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ fontFamily: t.typography.bodySemi.fontFamily, fontSize: 15, color: ringColor }}>
            {other.avatarInitials}
          </Text>
        </View>

        {/* Role badge — bottom right of avatar */}
        <View style={{
          position: 'absolute', bottom: -2, right: -2,
          width: 18, height: 18, borderRadius: 9,
          backgroundColor: t.bg.secondary,
          borderWidth: 1, borderColor: t.border.subtle,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ fontSize: 10 }}>{roleIcon}</Text>
        </View>

        {/* Online dot */}
        <AvatarOnlineDot online={other.online} />
      </View>

      {/* Content */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
          <Text
            style={{ ...t.typography.bodySemi, color: t.text.primary, flex: 1, fontSize: 14 }}
            numberOfLines={1}
          >
            {other.name}
          </Text>
          <Text style={{ ...t.typography.caption, color: t.text.muted }}>
            {lastMessageAt ? formatRelativeTime(lastMessageAt) : ''}
          </Text>
        </View>

        {/* Specialty + status */}
        {other.specialty && (
          <Text style={{ ...t.typography.caption, color: t.brand.teal, marginBottom: 2 }}>
            {other.specialty}
            {other.online
              ? '  ● online'
              : other.lastSeen
              ? `  · ${other.lastSeen}`
              : ''}
          </Text>
        )}

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={{
              ...t.typography.body,
              color: hasUnread ? t.text.primary : t.text.muted,
              fontSize: 12,
              flex: 1,
              fontFamily: hasUnread ? t.typography.bodyMed.fontFamily : t.typography.body.fontFamily,
            }}
            numberOfLines={1}
          >
            {lastMessage ?? ''}
          </Text>

          {/* Unread badge */}
          {hasUnread && (
            <View style={{
              backgroundColor: t.brand.teal,
              borderRadius: 10,
              minWidth: 20, height: 20,
              alignItems: 'center', justifyContent: 'center',
              paddingHorizontal: 6, marginLeft: 8,
            }}>
              <Text style={{ fontFamily: t.typography.bodySemi.fontFamily, fontSize: 11, color: '#FFFFFF' }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  )
}
