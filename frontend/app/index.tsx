"use client";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import React, { useEffect, useState, useRef } from "react";
import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import WikaTalkLogo from "@/components/WikaTalkLogo";
import FormInput from "@/components/FormInput";
import { useForm } from "react-hook-form";
import FormMessage from "@/components/FormMessage";
import { User, Lock, Mail } from "lucide-react-native";
import { yupResolver } from "@hookform/resolvers/yup";
import { useValidation } from "@/context/ValidationContext";
import { SignUpFormData, SignInFormData } from "@/context/ValidationContext";

const { width } = Dimensions.get("window");

export default function Index() {
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
  useEffect(() => {
    console.log("Form re-rendered");
  }, [formMessage, isLoading]);
  const [fontsLoaded] = useFonts({
    Baybayin: require("../assets/fonts/Baybayin-Regular.ttf"),
  });

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

  if (!fontsLoaded) {
    return null;
  }

  // Show loading screen while app is initializing
  if (!isAppReady) {
    return (
      <ImageBackground
        source={require("../assets/images/philippines-tapestry.jpg")}
        style={styles.background}
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
    const result = await register(
      fullName,
      username,
      email,
      password,
      confirmPassword
    );

    if (result.success) {
      // Use setTimeout to ensure state updates are complete
      setTimeout(() => {
        router.push("/(auth)/VerifyEmail");
      }, 200);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/philippines-tapestry.jpg")}
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
          keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0} // Adjust as needed
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <WikaTalkLogo />
          </View>

          {/* Form container */}
          <View style={styles.card}>
            {/* Compact tab navigation */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={styles.tab}
                onPress={() => switchTab("signin")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "signin" && styles.activeTabText,
                  ]}
                >
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tab}
                onPress={() => switchTab("signup")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "signup" && styles.activeTabText,
                  ]}
                >
                  Sign Up
                </Text>
              </TouchableOpacity>
              {/* Animated tab indicator */}
              <Animated.View
                style={[
                  styles.tabIndicator,
                  {
                    left: tabIndicatorLeft,
                  },
                ]}
              />
            </View>

            {/* Form container */}
            <View style={styles.formContainer}>
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
                    error={signInErrors.usernameOrEmail?.message as string}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <FormInput
                    control={signInControl}
                    name="password"
                    placeholder="Password"
                    secureTextEntry
                    IconComponent={Lock}
                    error={signInErrors.password?.message as string}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity style={styles.forgotPassword}>
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
                    error={signUpErrors.fullName?.message as string}
                    autoCapitalize="words"
                  />
                  <FormInput
                    control={signUpControl}
                    name="username"
                    placeholder="Username"
                    IconComponent={User}
                    error={signUpErrors.username?.message as string}
                    autoCapitalize="none"
                  />
                  <Text style={styles.noteContainer}>
                    Provide a <Text style={styles.boldText}>valid email</Text>{" "}
                    to receive a 6-digit code. Check spam/junk if not received.
                  </Text>
                  <FormInput
                    control={signUpControl}
                    name="email"
                    placeholder="Email"
                    keyboardType="email-address"
                    IconComponent={Mail}
                    error={signUpErrors.email?.message as string}
                    autoCapitalize="none"
                  />
                  <FormInput
                    control={signUpControl}
                    name="password"
                    placeholder="Password"
                    secureTextEntry
                    IconComponent={Lock}
                    error={signUpErrors.password?.message as string}
                    autoCapitalize="none"
                  />
                  <FormInput
                    control={signUpControl}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    secureTextEntry
                    IconComponent={Lock}
                    error={signUpErrors.confirmPassword?.message as string}
                    autoCapitalize="none"
                  />
                </>
              )}

              {/* Submit Button */}
              <Animated.View
                style={[
                  styles.buttonContainer,
                  { transform: [{ scale: buttonScale }] },
                ]}
              >
                <Pressable
                  style={styles.button}
                  disabled={isLoading}
                  onPress={() => {
                    if (activeTab === "signin") {
                      handleSignInSubmit(handleSignIn)();
                    } else {
                      handleSignUpSubmit(handleSignUp)();
                    }
                  }}
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
                      {activeTab === "signin" ? "Sign In" : "Sign Up"}
                    </Text>
                  </View>
                </Pressable>
              </Animated.View>

              {/* Social login options */}
              {activeTab === "signin" && (
                <>
                  <View style={styles.orContainer}>
                    <View style={styles.orLine} />
                    <Text style={styles.orText}>OR</Text>
                    <View style={styles.orLine} />
                  </View>

                  <View style={styles.socialContainer}>
                    <TouchableOpacity style={styles.socialButton}>
                      <Ionicons name="logo-google" size={20} color="#DB4437" />
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
                  <Text style={styles.switchActionText}>
                    {activeTab === "signin" ? "Sign Up" : "Sign In"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </ImageBackground>
  );
}

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
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    fontFamily: "Baybayin",
    fontSize: 42,
    color: "#FDB913",
    marginBottom: 6,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  tagline: {
    fontFamily: "Roboto",
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 16,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
    minHeight: 400,
  },
  noteContainer: {
    color: "#777", //
    padding: 5,
    fontFamily: "Poppins-Regular",
    borderColor: "#059669",
    fontSize: 12,
  },
  boldText: {
    fontFamily: "Poppins-SemiBold",
    color: "#555",
  },
  tabContainer: {
    flexDirection: "row",
    width: "100%",
    position: "relative",
    marginBottom: 16,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    zIndex: 1,
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    width: "50%",
    height: "100%",
    backgroundColor: "#FDB913",
    borderRadius: 10,
    opacity: 0.2,
    zIndex: 0,
  },
  tabText: {
    fontFamily: "Roboto",
    color: "#555",
    fontSize: 14,
    fontWeight: "bold",
  },
  activeTabText: {
    color: "#0038A8",
  },
  formContainer: {
    minHeight: 350,
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    fontFamily: "Roboto",
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 12,
  },
  forgotPasswordText: {
    fontFamily: "Roboto",
    color: "#0038A8",
    fontSize: 12,
  },
  buttonContainer: {
    width: "100%",
    borderRadius: 10,
    overflow: "hidden",
    marginVertical: 8,
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
    backgroundColor: "#CE1126",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  buttonText: {
    fontFamily: "Roboto",
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  orText: {
    fontFamily: "Roboto",
    color: "#888",
    paddingHorizontal: 8,
    fontSize: 12,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 1,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  switchText: {
    fontFamily: "Roboto",
    color: "#666",
    fontSize: 12,
  },
  switchActionText: {
    fontFamily: "Roboto",
    color: "#CE1126",
    fontWeight: "bold",
    fontSize: 12,
    marginLeft: 4,
  },
});
