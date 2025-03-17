import React, { useEffect, ReactNode } from "react";
import { useAuthStore, initializeAuth } from "@/store/useAuthStore";
import { StyleSheet } from "react-native";
import { showToast } from "@/lib/showToast";
import { TITLE_COLORS } from "@/constant/colors";
import DotsLoader from "@/components/DotLoader";
import { StatusBar } from "expo-status-bar";

import { SafeAreaView } from "react-native-safe-area-context";
import AuthLogo from "@/components/AuthLogo";
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { isAppReady } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, []);

  if (!isAppReady) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <AuthLogo title="Talk" />
        <DotsLoader />
      </SafeAreaView>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TITLE_COLORS.customNavyBlue,
    justifyContent: "space-around",
    alignItems: "center",
  },
});

// Hook for compatibility with existing code
export const useAuth = () => {
  const {
    isLoading,
    userToken,
    userData,
    error,
    formMessage,
    isLoggedIn,
    isVerified,
    setFormMessage,
    clearFormMessage,
    register,
    login,
    logout,
    getUserProfile,
    verifyEmail,
    resendVerificationEmail,
    sendPasswordResetCode,
    verifyPasswordResetCode,
    resetPassword,
    clearStorage,
    clearResetData,
  } = useAuthStore();

  return {
    isLoading,
    isAppReady: true,
    userToken,
    userData,
    error,
    formMessage,
    isLoggedIn,
    isVerified,
    showToast,
    setFormMessage,
    clearFormMessage,
    register,
    login,
    logout,
    getUserProfile,
    verifyEmail,
    resendVerificationEmail,
    sendPasswordResetCode,
    verifyPasswordResetCode,
    resetPassword,
    clearStorage,
    clearResetData,
  };
};
