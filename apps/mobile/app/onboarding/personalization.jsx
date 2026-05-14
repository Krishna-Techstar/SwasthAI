import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { PillButton } from '../../components/ui/PillButton';
import { Check } from 'lucide-react-native';

export default function PersonalizationScreen() {
  const { setPreferences } = useOnboardingStore();
  const [selectedLangs, setSelectedLangs] = useState(['English']);

  const languages = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Bengali'];

  const toggleLang = (lang) => {
    setSelectedLangs(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]);
  };

  const onComplete = () => {
    setPreferences({ languages: selectedLangs });
    // Go to main app
    router.push('/');
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView className="flex-1 px-6">
        
        <View className="mt-12 mb-8">
          <Text className="font-outfit_700Bold text-3xl text-text-primary dark:text-white mb-2">AI Personalization</Text>
          <Text className="font-inter_400Regular text-text-secondary dark:text-gray-400 text-base">
            SwasthAI listens natively. Select the languages you primarily use for consultations.
          </Text>
        </View>

        <View className="flex-row flex-wrap gap-3 mb-12">
          {languages.map(lang => {
            const isSelected = selectedLangs.includes(lang);
            return (
              <TouchableOpacity 
                key={lang} 
                onPress={() => toggleLang(lang)}
                className={`px-5 py-3 rounded-full border flex-row items-center gap-2 ${isSelected ? 'bg-primary/10 border-primary' : 'bg-surface-light dark:bg-surface-dark border-gray-200 dark:border-gray-800'}`}
              >
                {isSelected && <Check size={16} color="#5B5FEF" />}
                <Text className={`font-inter_500Medium ${isSelected ? 'text-primary' : 'text-text-secondary dark:text-gray-300'}`}>{lang}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>

      <View className="p-6 border-t border-gray-100 dark:border-gray-800 bg-surface-light dark:bg-surface-dark items-center">
        <PillButton label="Complete Setup" onPress={onComplete} className="w-full mb-4" />
        <Text className="text-text-secondary text-xs text-center font-inter_400Regular">
          By continuing, you agree to our Terms of Service & Privacy Policy. Data is secured and ABHA compliant.
        </Text>
      </View>
    </SafeAreaView>
  );
}
