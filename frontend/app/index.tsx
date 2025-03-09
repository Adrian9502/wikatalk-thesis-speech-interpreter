"use client";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
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

import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import React, { useEffect, useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import WikaTalkLogo from "@/components/WikaTalkLogo";
import FormInput from "@/components/FormInput";
import { useForm } from "react-hook-form";
import FormMessage from "@/components/FormMessage";
import { User, Lock, Mail } from "lucide-react-native";
import { yupResolver } from "@hookform/resolvers/yup";
import { useValidation } from "@/context/ValidationContext";
import { SignUpFormData, SignInFormData } from "@/context/ValidationContext";
import { verifyInstallation } from "nativewind";
// check nativewind installation
verifyInstallation();

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

    // setTimeout(() => {
    //   router.push("/(tabs)/Home");
    // }, 2000);

    let mounted = true;

    const initializeApp = async () => {
      if (isAppReady && mounted) {
        // Add small delay to ensure layout is mounted
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (isLoggedIn) {
          router.replace("/(tabs)/Home");
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
      <ImageBackground
        source={require("../assets/images/philippines-tapestry.jpg")}
        className="flex-1 w-full h-full"
      ></ImageBackground>
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
      <View style={styles.container}>
        <ImageBackground
          source={require("../assets/images/philippines-tapestry.jpg")}
          style={styles.imageBackground}
        >
          <StatusBar style="light" />
          <LinearGradient
            colors={["rgba(0, 56, 168, 0.8)", "rgba(206, 17, 38, 0.8)"]}
            style={styles.gradient}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.keyboardAvoidingView}
              keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
            >
              {/* Logo */}
              <View style={styles.logoContainer}>
                <WikaTalkLogo />
              </View>

              {/* Form container */}
              <View style={styles.formOuterContainer}>
                {/* Compact tab navigation */}
                <View style={styles.tabContainer}>
                  <TouchableOpacity
                    style={styles.tabButton}
                    onPress={() => switchTab("signin")}
                  >
                    <Text
                      style={[
                        styles.tabButtonText,
                        activeTab === "signin"
                          ? styles.activeTabText
                          : styles.inactiveTabText,
                      ]}
                    >
                      Sign In
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.tabButton}
                    onPress={() => switchTab("signup")}
                  >
                    <Text
                      style={[
                        styles.tabButtonText,
                        activeTab === "signup"
                          ? styles.activeTabText
                          : styles.inactiveTabText,
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
                      backgroundColor: "#0038A8",
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
                      <FormInput
                        control={signInControl}
                        name="usernameOrEmail"
                        placeholder="Username or Email"
                        IconComponent={User}
                        error={signInErrors.usernameOrEmail?.message}
                        keyboardType="email-address"
                        autoCapitalize="sentences"
                      />
                      <FormInput
                        control={signInControl}
                        name="password"
                        placeholder="Password"
                        secureTextEntry
                        IconComponent={Lock}
                        error={signInErrors.password?.message}
                      />
                      <TouchableOpacity
                        onPress={() => router.push("/(auth)/ForgotPassword")}
                        style={styles.forgotPasswordButton}
                      >
                        <Text style={styles.forgotPasswordText}>
                          Forgot Password?
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {/* Sign Up Form */}
                  {activeTab === "signup" && (
                    <>
                      <FormInput
                        control={signUpControl}
                        name="fullName"
                        placeholder="Full Name"
                        IconComponent={User}
                        error={signUpErrors.fullName?.message}
                        autoCapitalize="words"
                      />
                      <FormInput
                        control={signUpControl}
                        name="username"
                        placeholder="Username"
                        IconComponent={User}
                        error={signUpErrors.username?.message}
                      />
                      <Text style={styles.helpText}>
                        Provide a{" "}
                        <Text style={styles.helpTextBold}>valid email</Text> to
                        receive a 6-digit code. Check spam/junk if not received.
                      </Text>
                      <FormInput
                        control={signUpControl}
                        name="email"
                        placeholder="Email"
                        keyboardType="email-address"
                        IconComponent={Mail}
                        error={signUpErrors.email?.message}
                        autoCapitalize="none"
                      />
                      <FormInput
                        control={signUpControl}
                        name="password"
                        placeholder="Password"
                        secureTextEntry
                        IconComponent={Lock}
                        error={signUpErrors.password?.message}
                      />
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
                      style={styles.submitButton}
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
                        {isLoading && (
                          <ActivityIndicator
                            size="small"
                            color="#FFFFFF"
                            style={styles.activityIndicator}
                          />
                        )}
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
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine} />
                      </View>

                      <View style={styles.socialButtonsContainer}>
                        <TouchableOpacity style={styles.socialButton}>
                          <Ionicons
                            name="logo-google"
                            size={20}
                            color="#DB4437"
                          />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialButton}>
                          <Ionicons
                            name="logo-facebook"
                            size={20}
                            color="#4267B2"
                          />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialButton}>
                          <Ionicons name="mail" size={20} color="#333333" />
                        </TouchableOpacity>
                      </View>
                    </>
                  )}

                  {/* Switch between sign in and sign up */}
                  <View style={styles.switchContainer}>
                    <Text style={styles.switchText}>
                      {activeTab === "signin"
                        ? "Don't have an account?"
                        : "Already have an account?"}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        switchTab(activeTab === "signin" ? "signup" : "signin")
                      }
                    >
                      <Text style={styles.switchButtonText}>
                        {activeTab === "signin" ? "Sign Up" : "Sign In"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </KeyboardAvoidingView>
          </LinearGradient>
        </ImageBackground>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    marginBottom: 20,
  },
  formOuterContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
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
    backgroundColor: "#f3f4f6",
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
    color: "#fbbf24",
  },
  inactiveTabText: {
    color: "#4b5563",
  },
  formInnerContainer: {
    minHeight: 350,
    width: "100%",
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginBottom: 12,
  },
  forgotPasswordText: {
    color: "#1e40af",
    fontSize: 14,
  },
  helpText: {
    color: "#6b7280",
    padding: 4,
    fontSize: 14,
  },
  helpTextBold: {
    fontWeight: "600",
    color: "#374151",
  },
  submitButton: {
    backgroundColor: "#dc2626",
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
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    color: "#6b7280",
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
    backgroundColor: "white",
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
    justifyContent: "center",
    marginTop: 12,
  },
  switchText: {
    color: "#4b5563",
    fontSize: 14,
  },
  switchButtonText: {
    color: "#dc2626",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 4,
  },
});
