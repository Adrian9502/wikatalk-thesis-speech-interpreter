import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { AppState, AppStateStatus, InteractionManager } from "react-native";
import { router } from "expo-router";
import { showToast } from "@/lib/showToast";

// get the api url from the .env file
const API_URL = `${process.env.EXPO_PUBLIC_BACKEND_URL}`;

// Type definitions
interface UserData {
  id?: string;
  fullName: string;
  username?: string;
  email: string;
  profilePicture?: string;
  createdAt?: string;
  isVerified?: boolean;
  updatedAt?: string;
  tempToken?: string;
}
interface ShowToastData {
  type: "success" | "error" | "info";
  title: string;
  description: string;
}
interface AuthResponse {
  success: boolean;
  message?: string;
}
interface AuthContextType {
  isLoading: boolean;
  isAppReady: boolean;
  userToken: string | null;
  userData: UserData | null;
  showToast: (data: ShowToastData) => void;
  error: string | null;
  register: (
    fullName: string,
    username: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => Promise<AuthResponse>;
  login: (usernameOrEmail: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  formMessage: FormMessage | null;
  setFormMessage: (
    message: string,
    type: "success" | "error" | "neutral"
  ) => void;
  clearFormMessage: () => void;
  getUserProfile: () => Promise<UserData | undefined>;
  isLoggedIn: boolean;
  isVerified: boolean;
  verifyEmail: (token: string) => Promise<AuthResponse>;
  resendVerificationEmail: () => Promise<AuthResponse>;
  sendPasswordResetCode: (email: string) => Promise<AuthResponse>;
  verifyPasswordResetCode: (
    email: string,
    verificationCode: string
  ) => Promise<AuthResponse & { token?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<AuthResponse>;
  clearStorage: () => Promise<void>;
  clearResetData: () => Promise<void>;
}
interface AuthProviderProps {
  children: ReactNode;
}
// interface for api connection testing
interface ApiResponse {
  message?: string;
  data?: unknown;
}
interface ApiError {
  message: string;
  config?: {
    url?: string;
    method?: string;
  };
}
interface FormMessage {
  text: string;
  type: "success" | "error" | "neutral";
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [appInactiveTime, setAppInactiveTime] = useState<number | null>(null);
  const [formMessage, setFormMessageState] = useState<FormMessage | null>(null);
  const INACTIVE_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds
  const [isAppReady, setIsAppReady] = useState(false);

  // Test API connection on startup
  // if this fails and you are using the expo go app,
  // you may need to update the .env to replace EXPO_PUBLIC_BACKEND_URL
  // to your PC/Laptop IPv4 address so that the app can connect to the backend

  // Heres my set up :
  // EXPO_PUBLIC_BACKEND_URL=http://192.168.18.82:5000
  // This is my IPv4 address, you can find yours by running ipconfig in cmd
  // and replace "192.168.18.82" with your IPv4 address
  useEffect(() => {
    const testAPI = async (): Promise<void> => {
      try {
        const response = await axios.get<ApiResponse>(
          `${process.env.EXPO_PUBLIC_BACKEND_URL}/`
        );
        console.log("API test successful:", response.data);
      } catch (error) {
        const apiError = error as ApiError;
        console.error("API test failed:", apiError.message);
        console.error("Request URL:", apiError.config?.url);
        console.error("Request method:", apiError.config?.method);
      }
    };

    testAPI();
  }, []);

  // Load token and user data from storage on startup
  useEffect(() => {
    const loadStorageData = async (): Promise<void> => {
      try {
        console.log("ON COMPONENT RENDER LOG DATA:");

        // Get all stored data
        const [storedToken, storedUserData, tempUserData] = await Promise.all([
          AsyncStorage.getItem("userToken"),
          AsyncStorage.getItem("userData"),
          AsyncStorage.getItem("tempUserData"),
        ]);

        // Check for temporary verification data first
        if (tempUserData) {
          const parsedTempData = JSON.parse(tempUserData);
          if (parsedTempData.tempToken) {
            setUserData(parsedTempData);
            console.log("Restored verification session");
            return;
          }
        }

        if (storedToken && storedUserData) {
          const userData = JSON.parse(storedUserData);

          // Verify user status with backend
          try {
            const response = await axios.post(
              `${API_URL}/api/users/check-verification`,
              {
                email: userData.email,
              }
            );

            if (response.data.success && response.data.isVerified) {
              setUserToken(storedToken);
              setUserData({ ...userData, isVerified: true });
              axios.defaults.headers.common[
                "Authorization"
              ] = `Bearer ${storedToken}`;
            } else {
              // Clear data if not verified
              await AsyncStorage.multiRemove(["userToken", "userData"]);
              setUserData(null);
              setUserToken(null);
            }
          } catch (error) {
            console.error("Verification check failed:", error);
            await AsyncStorage.multiRemove(["userToken", "userData"]);
          }
        }
      } catch (error) {
        console.error("Error loading auth info:", error);
        await AsyncStorage.clear();
        setUserData(null);
        setUserToken(null);
      } finally {
        console.log("FINAL LOG DATA ON USEEFFECT:");

        setIsLoading(false);
        setIsAppReady(true);
      }
    };

    loadStorageData();
  }, []);

  useEffect(() => {
    const persistVerificationData = async () => {
      if (userData?.tempToken && !userData?.isVerified) {
        await AsyncStorage.setItem("tempUserData", JSON.stringify(userData));
      }
    };

    persistVerificationData();
  }, [userData]);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, [appInactiveTime, userData]);
  // Set form message response
  const setFormMessage = (
    text: string,
    type: "success" | "error" | "neutral" = "neutral"
  ) => {
    setFormMessageState({ text, type });
  };

  const clearFormMessage = () => {
    setFormMessageState(null);
  };

  // Check if Verification is in process
  const isInVerificationProcess = (userData: UserData | null): boolean => {
    return !!(userData?.tempToken && !userData?.isVerified);
  };

  // Handle app state
  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    const currentTime = Date.now();

    if (nextAppState === "active") {
      // App came back to foreground
      if (appInactiveTime && currentTime - appInactiveTime > INACTIVE_TIMEOUT) {
        // Only clear if app was inactive for more than INACTIVE_TIMEOUT
        try {
          if (!isInVerificationProcess(userData)) {
            await AsyncStorage.multiRemove(["userToken", "userData"]);
            setUserToken(null);
            setUserData(null);
            delete axios.defaults.headers.common["Authorization"];
            console.log("Cleared auth data due to long inactivity");
          }
        } catch (error) {
          console.error("Error clearing auth data:", error);
        }
      }
      setAppInactiveTime(null);
    } else if (nextAppState === "background") {
      // App went to background
      setAppInactiveTime(currentTime);
    }
  };

  // State listener
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, []);

