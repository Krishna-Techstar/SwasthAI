import { View, Text, ScrollView, Pressable, StyleSheet, Animated, SafeAreaView, Platform } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import * as Haptics from 'expo-haptics'
import { useRef, memo } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { doctorTheme as t } from '../../../constants/doctorTheme'

// Fallback for expo-blur if not yet indexed by Metro
let BlurView;
try {
  BlurView = require('expo-blur').BlurView;
} catch (e) {
  BlurView = View;
}

const BLUR_HASH = 'L6PZfSi_.AyE_3t7t7Rj4nMx9Fsq'
const HEADER_MAX_HEIGHT = 320
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 120 : 100

const StatItem = memo(({ label, value, hasBorder }) => (
  <View style={[styles.statItem, hasBorder && styles.statDivider]}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
))

const ExpertiseChip = memo(({ label }) => (
  <View style={styles.expertiseChip}>
    <Text style={styles.expertiseText}>{label}</Text>
  </View>
))

const EduRow = memo(({ degree, school, year }) => (
  <View style={styles.eduRow}>
    <View style={styles.eduDot} />
    <View style={{ flex: 1 }}>
      <Text style={styles.eduDegree}>{degree}</Text>
      <Text style={styles.eduSchool}>{school} · {year}</Text>
    </View>
  </View>
))

const Section = memo(({ title, children }) => (
  <View style={styles.sectionContainer}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
))

