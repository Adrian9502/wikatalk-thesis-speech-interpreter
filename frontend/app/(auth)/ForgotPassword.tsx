import React, { useState, useEffect } from "react";
import {
  StyleSheet,
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
      style={styles.background}
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={["rgba(0, 56, 168, 0.8)", "rgba(206, 17, 38, 0.8)"]}
        style={styles.overlay}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
          keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
        >
          {/* Form container */}
          <View style={styles.card}>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
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
                      style={styles.button}
                      disabled={isLoading}
                      onPress={handleEmailSubmit(handleSendCode)}
                    >
                      <View style={styles.buttonContent}>
                        {isLoading && (
                          <ActivityIndicator
                            size="small"
                            color="#FFFFFF"
                            style={styles.buttonLoader}
                          />
                        )}
                        <Text style={styles.buttonText}>
                          Send Recovery Code
                        </Text>
                      </View>
                    </Pressable>
                  </View>
                </>
              ) : (
                <>
                  {/* Display sent email */}
                  <View style={styles.emailSentContainer}>
                    <Mail size={20} color="#0038A8" />
                    <Text style={styles.emailSentText}>{email}</Text>
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
                      style={styles.button}
                      disabled={isLoading}
                      onPress={handleVerificationSubmit(handleVerifyCode)}
                    >
                      <View style={styles.buttonContent}>
                        {isLoading && (
                          <ActivityIndicator
                            size="small"
                            color="#FFFFFF"
                            style={styles.buttonLoader}
                          />
                        )}
                        <Text style={styles.buttonText}>Verify Code</Text>
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
                        styles.resendText,
                        resendDisabled && styles.resendTextDisabled,
                      ]}
                    >
                      {resendDisabled
                        ? `Resend Code (${countdown}s)`
                        : "Resend Code"}
                    </Text>
                  </Pressable>
                </>
              )}
              <Pressable onPress={() => router.back()}>
                <Text style={styles.goBackText}>Go back</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: width * 0.85,
    maxWidth: 350,
    alignItems: "center",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  formContainer: {
    width: "100%",
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0038A8",
    marginBottom: 10,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  goBackText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    width: "100%",
    borderRadius: 10,
    overflow: "hidden",
    marginVertical: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonLoader: {
    marginRight: 8,
  },
  button: {
    backgroundColor: "#CE1126", // Red
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  emailSentContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F8FF",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#0038A8",
  },
  emailSentText: {
    marginLeft: 10,
    color: "#0038A8",
    fontWeight: "500",
  },
  resendButton: {
    marginTop: 15,
    alignSelf: "center",
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendText: {
    color: "#0038A8",
    fontSize: 14,
    fontWeight: "600",
  },
  resendTextDisabled: {
    color: "#666",
  },
});

export default ForgotPassword;
