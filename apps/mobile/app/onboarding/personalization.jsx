import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { PillButton } from '../../components/ui/PillButton';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { useOnboardingStore } from '../../store/useOnboardingStore';

export default function PersonalizationScreen() {
  const { role, basicDetails, roleDetails, setPreferences } = useOnboardingStore();
  const { completeLogin, setLoading, isLoading } = useAuthStore();
  const [selectedLangs, setSelectedLangs] = useState(['English']);
  const [error, setError] = useState(null);

  const languages = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Bengali'];

  const toggleLang = (lang) => {
    setSelectedLangs(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]);
  };

  const onComplete = async () => {
    if (!basicDetails || !role) return;
    setLoading(true);
    setError(null);

    try {
      setPreferences({ languages: selectedLangs });
      const result = await authService.signup({ role, basicDetails, roleDetails });
      completeLogin(result);

      if (role === "Doctor" || role === "Nurse") {
        router.replace("/onboarding/pending");
      } else {
        const home = useAuthStore.getState().getHomeRoute();
        router.replace(home);
      }
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
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

      {error ? (
        <View className="px-6 pt-2">
          <Text className="text-xs text-red-600">{error}</Text>
        </View>
      ) : null}
      <View className="p-6 border-t border-gray-100 dark:border-gray-800 bg-surface-light dark:bg-surface-dark items-center">
        <PillButton 
          label={isLoading ? "Creating Account..." : "Complete Setup"} 
          onPress={onComplete} 
          disabled={!selectedLangs.length || isLoading} 
          className="w-full mb-4" 
        />
        <Text className="text-text-secondary text-xs text-center font-inter_400Regular">
          By continuing, you agree to our Terms of Service & Privacy Policy. Data is secured and ABHA compliant.
        </Text>
      </View>
    </SafeAreaView>
  );
}
