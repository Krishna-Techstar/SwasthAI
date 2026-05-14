// apps/mobile/app/onboarding/signup-patient.jsx
// Multi-step Patient signup — 3 steps
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
import { PillButton } from '../../components/ui/PillButton'
import { doctorTheme as t } from '../../constants/doctorTheme'

const STEPS = [
  { label: 'Account' },
  { label: 'Personal' },
  { label: 'Health' },
]

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const GENDERS = ['Male', 'Female', 'Other']

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
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
      {options.map((opt) => {
        const isSelected = multi ? selected?.includes(opt) : selected === opt
        return (
          <Pressable key={opt} onPress={() => onSelect(opt)}>
            <View style={{
              paddingHorizontal: 16, paddingVertical: 8,
              borderRadius: t.radius.chip,
              backgroundColor: isSelected ? t.brand.tealDim : t.bg.secondary,
              borderWidth: 1.5, borderColor: isSelected ? t.brand.teal : t.border.subtle,
            }}>
              <Text style={{
                ...t.typography.bodyMed, fontSize: 13,
                color: isSelected ? t.brand.teal : t.text.secondary,
              }}>{opt}</Text>
            </View>
          </Pressable>
        )
      })}
    </View>
  )
}

export default function PatientSignup() {
  const { setBasicDetails, setRoleDetails } = useOnboardingStore()
  const [step, setStep] = useState(0)

  // Step 1 — Account
  const [name,      setName]      = useState('')
  const [email,     setEmail]     = useState('')
  const [phone,     setPhone]     = useState('')
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')

  // Step 2 — Personal
  const [gender,    setGender]    = useState(null)
  const [dob,       setDob]       = useState('')
  const [blood,     setBlood]     = useState(null)
  const [emergency, setEmergency] = useState('')
  const [address,   setAddress]   = useState('')

  // Step 3 — Health
  const [conditions, setConditions] = useState('')
  const [allergies,  setAllergies]  = useState('')
  const [height,     setHeight]     = useState('')
  const [weight,     setWeight]     = useState('')

  const canAdvance = useMemo(() => {
    if (step === 0) return name.trim() && email.trim() && phone.trim() && password.length >= 8 && password === confirm
    if (step === 1) return gender
    return true
  }, [step, name, email, phone, password, confirm, gender])

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (step < 2) {
      setStep(step + 1)
      return
    }
    // Final submit
    setBasicDetails({ name, email, phone })
    setRoleDetails({
      gender, dob, blood, emergency, address,
      conditions, allergies, height, weight,
    })
    router.push('/onboarding/otp')
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg.primary }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 8, gap: 12 }}>
            <Pressable onPress={() => step > 0 ? setStep(step - 1) : router.back()}>
              <Ionicons name="arrow-back" size={22} color={t.text.primary} />
            </Pressable>
            <Text style={{ ...t.typography.h2, color: t.text.primary, flex: 1 }}>Patient Sign Up</Text>
          </View>

          {/* Stepper */}
          <ProgressStepper currentStep={step} steps={STEPS} />

          {/* ── Step 1: Account ── */}
          {step === 0 && (
            <View style={{ marginTop: 8 }}>
              <InputField label="Full Name" required icon="person-outline" value={name} onChangeText={setName} placeholder="Enter your full name" />
              <InputField label="Email" required icon="mail-outline" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
              <InputField label="Phone Number" required icon="call-outline" value={phone} onChangeText={setPhone} placeholder="+91 98765 43210" keyboardType="phone-pad" />
              <SecurePasswordInput label="Password" value={password} onChangeText={setPassword} showStrength placeholder="Min 8 characters" />
              <SecurePasswordInput label="Confirm Password" value={confirm} onChangeText={setConfirm} placeholder="Re-enter password" error={confirm.length > 0 && confirm !== password ? 'Passwords do not match' : undefined} />
            </View>
          )}

          {/* ── Step 2: Personal ── */}
          {step === 1 && (
            <View style={{ marginTop: 8 }}>
              <Text style={{ ...t.typography.bodyMed, color: t.text.secondary, marginBottom: 6 }}>Gender *</Text>
              <ChipSelector options={GENDERS} selected={gender} onSelect={setGender} />

              <InputField label="Date of Birth" icon="calendar-outline" value={dob} onChangeText={setDob} placeholder="DD/MM/YYYY" keyboardType="number-pad" />
              <Text style={{ ...t.typography.bodyMed, color: t.text.secondary, marginBottom: 6 }}>Blood Group</Text>
              <ChipSelector options={BLOOD_GROUPS} selected={blood} onSelect={setBlood} />

              <InputField label="Emergency Contact" icon="call-outline" value={emergency} onChangeText={setEmergency} placeholder="Emergency phone" keyboardType="phone-pad" />
              <InputField label="Address" icon="location-outline" value={address} onChangeText={setAddress} placeholder="City, State" />
            </View>
          )}

          {/* ── Step 3: Health ── */}
          {step === 2 && (
            <View style={{ marginTop: 8 }}>
              <InputField label="Existing Conditions" icon="heart-outline" value={conditions} onChangeText={setConditions} placeholder="e.g. Diabetes, Hypertension" />
              <InputField label="Allergies" icon="warning-outline" value={allergies} onChangeText={setAllergies} placeholder="e.g. Penicillin, Peanuts" />
              <InputField label="Height (cm)" icon="resize-outline" value={height} onChangeText={setHeight} placeholder="170" keyboardType="number-pad" />
              <InputField label="Weight (kg)" icon="fitness-outline" value={weight} onChangeText={setWeight} placeholder="70" keyboardType="number-pad" />
            </View>
          )}

          {/* Spacer */}
          <View style={{ flex: 1, minHeight: 24 }} />
        </ScrollView>

        {/* Bottom bar */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1, borderTopColor: t.border.subtle, backgroundColor: t.bg.secondary }}>
          <PillButton
            label={step < 2 ? 'Continue' : 'Verify Phone & Create Account'}
            onPress={handleNext}
            disabled={!canAdvance}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
