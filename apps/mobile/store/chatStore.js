// apps/mobile/store/chatStore.js
import { create } from 'zustand'

const WS_URL = process.env.EXPO_PUBLIC_CHAT_WS_URL ?? 'ws://localhost:3003'

export const useChatStore = create((set, get) => ({
  conversations: [
    {
      id: 'conv_1',
      type: 'DOCTOR_PATIENT',
      unreadCount: 2,
      lastMessage: 'Thank you doctor, the pain is much better now.',
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      participants: [
        { userId: 'p_krishna', name: 'Krishna', online: true, avatarInitials: 'K', avatarColor: '#8B5CF6' }
      ]
    },
    {
      id: 'conv_2',
      type: 'DOCTOR_PATIENT',
      unreadCount: 0,
      lastMessage: 'When should I take the next dose?',
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      participants: [
        { userId: 'p_yash', name: 'Yash', online: false, lastSeen: '2h ago', avatarInitials: 'Y', avatarColor: '#F59E0B' }
      ]
    },
    {
      id: 'conv_3',
      type: 'DOCTOR_PATIENT',
      unreadCount: 1,
      lastMessage: 'I have uploaded the reports.',
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 400).toISOString(),
      participants: [
        { userId: 'p_ram', name: 'Ram', online: true, avatarInitials: 'R', avatarColor: '#10B981' }
      ]
    }
  ],
  messages: {
    'conv_1': [
      { id: 'm1', conversationId: 'conv_1', senderId: 'me', content: 'Hi Krishna, how are you feeling today?', createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), status: 'read', reactions: [] },
      { id: 'm2', conversationId: 'conv_1', senderId: 'p_krishna', content: 'I still have some mild fever, but much better than yesterday.', createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), status: 'read', reactions: [{ userId: 'me', emoji: '👍' }] },
      { id: 'm3', conversationId: 'conv_1', senderId: 'me', content: 'That is good to hear. Keep taking the fluids.', createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(), status: 'read', reactions: [] },
      { id: 'm4', conversationId: 'conv_1', senderId: 'p_krishna', content: 'Thank you doctor, the pain is much better now.', createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), status: 'delivered', reactions: [] },
    ],
    'conv_2': [
      { id: 'm5', conversationId: 'conv_2', senderId: 'p_yash', content: 'Doctor, I forgot the timing for the red capsule.', createdAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(), status: 'read', reactions: [] },
      { id: 'm6', conversationId: 'conv_2', senderId: 'me', content: 'Take it after dinner, Yash.', createdAt: new Date(Date.now() - 1000 * 60 * 130).toISOString(), status: 'read', reactions: [] },
      { id: 'm7', conversationId: 'conv_2', senderId: 'p_yash', content: 'When should I take the next dose?', createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), status: 'read', reactions: [] },
    ],
    'conv_3': [
      { id: 'm8', conversationId: 'conv_3', senderId: 'me', content: 'Ram, please upload your latest blood work.', createdAt: new Date(Date.now() - 1000 * 60 * 500).toISOString(), status: 'read', reactions: [] },
      { id: 'm9', conversationId: 'conv_3', senderId: 'p_ram', content: 'I have uploaded the reports.', createdAt: new Date(Date.now() - 1000 * 60 * 400).toISOString(), status: 'delivered', reactions: [] },
    ]
  },
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
      console.log('[WS] Connection failed; realtime chat is unavailable')
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

    if (!wsReady) {
      get().updateMessageStatus(tempId, 'failed')
      return false
    }

    ws?.send(
      JSON.stringify({ type: 'message', conversationId: convId, content, msgType: type, metadata, replyToId })
    )
    return true
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
