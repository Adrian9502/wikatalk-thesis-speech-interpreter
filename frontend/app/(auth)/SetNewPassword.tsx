import React, { useState, useEffect } from "react";
import {
  Pressable,
  Text,
  View,
  ImageBackground,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormInput from "@/app/components/FormInput";
import { Mail, Lock } from "lucide-react-native";
import { useValidation } from "@/app/context/ValidationContext";
import { useAuth } from "@/app/context/AuthContext";
import FormMessage from "@/app/components/FormMessage";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showToast } from "@/app/lib/showToast";
interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

const SetNewPassword: React.FC = () => {
  const {
    resetPassword,
    clearResetData,
    isLoading,
    formMessage,
    clearFormMessage,
  } = useAuth();
  const { resetPasswordSchema } = useValidation();
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema),
  });

  // Load reset token
  useEffect(() => {
    (async () => {
      try {
        // Load reset token
        const token = await AsyncStorage.getItem("resetToken");
        if (!token) {
          router.replace("/(auth)/ForgotPassword");
          return;
        }
        setResetToken(token);

        // Load email
        const storedEmail = await AsyncStorage.getItem("resetEmailAddress");
        setEmail(storedEmail);
      } catch (error) {
        console.error("Error loading data from storage:", error);
        router.replace("/(auth)/ForgotPassword");
      }
    })();
  }, []);

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    if (!resetToken) {
      showToast({
        type: "error",
        title: "Session Expired",
        description: "Reset session expired. Please try again.",
      });
      router.replace("/(auth)/ForgotPassword");
      return;
    }

    try {
      const result = await resetPassword(resetToken, data.password);

      if (result.success) {
        // Navigation is now handled within the resetPassword function
        // No need for additional Alert here as we're already showing a toast
      }
    } catch (error) {
      // This catch block will rarely be hit as errors are handled in resetPassword
      console.error("Unexpected error during password reset:", error);
    }
  };

  if (!resetToken) {
    return (
      <ImageBackground
        source={require("../../assets/images/philippines-tapestry.jpg")}
        className="flex-1 w-full h-full"
      >
        <LinearGradient
          colors={["rgba(0, 56, 168, 0.8)", "rgba(206, 17, 38, 0.8)"]}
          className="flex-1 justify-center items-center"
        >
          <ActivityIndicator size="large" color="#ffffff" />
        </LinearGradient>
      </ImageBackground>
    );
  }

  const handleGoBack = async () => {
    await clearResetData();
    router.replace("/");
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
          <View className="bg-white/95 rounded-2xl p-5 w-full items-center shadow-md">
            <Text className="text-3xl font-bold text-customBlue mb-2">
              Set New Password
            </Text>
            <Text className="text-center text-sm text-gray-600 mb-2 px-2">
              Create a new password for your account
            </Text>

            {/* Form container */}
            <View className="w-full mt-5">
              {formMessage && (
                <FormMessage
                  message={formMessage.text}
                  type={formMessage.type}
                  onDismiss={clearFormMessage}
                />
              )}

              {/* Display email */}
              <View className="flex-row items-center bg-[#F0F8FF] rounded-lg p-3 mb-4 border border-customBlue">
                <Mail size={20} color="#0038A8" />
                <Text className="ml-2 text-customBlue font-medium">
                  {email ?? "Loading..."}
                </Text>
              </View>

              <FormInput
                control={control}
                name="password"
                placeholder="New Password"
                IconComponent={Lock}
                error={errors.password?.message}
                secureTextEntry
              />

              <FormInput
                control={control}
                name="confirmPassword"
                placeholder="Confirm New Password"
                IconComponent={Lock}
                error={errors.confirmPassword?.message}
                secureTextEntry
              />

              {/* Reset Password Button */}
              <View className="w-full rounded-lg overflow-hidden my-4 shadow">
                <Pressable
                  className="bg-customRed py-3.5 items-center justify-center rounded-lg"
                  disabled={isLoading}
                  onPress={handleSubmit(handleResetPassword)}
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
                      Reset Password
                    </Text>
                  </View>
                </Pressable>
              </View>

              <Pressable onPress={handleGoBack}>
                <Text className=" text-sm text-gray-400 mb-2">Go back</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </ImageBackground>
  );
};

export default SetNewPassword;
