import React from 'react';
import { View, Text, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { PremiumInput } from '../../components/ui/PremiumInput';
import { PillButton } from '../../components/ui/PillButton';
import { ArrowLeft } from 'lucide-react-native';

const schema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().min(1, "Email is required"),
  phone: z.string().min(1, "Phone number required"),
  password: z.string().min(1, "Password is required")
});

export default function BasicDetailsScreen() {
  const { setBasicDetails } = useOnboardingStore();
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = (data) => {
    setBasicDetails(data);
    router.push('/onboarding/role-details');
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>

          {/* Back */}
          <TouchableOpacity onPress={() => router.back()} className="mt-5 mb-6">
            <ArrowLeft color="#6B7280" size={24} />
          </TouchableOpacity>

          {/* Header */}
          <Text
            className="text-darkText font-inter mb-1"
            style={{ fontSize: 28, fontWeight: '700', letterSpacing: -0.3 }}
          >
            Create Account
          </Text>
          <Text
            className="text-secondaryText font-inter mb-8"
            style={{ fontSize: 14, lineHeight: 22 }}
          >
            Enter your details to get started with SwasthAI.
          </Text>

          {/* Form */}
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, onBlur, value } }) => (
              <PremiumInput
                label="Full Name"
                placeholder="Dr. Rahul Sharma"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.fullName?.message}
                autoCapitalize="words"
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <PremiumInput
                label="Email Address"
                placeholder="rahul@hospital.com"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <PremiumInput
                label="Phone Number"
                placeholder="+91 98765 43210"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.phone?.message}
                keyboardType="phone-pad"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <PremiumInput
                label="Password"
                placeholder="••••••••"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.password?.message}
                secureTextEntry
              />
            )}
          />
        </ScrollView>

        {/* CTA */}
        <View className="px-5 pb-8 pt-4 bg-surface-light border-t border-borderGray">
          <PillButton label="Continue" onPress={handleSubmit(onSubmit)} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
