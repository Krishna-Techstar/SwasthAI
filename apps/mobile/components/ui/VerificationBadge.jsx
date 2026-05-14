// apps/mobile/components/ui/VerificationBadge.jsx
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { doctorTheme as t } from '../../constants/doctorTheme'

const BADGE_CONFIG = {
  approved: {
    icon: 'shield-checkmark',
    label: 'Verified',
    color: t.semantic.success,
    bg: t.semantic.successDim,
  },
  review_pending: {
    icon: 'time-outline',
    label: 'Under Review',
    color: '#F59E0B',
    bg: '#F59E0B20',
  },
  doc_pending: {
    icon: 'document-attach-outline',
    label: 'Docs Needed',
    color: t.brand.teal,
    bg: t.brand.tealDim,
  },
  rejected: {
    icon: 'close-circle-outline',
    label: 'Rejected',
    color: t.semantic.error,
    bg: t.semantic.errorDim,
  },
  otp_pending: {
    icon: 'key-outline',
    label: 'Verify Phone',
    color: t.brand.teal,
    bg: t.brand.tealDim,
  },
  none: {
    icon: 'help-outline',
    label: 'Unverified',
    color: t.text.muted,
    bg: t.bg.tertiary,
  },
}

export function VerificationBadge({ status = 'none', size = 'md' }) {
  const cfg = BADGE_CONFIG[status] ?? BADGE_CONFIG.none
  const iconSize = size === 'sm' ? 12 : 16
  const fontSize = size === 'sm' ? 10 : 12

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: cfg.bg,
        paddingHorizontal: size === 'sm' ? 8 : 12,
        paddingVertical: size === 'sm' ? 3 : 5,
        borderRadius: 20,
      }}
    >
      <Ionicons name={cfg.icon} size={iconSize} color={cfg.color} />
      <Text
        style={{
          fontFamily: t.typography.bodySemi.fontFamily,
          fontSize,
          color: cfg.color,
        }}
      >
        {cfg.label}
      </Text>
    </View>
  )
}
