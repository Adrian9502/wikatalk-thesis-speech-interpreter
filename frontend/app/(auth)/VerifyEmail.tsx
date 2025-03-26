import React, { useState, useEffect } from "react";
import {
  Pressable,
  Text,
  View,
  KeyboardAvoidingView,
  ActivityIndicator,
  InteractionManager,
  Platform,
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormInput from "@/components/FormInput";
import { Mail, CheckCircle } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import FormMessage from "@/components/FormMessage";
import { router } from "expo-router";
import { useValidation } from "@/context/ValidationContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { BASE_COLORS, TITLE_COLORS } from "@/constant/colors";
import Logo from "@/components/Logo";
import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";

interface VerificationFormData {
  verificationCode: string;
}

const VerifyEmail: React.FC = () => {
  const { activeTheme } = useThemeStore();

  // Get the dynamic styles based on the current theme
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);

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

  // Clear form message on mount
  useEffect(() => {
    clearFormMessage();
  }, []);

  const handleResendCode = async () => {
    if (resendDisabled) return;

    try {
      clearFormMessage();
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
        // Use InteractionManager to ensure UI is ready
        InteractionManager.runAfterInteractions(() => {
          // Use replace instead of push to prevent going back
          router.replace("/(tabs)/Speech");
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
    <SafeAreaView
      style={[
        dynamicStyles.container,
        {
          justifyContent: "center",
          alignItems: "center",
        },
      ]}
    >
      <StatusBar style="light" />
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Logo />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        {/* Form container */}
        <View style={styles.formOuterContainer}>
          <Text style={styles.titleText}>Verify Your Email</Text>
          <Text style={styles.descriptionText}>
            We've sent a verification code to your email
          </Text>

          {/* Form container */}
          <View style={styles.formContainer}>
            {/* Display sent email */}
            <View style={styles.emailContainer}>
              <Mail size={20} color="#0038A8" />
              <Text style={styles.emailText}>{userData?.email}</Text>
            </View>

            <View style={styles.noteContainer}>
              <Text style={styles.noteText}>
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
            <View style={styles.buttonContainer}>
              <Pressable
                style={styles.submitButton}
                disabled={isLoading}
                onPress={handleSubmit(handleVerification)}
              >
                <View style={styles.buttonContent}>
                  {isLoading && (
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <Text style={styles.buttonText}>Verify Email</Text>
                </View>
              </Pressable>
            </View>

            {/* Resend Code Button */}
            <Pressable
              style={[
                styles.resendButton,
                resendDisabled && styles.resendButtonDisabled,
              ]}
              onPress={handleResendCode}
              disabled={resendDisabled}
            >
              <Text
                style={[
                  styles.resendButtonText,
                  resendDisabled && styles.resendDisabledText,
                ]}
              >
                {resendDisabled ? `Resend Code (${countdown}s)` : "Resend Code"}
              </Text>
            </Pressable>

            <Pressable onPress={handleGoBack}>
              <Text style={styles.goBackText}>Go back</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default VerifyEmail;

const styles = StyleSheet.create({
  logoContainer: {
    marginBottom: 10,
    width: "100%",
  },
  keyboardAvoidingView: {
    width: "85%",
    maxWidth: 350,
    alignItems: "center",
  },
  formOuterContainer: {
    backgroundColor: BASE_COLORS.white,
    borderRadius: 16,
    padding: 15,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  titleText: {
    fontSize: 23,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.blue,
    marginBottom: 8,
  },
  descriptionText: {
    textAlign: "center",
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.darkText,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  formContainer: {
    width: "100%",
    marginTop: 10,
  },
  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F8FF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BASE_COLORS.blue,
  },
  emailText: {
    marginLeft: 8,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.darkText,
    fontWeight: "500",
  },
  noteContainer: {
    backgroundColor: "#F0F8FF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BASE_COLORS.blue,
  },
  noteText: {
    textAlign: "center",
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.darkText,
  },
  buttonContainer: {
    width: "100%",
    overflow: "hidden",
    marginVertical: 8,
  },
  submitButton: {
    backgroundColor: TITLE_COLORS.customRed,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 15,
    fontFamily: "Poppins-Medium",
  },
  resendButton: {
    marginTop: 4,
    alignSelf: "center",
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    color: "#0038A8",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    fontWeight: "600",
  },
  resendDisabledText: {
    color: "#9CA3AF",
  },
  goBackText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#9CA3AF",
    marginTop: 16,
  },
});
