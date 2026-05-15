import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import {
  View,
  Text,
  Pressable,
  FlatList,
  RefreshControl,
  Animated,
  Easing,
  Dimensions,
  StyleSheet,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { doctorTheme as t } from '../../constants/doctorTheme'
import { queryKeys } from '../../services/queryClient'
import { userService } from '../../services/userService'

const { width: SCREEN_W } = Dimensions.get('window')
const CARD_CONTENT_W = SCREEN_W - t.space.base * 2

const CARD_W = 110

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(d) {
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()
}
function greetingWord(hour) {
  if (hour < 12) return 'Good Morning,'
  if (hour < 17) return 'Good Afternoon,'
  return 'Good Evening,'
}

function buildIntelCards(dashboard) {
  const stats = dashboard?.stats ?? []
  const firstQueue = dashboard?.queue?.[0]
  const todayPatients = stats.find((item) => item.key === 'todayPatients')?.value ?? 0
  const aiQueue = stats.find((item) => item.key === 'aiQueue')?.value ?? 0
  const reportReviews = stats.find((item) => item.key === 'reportReviews')?.value ?? 0

  return [
    {
      id: 'next_patient',
      label: firstQueue ? 'NEXT APPOINTMENT' : 'CARE QUEUE',
      dotType: firstQueue ? 'live' : 'pulse',
      dotColor: firstQueue ? '#22C55E' : '#8B5CF6',
      headline: firstQueue ? `${firstQueue.name} - ${firstQueue.reason ?? firstQueue.type}` : 'No live appointments returned by API',
      barLabel: 'Today queue load',
      barValue: Math.min(todayPatients / 20, 1),
      barColor: '#8B5CF6',
      footer: firstQueue ? new Date(firstQueue.scheduledStart).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Waiting for backend data',
      footerIcon: firstQueue ? 'time-outline' : 'information-circle-outline',
      accentColor: '#8B5CF6',
    },
    {
      id: 'ai_brief',
      label: 'AI QUEUE',
      dotType: aiQueue ? 'live' : 'pulse',
      dotColor: aiQueue ? '#FACC15' : '#22C55E',
      headline: `${aiQueue} AI jobs queued or running`,
      barLabel: 'Inference queue pressure',
      barValue: Math.min(aiQueue / 10, 1),
      barColor: aiQueue ? '#FACC15' : '#22C55E',
      footer: 'Sourced from ai_processing_jobs',
      footerIcon: 'sparkles-outline',
      accentColor: '#22C55E',
    },
    {
      id: 'report_reviews',
      label: 'REPORT REVIEWS',
      dotType: reportReviews ? 'live' : 'pulse',
      dotColor: reportReviews ? '#FACC15' : '#22C55E',
      headline: `${reportReviews} SOAP reports need review`,
      barLabel: 'Review workload',
      barValue: Math.min(reportReviews / 10, 1),
      barColor: '#8B5CF6',
      footer: 'Draft, AI-generated, and under-review reports',
      footerIcon: 'document-text-outline',
      accentColor: '#A78BFA',
    },
  ]
}

function buildStats(dashboard) {
  return (dashboard?.stats ?? []).map((item, index) => ({
    icon: index === 0 ? 'people-outline' : index === 1 ? 'warning-outline' : 'pulse-outline',
    value: String(item.value ?? 0),
    label: item.label,
    trend: item.trend,
    trendColor: item.value > 0 ? t.semantic.success : t.text.muted,
    color: index === 1 ? t.semantic.warning : t.brand.indigo,
  }))
}

function buildFlags(dashboard) {
  return (dashboard?.flags ?? []).map((flag, index) => ({
    label: flag.label,
    count: String(flag.count),
    color: index === 0 ? t.semantic.warning : t.brand.teal,
  }))
}

function buildQueue(dashboard) {
  return (dashboard?.queue ?? []).map((item, index) => ({
    ...item,
    initials: initials(item.name),
    statusLabel: item.statusLabel ?? item.status,
    avatarColor: [t.brand.indigo, t.semantic.warning, t.semantic.success][index % 3],
  }))
}

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || '?'
}

// ─── Animated dots ────────────────────────────────────────────────────────────

function LiveDot({ color = '#22C55E' }) {
  const scale = useRef(new Animated.Value(1)).current
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(scale, { toValue: 1.5, duration: 550, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1,   duration: 550, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]))
    loop.start()
    return () => loop.stop()
  }, [scale])
  return (
    <Animated.View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color, transform: [{ scale }] }} />
  )
}

