import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { doctorTheme as t } from '../../constants/doctorTheme'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.brand.teal,
        tabBarInactiveTintColor: t.text.muted,
        tabBarStyle: { backgroundColor: t.bg.secondary, borderTopColor: t.border.subtle },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => <Ionicons name="compass-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}
