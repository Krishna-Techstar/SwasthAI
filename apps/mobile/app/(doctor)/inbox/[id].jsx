// apps/mobile/app/(doctor)/inbox/[id].jsx
import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Modal,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useChatStore } from '../../../store/chatStore'
import { ChatBubble, DateSeparator, ReactionPicker } from '../../../components/chat/ChatBubble'
import { ChatInput } from '../../../components/chat/ChatInput'
import { TypingIndicator } from '../../../components/chat/TypingIndicator'
import { QuickReplyChips } from '../../../components/chat/QuickReplyChips'
import { OnlineIndicator } from '../../../components/chat/OnlineIndicator'
import { mockMessages, mockConversations } from '../../../constants/mockChats'
import { doctorTheme as t } from '../../../constants/doctorTheme'

// ── Helpers ───────────────────────────────────────────────────────────────────

function isSameDay(a, b) {
  const da = new Date(a), db = new Date(b)
  return da.getFullYear() === db.getFullYear()
    && da.getMonth() === db.getMonth()
    && da.getDate() === db.getDate()
}

/**
 * Interleave messages with DateSeparator markers
 */
function buildListData(messages) {
  const out = []
  messages.forEach((msg, i) => {
    const prev = messages[i - 1]
    if (!prev || !isSameDay(prev.createdAt, msg.createdAt)) {
      out.push({ id: `sep_${msg.id}`, type: 'SEPARATOR', date: msg.createdAt })
    }
    out.push({ ...msg, type: msg.type ?? 'TEXT', _isMsgRow: true })
  })
  return out
}

// ── Action sheet (long press) ─────────────────────────────────────────────────

function MessageActionSheet({ visible, message, onClose, onReply, onCopy, onDelete }) {
  if (!visible) return null
  const isMine = message?.senderId === 'me'
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }} onPress={onClose}>
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          backgroundColor: t.bg.secondary,
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
          paddingTop: 8, paddingBottom: 32,
        }}>
          <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: t.border.subtle, alignSelf: 'center', marginBottom: 16 }} />
          {[
            { icon: 'return-up-back-outline', label: 'Reply',   action: onReply },
            { icon: 'copy-outline',           label: 'Copy',    action: onCopy },
            ...(isMine ? [{ icon: 'trash-outline', label: 'Delete', action: onDelete, danger: true }] : []),
          ].map((opt) => (
            <Pressable
              key={opt.label}
              onPress={() => { opt.action?.(); onClose() }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 24, paddingVertical: 14 }}
            >
              <Ionicons name={opt.icon} size={20} color={opt.danger ? t.semantic.error : t.text.primary} />
              <Text style={{ ...t.typography.bodyLg, color: opt.danger ? t.semantic.error : t.text.primary }}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  )
}

// ── Main Chat Screen ──────────────────────────────────────────────────────────

