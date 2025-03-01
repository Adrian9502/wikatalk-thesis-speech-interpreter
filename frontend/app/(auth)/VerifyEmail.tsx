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
  InteractionManager,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormInput from "@/components/FormInput";
import { Mail, CheckCircle } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import FormMessage from "@/components/FormMessage";
import { router } from "expo-router";
import { useValidation } from "@/context/ValidationContext";
const { width } = Dimensions.get("window");

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
            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.subtitle}>
              We've sent a verification code to your email
            </Text>

            {/* Form container */}
            <View style={styles.formContainer}>
              {/* Display sent email */}
              <View style={styles.emailSentContainer}>
                <Mail size={20} color="#0038A8" />
                <Text style={styles.emailSentText}>{userData?.email}</Text>
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
                  style={styles.button}
                  disabled={isLoading}
                  onPress={handleSubmit(handleVerification)}
                >
                  <View style={styles.buttonContent}>
                    {isLoading && (
                      <ActivityIndicator
                        size="small"
                        color="#FFFFFF"
                        style={styles.buttonLoader}
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
                    styles.resendText,
                    resendDisabled && styles.resendTextDisabled,
                  ]}
                >
                  {resendDisabled
                    ? `Resend Code (${countdown}s)`
                    : "Resend Code"}
                </Text>
              </Pressable>

              <Pressable onPress={handleGoBack}>
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
  formMessageContainer: {
    marginBottom: 16,
    width: "100%",
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
  noteContainer: {
    backgroundColor: "#F0F8FF",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#0038A8",
  },
  noteText: {
    color: "#555",
    textAlign: "center",
    fontSize: 13,
  },
  goBackText: {
    fontSize: 13,
    color: "#999",
    marginTop: 15,
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
    marginTop: 5,
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

export default VerifyEmail;