function PulseDot({ color = '#8B5CF6' }) {
  const op = useRef(new Animated.Value(1)).current
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(op, { toValue: 0.2, duration: 700, useNativeDriver: true }),
      Animated.timing(op, { toValue: 1,   duration: 700, useNativeDriver: true }),
    ]))
    loop.start()
    return () => loop.stop()
  }, [op])
  return (
    <Animated.View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color, opacity: op }} />
  )
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ value, color, label }) {
  const widthAnim = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: value,
      duration: 900,
      delay: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start()
  }, [value, widthAnim])

  return (
    <View style={{ marginTop: 10 }}>
      <Text style={{ fontSize: 10, color: 'rgba(196,181,253,0.6)', fontFamily: t.typography.caption.fontFamily, marginBottom: 6, letterSpacing: 0.4 }}>
        {label}
      </Text>
      {/* Track */}
      <View style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
        <Animated.View
          style={{
            height: '100%',
            borderRadius: 2,
            backgroundColor: color,
            width: widthAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 4,
          }}
        />
      </View>
      {/* Percentage */}
      <Text style={{ fontSize: 10, color: color, marginTop: 4, fontFamily: t.typography.bodySemi.fontFamily, alignSelf: 'flex-end' }}>
        {Math.round(value * 100)}%
      </Text>
    </View>
  )
}

// ─── Single Intelligence Card ─────────────────────────────────────────────────

function IntelCard({ card }) {
  return (
    <View
      style={{
        width: CARD_CONTENT_W,
        borderRadius: t.radius.card,
        backgroundColor: '#140D2E',
        borderWidth: 1,
        borderColor: card.accentColor + '40',
        padding: t.space.base,
        overflow: 'hidden',
      }}
    >
      {/* Subtle gradient overlay */}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: card.accentColor + '0D', borderRadius: t.radius.card }]} />

      {/* Label + Dot row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <Text style={{ fontSize: 10, letterSpacing: 1.1, color: 'rgba(196,181,253,0.65)', fontFamily: t.typography.bodySemi.fontFamily }}>
          {card.label}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          {card.dotType === 'live'
            ? <LiveDot color={card.dotColor} />
            : <PulseDot color={card.dotColor} />}
          <Text style={{ fontSize: 10, color: card.dotColor, fontFamily: t.typography.bodySemi.fontFamily }}>
            {card.dotType === 'live' ? 'LIVE' : 'PULSE'}
          </Text>
        </View>
      </View>

      {/* Headline */}
      <Text style={{ fontSize: 17, fontFamily: t.typography.h2.fontFamily, color: '#FFFFFF', lineHeight: 24 }}>
        {card.headline}
      </Text>

      {/* Progress Bar */}
      <ProgressBar value={card.barValue} color={card.barColor} label={card.barLabel} />

      {/* Footer */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}>
        <Ionicons name={card.footerIcon} size={12} color="rgba(196,181,253,0.55)" />
        <Text style={{ fontSize: 11, color: 'rgba(196,181,253,0.55)', fontFamily: t.typography.body.fontFamily, flex: 1 }}>
          {card.footer}
        </Text>
      </View>
    </View>
  )
}

// ─── Intelligence Carousel (5 cards, auto-cycles every 5 s) ─────────────────

function IntelCarousel({ cards }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const fadeAnim    = useRef(new Animated.Value(1)).current
  const slideAnim   = useRef(new Animated.Value(0)).current
  const timerRef    = useRef(null)

  const activeCards = cards?.length ? cards : buildIntelCards(null)

  const advance = useCallback((next) => {
    // Slide out + fade out
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 0, duration: 280, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -30, duration: 280, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start(() => {
      setActiveIdx(next)
      slideAnim.setValue(30)
      // Slide in + fade in
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start()
    })
  }, [fadeAnim, slideAnim])

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActiveIdx(prev => {
        const next = (prev + 1) % activeCards.length
        advance(next)
        return prev // state update happens inside advance callback
      })
    }, 5000)
    return () => clearInterval(timerRef.current)
  }, [advance, activeCards.length])

  const handleDot = (idx) => {
    clearInterval(timerRef.current)
    advance(idx)
    timerRef.current = setInterval(() => {
      setActiveIdx(prev => {
        const next = (prev + 1) % activeCards.length
        advance(next)
        return prev
      })
    }, 5000)
  }

  return (
    <View style={{ marginTop: t.space.md, marginBottom: t.space.sm }}>
      {/* Card */}
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
        <IntelCard card={activeCards[activeIdx] ?? activeCards[0]} />
      </Animated.View>

      {/* Dot indicators */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 10 }}>
        {activeCards.map((_, i) => (
          <Pressable key={i} onPress={() => handleDot(i)}>
            <View style={{
              width: i === activeIdx ? 18 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: i === activeIdx ? t.brand.teal : t.border.subtle,
              transition: 'width 0.3s',
            }} />
          </Pressable>
        ))}
      </View>
    </View>
  )
}

