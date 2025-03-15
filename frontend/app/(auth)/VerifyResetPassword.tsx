import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useForm } from "react-hook-form";
import { StatusBar } from "expo-status-bar";
import FormInput from "@/app/components/FormInput";
import { router } from "expo-router";
import { useAuth } from "@/app/context/AuthContext";
import AuthLogo from "@/app/components/AuthLogo";
import { CheckCircle } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const VerifyResetPassword: React.FC = () => {
  const {
    verifyPasswordResetCode,
    isLoading,
    showSnackbar,
    sendPasswordResetCode,
  } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState("");
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control } = useForm({
    defaultValues: {
      code: "",
    },
  });

  // Load the email used for password reset
  useEffect(() => {
    const loadEmail = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem("resetEmailAddress");

        if (!storedEmail) {
          // Redirect back to forgot password if no email found
          console.log(storedEmail);

          showSnackbar("Reset session expired. Please try again.", "error");
          router.replace("/(auth)/ForgotPassword");
          return;
        }

        setEmail(storedEmail);
      } catch (error) {
        console.error("Failed to load reset email:", error);
        router.replace("/(auth)/ForgotPassword");
      }
    };

    loadEmail();
  }, []);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      showSnackbar("Please enter a valid 6-digit code", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await verifyPasswordResetCode(email, code);

      if (result.success && result.token) {
        console.log("Received token, saving to AsyncStorage");
        try {
          await AsyncStorage.setItem("resetToken", result.token);
          console.log("Token saved successfully");

          // Verify it was saved correctly
          const savedToken = await AsyncStorage.getItem("resetToken");
          console.log("Token retrieved after save:", !!savedToken);

          showSnackbar("Code verified successfully!", "success");

          // Navigate to reset password screen
          setTimeout(() => {
            router.push("/(auth)/SetNewPassword");
          }, 1000);
        } catch (storageError) {
          console.error("AsyncStorage error:", storageError);
          showSnackbar(
            "Error saving verification data. Please try again.",
            "error"
          );
        }
      }
    } catch (error) {
      console.error("Verification error:", error);
      showSnackbar("Failed to verify code. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend || !email) return;

    // Reset countdown
    setCanResend(false);
    setCountdown(30);

    try {
      // Call the sendPasswordResetCode function to resend the code
      const result = await sendPasswordResetCode(email);

      if (!result.success) {
        showSnackbar("Failed to resend code. Please try again.", "error");
      }
    } catch (error) {
      console.error("Failed to resend code:", error);
      showSnackbar("Failed to resend code. Please try again.", "error");
    }
  };

  const handleBackToSignIn = () => {
    router.push("/(auth)/SignIn");
  };

  if (!email) {
    return (
      <SafeAreaView className="bg-emerald-500 flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </SafeAreaView>
    );
  }

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
                Verify Reset Code
              </Text>
              <View className="mb-2">
                <Text className="text-white text-center font-pregular">
                  We've sent a password reset code to
                </Text>
                <Text className="my-2 text-white text-center font-psemibold">
                  {email}
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
                control={control} // Required for react-hook-form
                name="code" // Unique identifier
                placeholder="Enter 6-digit code"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
                IconComponent={CheckCircle}
                autoComplete="off"
              />

              <TouchableOpacity
                onPress={handleResendCode}
                disabled={!canResend}
                className="mt-4"
              >
                <Text className="text-white text-center font-pregular">
                  {!canResend ? `Resend code in ${countdown}s` : "Resend code"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.9}
                className="bg-white p-3 mt-5 rounded-xl"
                onPress={handleVerifyCode}
                disabled={isLoading || isSubmitting}
              >
                {isLoading || isSubmitting ? (
                  <ActivityIndicator size="small" color="#10b981" />
                ) : (
                  <Text className="text-emerald-500 font-pmedium text-lg uppercase text-center">
                    Verify Code
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={handleBackToSignIn} className="mt-4">
                <Text className="text-white text-center font-pregular">
                  Back to Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default VerifyResetPassword;
