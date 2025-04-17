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

  useEffect(() => {
    // Only initialize if not already done in RootLayout
    const init = async () => {
      try {
        // Check if we already have auth state in store before initializing again
        const isLoggedIn = useAuthStore.getState().isLoggedIn;
        const isAppReady = useAuthStore.getState().isAppReady;

        if (!isAppReady) {
          console.log("Auth not initialized yet, initializing...");
          await initializeAuth();
        } else {
          console.log("Auth already initialized, checking status...");
        }

        // Get latest token after initialization
        const token = await AsyncStorage.getItem("userToken");

        // Handle redirection based on token
        if (token) {
          console.log("Token exists, redirecting to Speech");
          router.replace("/(tabs)/Speech");
        } else {
          console.log("No token, staying on login screen");
          // Only go to login if not already there
          const currentPath = router.getCurrentRoute()?.path;
          if (currentPath && !currentPath.includes("index")) {
            router.replace("/");
          }
        }
      } catch (error) {
        console.log("Auth initialization error:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    init();
  }, []);
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
