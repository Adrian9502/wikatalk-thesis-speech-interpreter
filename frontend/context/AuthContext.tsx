import React, { useEffect, useState, ReactNode } from "react";
import { useAuthStore, initializeAuth } from "@/store/useAuthStore";
import { showToast } from "@/lib/showToast";
import SplashAnimation from "@/components/SplashAnimation";
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  useEffect(() => {
    initializeAuth();
  }, []);

  // _layout.tsx will handle the splash screen
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
