import { View, Text } from 'react-native'
import { doctorTheme as t } from '../../constants/doctorTheme'

export default function HomeScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: t.bg.primary,
      }}
    >
      <Text style={[t.typography.body, { color: t.text.secondary }]}>SwasthAI — tabs template</Text>
    </View>
  )
}
