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
import CustomSnackbar from "@/lib/CustomSnackbar";
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
interface AuthResponse {
  success: boolean;
  message?: string;
}
interface AuthContextType {
  isLoading: boolean;
  isAppReady: boolean;
  userToken: string | null;
  userData: UserData | null;
  showSnackbar: (
    message: string,
    type?: "success" | "error" | "neutral"
  ) => void;
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
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<
    "success" | "error" | "neutral"
  >("neutral");
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

  // Snackbar helper function to show popup messages
  const showSnackbar = (
    message: string,
    type: "success" | "error" | "neutral" = "neutral"
  ) => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };

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
        const tempUserData = {
          email: response.data.data.email,
          fullName: response.data.data.fullName,
          tempToken: response.data.data.tempToken,
          isVerified: false, // Add this explicitly
        };

        // Set data in state and storage
        setUserData(tempUserData);
        await AsyncStorage.setItem(
          "tempUserData",
          JSON.stringify(tempUserData)
        );

        showSnackbar(
          "Please verify your email to complete registration",
          "success"
        );
        console.log("AFTER REGISTER LOG DATA:");

        return { success: true };
      }

      throw new Error(response.data.message || "Registration failed");
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || "Registration failed";
      setError(message);
      showSnackbar(message, "error");
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
    clearFormMessage(); // Clear any existing messages
    console.log("🚀 Login attempt started");

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
      console.log("👤 User verification status:", user.isVerified);

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
        await router.replace("/(auth)/VerifyEmail");
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

        // Use InteractionManager for navigation
        InteractionManager.runAfterInteractions(async () => {
          await router.replace("/(tabs)/Home");
        });

        return { success: true };
      }

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

      showSnackbar("Logged out successfully!", "success");

      // Let the AuthGuard handle navigation
      // Remove direct navigation call here
    } catch (error) {
      console.error("Error during logout:", error);
      showSnackbar("Error logging out", "error");
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
        showSnackbar("Session expired. Please login again.", "error");
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
      const tempToken = userData?.tempToken;
      console.log("Verification attempt with:", {
        email: userData?.email,
        codeLength: verificationCode.length,
        hasTempToken: !!tempToken,
      });
      if (!tempToken) {
        showSnackbar("Invalid session. Please register again.", "error");
        router.replace("/(auth)/SignUp");
        return { success: false, message: "Invalid session" };
      }

      const response = await axios.post(`${API_URL}/api/users/verify-email`, {
        email: userData?.email,
        verificationCode,
        tempToken,
      });
      console.log("Verification response:", response.data);

      if (response.data.success) {
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

        return { success: true };
      }

      return { success: false, message: response.data.message };
    } catch (error: any) {
      const message = error.response?.data?.message || "Verification failed";
      showSnackbar(message, "error");
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
        showSnackbar("Verification email sent!", "success");
        return { success: true };
      } else {
        showSnackbar(response.data.message, "error");
        return { success: false, message: response.data.message };
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to send verification email";
      showSnackbar(message, "error");
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
      console.log("forgot password data: ", response.data);

      if (response.data.success) {
        showSnackbar(response.data.message, "success");

        // Store the email AND the reset password flow flag
        await Promise.all([
          AsyncStorage.setItem("resetEmailAddress", email),
          AsyncStorage.setItem("isResetPasswordFlow", "true"),
        ]);

        // Use setTimeout to ensure AsyncStorage writes complete before navigation
        setTimeout(() => {
          router.replace("/(auth)/VerifyResetPassword");
        }, 100);

        return { success: true };
      } else {
        showSnackbar(response.data.message, "error");
        return { success: false, message: response.data.message };
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to send reset code";
      showSnackbar(message, "error");
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

        showSnackbar("Code verified successfully!", "success");
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
        showSnackbar(errorMessage, "error");
        console.log("Verification failed:", errorMessage);

        return { success: false, message: errorMessage };
      }
    } catch (error: any) {
      // Log the full error for debugging
      console.error("Verification request error:", error);

      const message = error.response?.data?.message || "Verification failed";
      showSnackbar(message, "error");

      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };
  // Reset password ( set new password)
  const resetPassword = async (token: string, newPassword: string) => {
    setIsLoading(true);
    try {
      console.log("Sending password reset request to backend");
      const response = await axios.post(`${API_URL}/api/users/reset-password`, {
        token,
        newPassword,
      });

      console.log("Password reset response:", response.data);

      if (response.data.success) {
        console.log("Password reset successful");
        showSnackbar("Password reset successfully!", "success");

        // First return success, THEN clear storage and navigate
        setTimeout(async () => {
          try {
            await Promise.all([
              AsyncStorage.removeItem("resetToken"),
              AsyncStorage.removeItem("resetEmailAddress"),
              AsyncStorage.removeItem("isResetPasswordFlow"),
            ]);
            console.log("Reset data cleared from storage");
            router.replace("/(auth)/SignIn");
          } catch (clearError) {
            console.error("Error clearing storage:", clearError);
          }
        }, 1000);

        return { success: true };
      } else {
        console.log("Password reset failed:", response.data.message);
        showSnackbar(response.data.message, "error");
        return { success: false, message: response.data.message };
      }
    } catch (error: any) {
      console.error("Password reset error:", error);
      const message = error.response?.data?.message || "Password reset failed";
      showSnackbar(message, "error");
      return { success: false, message };
    } finally {
      setIsLoading(false);
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
        showSnackbar,
        verifyEmail,
        verifyPasswordResetCode,
        resetPassword,
        resendVerificationEmail,
        clearStorage,
      }}
    >
      {children}
      <CustomSnackbar
        visible={snackbarVisible}
        message={snackbarMessage}
        type={snackbarType}
        onDismiss={() => setSnackbarVisible(false)}
      />
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