  // Register user
  const register = async (
    fullName: string,
    username: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/api/users/register`, {
        fullName,
        username,
        email,
        password,
        confirmPassword,
      });

      if (response.data.success) {
        // clear form message after register
        clearFormMessage();
        const tempUserData = {
          email: response.data.data.email,
          fullName: response.data.data.fullName,
          tempToken: response.data.data.tempToken,
          isVerified: false,
        };

        // Set data in state and storage
        setUserData(tempUserData);
        await AsyncStorage.setItem(
          "tempUserData",
          JSON.stringify(tempUserData)
        );

        showToast({
          type: "success",
          title: "Verify your email",
          description: response.data.message,
        });

        // redirect to verify email after successful registration
        router.push("/(auth)/VerifyEmail");
        return { success: true };
      }
      clearFormMessage();

      throw new Error(response.data.message || "Registration failed");
    } catch (error: any) {
      clearFormMessage();

      const message =
        error.response?.data?.message || error.message || "Registration failed";
      setError(message);

      showToast({
        type: "error",
        title: "Registration failed",
        description: message,
      });

      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  // Login user
  const login = async (
    usernameOrEmail: string,
    password: string
  ): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);
    clearFormMessage();
    try {
      // Clear any existing tokens first
      await AsyncStorage.multiRemove(["userToken", "userData"]);
      console.log("🔄 Cleared existing tokens");

      const response = await axios.post(`${API_URL}/api/users/login`, {
        usernameOrEmail,
        password,
      });

      console.log("📥 Login response:", response.data);

      const { token, ...user } = response.data.data;

      // Handle unverified user
      if (user.isVerified === false) {
        console.log("❌ User not verified - handling unverified flow");
        const tempUserData = {
          email: user.email,
          fullName: user.fullName,
          tempToken: token,
          isVerified: false,
        };

        setUserData(tempUserData);
        await AsyncStorage.setItem(
          "tempUserData",
          JSON.stringify(tempUserData)
        );
        setFormMessage("Please verify your email to continue", "neutral");
        router.replace("/(auth)/VerifyEmail");
        return { success: true };
      }

      // Handle successful login for verified users
      if (response.data.success) {
        console.log("✅ Login successful - setting up session");
        await Promise.all([
          AsyncStorage.setItem("userToken", token),
          AsyncStorage.setItem("userData", JSON.stringify(user)),
        ]);

        setUserToken(token);
        setUserData(user);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setFormMessage("Login successful!", "success");

        showToast({
          type: "success",
          title: "Login Successful!",
          description: response.data.message,
        });

        // Use InteractionManager for navigation
        InteractionManager.runAfterInteractions(async () => {
          router.replace("/(tabs)/Home");
        });

        return { success: true };
      }
      // clear form message after login
      clearFormMessage();

      throw new Error(response.data.message || "Login failed");
    } catch (error: any) {
      console.log("❌ Login failed:", error.response?.data || error.message);
      const message = error.response?.data?.message || "Login failed";
      setError(message);
      setFormMessage(message, "error");
      return { success: false, message };
    } finally {
      setIsLoading(false);
      console.log("🏁 Login attempt finished");
    }
  };

  // Logout user
  const logout = async (): Promise<void> => {
    setIsLoading(true);

    try {
      console.log("BEFORE LOG OUT DATA:");

      // Clear storage first
      await Promise.all([
        AsyncStorage.removeItem("userToken"),
        AsyncStorage.removeItem("userData"),
        AsyncStorage.removeItem("tempUserData"),
        AsyncStorage.removeItem("tempToken"),
      ]);

      // Update state after storage is cleared
      setUserToken(null);
      setUserData(null);
      delete axios.defaults.headers.common["Authorization"];

      showToast({
        type: "success",
        title: "Logged out",
        description: "Logged out successfully!",
      });
      // Let the AuthGuard handle navigation
      // Remove direct navigation call here
      router.replace("/");
    } catch (error) {
      console.error("Error during logout:", error);
      showToast({
        type: "error",
        title: "Error logging out",
        description: "Error during logout",
      });
    } finally {
      setIsLoading(false);
      console.log("AFTER LOGOUT LOG DATA:");
    }
  };

  // Get user profile
  const getUserProfile = async (): Promise<UserData | undefined> => {
    try {
      const response = await axios.get(`${API_URL}/profile`);

      if (response.data.success) {
        setUserData(response.data.data);
        return response.data.data;
      }
    } catch (error: any) {
      console.error("Error fetching user profile:", error);
      if (error.response?.status === 401) {
        showToast({
          type: "error",
          title: "Error, Session expired",
          description: "Session expired. Please login again.",
        });
        logout();
      }
    }
    return undefined;
  };

  // ? -- EMAIL VERIFICATION SECTION --
  const verifyEmail = async (
    verificationCode: string
  ): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      clearFormMessage();
      const tempToken = userData?.tempToken;

      if (!tempToken) {
        showToast({
          type: "error",
          title: "Invalid Session",
          description: "Invalid session. Please register again.",
        });

        await AsyncStorage.clear();
        router.replace("/");
        return { success: false, message: "Invalid session" };
      }

      const response = await axios.post(`${API_URL}/api/users/verify-email`, {
        email: userData?.email,
        verificationCode,
        tempToken,
      });

      if (response.data.success) {
        clearFormMessage();
        const { token, user } = response.data;

        // Clear old data and set new data only after successful verification
        await Promise.all([
          AsyncStorage.removeItem("tempUserData"),
          AsyncStorage.removeItem("tempToken"),
          AsyncStorage.setItem("userToken", token),
          AsyncStorage.setItem("userData", JSON.stringify(user)),
        ]);

        setUserToken(token);
        setUserData(user);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        // Show toast message to inform user
        showToast({
          type: "success",
          title: "Verification Success!",
          description: response.data.message,
        });
        // after successful verification. redirect to Main screen
        setTimeout(() => {
          router.replace("/(tabs)/Home");
        }, 1000);
        return { success: true };
      }

      return { success: false, message: response.data.message };
    } catch (error: any) {
      const message = error.response?.data?.message || "Verification failed";
      setFormMessage(message);

      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };
  const resendVerificationEmail = async (): Promise<AuthResponse> => {
    try {
      const response = await axios.post(
        `${API_URL}/api/users/resend-verification-code`,
        {
          email: userData?.email,
        }
      );

      if (response.data.success) {
        showToast({
          type: "success",
          title: "Verification Email Sent!",
          description: response.data.message,
        });
        return { success: true };
      } else {
        showToast({
          type: "error",
          title: "Verification Send Error",
          description: response.data.message,
        });

        return { success: false, message: response.data.message };
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to send verification email";
      showToast({
        type: "error",
        title: "Error",
        description: message,
      });
      return { success: false, message };
    }
  };
  // ? -- PASSWORD RESET SECTION --
  // Forgot password (send reset code)
  const sendPasswordResetCode = async (
    email: string
  ): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/users/forgot-password`,
        {
          email,
        }
      );
      console.log("forgot password response: ", response.data);

