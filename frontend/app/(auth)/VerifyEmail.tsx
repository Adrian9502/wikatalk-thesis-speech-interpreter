import React, { useState, useEffect } from "react";
import {
  Pressable,
  Text,
  View,
  ImageBackground,
  KeyboardAvoidingView,
  ActivityIndicator,
  InteractionManager,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormInput from "@/app/components/FormInput";
import { Mail, CheckCircle } from "lucide-react-native";
import { useAuth } from "@/app/context/AuthContext";
import FormMessage from "@/app/components/FormMessage";
import { router } from "expo-router";
import { useValidation } from "@/app/context/ValidationContext";

interface VerificationFormData {
  verificationCode: string;
}

const VerifyEmail: React.FC = () => {
  const [countdown, setCountdown] = useState<number>(30);
  const [resendDisabled, setResendDisabled] = useState<boolean>(true);
  const {
    verifyEmail,
    isLoading,
    resendVerificationEmail,
    userData,
    clearStorage,
    formMessage,
    setFormMessage,
    clearFormMessage,
  } = useAuth();
  const { emailVerificationCodeSchema } = useValidation();

  // Form for verification code
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VerificationFormData>({
    resolver: yupResolver(emailVerificationCodeSchema),
  });

  // Timer for resend code
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      setResendDisabled(true);
    } else {
      setResendDisabled(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  const handleResendCode = async () => {
    if (resendDisabled) return;

    try {
      clearFormMessage(); // Clear any existing message
      const result = await resendVerificationEmail();
      if (result.success) {
        console.log("✅ Success! Verification email resent");
        setFormMessage("Verification code resent successfully", "success");
        // Start the countdown timer
        setCountdown(30);
      }
    } catch (error) {
      console.error("Failed to resend verification code:", error);
      setFormMessage(
        "Failed to resend verification code. Please try again.",
        "error"
      );
    }
  };

  const handleVerification = async (data: VerificationFormData) => {
    console.log("Verifying code:", data.verificationCode);
    clearFormMessage();
    try {
      const result = await verifyEmail(data.verificationCode);

      if (result.success) {
        console.log("✅ Verification successful!");
        setFormMessage("Email verified successfully!", "success");

        // Use InteractionManager to ensure UI is ready
        InteractionManager.runAfterInteractions(() => {
          // Use replace instead of push to prevent going back
          router.replace("/(tabs)/Home");
        });
      }
    } catch (error: any) {
      console.error("Failed to verify code:", error);
      const message =
        error.response?.data?.message ||
        "Invalid verification code. Please try again.";
      setFormMessage(message, "error");
    }
  };

  const handleGoBack = async () => {
    try {
      // clear both storage and state
      await clearStorage();

      InteractionManager.runAfterInteractions(() => {
        router.replace("/");
      });
    } catch (error) {
      console.error("Error returning to home:", error);
      setFormMessage("Error returning to home", "error");
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/philippines-tapestry.jpg")}
      className="flex-1 w-full h-full"
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={["rgba(0, 56, 168, 0.8)", "rgba(206, 17, 38, 0.8)"]}
        className="flex-1 justify-center items-center"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="w-[85%] max-w-[350px] items-center"
          keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
        >
          {/* Form container */}
          <View className="bg-white/95 rounded-2xl p-5 w-full items-center shadow-lg">
            <Text className="text-2xl font-bold text-customBlue mb-2">
              Verify Your Email
            </Text>
            <Text className="text-center text-sm text-gray-600 mb-2 px-2">
              We've sent a verification code to your email
            </Text>

            {/* Form container */}
            <View className="w-full mt-5">
              {/* Display sent email */}
              <View className="flex-row items-center bg-[#F0F8FF] rounded-lg p-3 mb-4 border border-customBlue">
                <Mail size={20} color="#0038A8" />
                <Text className="ml-2 text-customBlue font-medium">
                  {userData?.email}
                </Text>
              </View>

              <View className="bg-[#F0F8FF] rounded-lg p-3 mb-4 border border-customBlue">
                <Text className="text-gray-600 text-center text-sm">
                  Note: If you don't see the email, check your spam or junk
                  folder.
                </Text>
              </View>

              {formMessage && (
                <FormMessage
                  message={formMessage.text}
                  type={"error"}
                  onDismiss={clearFormMessage}
                />
              )}

              {/* Verification Code Input */}
              <FormInput
                control={control}
                name="verificationCode"
                placeholder="Enter 6-digit verification code"
                IconComponent={CheckCircle}
                error={errors.verificationCode?.message}
                keyboardType="number-pad"
                maxLength={6}
              />

              {/* Verify Button */}
              <View className="w-full rounded-lg overflow-hidden my-4 shadow">
                <Pressable
                  className="bg-customRed py-3.5 items-center justify-center rounded-lg"
                  disabled={isLoading}
                  onPress={handleSubmit(handleVerification)}
                >
                  <View className="flex-row items-center justify-center">
                    {isLoading && (
                      <ActivityIndicator
                        size="small"
                        color="#FFFFFF"
                        className="mr-2"
                      />
                    )}
                    <Text className="text-white text-base font-bold">
                      Verify Email
                    </Text>
                  </View>
                </Pressable>
              </View>

              {/* Resend Code Button */}
              <Pressable
                className={`mt-1 self-center ${
                  resendDisabled ? "opacity-50" : ""
                }`}
                onPress={handleResendCode}
                disabled={resendDisabled}
              >
                <Text
                  className={`text-customBlue text-sm font-semibold ${
                    resendDisabled ? "text-gray-500" : ""
                  }`}
                >
                  {resendDisabled
                    ? `Resend Code (${countdown}s)`
                    : "Resend Code"}
                </Text>
              </Pressable>

              <Pressable onPress={handleGoBack}>
                <Text className="text-sm text-gray-500 mt-4">Go back</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </ImageBackground>
  );
};

export default VerifyEmail;
