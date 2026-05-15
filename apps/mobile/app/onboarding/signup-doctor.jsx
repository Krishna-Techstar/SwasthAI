// apps/mobile/app/onboarding/signup-doctor.jsx
// Multi-step Doctor signup — 4 steps including document upload
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
  { label: 'Practice' },
  { label: 'Documents' },
]

const SPECIALIZATIONS = [
  'General Medicine', 'Cardiology', 'Orthopedics', 'Pediatrics',
  'Dermatology', 'Neurology', 'Psychiatry', 'ENT',
  'Ophthalmology', 'Gynecology', 'Pulmonology', 'Other',
]

const CONSULTATION_TYPES = ['In-Clinic', 'Tele-Consult', 'Both']

const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Marathi', 'Gujarati']

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
          style={{
            flex: 1, height: 48,
            fontFamily: t.typography.body.fontFamily, fontSize: 14, color: t.text.primary,
          }}
          {...props}
        />
      </View>
    </View>
  )
}

function ChipSelector({ options, selected, onSelect, multi = false }) {
  const handleSelect = (opt) => {
    if (multi) {
      const arr = selected ?? []
      onSelect(arr.includes(opt) ? arr.filter(o => o !== opt) : [...arr, opt])
    } else {
      onSelect(opt)
    }
  }
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
      {options.map((opt) => {
        const isSelected = multi ? selected?.includes(opt) : selected === opt
        return (
          <Pressable key={opt} onPress={() => handleSelect(opt)}>
            <View style={{
              paddingHorizontal: 14, paddingVertical: 8, borderRadius: t.radius.chip,
              backgroundColor: isSelected ? t.brand.tealDim : t.bg.secondary,
              borderWidth: 1.5, borderColor: isSelected ? t.brand.teal : t.border.subtle,
            }}>
              <Text style={{
                ...t.typography.bodyMed, fontSize: 12,
                color: isSelected ? t.brand.teal : t.text.secondary,
              }}>{opt}</Text>
            </View>
          </Pressable>
        )
      })}
    </View>
  )
}

