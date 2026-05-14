import { View, Text, ScrollView } from 'react-native'
import { doctorTheme as t } from '../../constants/doctorTheme'

export default function ExploreScreen() {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg.primary }}
      contentContainerStyle={{ padding: t.space.base, paddingTop: 48 }}
    >
      <Text style={[t.typography.h2, { color: t.text.primary }]}>Explore</Text>
      <Text style={[t.typography.body, { color: t.text.secondary, marginTop: t.space.sm }]}>
        Legacy tab placeholder. Use the doctor flow from the app entry redirect.
      </Text>
    </ScrollView>
  )
}
