import { Link } from 'expo-router'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { doctorTheme as t } from '../constants/doctorTheme'

export default function ModalScreen() {
  return (
    <View style={[styles.container, { backgroundColor: t.bg.primary }]}>
      <Text style={[t.typography.h2, { color: t.text.primary }]}>Modal</Text>
      <Link href="/(doctor)/home" asChild>
        <Pressable style={styles.link}>
          <Text style={[t.typography.link, { color: t.brand.teal }]}>Go to doctor home</Text>
        </Pressable>
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
})
