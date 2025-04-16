import React, { useEffect, useState, ReactNode } from "react";
import { useAuthStore, initializeAuth } from "@/store/useAuthStore";
import { showToast } from "@/lib/showToast";
import SplashAnimation from "@/components/SplashAnimation";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { userToken, isLoggedIn } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      // Check if token exists first
      const token = await AsyncStorage.getItem("userToken");
      console.log("Initial token check:", !!token);

      // Initialize auth store
      await initializeAuth();

      setIsInitialized(true);
    };

    init();
  }, []);

  // Redirect based on auth status when initialized
  useEffect(() => {
    if (isInitialized) {
      const checkAuthAndRedirect = async () => {
        const token = await AsyncStorage.getItem("userToken");

        if (token) {
          console.log("Token exists, redirecting to Speech");
          router.replace("/(tabs)/Speech");
        } else {
          console.log("No token, staying on login screen");
        }
      };

      checkAuthAndRedirect();
    }
  }, [isInitialized]);

  if (!isInitialized) {
    return <SplashAnimation />;
  }

  return <>{children}</>;
};

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