      if (response.data.success) {
        showToast({
          type: "success",
          title: "Email sent!",
          description: response.data.message,
        });
        // Store the email AND the reset password flow flag
        await Promise.all([
          AsyncStorage.setItem("resetEmailAddress", email),
          AsyncStorage.setItem("isResetPasswordFlow", "true"),
        ]);

        // Use setTimeout to ensure AsyncStorage writes complete before navigation
        // setTimeout(() => {
        //   router.replace("/(auth)/VerifyResetPassword");
        // }, 100);

        return { success: true };
      } else {
        showToast({
          type: "error",
          title: "Error sending email",
          description: response.data.message,
        });
        return { success: false, message: response.data.message };
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to process your request";
      showToast({
        type: "error",
        title: "Error sending email",
        description: message,
      });
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };
  // Verify the reset code ( check if code is valid)
  const verifyPasswordResetCode = async (
    email: string,
    verificationCode: string
  ): Promise<AuthResponse & { token?: string }> => {
    setIsLoading(true);
    try {
      console.log("Verifying reset code with data:", {
        email,
        verificationCode,
      });

      const response = await axios.post(
        `${API_URL}/api/users/verify-reset-code`,
        {
          email,
          verificationCode,
        }
      );

      console.log("Verification API response:", response.data);

      // Check if the response indicates success
      if (response.data && response.data.success === true) {
        console.log(
          "Verification successful, resetToken:",
          response.data.resetToken
        );

        // Store both the reset token and a flag indicating we're in the password reset flow
        await Promise.all([
          AsyncStorage.setItem("resetToken", response.data.resetToken),
          AsyncStorage.setItem("isResetPasswordFlow", "true"),
        ]);

        showToast({
          type: "success",
          title: "Code Verified successfully!",
          description: response.data.message,
        });
        console.log("Setting reset flow flag and navigating to SetNewPassword");

        // Set a specific timeout to ensure state updates before navigation
        setTimeout(() => {
          router.replace("/(auth)/SetNewPassword");
        }, 100);

        return {
          success: true,
          token: response.data.resetToken,
        };
      } else {
        // Handle when the API returns success: false
        const errorMessage = response.data.message || "Verification failed";

        showToast({
          type: "error",
          title: "Verification Error",
          description: errorMessage,
        });

        console.log("Verification failed:", errorMessage);

        return { success: false, message: errorMessage };
      }
    } catch (error: any) {
      // Log the full error for debugging
      console.error("Verification request error:", error);

      const message = error.response?.data?.message || "Verification failed";

      showToast({
        type: "error",
        title: "Verification Error",
        description: message,
      });
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };
  // Reset password (set new password)
  const resetPassword = async (token: string, newPassword: string) => {
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/users/reset-password`, {
        token,
        newPassword,
      });

      const { success, message } = response.data;

      showToast({
        type: success ? "success" : "error",
        title: success
          ? "Password reset successfully!"
          : "Password reset failed!",
        description: message,
      });

      if (success) {
        // Clear storage items after successful reset
        await clearResetData();
        return { success: true };
      }

      return { success: false, message };
    } catch (error: any) {
      const message = error.response?.data?.message || "Password reset failed";

      showToast({
        type: "error",
        title: "Password reset error",
        description: message,
      });

      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to clear reset password data
  const clearResetData = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem("resetToken"),
        AsyncStorage.removeItem("resetEmailAddress"),
        AsyncStorage.removeItem("isResetPasswordFlow"),
      ]);

      // Wait a bit before navigation to ensure toast is visible
      setTimeout(() => {
        router.replace("/");
      }, 1000);
    } catch (error) {
      console.error("Error clearing storage:", error);
    }
  };
  // ? -- Remove all async storage data --
  const clearStorage = async () => {
    try {
      await AsyncStorage.clear();
      console.log("✅ AsyncStorage cleared successfully!");
    } catch (error) {
      console.error("❌ Error clearing AsyncStorage:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAppReady,
        userToken,
        userData,
        error,
        register,
        formMessage,
        setFormMessage,
        clearFormMessage,
        sendPasswordResetCode,
        login,
        logout,
        getUserProfile,
        isLoggedIn: !!userToken,
        isVerified: userData?.isVerified ?? false,
        showToast,
        verifyEmail,
        verifyPasswordResetCode,
        resetPassword,
        resendVerificationEmail,
        clearStorage,
        clearResetData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