export default function ChatScreen() {
  const { id: convId } = useLocalSearchParams()
  const flatListRef = useRef(null)

  const { messages: allMessages, setMessages, appendMessage, sendMessage, sendTyping, typingUsers, markRead } = useChatStore()
  const msgs = allMessages[convId] ?? []

  const [loading,           setLoading]           = useState(true)
  const [replyTo,           setReplyTo]            = useState(null)
  const [showActionSheet,   setShowActionSheet]    = useState(false)
  const [selectedMsg,       setSelectedMsg]        = useState(null)
  const [showReactionPicker,setShowReactionPicker] = useState(false)
  const [showQuickReplies,  setShowQuickReplies]   = useState(false)
  const [typingTimeout,     setTypingTimeout]      = useState(null)

  // Find conversation for header info
  const conversation = useMemo(() =>
    mockConversations.find((c) => c.id === convId),
    [convId]
  )
  const other = conversation?.participants[0]

  // Load mock messages
  useEffect(() => {
    const timer = setTimeout(() => {
      const initial = mockMessages[convId] ?? []
      setMessages(convId, initial)
      setLoading(false)
      markRead(convId)
      // Show quick replies if last message is from other person
      if (initial.length > 0 && initial[initial.length - 1]?.senderId !== 'me') {
        setShowQuickReplies(true)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [convId, setMessages, markRead])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (msgs.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)
    }
  }, [msgs.length])

  const listData = useMemo(() => buildListData(msgs), [msgs])
  const isTyping = (typingUsers[convId] ?? []).length > 0

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSend = useCallback((text, type = 'TEXT') => {
    sendMessage(convId, text, type, null, replyTo?.id ?? null)
    setReplyTo(null)
    setShowQuickReplies(false)
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50)
  }, [convId, sendMessage, replyTo])

  const handleTyping = useCallback((isTypingNow) => {
    sendTyping(convId, isTypingNow)
    if (typingTimeout) clearTimeout(typingTimeout)
    if (isTypingNow) {
      setTypingTimeout(setTimeout(() => sendTyping(convId, false), 3000))
    }
  }, [convId, sendTyping, typingTimeout])

  const handleLongPress = useCallback((msg) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setSelectedMsg(msg)
    setShowActionSheet(true)
  }, [])

  const handleReaction = useCallback((msgId, emoji) => {
    useChatStore.getState().addReaction(msgId, 'me', emoji)
  }, [])

  const handleQuickReply = (text) => {
    handleSend(text, 'TEXT')
  }

  // ── Render items ─────────────────────────────────────────────────────────────

  const renderItem = useCallback(({ item }) => {
    if (!item._isMsgRow) {
      return <DateSeparator date={item.date} />
    }
    return (
      <ChatBubble
        message={item}
        onLongPress={handleLongPress}
        onReact={handleReaction}
      />
    )
  }, [handleLongPress, handleReaction])

  // ── Header ───────────────────────────────────────────────────────────────────

  const ChatHeader = (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: t.space.base,
      paddingVertical: 10,
      backgroundColor: t.bg.secondary,
      borderBottomWidth: 1,
      borderBottomColor: t.border.subtle,
      gap: t.space.sm,
    }}>
      <Pressable onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color={t.text.primary} />
      </Pressable>

      {/* Avatar */}
      <View style={{ position: 'relative' }}>
        <View style={{
          width: 38, height: 38, borderRadius: 19,
          backgroundColor: (other?.avatarColor ?? t.brand.teal) + '20',
          borderWidth: 1.5, borderColor: (other?.avatarColor ?? t.brand.teal) + '60',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ fontFamily: t.typography.bodySemi.fontFamily, fontSize: 13, color: other?.avatarColor ?? t.brand.teal }}>
            {other?.avatarInitials ?? '?'}
          </Text>
        </View>
        {other?.online && (
          <View style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: t.semantic.success, borderWidth: 1.5, borderColor: t.bg.secondary }} />
        )}
      </View>

      {/* Name + status */}
      <View style={{ flex: 1 }}>
        <Text style={{ ...t.typography.bodySemi, color: t.text.primary, fontSize: 14 }}>
          {other?.name ?? 'Chat'}
        </Text>
        <OnlineIndicator
          status={other?.online ? 'online' : 'offline'}
          lastSeen={other?.lastSeen}
          size="sm"
        />
      </View>

      {/* Actions */}
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <Pressable onPress={() => Haptics.selectionAsync()}>
          <Ionicons name="attach-outline" size={22} color={t.text.secondary} />
        </Pressable>
        <Pressable onPress={() => Haptics.selectionAsync()}>
          <Ionicons name="call-outline" size={22} color={t.text.secondary} />
        </Pressable>
      </View>
    </View>
  )

  // ── Screen ───────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg.primary }}>
      {ChatHeader}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={t.brand.teal} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={listData}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            ListFooterComponent={isTyping ? (
              <View style={{ paddingHorizontal: t.space.base, paddingBottom: 4 }}>
                <TypingIndicator />
              </View>
            ) : null}
          />
        )}

        {/* Quick reply chips */}
        {showQuickReplies && !loading && (
          <QuickReplyChips
            onSelect={handleQuickReply}
            onDismiss={() => setShowQuickReplies(false)}
          />
        )}

        {/* Input bar */}
        <ChatInput
          onSend={handleSend}
          onTyping={handleTyping}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
        />
      </KeyboardAvoidingView>

      {/* Action sheet */}
      <MessageActionSheet
        visible={showActionSheet}
        message={selectedMsg}
        onClose={() => setShowActionSheet(false)}
        onReply={() => setReplyTo(selectedMsg)}
        onCopy={() => {}}
        onDelete={() => {}}
      />

      {/* Reaction picker */}
      <ReactionPicker
        visible={showReactionPicker}
        onSelect={(emoji) => selectedMsg && handleReaction(selectedMsg.id, emoji)}
        onClose={() => setShowReactionPicker(false)}
      />
    </SafeAreaView>
  )
}
