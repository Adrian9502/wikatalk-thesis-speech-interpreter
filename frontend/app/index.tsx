"use client";
import React, { useEffect, useState } from "react";
import {
  View,
  Platform,
  UIManager,
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useValidation } from "@/context/ValidationContext";
import { BASE_COLORS } from "@/constant/colors";
import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";
// Component imports
import AuthTabs from "@/components/auth/AuthTabs";
import SignInForm from "@/components/auth/SignInForm";
import SignUpForm from "@/components/auth/SignUpForm";
import FormMessage from "@/components/FormMessage";
import SocialLogin from "@/components/auth/SocialLogin";
import AuthSwitcher from "@/components/auth/AuthSwitcher";
import SubmitButton from "@/components/auth/SubmitButton";
import ProtectedRoute from "@/components/ProtectedRoute";
// Custom hook
import { useAuthForms } from "@/hooks/useAuthForms";
import Logo from "@/components/Logo";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Enable layout animation for Android
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface LoginFormValues {
  usernameOrEmail: string;
  password: string;
}

// Define a type for signup form data
interface SignUpFormValues {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}
type TabType = "signin" | "signup";

const Index = () => {
  // Theme store
  const { activeTheme } = useThemeStore();

  // Get the dynamic styles based on the current theme
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);

  const { signUpSchema, signInSchema } = useValidation();
  const {
    login,
    register,
    isLoading,
    formMessage,
    clearFormMessage,
    isLoggedIn,
    isAppReady,
  } = useAuth();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const { signIn, signUp } = useAuthForms(signInSchema, signUpSchema);

  // reset to default theme if user is not logged in
  useEffect(() => {
    console.log("index rendered: is logged in - ", isLoggedIn);

    let mounted = true;

    // Only reset theme if truly not logged in AND app is ready
    if (isAppReady && !isLoggedIn) {
      // Check token directly instead of relying on isLoggedIn
      AsyncStorage.getItem("userToken").then((token) => {
        if (!token && mounted) {
          console.log("No token found, resetting to default theme");
          useThemeStore.getState().resetToDefaultTheme();
        } else if (token) {
          console.log("Token exists in storage, skipping theme reset");
          // Redirect if on login screen but has token
          router.replace("/(tabs)/Home");
        }
      });
    }

    clearFormMessage();

    return () => {
      mounted = false;
    };
  }, [isAppReady, isLoggedIn]);

  const switchTab = (tab: TabType) => {
    if (activeTab !== tab) {
      // Dismiss keyboard first
      Keyboard.dismiss();

      // Clear form messages
      clearFormMessage();

      // Reset forms - but delay slightly to avoid conflicts during animation
      setTimeout(() => {
        if (activeTab === "signin" && tab === "signup") {
          signIn.reset();
        } else if (activeTab === "signup" && tab === "signin") {
          signUp.reset();
        }
      }, 100);

      // Update tab immediately for UI responsiveness
      setActiveTab(tab);
    }
  };

  // Login handler
  const handleSignIn = async (data: LoginFormValues): Promise<void> => {
    clearFormMessage();
    await login(data.usernameOrEmail, data.password);
  };

  // Register handler
  const handleSignUp = async (data: SignUpFormValues): Promise<void> => {
    clearFormMessage();
    const { fullName, username, email, password, confirmPassword } = data;
    await register(fullName, username, email, password, confirmPassword);
  };

  // handle sign in or sign up
  const handleSubmit = () => {
    // Dismiss keyboard before submitting
    Keyboard.dismiss();
    if (activeTab === "signin") {
      signIn.handleSubmit(handleSignIn)();
    } else {
      signUp.handleSubmit(handleSignUp)();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={[dynamicStyles.container]}>
        <StatusBar style="light" />
        <ScrollView
          overScrollMode="never"
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View
            style={{ width: "100%", alignItems: "center", paddingVertical: 20 }}
          >
            {/* Logo */}
            <Logo />

            {/* Form container with animation */}
            <View style={styles.keyboardAvoidingView}>
              <View
                style={[
                  styles.formOuterContainer,
                  { backgroundColor: BASE_COLORS.white },
                ]}
              >
                {/* Tab navigation */}
                <AuthTabs activeTab={activeTab} switchTab={switchTab} />

                <View style={styles.formInnerContainer}>
                  {formMessage && (
                    <FormMessage
                      message={formMessage.text}
                      type={formMessage.type}
                      onDismiss={clearFormMessage}
                    />
                  )}

                  {/* Sign In Form */}
                  {activeTab === "signin" && (
                    <SignInForm
                      control={signIn.control}
                      errors={signIn.errors}
                      navigateToForgotPassword={() =>
                        router.push("/(auth)/ForgotPassword")
                      }
                    />
                  )}

                  {/* Sign Up Form */}
                  {activeTab === "signup" && (
                    <SignUpForm
                      control={signUp.control}
                      errors={signUp.errors}
                    />
                  )}

                  {/* Submit Button */}
                  <SubmitButton
                    activeTab={activeTab}
                    isLoading={isLoading}
                    onPress={handleSubmit}
                  />

                  {/* Social login options */}
                  {activeTab === "signin" && <SocialLogin />}

                  {/* Switch between sign in and sign up */}
                  <AuthSwitcher
                    activeTab={activeTab}
                    onSwitch={() =>
                      switchTab(activeTab === "signin" ? "signup" : "signin")
                    }
                  />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default function IndexWrapper() {
  return (
    <ProtectedRoute authRequired={false}>
      <Index />
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    width: "85%",
    maxWidth: 350,
  },
  formOuterContainer: {
    borderRadius: 20,
    padding: 16,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  formInnerContainer: {
    width: "100%",
  },
});
