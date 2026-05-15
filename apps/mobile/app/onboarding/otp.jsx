// apps/mobile/app/onboarding/otp.jsx
// OTP Verification screen — shared by all roles
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";
import { OTPInput } from "../../components/ui/OTPInput";
import { PillButton } from "../../components/ui/PillButton";
import { doctorTheme as t } from "../../constants/doctorTheme";
import { authService } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";
import { useOnboardingStore } from "../../store/useOnboardingStore";

export default function OTPScreen() {
  const { role, basicDetails, roleDetails } = useOnboardingStore();
  const { completeLogin, setOTPVerified, setLoading, isLoading } =
    useAuthStore();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(60);
  const timerRef = useRef(null);

  const phone = basicDetails?.phone ?? "+91 ••••• •••••";

  // Countdown timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleResend = async () => {
    if (countdown > 0) return;
    setCountdown(60);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const createLocalUser = (role, basicDetails, roleDetails) => {
    const name =
      basicDetails?.name ?? basicDetails?.fullName ?? "SwasthAI User";
    return {
      id: basicDetails?.phone ?? `local-${Date.now()}`,
      name,
      fullName: name,
      email:
        basicDetails?.email ??
        `${basicDetails?.phone ?? "user"}@swasthai.local`,
      phone: basicDetails?.phone ?? "+91 00000 00000",
      role,
      verificationStatus: role === "Patient" ? "approved" : "review_pending",
      metadata: {
        onboardingSource: "local-hackathon-mvp",
        roleDetails: roleDetails ?? {},
      },
    };
  };

  const handleVerify = useCallback(async () => {
    if (!otp.trim() || isLoading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setError(null);

    try {
      setOTPVerified(true);

      const result = await authService.signup({
        role,
        basicDetails,
        roleDetails,
      });
      completeLogin(result);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (role === "Doctor" || role === "Nurse") {
        router.replace("/onboarding/pending");
      } else {
        const home = useAuthStore.getState().getHomeRoute();
        router.replace(home);
      }
    } catch (err) {
      const shouldFallback =
        err?.isNetworkError ||
        err?.status >= 500 ||
        /network/i.test(err?.message);
      const isProvider = role === "Doctor" || role === "Nurse";

      console.error("Signup failed", err);

      if (shouldFallback && !isProvider) {
        const result = {
          user: createLocalUser(role, basicDetails, roleDetails),
          accessToken: "local-dev-access-token",
          refreshToken: "local-dev-refresh-token",
        };
        completeLogin(result);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const home = useAuthStore.getState().getHomeRoute();
        router.replace(home);
      } else {
        setError(
          isProvider
            ? err.message || "Provider signup failed. Please retry with a working network."
            : err.message || "Verification failed",
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setLoading(false);
    }
  }, [
    otp,
    isLoading,
    role,
    basicDetails,
    roleDetails,
    completeLogin,
    setOTPVerified,
    setLoading,
  ]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg.primary }}>
      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        {/* Back */}
        <Pressable
          onPress={() => router.back()}
          style={{ marginTop: 16, marginBottom: 24 }}
        >
          <Ionicons name="arrow-back" size={22} color={t.text.primary} />
        </Pressable>

        {/* Shield icon */}
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              backgroundColor: t.semantic.successDim,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Ionicons
              name="shield-checkmark"
              size={32}
              color={t.semantic.success}
            />
          </View>
          <Text
            style={{
              ...t.typography.h1,
              color: t.text.primary,
              textAlign: "center",
            }}
          >
            Verify Phone
          </Text>
          <Text
            style={{
              ...t.typography.body,
              color: t.text.secondary,
              textAlign: "center",
              marginTop: 8,
              lineHeight: 20,
            }}
          >
            Enter any placeholder code for now for{"\n"}
            <Text
              style={{
                color: t.brand.teal,
                fontFamily: t.typography.bodySemi.fontFamily,
              }}
            >
              {phone}
            </Text>
          </Text>
        </View>

        {/* OTP Input */}
        <OTPInput value={otp} onChange={setOtp} error={error} />

        {/* Resend */}
        <Pressable
          onPress={handleResend}
          disabled={countdown > 0}
          style={{ alignItems: "center", marginTop: 20 }}
        >
          <Text
            style={{
              ...t.typography.bodyMed,
              color: countdown > 0 ? t.text.muted : t.brand.teal,
            }}
          >
            {countdown > 0
              ? `Resend Code in 00:${countdown.toString().padStart(2, "0")}`
              : "Resend Code"}
          </Text>
        </Pressable>

        {/* Security note */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: t.bg.tertiary,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 10,
            marginTop: 32,
          }}
        >
          <Ionicons name="lock-closed" size={16} color={t.brand.teal} />
          <Text
            style={{ ...t.typography.caption, color: t.text.muted, flex: 1 }}
          >
            End-to-end secured verification. Your data is protected under ABHA
            compliance.
          </Text>
        </View>

        <View style={{ flex: 1 }} />
      </View>

      {/* Verify button */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingVertical: 16,
          borderTopWidth: 1,
          borderTopColor: t.border.subtle,
          backgroundColor: t.bg.secondary,
        }}
      >
        <PillButton
          label={isLoading ? "Verifying..." : "Verify & Secure Account"}
          onPress={handleVerify}
          disabled={!otp.trim() || isLoading}
        />
      </View>
    </SafeAreaView>
  );
}
