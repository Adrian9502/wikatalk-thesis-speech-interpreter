"use client";

import { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function WikaTalkLandingV3() {
  const [activeTab, setActiveTab] = useState("signin");
  const [buttonScale] = useState(new Animated.Value(1));
  const tabIndicatorPosition = useRef(new Animated.Value(0)).current;
  const [fontsLoaded] = useFonts({
    Baybayin: require("../assets/fonts/Baybayin-Regular.ttf"),
    Roboto: require("../assets/fonts/Poppins-Regular.ttf"),
  });

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    Animated.timing(tabIndicatorPosition, {
      toValue: tab === "signin" ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  if (!fontsLoaded) {
    return null;
  }

  const tabIndicatorLeft = tabIndicatorPosition.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "50%"],
  });

  return (
    <ImageBackground
      source={require("../assets/images/philippines-tapestry.jpg")}
      style={styles.background}
    >
      <LinearGradient
        colors={["rgba(0, 56, 168, 0.8)", "rgba(206, 17, 38, 0.8)"]}
        style={styles.overlay}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>WikaTalk</Text>
            <Text style={styles.tagline}>Bridging Philippine Languages</Text>
          </View>

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

            {/* Compact form */}
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color="#0038A8"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#888"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color="#0038A8"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#888"
                  secureTextEntry
                />
              </View>
              {activeTab === "signup" && (
                <>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color="#0038A8"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm Password"
                      placeholderTextColor="#888"
                      secureTextEntry
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="person-outline"
                      size={18}
                      color="#0038A8"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Full Name"
                      placeholderTextColor="#888"
                    />
                  </View>
                </>
              )}

              {activeTab === "signin" && (
                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              )}

              <Animated.View
                style={[
                  styles.buttonContainer,
                  { transform: [{ scale: buttonScale }] },
                ]}
              >
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    animateButton();
                    // Add your sign in / sign up logic here
                  }}
                >
                  <Text style={styles.buttonText}>
                    {activeTab === "signin" ? "Sign In" : "Sign Up"}
                  </Text>
                </TouchableOpacity>
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
