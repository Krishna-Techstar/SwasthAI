import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { PremiumInput } from '../../components/ui/PremiumInput';
import { PillButton } from '../../components/ui/PillButton';
import { ArrowLeft } from 'lucide-react-native';

export default function RoleDetailsScreen() {
  const { role, setRoleDetails } = useOnboardingStore();
  const { control, handleSubmit } = useForm();

  const onSubmit = (data) => {
    setRoleDetails(data);
    router.push('/onboarding/verification');
  };

  const roleDescriptions = {
    Doctor: 'Provide your medical credentials for verification.',
    Patient: 'Help us personalise your health experience.',
    Nurse: 'Provide your nursing credentials for verification.',
  };

  const renderFields = () => {
    switch (role) {
      case 'Doctor': return (
        <>
          <Controller control={control} name="registrationNumber" render={({ field: { onChange, value } }) => (
            <PremiumInput label="Medical Registration Number" placeholder="MCI-12345" onChangeText={onChange} value={value} />
          )} />
          <Controller control={control} name="specialization" render={({ field: { onChange, value } }) => (
            <PremiumInput label="Specialization" placeholder="e.g. Cardiology" onChangeText={onChange} value={value} />
          )} />
          <Controller control={control} name="hospital" render={({ field: { onChange, value } }) => (
            <PremiumInput label="Hospital / Clinic Name" placeholder="Apollo Hospitals" onChangeText={onChange} value={value} />
          )} />
        </>
      );
      case 'Patient': return (
        <>
          <Controller control={control} name="dob" render={({ field: { onChange, value } }) => (
            <PremiumInput label="Date of Birth" placeholder="DD/MM/YYYY" onChangeText={onChange} value={value} />
          )} />
          <Controller control={control} name="gender" render={({ field: { onChange, value } }) => (
            <PremiumInput label="Gender" placeholder="Male / Female / Other" onChangeText={onChange} value={value} />
          )} />
        </>
      );
      case 'Nurse': return (
        <>
          <Controller control={control} name="license" render={({ field: { onChange, value } }) => (
            <PremiumInput label="Nursing License Number" placeholder="RN-9876" onChangeText={onChange} value={value} />
          )} />
          <Controller control={control} name="department" render={({ field: { onChange, value } }) => (
            <PremiumInput label="Department" placeholder="ICU / General Ward" onChangeText={onChange} value={value} />
          )} />
        </>
      );
      default: return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>

          <TouchableOpacity onPress={() => router.back()} className="mt-5 mb-6">
            <ArrowLeft color="#6B7280" size={24} />
          </TouchableOpacity>

          <Text
            className="text-darkText font-inter mb-1"
            style={{ fontSize: 28, fontWeight: '700', letterSpacing: -0.3 }}
          >
            {role} Verification
          </Text>
          <Text
            className="text-secondaryText font-inter mb-8"
            style={{ fontSize: 14, lineHeight: 22 }}
          >
            {roleDescriptions[role] || 'Please provide your credentials.'}
          </Text>

          {renderFields()}

        </ScrollView>

        <View className="px-5 pb-8 pt-4 bg-surface-light border-t border-borderGray">
          <PillButton label="Verify Details" onPress={handleSubmit(onSubmit)} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
