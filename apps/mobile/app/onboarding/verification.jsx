import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { PillButton } from '../../components/ui/PillButton';
import { ArrowLeft, ShieldCheck } from 'lucide-react-native';
import { PremiumInput } from '../../components/ui/PremiumInput';

export default function VerificationScreen() {
  const { basicDetails } = useOnboardingStore();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onVerify = async () => {
    if (!otp.trim()) return;
    setLoading(true);
    setError(null);
    try {
      router.push('/onboarding/personalization');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <View className="flex-1 px-6">
          <TouchableOpacity onPress={() => router.back()} className="mt-4 mb-6">
            <ArrowLeft color="#475467" size={24} className="dark:text-white" />
          </TouchableOpacity>

          <View className="w-16 h-16 bg-success/10 rounded-full items-center justify-center mb-6">
            <ShieldCheck color="#1FA971" size={32} />
          </View>

          <Text className="font-outfit_700Bold text-3xl text-text-primary dark:text-white mb-2">Verify Phone</Text>
          <Text className="font-inter_400Regular text-text-secondary dark:text-gray-400 text-base mb-8">
            OTP delivery is not connected yet. Enter any placeholder code for {basicDetails?.phone || '+91 ***** *****'}.
          </Text>

          <PremiumInput 
            placeholder="000000" 
            keyboardType="number-pad" 
            maxLength={6} 
            value={otp} 
            onChangeText={setOtp} 
          />
          {error ? (
            <Text className="mt-3 text-sm text-red-600">{error}</Text>
          ) : null}
          
          <TouchableOpacity className="mt-4 items-center">
            <Text className="text-primary font-inter_500Medium">Resend Code in 00:45</Text>
          </TouchableOpacity>

        </View>

        <View className="p-6 border-t border-gray-100 dark:border-gray-800 bg-surface-light dark:bg-surface-dark">
          <PillButton label={loading ? 'Verifying...' : 'Verify & Secure Account'} onPress={onVerify} disabled={!otp.trim() || loading} className={!otp.trim() || loading ? 'opacity-50' : ''} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
