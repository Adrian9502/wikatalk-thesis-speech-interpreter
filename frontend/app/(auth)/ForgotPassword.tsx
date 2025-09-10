import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  Text,
  View,
  TouchableWithoutFeedback,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Keyboard,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormInput from "@/components/FormInput";
import { Mail, KeyRound } from "lucide-react-native";
import { useValidation } from "@/context/ValidationContext";
import { useAuth } from "@/context/AuthContext";
import FormMessage from "@/components/FormMessage";
import { router } from "expo-router";
import { BASE_COLORS, TITLE_COLORS } from "@/constant/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constant/fontSizes";
import Logo from "@/components/Logo";
import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";

interface ForgotPasswordFormData {
  email: string;
}

interface VerificationFormData {
  verificationCode: string;
}

const ForgotPassword: React.FC = () => {
  // Theme store
  const { activeTheme } = useThemeStore();
  // Get the dynamic styles based on the current theme
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);

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

  // When component unmount, clear the form message
  useEffect(() => {
    clearFormMessage();
    return () => {
      clearFormMessage();
    };
  }, []);

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

    // Dismiss keyboard first
    Keyboard.dismiss();

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

    // Dismiss keyboard
    Keyboard.dismiss();

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

    // Dismiss keyboard
    Keyboard.dismiss();

    try {
      const result = await verifyPasswordResetCode(
        email,
        data.verificationCode
      );

      if (result.success) {
        clearFormMessage();
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={[dynamicStyles.container]}>
        <StatusBar style="light" />
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Logo />
          </View>

          {/* Form container */}
          <View style={styles.keyboardAvoidingView}>
            <View
              style={[
                styles.formOuterContainer,
                { backgroundColor: BASE_COLORS.white },
              ]}
            >
              <Text style={styles.titleText}>Forgot Password</Text>
              <Text style={styles.descriptionText}>
                {codeSent
                  ? "Enter the verification code sent to your email"
                  : "Enter your email address and we'll send you a code to reset your password"}
              </Text>

              {/* Form container */}
              <View style={styles.formContainer}>
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
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        style={[styles.submitButton]}
                        disabled={isLoading}
                        onPress={handleEmailSubmit(handleSendCode)}
                      >
                        <View style={styles.buttonContent}>
                          {isLoading && (
                            <ActivityIndicator
                              style={{ marginRight: 10 }}
                              size={20}
                              color={TITLE_COLORS.customWhite}
                            />
                          )}
                          <Text style={styles.buttonText}>
                            Send Recovery Code
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    {/* Display sent email */}
                    <View style={styles.emailContainer}>
                      <Mail size={14} color="#4A6FFF" />
                      <Text style={styles.emailText}>{email}</Text>
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
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        style={[styles.submitButton]}
                        disabled={isLoading}
                        onPress={handleVerificationSubmit(handleVerifyCode)}
                      >
                        <View style={styles.buttonContent}>
                          {isLoading && (
                            <ActivityIndicator
                              size="small"
                              color={BASE_COLORS.white}
                            />
                          )}
                          <Text style={styles.buttonText}>Verify Code</Text>
                        </View>
                      </TouchableOpacity>
                    </View>

                    {/* Resend Code Button */}
                    <TouchableOpacity
                      style={[styles.resendButton]}
                      onPress={handleResendCode}
                      disabled={resendDisabled}
                    >
                      <Text
                        style={[
                          styles.resendButtonText,
                          resendDisabled && styles.resendDisabledText,
                        ]}
                      >
                        {resendDisabled
                          ? `Resend Code (${countdown}s)`
                          : "Resend Code"}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
                <TouchableOpacity
                  onPress={() => {
                    clearFormMessage();
                    router.back();
                  }}
                >
                  <Text style={styles.goBackText}>Go back</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ForgotPassword;

export const styles = StyleSheet.create({
  logoContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  keyboardAvoidingView: {
    width: "85%",
    maxWidth: 350,
  },
  formOuterContainer: {
    backgroundColor: BASE_COLORS.white,
    borderRadius: 20,
    padding: 20,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  titleText: {
    fontSize: COMPONENT_FONT_SIZES.navigation.headerTitle,
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.blue,
    marginBottom: 8,
  },
  descriptionText: {
    textAlign: "center",
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.darkText,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  formContainer: {
    width: "100%",
    marginTop: 10,
  },
  buttonContainer: {
    width: "100%",
    overflow: "hidden",
    marginVertical: 8,
  },
  submitButton: {
    backgroundColor: TITLE_COLORS.customRed,
    paddingVertical: 7,
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
    color: BASE_COLORS.white,
    fontSize: COMPONENT_FONT_SIZES.button.medium,
    fontFamily: POPPINS_FONT.medium,
  },
  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F8FF",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BASE_COLORS.blue,
  },
  emailText: {
    marginLeft: 8,
    fontFamily: POPPINS_FONT.regular,
    fontSize: COMPONENT_FONT_SIZES.input.text,
    color: BASE_COLORS.darkText,
  },
  resendButton: {
    marginTop: 16,
    alignSelf: "center",
  },
  resendButtonText: {
    color: "#0038A8",
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.regular,
  },
  resendDisabledText: {
    color: "#9CA3AF",
  },
  goBackText: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.regular,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },
});
