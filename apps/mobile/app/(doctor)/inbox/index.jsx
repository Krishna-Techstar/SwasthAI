// apps/mobile/app/(doctor)/inbox/index.jsx
import { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useChatStore } from '../../../store/chatStore'
import { ConversationItem } from '../../../components/chat/ConversationItem'
import { doctorTheme as t } from '../../../constants/doctorTheme'

const FILTERS = [
  { key: 'ALL',              label: 'All' },
  { key: 'DOCTOR_DOCTOR',   label: 'Doctors' },
  { key: 'DOCTOR_PATIENT',  label: 'Patients' },
  { key: 'DOCTOR_LAB',      label: 'Labs' },
  { key: 'DOCTOR_PHARMACY', label: 'Pharmacy' },
]

function FilterTabs({ active, onChange }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        paddingHorizontal: t.space.base,
        paddingVertical: 10,
        gap: 8,
        backgroundColor: t.bg.secondary,
        borderBottomWidth: 1,
        borderBottomColor: t.border.subtle,
      }}
    >
      {FILTERS.map((f) => {
        const isActive = active === f.key
        return (
          <Pressable
            key={f.key}
            onPress={() => onChange(f.key)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: t.radius.chip,
              backgroundColor: isActive ? t.brand.tealDim : 'transparent',
              borderWidth: 1,
              borderColor: isActive ? t.brand.teal + '80' : t.border.subtle,
            }}
          >
            <Text
              style={{
                ...t.typography.bodyMed,
                fontSize: 12,
                color: isActive ? t.brand.teal : t.text.muted,
              }}
            >
              {f.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

function EmptyState() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
      <Ionicons name="chatbubbles-outline" size={48} color={t.text.muted} />
      <Text style={{ ...t.typography.bodySemi, color: t.text.secondary, marginTop: 16 }}>
        No conversations yet
      </Text>
      <Text style={{ ...t.typography.body, color: t.text.muted, marginTop: 4 }}>
        Tap + to start a new chat
      </Text>
    </View>
  )
}

export default function InboxScreen() {
  const { conversations, setConversations, markRead } = useChatStore()
  const [activeFilter, setActiveFilter]  = useState('ALL')
  const [search,       setSearch]        = useState('')
  const [loading,      setLoading]       = useState(true)
  const [refreshing,   setRefreshing]    = useState(false)

  useEffect(() => {
    setLoading(false)
  }, [setConversations])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    setConversations(conversations)
    setRefreshing(false)
  }, [conversations, setConversations])

  const filtered = conversations.filter((c) => {
    const matchesFilter = activeFilter === 'ALL' || c.type === activeFilter
    const otherName = c.participants[0]?.name ?? ''
    const matchesSearch = search.length === 0
      || otherName.toLowerCase().includes(search.toLowerCase())
      || c.lastMessage?.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleOpen = (conv) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    markRead(conv.id)
    router.push(`/(doctor)/inbox/${conv.id}`)
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>

      {/* Search bar */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        margin: t.space.base,
        marginBottom: 0,
        backgroundColor: t.bg.secondary,
        borderWidth: 1,
        borderColor: t.border.subtle,
        borderRadius: t.radius.input,
        paddingHorizontal: 12,
        gap: 8,
      }}>
        <Ionicons name="search-outline" size={18} color={t.text.muted} />
        <TextInput
          style={{
            flex: 1,
            height: 42,
            fontFamily: t.typography.body.fontFamily,
            fontSize: 14,
            color: t.text.primary,
          }}
          value={search}
          onChangeText={setSearch}
          placeholder="Search conversations..."
          placeholderTextColor={t.text.muted}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={t.text.muted} />
          </Pressable>
        )}
      </View>

      {/* Filter tabs */}
      <FilterTabs active={activeFilter} onChange={setActiveFilter} />

      {/* List */}
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={t.brand.teal} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => (
            <ConversationItem conversation={item} onPress={() => handleOpen(item)} />
          )}
          ListEmptyComponent={<EmptyState />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.brand.teal} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB — New conversation */}
      <Pressable
        onPress={() => router.push('/(doctor)/inbox/new')}
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: t.brand.teal,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: t.shadow.floating,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 1,
          shadowRadius: 16,
          elevation: 12,
        }}
      >
        <Ionicons name="create-outline" size={24} color="#FFFFFF" />
      </Pressable>
    </View>
  )
}
