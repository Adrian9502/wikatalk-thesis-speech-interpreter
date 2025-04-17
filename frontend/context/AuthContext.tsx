import React, { useEffect, ReactNode } from "react";
import { useAuthStore, initializeAuth } from "@/store/useAuthStore";
import { showToast } from "@/lib/showToast";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  useEffect(() => {
    // Initialize auth once on component mount
    const init = async () => {
      try {
        const isAppReady = useAuthStore.getState().isAppReady;

        if (!isAppReady) {
          console.log("Auth initializing...");
          await initializeAuth();
        } else {
          console.log("Auth already initialized");
        }
      } catch (error) {
        console.log("Auth initialization error:", error);
      }
    };

    init();
  }, []);

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
    isAppReady,
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
    isAppReady,
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
