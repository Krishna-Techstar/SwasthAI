import React, { useState, useMemo } from 'react'
import { 
  View, Text, StyleSheet, ScrollView, TextInput, 
  Pressable, SafeAreaView, Platform, Modal, Dimensions, Animated
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import QRCode from 'react-native-qrcode-svg'
import { doctorTheme as t } from '../../../constants/doctorTheme'

const { width } = Dimensions.get('window')

const PATIENTS = [
  { 
    id: 'p1', 
    name: 'Krishna', 
    age: 32, 
    gender: 'Male', 
    status: 'Stable', 
    lastVisit: '2 days ago', 
    abha: '91-2345-6789-0123', 
    summary: 'Post-CABG Recovery (3 weeks). Progressing well.' 
  },
  { 
    id: 'p2', 
    name: 'Krishnakant', 
    age: 45, 
    gender: 'Male', 
    status: 'Follow-up', 
    lastVisit: '5 days ago', 
    abha: '91-8888-9999-1111', 
    summary: 'Hypertension follow-up. BP stabilized at 130/85.' 
  },
  { 
    id: 'p3', 
    name: 'Yash', 
    age: 28, 
    gender: 'Male', 
    status: 'Critical', 
    lastVisit: 'Today', 
    abha: '91-7777-6666-5555', 
    summary: 'Arrhythmia screening complete. Holter normal.' 
  },
  { 
    id: 'p4', 
    name: 'Jayganesh', 
    age: 50, 
    gender: 'Male', 
    status: 'Stable', 
    lastVisit: '1 week ago', 
    abha: '91-4444-3333-2222', 
    summary: 'Type 2 Diabetes management. HbA1c updated.' 
  },
  { 
    id: 'p5', 
    name: 'Ram', 
    age: 62, 
    gender: 'Male', 
    status: 'Stable', 
    lastVisit: '3 days ago', 
    abha: '91-1111-2222-3333', 
    summary: 'Chronic Stable Angina. Stress test scheduled.' 
  },
]

export default function PatientsListScreen() {
  const [search, setSearch] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('All')
  const [showQR, setShowQR] = useState(null)

  const filteredPatients = useMemo(() => {
    return PATIENTS.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.abha.includes(search)
      const matchesFilter = selectedFilter === 'All' || p.status === selectedFilter
      return matchesSearch && matchesFilter
    })
  }, [search, selectedFilter])

  const renderPatientCard = (patient) => (
    <Pressable 
      key={patient.id} 
      onPress={() => {
        Haptics.selectionAsync()
        // Future: router.push(`/(doctor)/patients/${patient.id}`)
      }}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{patient.name[0]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{patient.name}</Text>
          <Text style={styles.abhaText}>ABHA: {patient.abha}</Text>
        </View>
        <View style={[
          styles.statusBadge, 
          { backgroundColor: patient.status === 'Critical' ? t.semantic.errorDim : t.brand.tealDim }
        ]}>
          <Text style={[
            styles.statusText, 
            { color: patient.status === 'Critical' ? t.semantic.error : t.brand.teal }
          ]}>{patient.status}</Text>
        </View>
      </View>

      <Text style={styles.summary} numberOfLines={2}>{patient.summary}</Text>

      <View style={styles.cardFooter}>
        <View style={styles.visitRow}>
          <Ionicons name="calendar-outline" size={14} color={t.text.muted} />
          <Text style={styles.visitText}>Last Visit: {patient.lastVisit}</Text>
        </View>
        
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              setShowQR(patient)
            }}
            style={styles.qrAction}
          >
            <Ionicons name="qr-code" size={18} color={t.brand.indigo} />
          </Pressable>
          <Pressable style={styles.actionBtn}>
            <Ionicons name="chatbubble-outline" size={18} color={t.brand.indigo} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={t.text.primary} />
        </Pressable>
        <Text style={styles.title}>Patient Directory</Text>
        <Pressable style={styles.addBtn}>
          <Ionicons name="person-add-outline" size={22} color={t.brand.indigo} />
        </Pressable>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={t.text.muted} />
        <TextInput
          placeholder="Search by name or ABHA ID..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          placeholderTextColor={t.text.muted}
        />
      </View>

      <View style={styles.filterRow}>
        {['All', 'Critical', 'Follow-up', 'Stable'].map(filter => (
          <Pressable 
            key={filter}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              setSelectedFilter(filter)
            }}
            style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>
              {filter}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filteredPatients.map(renderPatientCard)}
        {filteredPatients.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={t.border.subtle} />
            <Text style={styles.emptyTitle}>No patients found</Text>
            <Text style={styles.emptySub}>Try searching with a different name or ABHA ID</Text>
          </View>
        )}
      </ScrollView>

      {/* QR Modal */}
      <Modal
        visible={!!showQR}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQR(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowQR(null)}>
          <View style={styles.qrCard}>
            <Text style={styles.qrModalTitle}>Patient Digital Identity</Text>
            <Text style={styles.qrModalName}>{showQR?.name}</Text>
            <Text style={styles.qrModalAbha}>ABHA: {showQR?.abha}</Text>
            
            <View style={styles.qrWrapper}>
               <QRCode
                 value={showQR?.abha || 'N/A'}
                 size={200}
                 color={t.brand.indigo}
                 backgroundColor="#FFF"
               />
            </View>
            
            <Text style={styles.qrHint}>This QR contains the unique ABHA ID for identity verification.</Text>
            
            <Pressable onPress={() => setShowQR(null)} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>Done</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg.primary },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'android' ? 40 : 0,
    height: 100
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { ...t.typography.h3, color: t.text.primary },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: t.brand.lavender + '30', alignItems: 'center', justifyContent: 'center' },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    marginHorizontal: 20, 
    paddingHorizontal: 14, 
    borderRadius: 16, 
    height: 48,
    borderWidth: 1,
    borderColor: t.border.subtle,
    marginBottom: 16
  },
  searchInput: { flex: 1, marginLeft: 10, ...t.typography.body, color: t.text.primary, fontSize: 14 },
  filterRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 20 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: '#FFF', borderWidth: 1, borderColor: t.border.subtle },
  filterChipActive: { backgroundColor: t.brand.indigo, borderColor: t.brand.indigo },
  filterText: { ...t.typography.caption, color: t.text.secondary },
  filterTextActive: { color: '#FFF', fontWeight: '700' },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 16, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: t.border.subtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: t.brand.tealDim, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  avatarText: { ...t.typography.h3, color: t.brand.teal },
  name: { ...t.typography.bodySemi, color: t.text.primary, fontSize: 16 },
  abhaText: { ...t.typography.caption, color: t.text.muted },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: { ...t.typography.caption, fontWeight: '700', fontSize: 10 },
  summary: { ...t.typography.body, color: t.text.secondary, fontSize: 13, lineHeight: 18, marginBottom: 16 },
  cardFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderTopWidth: 1, 
    borderTopColor: t.border.subtle, 
    paddingTop: 12 
  },
  visitRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  visitText: { ...t.typography.caption, color: t.text.muted },
  actionBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: t.brand.lavender + '20', alignItems: 'center', justifyContent: 'center' },
  qrAction: { width: 36, height: 36, borderRadius: 10, backgroundColor: t.brand.tealDim, alignItems: 'center', justifyContent: 'center' },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyTitle: { ...t.typography.h3, color: t.text.primary, marginTop: 16 },
  emptySub: { ...t.typography.body, color: t.text.muted, textAlign: 'center', marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  qrCard: { backgroundColor: '#FFF', borderRadius: 30, padding: 32, alignItems: 'center', width: width * 0.85 },
  qrModalTitle: { ...t.typography.caption, color: t.text.muted, letterSpacing: 1.5, marginBottom: 12 },
  qrModalName: { ...t.typography.h2, color: t.text.primary, marginBottom: 4 },
  qrModalAbha: { ...t.typography.bodyMed, color: t.brand.indigo, marginBottom: 24 },
  qrWrapper: { padding: 20, backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: t.border.subtle },
  qrHint: { ...t.typography.caption, color: t.text.muted, textAlign: 'center', marginTop: 24, lineHeight: 16 },
  closeBtn: { marginTop: 32, backgroundColor: t.brand.indigo, paddingHorizontal: 40, paddingVertical: 14, borderRadius: 16 },
  closeBtnText: { ...t.typography.bodySemi, color: '#FFF' },
})
