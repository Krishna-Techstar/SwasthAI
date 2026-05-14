import { View, Text } from 'react-native'
import { doctorTheme as t } from '../../../constants/doctorTheme'

export default function ProfileSettingsScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: t.bg.primary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={[t.typography.body, { color: t.text.secondary }]}>Profile Settings</Text>
    </View>
  )
}
