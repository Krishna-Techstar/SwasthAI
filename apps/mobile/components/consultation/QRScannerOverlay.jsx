import { useRef, useEffect } from 'react'
import { View, Text, Pressable, Animated, Easing, Dimensions, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { doctorTheme as t } from '../../constants/doctorTheme'

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window')
const SCANNER_SIZE = SCREEN_W * 0.7

export function QRScannerOverlay({ onManualEntry, scanning = true }) {
  const edgeGlow = useRef(new Animated.Value(0.3)).current
  const scanLine = useRef(new Animated.Value(0)).current
  const cornerScale = useRef(new Animated.Value(0.95)).current

  useEffect(() => {
    // Edge glow pulse
    Animated.loop(Animated.sequence([
      Animated.timing(edgeGlow, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(edgeGlow, { toValue: 0.3, duration: 800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ])).start()

    // Scan line sweep
    Animated.loop(Animated.sequence([
      Animated.timing(scanLine, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(scanLine, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ])).start()

    // Corner breathing
    Animated.loop(Animated.sequence([
      Animated.timing(cornerScale, { toValue: 1.05, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(cornerScale, { toValue: 0.95, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ])).start()

    return () => {
      edgeGlow.stopAnimation()
      scanLine.stopAnimation()
      cornerScale.stopAnimation()
    }
  }, [edgeGlow, scanLine, cornerScale])

  const Corner = ({ style }) => (
    <Animated.View style={[{ position: 'absolute', width: 28, height: 28 }, style, { transform: [{ scale: cornerScale }] }]}>
      <View style={{ position: 'absolute', ...style.corner, backgroundColor: t.brand.teal, borderRadius: 2 }} />
      <View style={{ position: 'absolute', ...style.corner2, backgroundColor: t.brand.teal, borderRadius: 2 }} />
    </Animated.View>
  )

  return (
    <View style={StyleSheet.absoluteFillObject}>
      {/* Dark overlay with scanner cutout */}
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center' }}>
        {/* Scanner frame */}
        <View style={{ width: SCANNER_SIZE, height: SCANNER_SIZE, position: 'relative' }}>
          {/* Edge glow */}
          <Animated.View style={{
            ...StyleSheet.absoluteFillObject,
            borderWidth: 2,
            borderColor: t.brand.teal,
            borderRadius: 20,
            opacity: edgeGlow,
            shadowColor: t.brand.teal,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 15,
          }} />

          {/* Corner brackets */}
          <View style={{ position: 'absolute', top: -2, left: -2, width: 30, height: 30 }}>
            <View style={{ position: 'absolute', top: 0, left: 0, width: 30, height: 4, backgroundColor: t.brand.teal, borderRadius: 2 }} />
            <View style={{ position: 'absolute', top: 0, left: 0, width: 4, height: 30, backgroundColor: t.brand.teal, borderRadius: 2 }} />
          </View>
          <View style={{ position: 'absolute', top: -2, right: -2, width: 30, height: 30 }}>
            <View style={{ position: 'absolute', top: 0, right: 0, width: 30, height: 4, backgroundColor: t.brand.teal, borderRadius: 2 }} />
            <View style={{ position: 'absolute', top: 0, right: 0, width: 4, height: 30, backgroundColor: t.brand.teal, borderRadius: 2 }} />
          </View>
          <View style={{ position: 'absolute', bottom: -2, left: -2, width: 30, height: 30 }}>
            <View style={{ position: 'absolute', bottom: 0, left: 0, width: 30, height: 4, backgroundColor: t.brand.teal, borderRadius: 2 }} />
            <View style={{ position: 'absolute', bottom: 0, left: 0, width: 4, height: 30, backgroundColor: t.brand.teal, borderRadius: 2 }} />
          </View>
          <View style={{ position: 'absolute', bottom: -2, right: -2, width: 30, height: 30 }}>
            <View style={{ position: 'absolute', bottom: 0, right: 0, width: 30, height: 4, backgroundColor: t.brand.teal, borderRadius: 2 }} />
            <View style={{ position: 'absolute', bottom: 0, right: 0, width: 4, height: 30, backgroundColor: t.brand.teal, borderRadius: 2 }} />
          </View>

          {/* Scan line */}
          <Animated.View style={{
            position: 'absolute',
            left: 10,
            right: 10,
            height: 2,
            backgroundColor: t.brand.teal,
            borderRadius: 1,
            shadowColor: t.brand.teal,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 8,
            transform: [{
              translateY: scanLine.interpolate({
                inputRange: [0, 1],
                outputRange: [10, SCANNER_SIZE - 12],
              }),
            }],
          }} />
        </View>

        {/* Instructions */}
        <View style={{ marginTop: 32, alignItems: 'center', gap: 8 }}>
          <Text style={{ ...t.typography.h3, color: '#FFFFFF', textAlign: 'center' }}>
            Scan Patient QR Code
          </Text>
          <Text style={{ ...t.typography.body, color: 'rgba(255,255,255,0.6)', textAlign: 'center', maxWidth: 260 }}>
            ABHA QR · Hospital QR · Patient ID Card
          </Text>
        </View>

        {/* Manual entry fallback */}
        <Pressable
          onPress={onManualEntry}
          style={{
            marginTop: 24,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'rgba(255,255,255,0.12)',
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: t.radius.btn,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.2)',
          }}
        >
          <Ionicons name="keypad-outline" size={18} color="#FFFFFF" />
          <Text style={{ ...t.typography.bodyMed, color: '#FFFFFF' }}>Enter ID Manually</Text>
        </Pressable>
      </View>
    </View>
  )
}