export default function DoctorSignup() {
  const { setBasicDetails, setRoleDetails } = useOnboardingStore()
  const [step, setStep] = useState(0)

  // Step 1 — Account
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [phone,    setPhone]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')

  // Step 2 — Professional
  const [regNumber,  setRegNumber]  = useState('')
  const [spec,       setSpec]       = useState(null)
  const [experience, setExperience] = useState('')
  const [hospital,   setHospital]   = useState('')

  // Step 3 — Practice
  const [consultType, setConsultType] = useState(null)
  const [languages,   setLanguages]   = useState(['English'])
  const [fees,        setFees]        = useState('')
  const [bio,         setBio]         = useState('')
  const [address,     setAddress]     = useState('')

  // Step 4 — Documents
  const [docs, setDocs] = useState({
    govId: null,
    degree: null,
    license: null,
    photo: null,
  })

  const canAdvance = useMemo(() => {
    if (step === 0) return name.trim() && email.trim() && phone.trim() && password.length >= 8 && password === confirm
    if (step === 1) return regNumber.trim() && spec
    if (step === 2) return consultType
    if (step === 3) return docs.govId && docs.degree && docs.license
    return true
  }, [step, name, email, phone, password, confirm, regNumber, spec, consultType, docs])

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (step < 3) {
      setStep(step + 1)
      return
    }
    setBasicDetails({ name, email, phone, password })
    setRoleDetails({
      regNumber, registrationNumber: regNumber, specialization: spec, experience, hospital,
      consultType, languages, fees, bio, address, documents: docs,
    })
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
            <Text style={{ ...t.typography.h2, color: t.text.primary, flex: 1 }}>Doctor Sign Up</Text>
          </View>

          <ProgressStepper currentStep={step} steps={STEPS} />

          {/* ── Step 1: Account ── */}
          {step === 0 && (
            <View style={{ marginTop: 8 }}>
              <InputField label="Full Name" required icon="person-outline" value={name} onChangeText={setName} placeholder="Dr. Full Name" />
              <InputField label="Email" required icon="mail-outline" value={email} onChangeText={setEmail} placeholder="doctor@clinic.com" keyboardType="email-address" autoCapitalize="none" />
              <InputField label="Phone Number" required icon="call-outline" value={phone} onChangeText={setPhone} placeholder="+91 98765 43210" keyboardType="phone-pad" />
              <SecurePasswordInput label="Password" value={password} onChangeText={setPassword} showStrength placeholder="Min 8 characters" />
              <SecurePasswordInput label="Confirm Password" value={confirm} onChangeText={setConfirm} placeholder="Re-enter password" error={confirm.length > 0 && confirm !== password ? 'Passwords do not match' : undefined} />
            </View>
          )}

          {/* ── Step 2: Professional ── */}
          {step === 1 && (
            <View style={{ marginTop: 8 }}>
              <InputField label="Medical Registration Number" required icon="id-card-outline" value={regNumber} onChangeText={setRegNumber} placeholder="MCI/NMC registration number" />
              <Text style={{ ...t.typography.bodyMed, color: t.text.secondary, marginBottom: 6 }}>Specialization *</Text>
              <ChipSelector options={SPECIALIZATIONS} selected={spec} onSelect={setSpec} />
              <InputField label="Years of Experience" icon="timer-outline" value={experience} onChangeText={setExperience} placeholder="e.g. 12" keyboardType="number-pad" />
              <InputField label="Hospital / Clinic Name" icon="business-outline" value={hospital} onChangeText={setHospital} placeholder="Apollo Clinic" />
            </View>
          )}

          {/* ── Step 3: Practice ── */}
          {step === 2 && (
            <View style={{ marginTop: 8 }}>
              <Text style={{ ...t.typography.bodyMed, color: t.text.secondary, marginBottom: 6 }}>Consultation Type *</Text>
              <ChipSelector options={CONSULTATION_TYPES} selected={consultType} onSelect={setConsultType} />

              <Text style={{ ...t.typography.bodyMed, color: t.text.secondary, marginBottom: 6 }}>Languages Spoken</Text>
              <ChipSelector options={LANGUAGES} selected={languages} onSelect={setLanguages} multi />

              <InputField label="Consultation Fees (INR)" icon="cash-outline" value={fees} onChangeText={setFees} placeholder="500" keyboardType="number-pad" />

              <View style={{ marginBottom: 14 }}>
                <Text style={{ ...t.typography.bodyMed, color: t.text.secondary, marginBottom: 6 }}>Bio / About</Text>
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Brief professional summary..."
                  placeholderTextColor={t.text.muted}
                  multiline
                  numberOfLines={4}
                  style={{
                    backgroundColor: t.bg.tertiary, borderWidth: 1.5, borderColor: t.border.subtle,
                    borderRadius: t.radius.input, paddingHorizontal: 14, paddingVertical: 12,
                    fontFamily: t.typography.body.fontFamily, fontSize: 14, color: t.text.primary,
                    textAlignVertical: 'top', minHeight: 100,
                  }}
                />
              </View>

              <InputField label="Clinic Address" icon="location-outline" value={address} onChangeText={setAddress} placeholder="Full address" />
            </View>
          )}

          {/* ── Step 4: Documents ── */}
          {step === 3 && (
            <View style={{ marginTop: 8 }}>
              <Text style={{ ...t.typography.bodySemi, color: t.text.primary, marginBottom: 6 }}>
                Upload Verification Documents
              </Text>
              <Text style={{ ...t.typography.body, color: t.text.secondary, marginBottom: 16 }}>
                These are required for account verification. Your profile will be reviewed within 24 hours.
              </Text>

              <UploadBox label="Government ID" description="Aadhaar, PAN, or Passport" required onUpload={(f) => setDocs(d => ({ ...d, govId: f }))} />
              <UploadBox label="Medical Degree Certificate" description="MBBS, MD, or equivalent" required onUpload={(f) => setDocs(d => ({ ...d, degree: f }))} />
              <UploadBox label="Medical License" description="Current state medical license" required onUpload={(f) => setDocs(d => ({ ...d, license: f }))} />
              <UploadBox label="Profile Photo" description="Professional headshot" onUpload={(f) => setDocs(d => ({ ...d, photo: f }))} />
            </View>
          )}

          <View style={{ flex: 1, minHeight: 24 }} />
        </ScrollView>

        <View style={{ paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1, borderTopColor: t.border.subtle, backgroundColor: t.bg.secondary }}>
          <PillButton
            label={step < 3 ? 'Continue' : 'Verify Phone & Submit'}
            onPress={handleNext}
            disabled={!canAdvance}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
