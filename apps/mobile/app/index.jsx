// apps/mobile/app/index.jsx
// Auth-aware entry point — routes to correct dashboard or onboarding
import { useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { Redirect } from 'expo-router'
import { useAuthStore } from '../store/authStore'
import { doctorTheme as t } from '../constants/doctorTheme'

export default function Index() {
  const { isAuthenticated, getHomeRoute } = useAuthStore()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Small delay to let stores hydrate (if using async storage in future)
    const timer = setTimeout(() => setReady(true), 100)
    return () => clearTimeout(timer)
  }, [])

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: t.bg.primary, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={t.brand.teal} />
      </View>
    )
  }

  if (!isAuthenticated) {
    return <Redirect href="/onboarding/welcome" />
  }

  const home = getHomeRoute()
  return <Redirect href={home} />
}
