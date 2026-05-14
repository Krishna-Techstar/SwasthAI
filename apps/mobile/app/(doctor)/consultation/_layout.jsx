import { Stack } from 'expo-router'
import { doctorTheme as t } from '../../../constants/doctorTheme'

export default function ConsultationLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: t.bg.primary },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="new" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="verify" />
      <Stack.Screen name="consent" options={{ animation: 'fade' }} />
      <Stack.Screen name="active" options={{ animation: 'fade' }} />
      <Stack.Screen name="radiology" options={{ animation: 'fade' }} />
      <Stack.Screen name="drug-safety" />
      <Stack.Screen name="report" />
      <Stack.Screen name="followup" options={{ animation: 'slide_from_bottom' }} />
    </Stack>
  )
}