export default function ProfileSettingsScreen() {
  const user = useAuthStore((s) => s.user)
  const scrollY = useRef(new Animated.Value(0)).current

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  })

  const avatarSize = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [100, 48],
    extrapolate: 'clamp',
  })

  const avatarTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [0, -10],
    extrapolate: 'clamp',
  })

  const headerZIndex = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [0, 100],
    extrapolate: 'clamp',
  })

  const dr = {
    name: user?.fullName || 'Dr. Krishnakant Sharma',
    specialization: user?.doctorProfile?.specialization || 'Senior Cardiologist & AI Researcher',
    hospital: user?.doctorProfile?.hospital || 'Apollo Speciality Hospitals, India',
    experience: user?.doctorProfile?.experience || '12+ Years',
    rating: '4.9',
    patients: '2,400+',
    bio: 'Dedicated cardiologist with a passion for integrating AI into clinical workflows. Specializing in advanced diagnostics and preventive care. Pioneering digital health initiatives at SwasthAI.',
    education: [
      { degree: 'MD Cardiology', school: 'AIIMS, New Delhi', year: '2012' },
      { degree: 'MBBS', school: 'KMC, Manipal', year: '2008' },
    ],
    expertise: ['Heart Failure', 'Echocardiography', 'AI Diagnostics', 'Tele-medicine'],
    availability: ['Mon - Fri', '09:00 AM - 05:00 PM'],
    regNo: 'MCI-12345-6789',
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.headerBackdrop, { height: headerHeight, zIndex: headerZIndex }]}>
        <View style={StyleSheet.absoluteFill}>
           <View style={styles.gradientBase} />
           <View style={styles.decoCircle1} />
           <View style={styles.decoCircle2} />
        </View>

        <SafeAreaView style={styles.headerActions}>
           <Pressable onPress={() => { Haptics.selectionAsync(); router.back() }} style={styles.actionButton}>
             <BlurView intensity={30} tint="light" style={styles.blurWrapper}>
               <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
             </BlurView>
           </Pressable>
           <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={styles.actionButton}>
             <BlurView intensity={30} tint="light" style={styles.blurWrapper}>
               <Ionicons name="create-outline" size={20} color="#FFFFFF" />
             </BlurView>
           </Pressable>
        </SafeAreaView>

        <Animated.View style={[styles.headerContent, { transform: [{ translateY: avatarTranslateY }] }]}>
          <Animated.View style={[styles.avatarContainer, { width: avatarSize, height: avatarSize }]}>
            <Image
              source={require('../../../assets/images/doctor-demo.png')}
              style={styles.avatar}
              placeholder={BLUR_HASH}
              transition={800}
            />
            <View style={styles.onlineBadge} />
          </Animated.View>

          <View style={styles.drInfoContainer}>
            <Text style={styles.drName}>{dr.name}</Text>
            <View style={styles.specBadge}>
               <Text style={styles.specText}>{dr.specialization.toUpperCase()}</Text>
            </View>
          </View>
        </Animated.View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.statsContainer}>
          <StatItem label="Experience" value={dr.experience} />
          <StatItem label="Rating" value={dr.rating} hasBorder />
          <Pressable 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              router.push('/(doctor)/patients')
            }}
            style={{ flex: 1 }}
          >
            <StatItem label="Patients" value={dr.patients} />
          </Pressable>
        </View>

        <View style={styles.bodyContent}>
          <Section title="About Professional">
            <Text style={styles.bioText}>{dr.bio}</Text>
          </Section>

          <Section title="Areas of Expertise">
            <View style={styles.chipsContainer}>
              {dr.expertise.map(skill => (
                <ExpertiseChip key={skill} label={skill} />
              ))}
            </View>
          </Section>

          <Section title="Education">
            {dr.education.map((edu, i) => (
              <EduRow key={i} {...edu} />
            ))}
          </Section>

          <Section title="Managed Patients">
            <View style={{ gap: 12 }}>
              {[
                { name: 'Krishnakant', summary: 'Post-CABG Recovery (3 weeks). Progressing well.' },
                { name: 'Krishna', summary: 'Hypertension follow-up. BP stabilized at 130/85.' },
                { name: 'Yash', summary: 'Arrhythmia screening complete. Holter normal.' },
                { name: 'Jayganesh', summary: 'Type 2 Diabetes management. HbA1c updated.' },
                { name: 'Ram', summary: 'Chronic Stable Angina. Stress test scheduled.' },
              ].map((p, i) => (
                <View key={i} style={styles.infoCard}>
                  <View style={styles.iconRow}>
                    <View style={[styles.iconBox, { backgroundColor: t.brand.lavender + '30' }]}>
                      <Ionicons name="person" size={18} color={t.brand.indigo} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{p.name}</Text>
                      <Text style={styles.cardSub} numberOfLines={1}>{p.summary}</Text>
                    </View>
                  </View>
                </View>
              ))}
              <Pressable 
                onPress={() => router.push('/(doctor)/patients')}
                style={{ alignSelf: 'center', marginTop: 8 }}
              >
                <Text style={{ ...t.typography.bodySemi, color: t.brand.teal }}>View All Patients</Text>
              </Pressable>
            </View>
          </Section>

          <Section title="Schedule">
             <View style={styles.infoCard}>
               <View style={styles.iconRow}>
                 <View style={styles.iconBox}>
                   <Ionicons name="calendar-outline" size={18} color={t.brand.teal} />
                 </View>
                 <View>
                   <Text style={styles.cardTitle}>{dr.availability[0]}</Text>
                   <Text style={styles.cardSub}>{dr.availability[1]}</Text>
                 </View>
               </View>
             </View>
          </Section>

          <View style={styles.regFooter}>
            <Ionicons name="ribbon-outline" size={14} color={t.text.muted} />
            <Text style={styles.regText}>
              Registered Practitioner ID: {dr.regNo}
            </Text>
          </View>
        </View>
      </Animated.ScrollView>

      <View style={styles.fabContainer}>
         <Pressable
           onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
           style={styles.fab}
         >
           <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
           <Text style={styles.fabText}>Share Profile</Text>
         </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg.primary },
  headerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  gradientBase: { flex: 1, backgroundColor: t.brand.indigo },
  decoCircle1: {
    position: 'absolute', bottom: -50, left: -50,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)'
  },
  decoCircle2: {
    position: 'absolute', top: 20, right: -30,
    width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)'
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 20,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  blurWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  avatarContainer: {
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 100,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  avatar: { flex: 1 },
  onlineBadge: {
    position: 'absolute', bottom: 5, right: 5,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#22C55E', borderWidth: 2, borderColor: '#FFFFFF',
  },
  drInfoContainer: { alignItems: 'center', marginTop: 12 },
  drName: { ...t.typography.h1, color: '#FFFFFF', fontSize: 22 },
  specBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10, paddingVertical: 2,
    borderRadius: 6, marginTop: 6,
  },
  specText: { ...t.typography.caption, color: t.brand.lavender, letterSpacing: 1, fontWeight: '700' },
  scrollView: { flex: 1 },
  scrollContent: { paddingTop: HEADER_MAX_HEIGHT, paddingBottom: 100 },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    borderRadius: 20,
    paddingVertical: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    marginTop: -40,
    zIndex: 30,
  },
  statItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statDivider: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#F1F5F9' },
  statValue: { ...t.typography.h2, color: t.brand.indigo, fontSize: 18 },
  statLabel: { ...t.typography.caption, color: t.text.muted, marginTop: 2 },
  bodyContent: { paddingHorizontal: 24, gap: 24 },
  sectionContainer: { marginBottom: 4 },
  sectionTitle: { ...t.typography.h3, color: t.text.primary, marginBottom: 12, letterSpacing: 0.5 },
  bioText: { ...t.typography.bodyLg, color: t.text.secondary, lineHeight: 22 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  expertiseChip: {
    backgroundColor: t.bg.tertiary,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 10, borderWidth: 1, borderColor: t.brand.lavender + '40',
  },
  expertiseText: { ...t.typography.bodyMed, fontSize: 12, color: t.brand.indigo },
  eduRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  eduDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: t.brand.teal },
  eduDegree: { ...t.typography.bodySemi, color: t.text.primary },
  eduSchool: { ...t.typography.caption, color: t.text.muted },
  infoCard: {
    backgroundColor: t.bg.secondary,
    padding: 16, borderRadius: 16,
    borderWidth: 1, borderColor: t.border.subtle,
  },
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: t.brand.tealDim,
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { ...t.typography.bodySemi, color: t.text.primary },
  cardSub: { ...t.typography.caption, color: t.text.muted },
  regFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10, opacity: 0.6 },
  regText: { ...t.typography.caption, color: t.text.muted },
  fabContainer: { position: 'absolute', bottom: 30, left: 0, right: 0, alignItems: 'center' },
  fab: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: t.brand.indigo, paddingHorizontal: 24, paddingVertical: 14,
    borderRadius: 30, shadowColor: t.brand.indigo,
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 10,
  },
  fabText: { ...t.typography.bodySemi, color: '#FFFFFF' },
})
