"use client";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  LayoutAnimation,
  StyleSheet,
  Platform,
  UIManager,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import React, { useEffect, useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import FormInput from "@/components/FormInput";
import { useForm } from "react-hook-form";
import FormMessage from "@/components/FormMessage";
import { User, Lock, Mail } from "lucide-react-native";
import { yupResolver } from "@hookform/resolvers/yup";
import { useValidation } from "@/context/ValidationContext";
import { SignUpFormData, SignInFormData } from "@/context/ValidationContext";
import Logo from "@/components/AuthLogo";
import { SafeAreaView } from "react-native-safe-area-context";
import { globalStyles } from "@/styles/globalStyles";
import { BASE_COLORS, TITLE_COLORS } from "@/constant/colors";
import DotsLoader from "@/components/DotLoader";

const Index = () => {
  // Validation context
  const { signUpSchema, signInSchema } = useValidation();
  // Authentication context - get the form message state
  const { login, register, isLoading, formMessage, clearFormMessage } =
    useAuth();
  const { isLoggedIn, isAppReady } = useAuth();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState("signin");
  const [buttonScale] = useState(new Animated.Value(1));
  const tabIndicatorPosition = useRef(new Animated.Value(0)).current;

  if (Platform.OS === "android") {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

  // Sign in form configuration
  const {
    control: signInControl,
    handleSubmit: handleSignInSubmit,
    formState: { errors: signInErrors },
  } = useForm<SignInFormData>({
    resolver: yupResolver(signInSchema),
  });

  // Sign up form configuration
  const {
    control: signUpControl,
    handleSubmit: handleSignUpSubmit,
    formState: { errors: signUpErrors },
  } = useForm<SignUpFormData>({
    resolver: yupResolver(signUpSchema),
  });

  // redirect to home if user is already logged in
  useEffect(() => {
    clearFormMessage();

    let mounted = true;

    const initializeApp = async () => {
      if (isAppReady && mounted) {
        // Add small delay to ensure layout is mounted
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (isLoggedIn) {
          router.replace("/(tabs)/Speech");
        } else {
          setIsAuthChecking(false);
        }
      }
    };

    initializeApp();

    return () => {
      mounted = false;
    };
  }, [isAppReady, isLoggedIn]);

  // Show loading screen while app is initializing
  if (!isAppReady) {
    return (
      <View
        style={{ flex: 1, backgroundColor: TITLE_COLORS.customNavyBlue }}
      ></View>
    );
  }

  const switchTab = (tab: "signin" | "signup") => {
    // Only animate if the tab is actually changing
    if (activeTab !== tab) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      clearFormMessage();
      setActiveTab(tab);
      Animated.timing(tabIndicatorPosition, {
        toValue: tab === "signin" ? 0 : 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };
  const tabIndicatorLeft = tabIndicatorPosition.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "50%"],
  });

  // Login handler
  const handleSignIn = async (data: SignInFormData): Promise<void> => {
    clearFormMessage();
    await login(data.usernameOrEmail, data.password);
  };

  // Register handler
  const handleSignUp = async (data: SignUpFormData): Promise<void> => {
    clearFormMessage();
    const { fullName, username, email, password, confirmPassword } = data;
    await register(fullName, username, email, password, confirmPassword);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView
        style={[
          globalStyles.container,
          { backgroundColor: TITLE_COLORS.customNavyBlue },
        ]}
      >
        <StatusBar style="light" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Logo title="Talk" />
          </View>

          {/* Form container */}
          <View
            style={[
              styles.formOuterContainer,
              { backgroundColor: BASE_COLORS.white },
            ]}
          >
            {/* Compact tab navigation */}
            <View
              style={[
                styles.tabContainer,
                { backgroundColor: BASE_COLORS.lightBlue },
              ]}
            >
              {/* Sign in tab */}
              <TouchableOpacity
                style={styles.tabButton}
                onPress={() => switchTab("signin")}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === "signin"
                      ? [
                          styles.activeTabText,
                          { color: TITLE_COLORS.customYellow },
                        ]
                      : [styles.inactiveTabText, { color: BASE_COLORS.blue }],
                  ]}
                >
                  Sign In
                </Text>
              </TouchableOpacity>
              {/* Sign up tab */}
              <TouchableOpacity
                style={styles.tabButton}
                onPress={() => switchTab("signup")}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === "signin"
                      ? [styles.activeTabText, { color: BASE_COLORS.blue }]
                      : [
                          styles.inactiveTabText,
                          { color: TITLE_COLORS.customYellow },
                        ],
                  ]}
                >
                  Sign Up
                </Text>
              </TouchableOpacity>
              {/* Animated tab indicator */}
              <Animated.View
                style={{
                  position: "absolute",
                  bottom: 0,
                  width: "50%",
                  height: "100%",
                  backgroundColor: TITLE_COLORS.customBlue,
                  borderRadius: 10,
                  opacity: 0.9,
                  zIndex: 0,
                  left: tabIndicatorLeft,
                }}
              />
            </View>

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
                <>
                  {/* username or email */}
                  <FormInput
                    control={signInControl}
                    name="usernameOrEmail"
                    placeholder="Username or Email"
                    IconComponent={User}
                    error={signInErrors.usernameOrEmail?.message}
                    keyboardType="email-address"
                    autoCapitalize="sentences"
                  />
                  {/* password */}
                  <FormInput
                    control={signInControl}
                    name="password"
                    placeholder="Password"
                    secureTextEntry
                    IconComponent={Lock}
                    error={signInErrors.password?.message}
                  />
                  {/* forgot password */}
                  <TouchableOpacity
                    onPress={() => router.push("/(auth)/ForgotPassword")}
                    style={styles.forgotPasswordButton}
                  >
                    <Text
                      style={[
                        styles.forgotPasswordText,
                        { color: BASE_COLORS.blue },
                      ]}
                    >
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Sign Up Form */}
              {activeTab === "signup" && (
                <>
                  {/* full name */}
                  <FormInput
                    control={signUpControl}
                    name="fullName"
                    placeholder="Full Name"
                    IconComponent={User}
                    error={signUpErrors.fullName?.message}
                    autoCapitalize="words"
                  />
                  {/* username */}
                  <FormInput
                    control={signUpControl}
                    name="username"
                    placeholder="Username"
                    IconComponent={User}
                    error={signUpErrors.username?.message}
                  />
                  {/* Provide a valid email text */}
                  <Text
                    style={[
                      styles.helpText,
                      { color: BASE_COLORS.placeholderText },
                    ]}
                  >
                    Provide a{" "}
                    <Text
                      style={[styles.helpTextBold, { color: BASE_COLORS.blue }]}
                    >
                      valid email
                    </Text>{" "}
                    to receive a 6-digit code. Check spam/junk if not received.
                  </Text>
                  {/* email address */}
                  <FormInput
                    control={signUpControl}
                    name="email"
                    placeholder="Email"
                    keyboardType="email-address"
                    IconComponent={Mail}
                    error={signUpErrors.email?.message}
                    autoCapitalize="none"
                  />
                  {/* password */}
                  <FormInput
                    control={signUpControl}
                    name="password"
                    placeholder="Password"
                    secureTextEntry
                    IconComponent={Lock}
                    error={signUpErrors.password?.message}
                  />
                  {/* confirm password */}
                  <FormInput
                    control={signUpControl}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    secureTextEntry
                    IconComponent={Lock}
                    error={signUpErrors.confirmPassword?.message}
                  />
                </>
              )}

              {/* Submit Button */}
              <Animated.View
                style={{
                  transform: [{ scale: buttonScale }],
                  width: "100%",
                  borderRadius: 8,
                  overflow: "hidden",
                  marginVertical: 8,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                <Pressable
                  style={[
                    styles.submitButton,
                    { backgroundColor: TITLE_COLORS.customRed },
                  ]}
                  disabled={isLoading}
                  onPress={() => {
                    if (activeTab === "signin") {
                      handleSignInSubmit(handleSignIn)();
                    } else {
                      handleSignUpSubmit(handleSignUp)();
                    }
                  }}
                >
                  <View style={styles.submitButtonContent}>
                    {isLoading && <DotsLoader />}
                    <Text style={styles.submitButtonText}>
                      {activeTab === "signin" ? "Sign In" : "Sign Up"}
                    </Text>
                  </View>
                </Pressable>
              </Animated.View>

              {/* Social login options */}
              {activeTab === "signin" && (
                <>
                  <View style={styles.dividerContainer}>
                    <View
                      style={[
                        styles.dividerLine,
                        { backgroundColor: BASE_COLORS.blue },
                      ]}
                    />
                    <Text
                      style={[
                        styles.dividerText,
                        { color: BASE_COLORS.placeholderText },
                      ]}
                    >
                      OR
                    </Text>
                    <View
                      style={[
                        styles.dividerLine,
                        { backgroundColor: BASE_COLORS.blue },
                      ]}
                    />
                  </View>

                  <View style={styles.socialButtonsContainer}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        marginTop: 10,
                      }}
                    >
                      <TouchableOpacity
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          backgroundColor: BASE_COLORS.blue,
                          paddingVertical: 10,
                          paddingHorizontal: 10,
                          borderRadius: 5,
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.2,
                          shadowRadius: 2,
                        }}
                      >
                        <View
                          style={{
                            marginRight: 10,
                            padding: 5,
                            borderRadius: 5,
                            backgroundColor: BASE_COLORS.white,
                          }}
                        >
                          <Ionicons
                            name="logo-google"
                            size={20}
                            color={TITLE_COLORS.customRed}
                          />
                        </View>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "500",
                            color: BASE_COLORS.white,
                          }}
                        >
                          Sign in with Google
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}

              {/* Switch between sign in and sign up */}
              <View style={styles.switchContainer}>
                <Text
                  style={[
                    styles.switchText,
                    { color: BASE_COLORS.placeholderText },
                  ]}
                >
                  {activeTab === "signin"
                    ? "Don't have an account?"
                    : "Already have an account?"}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    switchTab(activeTab === "signin" ? "signup" : "signin")
                  }
                >
                  <Text
                    style={[
                      styles.switchButtonText,
                      { color: BASE_COLORS.blue },
                    ]}
                  >
                    {activeTab === "signin" ? "Sign Up" : "Sign In"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default Index;

const styles = StyleSheet.create({
  imageBackground: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardAvoidingView: {
    width: "85%",
    maxWidth: 350,
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  formOuterContainer: {
    borderRadius: 16,
    padding: 16,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    minHeight: 400,
  },
  tabContainer: {
    flexDirection: "row",
    width: "100%",
    position: "relative",
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    zIndex: 10,
  },
  tabButtonText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  activeTabText: {
    fontWeight: "700",
  },
  inactiveTabText: {},
  formInnerContainer: {
    minHeight: 350,
    width: "100%",
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginBottom: 12,
  },
  forgotPasswordText: {
    fontSize: 12,
  },
  helpText: {
    padding: 4,
    marginBottom: 4,
    fontSize: 13,
  },
  helpTextBold: {
    fontWeight: "600",
  },
  submitButton: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  submitButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  activityIndicator: {
    marginRight: 8,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 0.7,
  },
  dividerText: {
    paddingHorizontal: 8,
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  switchText: {
    fontSize: 12,
  },
  switchButtonText: {
    fontWeight: "bold",
    fontSize: 13,
    marginLeft: 4,
  },
});
