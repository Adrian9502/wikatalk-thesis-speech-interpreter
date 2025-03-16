import React, { useState, useEffect } from "react";
import {
  Pressable,
  Text,
  View,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform,
  StyleSheet,
  Alert,
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
import { SafeAreaView } from "react-native-safe-area-context";
import { globalStyles } from "@/styles/globalStyles";
import { BASE_COLORS, TITLE_COLORS } from "@/constant/colors";
import { styles as authStyles } from "@/styles/authStyles";
import AuthLogo from "@/components/AuthLogo";
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

  // When component unmount, clear the form message
  useEffect(() => {
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
    <SafeAreaView
      style={[
        globalStyles.container,
        {
          backgroundColor: TITLE_COLORS.customNavyBlue,
          justifyContent: "center",
          alignItems: "center",
        },
      ]}
    >
      <StatusBar style="light" />
      {/* Logo */}
      <View style={styles.logoContainer}>
        <AuthLogo title="Talk" />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        {/* Form container */}
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
                  <Pressable
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
                      <Text style={styles.buttonText}>Send Recovery Code</Text>
                    </View>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                {/* Display sent email */}
                <View style={styles.emailContainer}>
                  <Mail size={20} color="#4A6FFF" />
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
                  <Pressable
                    style={[styles.submitButton]}
                    disabled={isLoading}
                    onPress={handleVerificationSubmit(handleVerifyCode)}
                  >
                    <View style={styles.buttonContent}>
                      {isLoading && (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      )}
                      <Text style={styles.buttonText}>Verify Code</Text>
                    </View>
                  </Pressable>
                </View>

                {/* Resend Code Button */}
                <Pressable
                  style={[styles.resendButton]}
                  onPress={handleResendCode}
                  disabled={resendDisabled}
                >
                  <Text style={[styles.resendButtonText]}>
                    {resendDisabled
                      ? `Resend Code (${countdown}s)`
                      : "Resend Code"}
                  </Text>
                </Pressable>
              </>
            )}
            <Pressable
              onPress={() => {
                clearFormMessage();
                router.back();
              }}
            >
              <Text style={styles.goBackText}>Go back</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPassword;

export const styles = StyleSheet.create({
  logoContainer: {
    marginBottom: 10,
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
  resendButton: {
    marginTop: 16,
    alignSelf: "center",
  },
  resendButtonText: {
    color: "#0038A8",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    fontWeight: "600",
  },
  resendDisabledText: {
    fontFamily: "Poppins-Regular",
    color: "#9CA3AF",
  },
  goBackText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#9CA3AF",
    marginBottom: 8,
    paddingHorizontal: 8,
  },
});
