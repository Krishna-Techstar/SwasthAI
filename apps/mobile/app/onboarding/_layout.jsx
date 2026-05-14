import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup-patient" />
      <Stack.Screen name="signup-doctor" />
      <Stack.Screen name="signup-nurse" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="pending" />
      <Stack.Screen name="basic-details" />
      <Stack.Screen name="role-details" />
      <Stack.Screen name="verification" />
      <Stack.Screen name="personalization" />
    </Stack>
  );
}
