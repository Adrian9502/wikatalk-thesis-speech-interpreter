import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  InteractionManager,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import AuthLogo from "@/components/AuthLogo";
import FormInput from "@/components/FormInput";
import { CheckCircle } from "lucide-react-native";
import { useForm } from "react-hook-form";
import AsyncStorage from "@react-native-async-storage/async-storage";
const VerifyEmail: React.FC = () => {
  const {
    verifyEmail,
    isLoading,
    showSnackbar,
    resendVerificationEmail,
    userData,
  } = useAuth();
  const [verificationCode, setVerificationCode] = useState("");
  const [activeInput, setActiveInput] = useState("");
  const [resendTimer, setResendTimer] = useState(30);

  const { control } = useForm({
    defaultValues: {
      verificationCode: "",
    },
  });

  // Check if verification email was sent and start timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendTimer]);

  const handleResendCode = async () => {
    if (resendTimer > 0) return;

    const result = await resendVerificationEmail();
    if (result.success) {
      setResendTimer(30);
    }
  };

  const handleVerification = async () => {
    if (isLoading) return;

    // Add validation
    if (!verificationCode || verificationCode.length !== 6) {
      showSnackbar("Please enter a valid 6-digit code", "error");
      return;
    }

    try {
      console.log("Attempting verification with:", verificationCode);
      const result = await verifyEmail(verificationCode);

      if (result.success) {
        showSnackbar("Email verified successfully!", "success");
        // Use replace instead of push to prevent going back
        setTimeout(() => {
          router.replace("/(tabs)/Home");
        }, 1000);
      }
    } catch (error) {
      console.error("Verification error:", error);
      showSnackbar("Failed to verify email. Please try again.", "error");
    }
  };

  const handleBacktoHome = async () => {
    const { logout } = useAuth(); // Add this to your existing destructuring
    try {
      await logout(); // This will properly clear both storage and state

      // Use InteractionManager to ensure UI is ready
      InteractionManager.runAfterInteractions(() => {
        router.push("/(auth)/SignIn");
      });
    } catch (error) {
      console.error("Error returning to home:", error);
      showSnackbar("Error returning to home", "error");
    }
  };

  return (
    <SafeAreaView className="min-h-screen bg-emerald-500 flex-1">
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 items-center px-8">
            <AuthLogo />
            <View className="py-5 px-8 w-full gap-4 mt-2">
              <Text className="text-3xl mb-2 text-center font-pbold text-white">
                Verify Your Email
              </Text>
              <View className="mb-2">
                <Text className="text-white text-center font-pregular">
                  We've sent a verification code token to
                </Text>
                <Text className="my-2 text-white text-center font-psemibold">
                  {userData?.email}
                </Text>
                <Text className="text-white text-center font-pregular">
                  Please enter the 6-digit code below.
                </Text>

                <View className="border p-2 border-white rounded-lg mt-4">
                  <Text className="text-white text-center font-pregular">
                    Note: If you don't see the email, check your spam or junk
                    folder.
                  </Text>
                </View>
              </View>

              <FormInput
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
                maxLength={6}
                IconComponent={CheckCircle}
                autoComplete="off"
                control={control}
                name="verificationCode"
                activeInput={activeInput}
                setActiveInput={setActiveInput}
              />

              <TouchableOpacity
                onPress={handleResendCode}
                disabled={resendTimer > 0}
                className="mt-4"
              >
                <Text className="text-white text-center font-pregular">
                  {resendTimer > 0
                    ? `Resend code in ${resendTimer}s`
                    : "Resend verification code"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.9}
                className="bg-white p-3 mt-5 rounded-xl"
                onPress={handleVerification}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#10b981" />
                ) : (
                  <Text className="text-emerald-500 font-pmedium text-lg uppercase text-center">
                    Verify Email
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={handleBacktoHome} className="mt-4">
                <Text className="text-white text-center font-pregular">
                  Back to Home
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default VerifyEmail;
