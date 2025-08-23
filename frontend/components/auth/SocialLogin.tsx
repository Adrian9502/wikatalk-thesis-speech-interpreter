import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Platform, Alert } from "react-native";
import { BASE_COLORS } from "@/constant/colors";
import {
  GoogleSigninButton,
  statusCodes,
  GoogleSignin,
  SignInResponse,
} from "@react-native-google-signin/google-signin";
import { useAuthStore } from "@/store/useAuthStore";
import CustomGoogleButton from "@/components/auth/GoogleLoginButton";

const SocialLogin = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { loginWithGoogle } = useAuthStore();

  useEffect(() => {
    const checkGoogleConfig = async () => {
      try {
        const isConfigured = await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });

        console.log("Google Play Services available:", isConfigured);
      } catch (error) {
        console.error("Google Play Services check failed:", error);
      }
    };

    checkGoogleConfig();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);

      // DEBUG: Log all environment variables
      console.log("=== GOOGLE SIGNIN ENVIRONMENT DEBUG ===");
      console.log(
        "Web Client ID:",
        process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB
      );
      console.log(
        "Android Client ID:",
        process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID
      );
      console.log(
        "iOS Client ID:",
        process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS
      );
      console.log(
        "All env vars:",
        Object.keys(process.env).filter((key) => key.includes("GOOGLE"))
      );
      console.log("=== END DEBUG ===");

      // Check Google Play Services
      const hasPlayServices = await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      console.log("Google Play Services available:", hasPlayServices);

      const userInfo: SignInResponse = await GoogleSignin.signIn();
      console.log("Google Sign-In Success!", userInfo);
      const idToken = userInfo?.data?.idToken ?? "";
      const userData = userInfo?.data?.user;

      if (!userData || !idToken) {
        throw new Error("Failed to get user data from Google Sign-In");
      }

      await loginWithGoogle(idToken, {
        name: userData.name ?? userData.email,
        email: userData.email,
        photo: userData.photo,
      });
    } catch (error: any) {
      console.error("Full Google sign-in error:", error);
      if (error.code) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            // Don't show alert for cancellation
            console.log("Sign-in cancelled by user");
            break;
          case statusCodes.IN_PROGRESS:
            Alert.alert("Sign in already in progress");
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert("Google Play services not available or outdated");
            break;
          default:
            console.error(
              `Google sign in error with code: ${error.code}`,
              error
            );
            Alert.alert(
              "Google Sign-In Error",
              `Error code: ${error.code} - ${error.message}`
            );
        }
      } else {
        // Check if it's a failed-to-get-data error (which often happens on cancel)
        if (
          error.message &&
          error.message.includes("Failed to get user data")
        ) {
          // This is likely a cancellation or silent failure - don't show alert
          console.log("Sign-in process did not complete");
        } else {
          // Show alert for other errors
          const errorMessage =
            error instanceof Error
              ? `${error.name}: ${error.message}`
              : "Unknown error type";
          console.error("Google sign in error:", errorMessage);
          Alert.alert(
            "Google Sign-In Error",
            `Something went wrong: ${errorMessage}`
          );
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <View style={styles.dividerContainer}>
        <View
          style={[
            styles.dividerLine,
            { backgroundColor: BASE_COLORS.placeholderText },
          ]}
        />
        <Text
          style={[styles.dividerText, { color: BASE_COLORS.placeholderText }]}
        >
          OR
        </Text>
        <View
          style={[
            styles.dividerLine,
            { backgroundColor: BASE_COLORS.placeholderText },
          ]}
        />
      </View>

      <View style={styles.socialButtonsContainer}>
        <CustomGoogleButton
          onPress={handleGoogleSignIn}
          isSubmitting={isSubmitting}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
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
    fontSize: 13,
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    minHeight: 48,
    paddingVertical: 8,
  },
  googleButton: {
    width: "100%",
    height: Platform.OS === "ios" ? 48 : 48,
  },
});

export default SocialLogin;