// ─── Infinite horizontal marquee ──────────────────────────────────────────────

function InfiniteMarquee({ items }) {
  const translateX = useRef(new Animated.Value(0)).current
  const chips = items?.length ? [...items, ...items, ...items] : []
  const totalWidth = CARD_W * Math.max(items?.length ?? 0, 1)
  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(translateX, {
        toValue: -totalWidth,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    )
    anim.start()
    return () => anim.stop()
  }, [totalWidth, translateX])

  return (
    <View style={{ height: 148, overflow: 'hidden', marginBottom: t.space.md }}>
      <Animated.View style={{ flexDirection: 'row', paddingVertical: 4, transform: [{ translateX }] }}>
        {chips.map((chip, i) => (
          <View
            key={i}
            style={{
              width: CARD_W - 8, marginRight: 8,
              backgroundColor: t.bg.secondary,
              borderRadius: t.radius.card,
              borderWidth: 1, borderColor: t.border.subtle,
              paddingVertical: 14, paddingHorizontal: 12,
              shadowColor: 'rgba(15,23,42,0.05)',
              shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2,
            }}
          >
            <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: chip.color + '18', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
              <Ionicons name={chip.icon} size={14} color={chip.color} />
            </View>
            <Text style={{ ...t.typography.chipValue, fontSize: 20, color: t.text.primary, lineHeight: 24 }}>{chip.value}</Text>
            <Text style={{ ...t.typography.body, color: t.text.secondary, marginTop: 1, fontSize: 10 }}>{chip.label}</Text>
            <Text style={{ ...t.typography.bodyMed, color: chip.trendColor, marginTop: 3, fontSize: 10 }}>{chip.trend}</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  )
}

// ─── Queue skeleton ────────────────────────────────────────────────────────────

function QueueSkeleton() {
  const shimmer = useRef(new Animated.Value(0.35)).current
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(shimmer, { toValue: 0.85, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(shimmer, { toValue: 0.35, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]))
    loop.start()
    return () => loop.stop()
  }, [shimmer])
  return (
    <View style={{ gap: t.space.sm }}>
      {[0, 1, 2].map(k => (
        <Animated.View key={k} style={{ height: 80, borderRadius: t.radius.card, backgroundColor: t.bg.tertiary, borderWidth: 1, borderColor: t.border.subtle, opacity: shimmer }} />
      ))}
    </View>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ item }) {
  if (item.status === 'in_consult') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: t.semantic.successDim, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: t.semantic.success }} />
        <Text style={{ ...t.typography.bodyMed, fontSize: 11, color: t.semantic.success }}>{item.statusLabel}</Text>
      </View>
    )
  }
  if (item.status === 'drug_flag') {
    return (
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        {item.urgent && (
          <View style={{ backgroundColor: t.semantic.warningDim, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
            <Text style={{ ...t.typography.bodySemi, fontSize: 10, color: t.semantic.warning }}>⚠ Drug flag</Text>
          </View>
        )}
        <View style={{ backgroundColor: t.semantic.errorDim, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
          <Text style={{ ...t.typography.bodySemi, fontSize: 10, color: t.semantic.error }}>Urgent</Text>
        </View>
      </View>
    )
  }
  return (
    <View style={{ backgroundColor: t.bg.tertiary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
      <Text style={{ ...t.typography.bodyMed, fontSize: 11, color: t.text.secondary }}>{item.statusLabel}</Text>
    </View>
  )
}

// ─── Queue row ────────────────────────────────────────────────────────────────

function QueueRow({ item, index }) {
  const fade = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, delay: index * 60, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start()
  }, [fade, index])

  return (
    <Animated.View style={{ opacity: fade }}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          router.push({ pathname: '/(doctor)/patients/[id]', params: { id: item.id } })
        }}
        style={{
          backgroundColor: t.bg.secondary,
          borderWidth: 1, borderColor: t.border.subtle,
          borderRadius: t.radius.card,
          paddingVertical: 14, paddingHorizontal: t.space.base,
          marginBottom: t.space.sm,
          shadowColor: 'rgba(15,23,42,0.05)',
          shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: item.avatarColor + '22', alignItems: 'center', justifyContent: 'center', marginRight: t.space.md }}>
            <Text style={{ ...t.typography.bodySemi, fontSize: 13, color: item.avatarColor }}>{item.initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: t.space.sm }}>
              <Text style={{ ...t.typography.bodySemi, fontSize: 14, color: t.text.primary, flex: 1 }}>{item.name}</Text>
              <StatusBadge item={item} />
            </View>
            <Text style={{ ...t.typography.body, color: t.text.secondary, marginTop: 3 }}>
              {[item.type, item.reason].filter(Boolean).join(' - ') || 'Appointment from API'}
            </Text>
            {item.waitTime && (
              <Text style={{ ...t.typography.caption, color: t.text.muted, marginTop: 4 }}>{item.waitTime}</Text>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function DoctorHomeScreen() {
  const user = useAuthStore(s => s.user)
  const [refreshing,   setRefreshing]   = useState(false)
  const dashboardQuery = useQuery({
    queryKey: queryKeys.myDashboard,
    queryFn: userService.dashboard,
    refetchInterval: 30_000,
  })
  const dashboard = dashboardQuery.data
  const dashboardStats = useMemo(() => buildStats(dashboard), [dashboard])
  const dashboardFlags = useMemo(() => buildFlags(dashboard), [dashboard])
  const dashboardQueue = useMemo(() => buildQueue(dashboard), [dashboard])
  const intelCards = useMemo(() => buildIntelCards(dashboard), [dashboard])

  const now  = useMemo(() => new Date(), [])
  const hour = now.getHours()
  const displayName = useMemo(() => {
    const raw = user?.name?.trim()
    if (!raw) return 'Dr. Guest'
    return /^dr\.?\s/i.test(raw) ? raw : `Dr. ${raw}`
  }, [user?.name])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    dashboardQuery.refetch().finally(() => setRefreshing(false))
  }, [dashboardQuery])

  const ListHeader = (
    <View style={{ paddingBottom: t.space.base }}>

      {/* Date */}
      <Text style={{ ...t.typography.caption, color: t.text.muted, marginBottom: 6, letterSpacing: 0.8 }}>
        {formatDate(now)}
      </Text>

      {/* Greeting */}
      <Text style={{ ...t.typography.h1, color: t.text.primary, fontSize: 26 }}>
        {greetingWord(hour)}
      </Text>
      <Text style={{ ...t.typography.display, color: t.brand.teal, marginBottom: t.space.md }}>
        {displayName}
      </Text>

      {/* ── Intelligence Cards Carousel ── */}
      <IntelCarousel cards={intelCards} />

      {/* Stat marquee */}
      <InfiniteMarquee items={dashboardStats} />

      {/* Preventive Flags */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: t.space.lg, marginBottom: t.space.sm }}>
        <Text style={{ ...t.typography.h3, color: t.text.primary }}>Preventive Flags</Text>
        <Pressable onPress={() => Haptics.selectionAsync()}>
          <Text style={{ ...t.typography.link, color: t.brand.teal }}>View all →</Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space.sm, marginBottom: t.space.lg }}>
        {dashboardFlags.length ? dashboardFlags.map(flag => (
          <View key={flag.label} style={{
            flexDirection: 'row', alignItems: 'center', gap: 6,
            backgroundColor: t.bg.secondary, borderWidth: 1, borderColor: t.border.subtle,
            borderRadius: t.radius.chip, paddingVertical: 8, paddingHorizontal: 12,
          }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: flag.color }} />
            <Text style={{ ...t.typography.bodyMed, fontSize: 12, color: t.text.primary }}>
              {flag.label} · <Text style={{ color: t.text.secondary }}>{flag.count}</Text>
            </Text>
          </View>
        )) : (
          <Text style={{ ...t.typography.body, color: t.text.muted }}>No preventive flags returned by API.</Text>
        )}
      </View>

      {/* Queue header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.space.sm }}>
        <Text style={{ ...t.typography.h3, color: t.text.primary }}>Today&apos;s Queue</Text>
        <View style={{ backgroundColor: t.brand.tealDim, paddingHorizontal: 10, paddingVertical: 4, borderRadius: t.radius.chip }}>
          <Text style={{ ...t.typography.bodySemi, fontSize: 12, color: t.brand.teal }}>{dashboardQueue.length} waiting</Text>
        </View>
      </View>
    </View>
  )

  return (
    <FlatList
      data={dashboardQuery.isLoading ? [] : dashboardQueue}
      keyExtractor={row => row.id}
      renderItem={({ item, index }) => <QueueRow item={item} index={index} />}
      ListHeaderComponent={
        <View style={{ paddingHorizontal: t.space.base, paddingTop: t.space.md }}>
          {ListHeader}
          {dashboardQuery.isLoading && <QueueSkeleton />}
        </View>
      }
      style={{ backgroundColor: '#FAFAFC' }}
      contentContainerStyle={{ paddingBottom: t.space.xxl + 16 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={t.brand.teal}
          colors={[t.brand.teal]}
        />
      }
    />
  )
}

