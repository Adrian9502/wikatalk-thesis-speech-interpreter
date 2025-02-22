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
  getUserProfile: () => Promise<UserData | undefined>;
  isLoggedIn: boolean;
  isVerified: boolean;
  verifyEmail: (token: string) => Promise<AuthResponse>;
  forgotPassword: (email: string) => Promise<AuthResponse>;
  resetPassword: (token: string, newPassword: string) => Promise<AuthResponse>;
  resendVerificationEmail: () => Promise<AuthResponse>;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// helper function to check if user loggedin

const logStorageData = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    console.log("\n=== AsyncStorage Data ===");
    console.log("Storage Keys:", keys);

    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);

      let parsedValue;
      try {
        parsedValue = JSON.parse(value!);
      } catch (e) {
        parsedValue = value; // Fallback to raw string if not JSON
      }

      console.log(`\n${key}:`, parsedValue);
    }
    console.log("========================\n");
  } catch (error) {
    console.error("Error logging storage:", error);
  }
};

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
        await logStorageData();

        // Get all stored data
        const [storedToken, storedUserData] = await Promise.all([
          AsyncStorage.getItem("userToken"),
          AsyncStorage.getItem("userData"),
        ]);

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
        await logStorageData();
        setIsLoading(false);
        setIsAppReady(true);
      }
    };

    loadStorageData();
  }, []);

  // Handle app state
  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === "background" || nextAppState === "inactive") {
      try {
        // Clear all auth data when app goes to background
        await AsyncStorage.multiRemove([
          "userToken",
          "userData",
          "tempUserData",
          "tempToken",
        ]);

        // Clear state
        setUserToken(null);
        setUserData(null);
        delete axios.defaults.headers.common["Authorization"];

        console.log("Cleared auth data on app close");
      } catch (error) {
        console.error("Error clearing auth data:", error);
      }
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
        await logStorageData(); // Log initial state

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

    try {
      // Clear any existing tokens first
      await AsyncStorage.multiRemove(["userToken", "userData"]);

      const response = await axios.post(`${API_URL}/api/users/login`, {
        usernameOrEmail,
        password,
      });

      console.log("Login response:", response.data);

      const { token, ...user } = response.data.data;
      console.log("User verification status:", user.isVerified);

      // Handle unverified user
      if (user.isVerified === false) {
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
        showSnackbar("Please verify your email to continue", "neutral");
        await router.replace("/(auth)/VerifyEmail");
        return { success: true };
      }

      // Handle successful login for verified users
      // Update storage and state
      await Promise.all([
        AsyncStorage.setItem("userToken", token),
        AsyncStorage.setItem("userData", JSON.stringify(user)),
      ]);

      setUserToken(token);
      setUserData(user);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Add delay before navigation
      await new Promise((resolve) => setTimeout(resolve, 100));

      showSnackbar("Login successful!", "success");

      // Use requestAnimationFrame for navigation
      requestAnimationFrame(async () => {
        try {
          await router.replace("/(tabs)/Home");
        } catch (navError) {
          console.error("Navigation error:", navError);
        }
      });

      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed";
      setError(message);
      showSnackbar(message, "error");
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logout = async (): Promise<void> => {
    setIsLoading(true);

    try {
      console.log("BEFORE LOG OUT DATA:");
      await logStorageData();

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
      await logStorageData();
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

  // Verify Email
  const verifyEmail = async (
    verificationCode: string
  ): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      // Clear existing tokens first
      await Promise.all([
        AsyncStorage.removeItem("userToken"),
        AsyncStorage.removeItem("userData"),
      ]);
      // Get temp token from state
      const tempToken = userData?.tempToken;

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

      if (response.data.success) {
        // !GET USER DATA
        console.log("AFTER VERIFIED ON VERIFY EMAIL DATA:");
        const { token, user } = response.data;

        // First update the state
        setUserToken(token);
        setUserData(user);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Then update storage
        await Promise.all([
          AsyncStorage.removeItem("tempUserData"),
          AsyncStorage.removeItem("tempToken"),
          AsyncStorage.setItem("userToken", token),
          AsyncStorage.setItem("userData", JSON.stringify(user)),
        ]);
        console.log("temp data shouldbe remove :");
        await logStorageData();

        showSnackbar("Email verified successfully!", "success");

        // Return success and let the component handle navigation
        return { success: true };
      }

      showSnackbar(
        response.data.message || "Invalid verification code",
        "error"
      );
      return { success: false, message: response.data.message };
    } catch (error: any) {
      const message = error.response?.data?.message || "Verification failed";
      showSnackbar(message, "error");
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password
  const forgotPassword = async (email: string): Promise<AuthResponse> => {
    try {
      const response = await axios.post(
        `${API_URL}/api/users/forgot-password`,
        { email }
      );

      if (response.data.success) {
        showSnackbar("Password reset email sent!", "success");
        return { success: true };
      } else {
        showSnackbar(response.data.message, "error");
        return { success: false, message: response.data.message };
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to send reset email";
      showSnackbar(message, "error");
      return { success: false, message };
    }
  };
  // Reset password
  const resetPassword = async (
    token: string,
    newPassword: string
  ): Promise<AuthResponse> => {
    try {
      const response = await axios.post(`${API_URL}/api/users/reset-password`, {
        token,
        newPassword,
      });

      if (response.data.success) {
        showSnackbar("Password reset successfully!", "success");
        return { success: true };
      } else {
        showSnackbar(response.data.message, "error");
        return { success: false, message: response.data.message };
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Password reset failed";
      showSnackbar(message, "error");
      return { success: false, message };
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

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAppReady,
        userToken,
        userData,
        error,
        register,
        login,
        logout,
        getUserProfile,
        isLoggedIn: !!userToken,
        isVerified: userData?.isVerified ?? false,
        showSnackbar,
        verifyEmail,
        forgotPassword,
        resetPassword,
        resendVerificationEmail,
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
