import React, { useState, useEffect } from "react";
import {
  Pressable,
  Text,
  View,
  ImageBackground,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormInput from "@/components/FormInput";
import { Mail, Lock } from "lucide-react-native";
import { useValidation } from "@/context/ValidationContext";
import { useAuth } from "@/context/AuthContext";
import FormMessage from "@/components/FormMessage";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showToast } from "@/lib/showToast";
import { SafeAreaView } from "react-native-safe-area-context";
import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";
import { BASE_COLORS, TITLE_COLORS } from "@/constant/colors";
import AppLoading from "@/components/AppLoading";
import Logo from "@/components/Logo";

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

const SetNewPassword: React.FC = () => {
  // Theme store
  const { activeTheme } = useThemeStore();

  // Get the dynamic styles based on the current theme
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);

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
    return <AppLoading />;
  }

  const handleGoBack = async () => {
    await clearResetData();
    router.replace("/");
  };

  return (
    <SafeAreaView style={[dynamicStyles.container, styles.safeAreaContainer]}>
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
          <Text style={styles.headerTitle}>Set New Password</Text>
          <Text style={styles.headerSubtitle}>
            Create a new password for your account
          </Text>

          {/* Form container */}
          <View style={styles.formInnerContainer}>
            {formMessage && (
              <FormMessage
                message={formMessage.text}
                type={formMessage.type}
                onDismiss={clearFormMessage}
              />
            )}

            {/* Display email */}
            <View style={styles.emailContainer}>
              <Mail size={20} color="#0038A8" />
              <Text style={styles.emailText}>{email ?? "Loading..."}</Text>
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
            <View style={styles.buttonContainer}>
              <Pressable
                style={styles.resetButton}
                disabled={isLoading}
                onPress={handleSubmit(handleResetPassword)}
              >
                <View style={styles.buttonContentContainer}>
                  {isLoading && (
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                      style={styles.activityIndicator}
                    />
                  )}
                  <Text style={styles.buttonText}>Reset Password</Text>
                </View>
              </Pressable>
            </View>

            <Pressable onPress={handleGoBack}>
              <Text style={styles.goBackText}>Go back</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  logoContainer: {
    marginBottom: 10,
    width: "100%",
  },
  safeAreaContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardAvoidingView: {
    width: "85%",
    maxWidth: 350,
    alignItems: "center",
  },
  formOuterContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Poppins-SemiBold",
    color: TITLE_COLORS.customBlue,
    marginBottom: 8,
  },
  headerSubtitle: {
    textAlign: "center",
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: BASE_COLORS.placeholderText,
  },
  formInnerContainer: {
    width: "100%",
    marginTop: 8,
  },
  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F8FF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: TITLE_COLORS.customBlue,
  },
  emailText: {
    marginLeft: 8,
    color: TITLE_COLORS.customBlue,
    fontFamily: "Poppins-Regular",
  },
  buttonContainer: {
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  resetButton: {
    backgroundColor: TITLE_COLORS.customRed,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  buttonContentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  activityIndicator: {
    marginRight: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 15,
    fontFamily: "Poppins-Medium",
  },
  goBackText: {
    fontSize: 12,
    color: BASE_COLORS.placeholderText,
    marginBottom: 8,
    fontFamily: "Poppins-Regular",
  },
});

export default SetNewPassword;
