"use client";
import {
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
    clearFormMessage();

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
      <View className="flex-1">
        <ImageBackground
          source={require("../assets/images/philippines-tapestry.jpg")}
          className="flex-1 w-full h-full"
        >
          <StatusBar style="light" />
          <LinearGradient
            colors={["rgba(0, 56, 168, 0.8)", "rgba(206, 17, 38, 0.8)"]}
            className="flex-1 justify-center items-center"
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              className="w-[85%] max-w-[350px] items-center"
              keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
            >
              {/* Logo */}
              <View className="items-center mb-5">
                <WikaTalkLogo />
              </View>

              {/* Form container */}
              <View className="bg-white/95 rounded-2xl p-4 w-full items-center shadow-md min-h-[400px]">
                {/* Compact tab navigation */}
                <View className="flex-row w-full relative mb-4 rounded-lg bg-gray-100 overflow-hidden">
                  <TouchableOpacity
                    className="flex-1 py-3 items-center z-10"
                    onPress={() => switchTab("signin")}
                  >
                    <Text
                      className={`font-bold text-sm ${
                        activeTab === "signin"
                          ? "text-amber-400"
                          : "text-gray-600"
                      }`}
                    >
                      Sign In
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 py-3 items-center z-10"
                    onPress={() => switchTab("signup")}
                  >
                    <Text
                      className={`font-bold text-sm ${
                        activeTab === "signup"
                          ? "text-amber-400"
                          : "text-gray-600"
                      }`}
                    >
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                  {/* Animated tab indicator */}
                  <Animated.View
                    style={[
                      {
                        position: "absolute",
                        bottom: 0,
                        width: "50%",
                        height: "100%",
                        backgroundColor: "#0038A8",
                        borderRadius: 10,
                        opacity: 0.9,
                        zIndex: 0,
                        left: tabIndicatorLeft,
                      },
                    ]}
                  />
                </View>

                {/* Form container */}
                <View className="min-h-[350px] w-full">
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
                        autoCapitalize="sentences"
                      />
                      <FormInput
                        control={signInControl}
                        name="password"
                        placeholder="Password"
                        secureTextEntry
                        IconComponent={Lock}
                        error={signInErrors.password?.message as string}
                      />
                      <TouchableOpacity
                        onPress={() => router.push("/(auth)/ForgotPassword")}
                        className="self-end mb-3"
                      >
                        <Text className="text-blue-800 text-sm">
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
                      />
                      <Text className="text-gray-500 p-1 text-sm">
                        Provide a{" "}
                        <Text className="font-semibold text-gray-700">
                          valid email
                        </Text>{" "}
                        to receive a 6-digit code. Check spam/junk if not
                        received.
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
                      />
                      <FormInput
                        control={signUpControl}
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        secureTextEntry
                        IconComponent={Lock}
                        error={signUpErrors.confirmPassword?.message as string}
                      />
                    </>
                  )}

                  {/* Submit Button */}
                  <Animated.View
                    style={[{ transform: [{ scale: buttonScale }] }]}
                    className="w-full rounded-lg overflow-hidden my-2 shadow"
                  >
                    <Pressable
                      className="bg-red-600 py-3 items-center justify-center rounded-lg"
                      disabled={isLoading}
                      onPress={() => {
                        if (activeTab === "signin") {
                          handleSignInSubmit(handleSignIn)();
                        } else {
                          handleSignUpSubmit(handleSignUp)();
                        }
                      }}
                    >
                      <View className="flex-row items-center justify-center">
                        {isLoading && (
                          <ActivityIndicator
                            size="small"
                            color="#FFFFFF"
                            className="mr-2"
                          />
                        )}
                        <Text className="text-white text-base font-bold">
                          {activeTab === "signin" ? "Sign In" : "Sign Up"}
                        </Text>
                      </View>
                    </Pressable>
                  </Animated.View>

                  {/* Social login options */}
                  {activeTab === "signin" && (
                    <>
                      <View className="flex-row items-center my-3">
                        <View className="flex-1 h-px bg-gray-200" />
                        <Text className="text-gray-500 px-2 text-sm">OR</Text>
                        <View className="flex-1 h-px bg-gray-200" />
                      </View>

                      <View className="flex-row justify-center mb-3">
                        <TouchableOpacity className="w-10 h-10 rounded-full bg-white justify-center items-center mx-2 shadow-sm">
                          <Ionicons
                            name="logo-google"
                            size={20}
                            color="#DB4437"
                          />
                        </TouchableOpacity>
                        <TouchableOpacity className="w-10 h-10 rounded-full bg-white justify-center items-center mx-2 shadow-sm">
                          <Ionicons
                            name="logo-facebook"
                            size={20}
                            color="#4267B2"
                          />
                        </TouchableOpacity>
                        <TouchableOpacity className="w-10 h-10 rounded-full bg-white justify-center items-center mx-2 shadow-sm">
                          <Ionicons name="mail" size={20} color="#333333" />
                        </TouchableOpacity>
                      </View>
                    </>
                  )}

                  {/* Switch between sign in and sign up */}
                  <View className="flex-row justify-center mt-3">
                    <Text className="text-gray-600 text-sm">
                      {activeTab === "signin"
                        ? "Don't have an account?"
                        : "Already have an account?"}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        switchTab(activeTab === "signin" ? "signup" : "signin")
                      }
                    >
                      <Text className="text-red-600 font-bold text-sm ml-1">
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
}
