import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Alert,
  TouchableOpacity,
} from "react-native";
import { BASE_COLORS } from "@/constant/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constant/fontSizes";
import {
  statusCodes,
  GoogleSignin,
  SignInResponse,
} from "@react-native-google-signin/google-signin";
import { useAuthStore } from "@/store/useAuthStore";
import CustomGoogleButton from "@/components/auth/GoogleLoginButton";
import TermsOfUseModal from "@/components/legal/TermsOfUseModal";
import showNotification from "@/lib/showNotification";

const SocialLogin = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
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
        showNotification({
          type: "error",
          title: "Google Login Unavailable",
          description:
            "Oops! Your device doesn't have Google Play Services, so Google login won't work. Please use another login method.",
        });
      }
    };

    checkGoogleConfig();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);

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

      const result = await loginWithGoogle(idToken, {
        name: userData.name ?? userData.email,
        email: userData.email,
        photo: userData.photo,
      });

      // The success message is now handled in the store
      console.log("Google login completed:", result);
    } catch (error: any) {
      console.error("Full Google sign-in error:", error);

      if (error.code) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            // Don't show notification for cancellation
            console.log("Sign-in cancelled by user");
            break;
          case statusCodes.IN_PROGRESS:
            showNotification({
              type: "info",
              title: "Sign-In In Progress",
              description: "Sign in is already in progress. Please wait.",
            });
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            showNotification({
              type: "error",
              title: "Google Play Services Unavailable",
              description:
                "Google Play services are not available or outdated.",
            });
            break;
          default:
            console.error(
              `Google sign in error with code: ${error.code}`,
              error
            );
            showNotification({
              type: "error",
              title: "Google Sign-In Error",
              description: `Error code: ${error.code} - ${error.message}`,
            });
        }
      } else {
        if (
          error.message &&
          error.message.includes("Failed to get user data")
        ) {
          console.log("Sign-in process did not complete");
        } else {
          const errorMessage =
            error instanceof Error
              ? `${error.name}: ${error.message}`
              : "Unknown error type";
          console.error("Google sign in error:", errorMessage);
          showNotification({
            type: "error",
            title: "Google Sign-In Error",
            description: `Something went wrong: ${errorMessage}`,
          });
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
      {/*Terms text below Google login button */}
      <View style={styles.termsTextContainer}>
        <Text style={styles.termsText}>
          By logging in with Google, you agree to our{"  "}
        </Text>
        <TouchableOpacity
          onPress={() => setShowTermsModal(true)}
          style={styles.termsLinkContainer}
        >
          <Text style={styles.termsLink}>Terms of Use</Text>
        </TouchableOpacity>
      </View>

      {/* Terms Modal */}
      <TermsOfUseModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  dividerLine: {
    flex: 1,
    height: 0.7,
  },
  dividerText: {
    paddingHorizontal: 8,
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.regular,
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  googleButton: {
    width: "100%",
    height: Platform.OS === "ios" ? 48 : 48,
  },
  // Terms text styles (similar to SignUpForm)
  termsTextContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  termsText: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.placeholderText,
    textAlign: "center",
    lineHeight: 16,
  },
  termsLinkContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  termsLink: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.blue,
    textDecorationLine: "underline",
  },
});

export default SocialLogin;
