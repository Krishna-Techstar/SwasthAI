// apps/mobile/store/chatStore.js
import { create } from 'zustand'

const WS_URL = process.env.EXPO_PUBLIC_CHAT_WS_URL ?? 'ws://localhost:3003'

export const useChatStore = create((set, get) => ({
  conversations: [],
  messages: {},           // Record<conversationId, Message[]>
  typingUsers: {},        // Record<conversationId, userId[]>
  onlineUsers: {},        // Record<userId, { online: boolean, lastSeen?: string }>
  activeConversationId: null,
  ws: null,
  wsReady: false,

  // ── Setters ──────────────────────────────────────────────────────────────

  setConversations: (convs) => set({ conversations: convs }),

  setMessages: (convId, msgs) =>
    set((s) => ({ messages: { ...s.messages, [convId]: msgs } })),

  appendMessage: (convId, msg) =>
    set((s) => {
      const existing = s.messages[convId] ?? []
      // Replace optimistic temp message if real one arrives with same tempId
      const filtered = existing.filter(
        (m) => !(m.tempId && m.tempId === msg.tempId)
      )
      return {
        messages: { ...s.messages, [convId]: [...filtered, msg] },
        conversations: s.conversations.map((c) =>
          c.id === convId
            ? { ...c, lastMessage: msg.content ?? '📎 Attachment', lastMessageAt: msg.createdAt }
            : c
        ),
      }
    }),

  updateMessageStatus: (msgId, status) =>
    set((s) => ({
      messages: Object.fromEntries(
        Object.entries(s.messages).map(([convId, msgs]) => [
          convId,
          msgs.map((m) => (m.id === msgId ? { ...m, status } : m)),
        ])
      ),
    })),

  setTyping: (convId, userId, isTyping) =>
    set((s) => {
      const current = s.typingUsers[convId] ?? []
      return {
        typingUsers: {
          ...s.typingUsers,
          [convId]: isTyping
            ? [...new Set([...current, userId])]
            : current.filter((id) => id !== userId),
        },
      }
    }),

  markRead: (convId) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === convId ? { ...c, unreadCount: 0 } : c
      ),
    })),

  updatePresence: (userId, online, lastSeen) =>
    set((s) => ({
      onlineUsers: {
        ...s.onlineUsers,
        [userId]: { online, lastSeen },
      },
      conversations: s.conversations.map((c) => ({
        ...c,
        participants: c.participants.map((p) =>
          p.userId === userId ? { ...p, online, lastSeen } : p
        ),
      })),
    })),

  addReaction: (msgId, userId, emoji) =>
    set((s) => ({
      messages: Object.fromEntries(
        Object.entries(s.messages).map(([convId, msgs]) => [
          convId,
          msgs.map((m) => {
            if (m.id !== msgId) return m
            const filtered = m.reactions.filter((r) => r.userId !== userId)
            return { ...m, reactions: [...filtered, { userId, emoji }] }
          }),
        ])
      ),
    })),

  removeReaction: (msgId, userId) =>
    set((s) => ({
      messages: Object.fromEntries(
        Object.entries(s.messages).map(([convId, msgs]) => [
          convId,
          msgs.map((m) => {
            if (m.id !== msgId) return m
            return { ...m, reactions: m.reactions.filter((r) => r.userId !== userId) }
          }),
        ])
      ),
    })),

  setActiveConversation: (convId) => set({ activeConversationId: convId }),

  // ── WebSocket ─────────────────────────────────────────────────────────────

  connectWS: (token) => {
    const existing = get().ws
    if (existing) existing.close()

    try {
      const ws = new WebSocket(`${WS_URL}/ws?token=${token}`)

      ws.onopen = () => {
        set({ wsReady: true })
        console.log('[WS] Connected')
      }

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data)
          const store = get()
          switch (data.type) {
            case 'message':
              store.appendMessage(data.message.conversationId, data.message)
              break
            case 'status':
              store.updateMessageStatus(data.messageId, data.status)
              break
            case 'typing':
              store.setTyping(data.conversationId, data.userId, data.isTyping)
              break
            case 'presence':
              store.updatePresence(data.userId, data.online, data.lastSeen)
              break
            case 'reaction':
              store.addReaction(data.messageId, data.userId, data.emoji)
              break
          }
        } catch (_) {}
      }

      ws.onerror = () => set({ wsReady: false })
      ws.onclose = () => set({ ws: null, wsReady: false })

      set({ ws })
    } catch (_) {
      console.log('[WS] Connection failed — running in offline/mock mode')
    }
  },

  disconnectWS: () => {
    get().ws?.close()
    set({ ws: null, wsReady: false })
  },

  // ── Send Message ─────────────────────────────────────────────────────────

  sendMessage: (convId, content, type = 'TEXT', metadata = null, replyToId = null) => {
    const { ws, wsReady, appendMessage } = get()
    const tempId = `temp_${Date.now()}`

    // Optimistic update — show immediately
    appendMessage(convId, {
      id: tempId,
      tempId,
      conversationId: convId,
      senderId: 'me',
      type,
      content,
      metadata,
      replyToId,
      status: 'sending',
      reactions: [],
      createdAt: new Date().toISOString(),
    })

    // Simulate delivery after 800ms in mock mode
    if (!wsReady) {
      setTimeout(() => get().updateMessageStatus(tempId, 'delivered'), 800)
      return
    }

    ws?.send(
      JSON.stringify({ type: 'message', conversationId: convId, content, msgType: type, metadata, replyToId })
    )
  },

  sendTyping: (convId, isTyping) => {
    const { ws, wsReady } = get()
    if (wsReady) {
      ws?.send(JSON.stringify({ type: 'typing', conversationId: convId, isTyping }))
    }
  },

  // ── Computed helpers ─────────────────────────────────────────────────────

  getTotalUnread: () =>
    get().conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0),
}))
