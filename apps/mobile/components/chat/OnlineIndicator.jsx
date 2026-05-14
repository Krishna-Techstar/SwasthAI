// apps/mobile/components/chat/OnlineIndicator.jsx
import { View, Text } from 'react-native'
import { doctorTheme as t } from '../../constants/doctorTheme'

/**
 * @param {'online'|'offline'} status
 * @param {string} lastSeen  - e.g. "12m ago"
 * @param {'sm'|'md'} size
 */
export function OnlineIndicator({ status, lastSeen, size = 'md' }) {
  const isOnline = status === 'online'
  const dotSize  = size === 'sm' ? 8 : 10

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <View
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: isOnline ? t.semantic.success : t.text.muted,
        }}
      />
      <Text style={{ ...t.typography.caption, color: t.text.muted }}>
        {isOnline ? 'Online' : lastSeen ? `Last seen ${lastSeen}` : 'Offline'}
      </Text>
    </View>
  )
}

/** Tiny overlay dot for avatar bottom-right */
export function AvatarOnlineDot({ online }) {
  if (!online) return null
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 11,
        height: 11,
        borderRadius: 6,
        backgroundColor: t.semantic.success,
        borderWidth: 2,
        borderColor: t.bg.secondary,
      }}
    />
  )
}
