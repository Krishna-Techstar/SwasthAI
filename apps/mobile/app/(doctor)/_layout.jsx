import { View } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { DoctorTopBar } from '../../components/layout/DoctorTopBar'
import { DoctorBottomBar } from '../../components/layout/DoctorBottomBar'
import { doctorTheme as t } from '../../constants/doctorTheme'

export default function DoctorLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg.primary }} edges={['top']}>
      <StatusBar style="dark" />
      <DoctorTopBar />
      <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
      </View>
      <DoctorBottomBar />
    </SafeAreaView>
  )
}
