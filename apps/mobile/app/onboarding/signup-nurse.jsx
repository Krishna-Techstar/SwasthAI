// apps/mobile/app/onboarding/signup-nurse.jsx
// Multi-step Nurse signup — 3 steps including document upload
import { useState, useMemo } from 'react'
import {
  View, Text, TextInput, Pressable, SafeAreaView,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useOnboardingStore } from '../../store/useOnboardingStore'
import { ProgressStepper } from '../../components/ui/ProgressStepper'
import { SecurePasswordInput } from '../../components/ui/SecurePasswordInput'
import { UploadBox } from '../../components/ui/UploadBox'
import { PillButton } from '../../components/ui/PillButton'
import { doctorTheme as t } from '../../constants/doctorTheme'

const STEPS = [
  { label: 'Account' },
  { label: 'Professional' },
  { label: 'Documents' },
]

const DEPARTMENTS = ['General Ward', 'ICU', 'Emergency', 'OT', 'Pediatrics', 'Maternity', 'Other']
const SHIFTS = ['Day', 'Night', 'Rotating']

function InputField({ label, required, icon, ...props }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ ...t.typography.bodyMed, color: t.text.secondary, marginBottom: 6 }}>
        {label}{required && <Text style={{ color: t.semantic.error }}> *</Text>}
      </Text>
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: t.bg.tertiary, borderWidth: 1.5, borderColor: t.border.subtle,
        borderRadius: t.radius.input, paddingHorizontal: 14, gap: 10,
      }}>
        {icon && <Ionicons name={icon} size={18} color={t.text.muted} />}
        <TextInput
          placeholderTextColor={t.text.muted}
          style={{ flex: 1, height: 48, fontFamily: t.typography.body.fontFamily, fontSize: 14, color: t.text.primary }}
          {...props}
        />
      </View>
    </View>
  )
}

function ChipSelector({ options, selected, onSelect }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
      {options.map((opt) => {
        const isSelected = selected === opt
        return (
          <Pressable key={opt} onPress={() => onSelect(opt)}>
            <View style={{
              paddingHorizontal: 14, paddingVertical: 8, borderRadius: t.radius.chip,
              backgroundColor: isSelected ? t.brand.tealDim : t.bg.secondary,
              borderWidth: 1.5, borderColor: isSelected ? t.brand.teal : t.border.subtle,
            }}>
              <Text style={{ ...t.typography.bodyMed, fontSize: 12, color: isSelected ? t.brand.teal : t.text.secondary }}>{opt}</Text>
            </View>
          </Pressable>
        )
      })}
    </View>
  )
}

export default function NurseSignup() {
  const { setBasicDetails, setRoleDetails } = useOnboardingStore()
  const [step, setStep] = useState(0)

  // Step 1
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [phone,    setPhone]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')

  // Step 2
  const [licenseNo,  setLicenseNo]  = useState('')
  const [hospital,   setHospital]   = useState('')
  const [department, setDepartment] = useState(null)
  const [experience, setExperience] = useState('')
  const [shift,      setShift]      = useState(null)
  const [address,    setAddress]    = useState('')

  // Step 3
  const [docs, setDocs] = useState({ govId: null, certificate: null, license: null, photo: null })

  const canAdvance = useMemo(() => {
    if (step === 0) return name.trim() && email.trim() && phone.trim() && password.length >= 8 && password === confirm
    if (step === 1) return licenseNo.trim() && hospital.trim()
    if (step === 2) return docs.govId && docs.certificate && docs.license
    return true
  }, [step, name, email, phone, password, confirm, licenseNo, hospital, docs])

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (step < 2) { setStep(step + 1); return }
    setBasicDetails({ name, email, phone })
    setRoleDetails({ licenseNo, hospital, department, experience, shift, address, documents: docs })
    router.push('/onboarding/otp')
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg.primary }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }} keyboardShouldPersistTaps="handled">
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 8, gap: 12 }}>
            <Pressable onPress={() => step > 0 ? setStep(step - 1) : router.back()}>
              <Ionicons name="arrow-back" size={22} color={t.text.primary} />
            </Pressable>
            <Text style={{ ...t.typography.h2, color: t.text.primary, flex: 1 }}>Nurse Sign Up</Text>
          </View>

          <ProgressStepper currentStep={step} steps={STEPS} />

          {step === 0 && (
            <View style={{ marginTop: 8 }}>
              <InputField label="Full Name" required icon="person-outline" value={name} onChangeText={setName} placeholder="Full name" />
              <InputField label="Email" required icon="mail-outline" value={email} onChangeText={setEmail} placeholder="nurse@hospital.com" keyboardType="email-address" autoCapitalize="none" />
              <InputField label="Phone Number" required icon="call-outline" value={phone} onChangeText={setPhone} placeholder="+91 98765 43210" keyboardType="phone-pad" />
              <SecurePasswordInput label="Password" value={password} onChangeText={setPassword} showStrength placeholder="Min 8 characters" />
              <SecurePasswordInput label="Confirm Password" value={confirm} onChangeText={setConfirm} placeholder="Re-enter password" error={confirm.length > 0 && confirm !== password ? 'Passwords do not match' : undefined} />
            </View>
          )}

          {step === 1 && (
            <View style={{ marginTop: 8 }}>
              <InputField label="Nursing License Number" required icon="id-card-outline" value={licenseNo} onChangeText={setLicenseNo} placeholder="State nursing license #" />
              <InputField label="Hospital Name" required icon="business-outline" value={hospital} onChangeText={setHospital} placeholder="Hospital / Clinic" />
              <Text style={{ ...t.typography.bodyMed, color: t.text.secondary, marginBottom: 6 }}>Department</Text>
              <ChipSelector options={DEPARTMENTS} selected={department} onSelect={setDepartment} />
              <InputField label="Years of Experience" icon="timer-outline" value={experience} onChangeText={setExperience} placeholder="e.g. 5" keyboardType="number-pad" />
              <Text style={{ ...t.typography.bodyMed, color: t.text.secondary, marginBottom: 6 }}>Shift Preference</Text>
              <ChipSelector options={SHIFTS} selected={shift} onSelect={setShift} />
              <InputField label="Address" icon="location-outline" value={address} onChangeText={setAddress} placeholder="City, State" />
            </View>
          )}

          {step === 2 && (
            <View style={{ marginTop: 8 }}>
              <Text style={{ ...t.typography.bodySemi, color: t.text.primary, marginBottom: 6 }}>Upload Verification Documents</Text>
              <Text style={{ ...t.typography.body, color: t.text.secondary, marginBottom: 16 }}>
                Account verification typically takes 12-24 hours.
              </Text>
              <UploadBox label="Government ID" required onUpload={(f) => setDocs(d => ({ ...d, govId: f }))} />
              <UploadBox label="Nursing Certificate" required onUpload={(f) => setDocs(d => ({ ...d, certificate: f }))} />
              <UploadBox label="License Proof" required onUpload={(f) => setDocs(d => ({ ...d, license: f }))} />
              <UploadBox label="Profile Photo" onUpload={(f) => setDocs(d => ({ ...d, photo: f }))} />
            </View>
          )}

          <View style={{ flex: 1, minHeight: 24 }} />
        </ScrollView>

        <View style={{ paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1, borderTopColor: t.border.subtle, backgroundColor: t.bg.secondary }}>
          <PillButton label={step < 2 ? 'Continue' : 'Verify Phone & Submit'} onPress={handleNext} disabled={!canAdvance} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
