"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Animated,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  UIManager,
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
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
// Custom hook
import { useAuthForms } from "@/hooks/useAuthForms";
import Logo from "@/components/Logo";
import AppLoading from "@/components/AppLoading";

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
  const [buttonScale] = useState(new Animated.Value(1));
  const tabIndicatorPosition = useRef(new Animated.Value(0)).current;
  const { signIn, signUp } = useAuthForms(signInSchema, signUpSchema);

  // Handle app initialization and redirection
  useEffect(() => {
    clearFormMessage();
    let mounted = true;

    const initializeApp = async () => {
      if (isAppReady && mounted) {
        // Add small delay to ensure layout is mounted
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (isLoggedIn) {
          router.replace("/(tabs)/Speech");
        }
      }
    };

    initializeApp();
    return () => {
      mounted = false;
    };
  }, [isAppReady, isLoggedIn]);

  const switchTab = (tab: TabType) => {
    // Only animate if the tab is actually changing
    if (activeTab !== tab) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      clearFormMessage();

      // Reset the form that's being switched away from
      if (activeTab === "signin" && tab === "signup") {
        signIn.reset();
      } else if (activeTab === "signup" && tab === "signin") {
        signUp.reset();
      }

      setActiveTab(tab);
      Animated.timing(tabIndicatorPosition, {
        toValue: tab === "signin" ? 0 : 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
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
    if (activeTab === "signin") {
      signIn.handleSubmit(handleSignIn)();
    } else {
      signUp.handleSubmit(handleSignUp)();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={[dynamicStyles.container]}>
        <StatusBar style="light" />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          {/* Logo */}
          <Logo />
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
              {/* Tab navigation */}
              <AuthTabs
                activeTab={activeTab}
                switchTab={switchTab}
                tabIndicatorPosition={tabIndicatorPosition}
              />

              {/* Form container */}
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
                  <SignUpForm control={signUp.control} errors={signUp.errors} />
                )}

                {/* Submit Button */}
                <SubmitButton
                  activeTab={activeTab}
                  isLoading={isLoading}
                  buttonScale={buttonScale}
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
          </KeyboardAvoidingView>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default Index;

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    width: "85%",
    maxWidth: 350,
  },
  formOuterContainer: {
    borderRadius: 16,
    padding: 16,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    minHeight: 400,
  },
  formInnerContainer: {
    minHeight: 350,
    width: "100%",
  },
});
