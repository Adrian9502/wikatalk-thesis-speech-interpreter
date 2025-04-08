import React, { useEffect, useState, ReactNode } from "react";
import { useAuthStore, initializeAuth } from "@/store/useAuthStore";
import { showToast } from "@/lib/showToast";
import SplashAnimation from "@/components/SplashAnimation";
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { isAppReady } = useAuthStore();
  const [showSplash, setShowSplash] = useState(!isAppReady);

  useEffect(() => {
    initializeAuth();
  }, []);

  // When app becomes ready, wait for splash animation to complete
  useEffect(() => {
    if (isAppReady && !showSplash) {
      // App is ready and splash has completed
    }
  }, [isAppReady, showSplash]);

  // Handle animation finish
  const handleSplashAnimationFinish = () => {
    setShowSplash(false);
  };

  if (!isAppReady) {
    return <SplashAnimation onAnimationFinish={handleSplashAnimationFinish} />;
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
