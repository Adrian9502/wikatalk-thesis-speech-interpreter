import React, { useState, useEffect } from "react";
import {
  Pressable,
  Text,
  View,
  ImageBackground,
  KeyboardAvoidingView,
  Dimensions,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormInput from "@/components/FormInput";
import { Mail, KeyRound } from "lucide-react-native";
import { useValidation } from "@/context/ValidationContext";
import { useAuth } from "@/context/AuthContext";
import FormMessage from "@/components/FormMessage";
import { router } from "expo-router";
const { width } = Dimensions.get("window");

interface ForgotPasswordFormData {
  email: string;
}

interface VerificationFormData {
  verificationCode: string;
}

const ForgotPassword: React.FC = () => {
  const [codeSent, setCodeSent] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [resendDisabled, setResendDisabled] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const { forgotPasswordSchema, passwordVerificationCodeSchema } =
    useValidation();
  const {
    sendPasswordResetCode,
    verifyPasswordResetCode,
    formMessage,
    clearFormMessage,
    isLoading,
  } = useAuth();

  // Form for email
  const {
    control: emailControl,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema),
  });

  // Form for verification code
  const {
    control: verificationControl,
    handleSubmit: handleVerificationSubmit,
    formState: { errors: verificationErrors },
  } = useForm<VerificationFormData>({
    resolver: yupResolver(passwordVerificationCodeSchema),
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

  // Send verification code
  const handleSendCode = async (data: ForgotPasswordFormData) => {
    console.log("Sending reset code to:", data.email);
    setEmail(data.email);

    try {
      const result = await sendPasswordResetCode(data.email);
      console.log("Password reset API response:", result);

      if (result.success) {
        console.log("✅ Success! Email verification sent");
        // Always move to code verification step even if email doesn't exist
        // This is for security purposes
        setCodeSent(true);

        // Start the countdown timer
        setCountdown(30);
      }
    } catch (error) {
      console.error("Failed to send verification code:", error);
      Alert.alert(
        "Error",
        "Failed to send verification code. Please try again."
      );
    }
  };

  // resend code after countdown
  const handleResendCode = async () => {
    if (resendDisabled) return;

    try {
      const result = await sendPasswordResetCode(email);

      if (result.success) {
        console.log("✅ Success! Email verification resent");
        // Start the countdown timer
        setCountdown(30);
      }
    } catch (error) {
      console.error("Failed to resend verification code:", error);
      Alert.alert(
        "Error",
        "Failed to resend verification code. Please try again."
      );
    }
  };

  const handleVerifyCode = async (data: VerificationFormData) => {
    console.log("Verifying code:", data.verificationCode);

    try {
      const result = await verifyPasswordResetCode(
        email,
        data.verificationCode
      );

      if (result.success) {
        console.log("✅ Verification successful!");
        // Navigate to reset password screen with the reset token
        router.push("/(auth)/SetNewPassword");
      }
    } catch (error) {
      console.error("Failed to verify code:", error);
      Alert.alert("Error", "Invalid verification code. Please try again.");
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
          <View className="bg-white/95 rounded-2xl p-5 w-full items-center shadow-md">
            <Text className="text-3xl font-bold text-customBlue mb-2">
              Forgot Password
            </Text>
            <Text className="text-center text-sm text-gray-600 mb-2 px-2">
              {codeSent
                ? "Enter the verification code sent to your email"
                : "Enter your email address and we'll send you a code to reset your password"}
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

              {!codeSent ? (
                <>
                  <FormInput
                    control={emailControl}
                    name="email"
                    placeholder="Email"
                    IconComponent={Mail}
                    error={emailErrors.email?.message}
                    keyboardType="email-address"
                  />

                  {/* Submit Button */}
                  <View className="w-full rounded-lg overflow-hidden my-4 shadow">
                    <Pressable
                      className="bg-customRed py-3.5 items-center justify-center rounded-lg"
                      disabled={isLoading}
                      onPress={handleEmailSubmit(handleSendCode)}
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
                          Send Recovery Code
                        </Text>
                      </View>
                    </Pressable>
                  </View>
                </>
              ) : (
                <>
                  {/* Display sent email */}
                  <View className="flex-row items-center bg-[#F0F8FF] rounded-lg p-3 mb-4 border border-customBlue">
                    <Mail size={20} color="#0038A8" />
                    <Text className="ml-2 text-customBlue font-medium">
                      {email}
                    </Text>
                  </View>

                  {/* Verification Code Input */}
                  <FormInput
                    control={verificationControl}
                    name="verificationCode"
                    placeholder="Enter 6-digit verification code"
                    IconComponent={KeyRound}
                    error={verificationErrors.verificationCode?.message}
                    keyboardType="number-pad"
                    maxLength={6}
                  />

                  {/* Verify Button */}
                  <View className="w-full rounded-lg overflow-hidden my-4 shadow">
                    <Pressable
                      className="bg-customRed py-3.5 items-center justify-center rounded-lg"
                      disabled={isLoading}
                      onPress={handleVerificationSubmit(handleVerifyCode)}
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
                          Verify Code
                        </Text>
                      </View>
                    </Pressable>
                  </View>

                  {/* Resend Code Button */}
                  <Pressable
                    className={`mt-4 self-center ${
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
                </>
              )}
              <Pressable onPress={() => router.back()}>
                <Text className="text-sm text-gray-400 mb-2 px-2">Go back</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </ImageBackground>
  );
};

export default ForgotPassword;
