import React, { useState, useEffect } from "react";
import {
  Pressable,
  Text,
  View,
  ActivityIndicator,
  InteractionManager,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
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
import { BASE_COLORS, TITLE_COLORS } from "@/constant/colors";
import Logo from "@/components/Logo";
import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";

interface VerificationFormData {
  verificationCode: string;
}

const VerifyEmail: React.FC = () => {
  const { activeTheme } = useThemeStore();
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);

  const [countdown, setCountdown] = useState<number>(30);
  const [resendDisabled, setResendDisabled] = useState<boolean>(true);
  const [resendLoading, setResendLoading] = useState<boolean>(false);
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
    if (resendDisabled || resendLoading) return;

    try {
      setResendLoading(true);
      // No need to call clearFormMessage(), it's now handled in the store
      const result = await resendVerificationEmail();
      if (result.success) {
        console.log("✅ Success! Verification email resent");
        // Start the countdown timer
        setCountdown(30);
      }
    } catch (error) {
      console.error("Failed to resend verification code:", error);
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerification = async (data: VerificationFormData) => {
    console.log("Verifying code:", data.verificationCode);
    clearFormMessage();

    try {
      await verifyEmail(data.verificationCode);
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
      // The navigation happens inside clearStorage
      await clearStorage();
    } catch (error) {
      console.error("Error returning to home:", error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={[dynamicStyles.container]}>
        <StatusBar style="light" />
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Logo />
          </View>

          {/* Form container */}
          <View style={styles.keyboardAvoidingView}>
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
                    type={formMessage.type}
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
                    (resendDisabled || resendLoading) &&
                      styles.resendButtonDisabled,
                  ]}
                  onPress={handleResendCode}
                  disabled={resendDisabled || resendLoading}
                >
                  <Text
                    style={[
                      styles.resendButtonText,
                      (resendDisabled || resendLoading) &&
                        styles.resendDisabledText,
                    ]}
                  >
                    {resendLoading
                      ? "Resending code..."
                      : resendDisabled
                      ? `Resend Code (${countdown}s)`
                      : "Resend Code"}
                  </Text>
                </Pressable>

                <Pressable onPress={handleGoBack}>
                  <Text style={styles.goBackText}>Go back</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default VerifyEmail;

const styles = StyleSheet.create({
  logoContainer: {
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  keyboardAvoidingView: {
    width: "85%",
    maxWidth: 350,
  },
  formOuterContainer: {
    backgroundColor: BASE_COLORS.white,
    borderRadius: 20,
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
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BASE_COLORS.blue,
  },
  emailText: {
    marginLeft: 8,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.darkText,
  },
  noteContainer: {
    backgroundColor: "#F0F8FF",
    borderRadius: 16,
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
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
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
    fontSize: 12,
    fontFamily: "Poppins-Regular",
  },
  resendDisabledText: {
    color: "#777d87",
  },
  goBackText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#777d87",
    marginTop: 16,
    textAlign: "center",
  },
});
