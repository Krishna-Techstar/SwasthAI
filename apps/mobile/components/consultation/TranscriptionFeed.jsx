import { useRef, useEffect } from 'react'
import { View, Text, ScrollView, Animated, Easing } from 'react-native'
import { doctorTheme as t } from '../../constants/doctorTheme'

function TranscriptLine({ entry, index }) {
  const fade = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 400, delay: 50, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start()
  }, [fade])

  const isDoctor = entry.speaker === 'Doctor'
  return (
    <Animated.View style={{ opacity: fade, flexDirection: 'row', gap: 8, marginBottom: 10, alignItems: 'flex-start' }}>
      <View style={{
        width: 24, height: 24, borderRadius: 12,
        backgroundColor: isDoctor ? t.brand.teal + '20' : t.semantic.success + '20',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{ ...t.typography.bodySemi, fontSize: 9, color: isDoctor ? t.brand.teal : t.semantic.success }}>
          {isDoctor ? 'DR' : 'PT'}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ ...t.typography.caption, color: isDoctor ? t.brand.teal : t.semantic.success, marginBottom: 2 }}>
          {entry.speaker}
        </Text>
        <Text style={{ ...t.typography.body, color: t.text.primary, lineHeight: 20 }}>{entry.text}</Text>
        {/* Entity highlights */}
        {entry.entities?.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
            {entry.entities.map((e, i) => (
              <View key={i} style={{ backgroundColor: t.brand.teal + '15', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                <Text style={{ ...t.typography.caption, fontSize: 9, color: t.brand.teal }}>{e.text}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Animated.View>
  )
}

export function TranscriptionFeed({ transcript = [] }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (transcript.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
    }
  }, [transcript.length])

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: t.space.base, paddingVertical: t.space.sm }}>
        <Text style={{ ...t.typography.h3, color: t.text.primary }}>Live Transcription</Text>
        {transcript.length > 0 && (
          <View style={{ backgroundColor: t.brand.teal + '18', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
            <Text style={{ ...t.typography.caption, color: t.brand.teal }}>{transcript.length} entries</Text>
          </View>
        )}
      </View>

      <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: t.space.base, paddingBottom: t.space.lg }}>
        {transcript.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 40, gap: 8 }}>
            <Text style={{ ...t.typography.body, color: t.text.muted }}>Start the microphone to begin transcription</Text>
            <Text style={{ ...t.typography.caption, color: t.text.muted }}>AI will identify speakers and extract medical entities</Text>
          </View>
        ) : (
          transcript.map((entry, i) => <TranscriptLine key={entry.id || i} entry={entry} index={i} />)
        )}
      </ScrollView>
    </View>
  )
}
