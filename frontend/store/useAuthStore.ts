import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { AppState, AppStateStatus, InteractionManager } from "react-native";
import { router } from "expo-router";
import { showToast } from "@/lib/showToast";
import useThemeStore from "./useThemeStore";
import { setToken } from "@/lib/authTokenManager";
import { useTranslateStore } from "./useTranslateStore";
// API URL from environment
const API_URL = `${process.env.EXPO_PUBLIC_BACKEND_URL}`;

// Types
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
  token?: string;
}

interface FormMessage {
  text: string;
  type: "success" | "error" | "neutral";
}

interface AuthState {
  isLoading: boolean;
  isAppReady: boolean;
  userToken: string | null;
  userData: UserData | null;
  error: string | null;
  formMessage: FormMessage | null;
  appInactiveTime: number | null;

  // Derived state
  isLoggedIn: boolean;
  isVerified: boolean;

  // Actions
  setIsLoading: (isLoading: boolean) => void;
  setFormMessage: (
    text: string,
    type?: "success" | "error" | "neutral"
  ) => void;
  clearFormMessage: () => void;

  // API methods
  initializeAuth: () => Promise<void>;
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
  verifyEmail: (verificationCode: string) => Promise<AuthResponse>;
  resendVerificationEmail: () => Promise<AuthResponse>;
  sendPasswordResetCode: (email: string) => Promise<AuthResponse>;
  verifyPasswordResetCode: (
    email: string,
    verificationCode: string
  ) => Promise<AuthResponse>;
  resetPassword: (token: string, newPassword: string) => Promise<AuthResponse>;
  clearStorage: () => Promise<{ success: boolean; message?: string }>;
  clearResetData: () => Promise<{ success: boolean; message?: string }>;
  handleAppStateChange: (nextAppState: AppStateStatus) => void;
}

// Initialize axios interceptors
const setupAxiosDefaults = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }

  // Add response interceptor for token expiry/auth issues
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Handle token expiry
        console.warn("Authentication error, may need to log in again");
      }
      return Promise.reject(error);
    }
  );
};

// Test API connection
const testAPIConnection = async () => {
  try {
    const response = await axios.get(`${API_URL}`);
    console.log("API test successful:", response.data);
  } catch (error: any) {
    console.error("API test failed:", error.message);
    console.error("Request URL:", error.config?.url);
    console.error("Request method:", error.config?.method);
  }
};

// Constants
const INACTIVE_TIMEOUT = 10 * 60 * 1000; // 10 minutes

// Define the store
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // State
      isLoading: true,
      isAppReady: false,
      userToken: null,
      userData: null,
      error: null,
      formMessage: null,
      appInactiveTime: null,

      // Computed properties
      get isLoggedIn() {
        return !!get().userToken;
      },
      get isVerified() {
        return get().userData?.isVerified ?? false;
      },

      // Actions
      setIsLoading: (isLoading) => set({ isLoading }),

      setFormMessage: (text, type = "neutral") =>
        set({
          formMessage: { text, type },
        }),

      clearFormMessage: () => set({ formMessage: null }),

      handleAppStateChange: (nextAppState) => {
        const currentTime = Date.now();
        const { appInactiveTime, userData } = get();

        if (nextAppState === "active") {
          if (
            appInactiveTime &&
            currentTime - appInactiveTime > INACTIVE_TIMEOUT
          ) {
            // Check if we're in a password reset flow
            AsyncStorage.getItem("isResetPasswordFlow").then((isResetFlow) => {
              if (isResetFlow === "true") {
                // Only clear for password reset flow
                get().clearResetData();
                console.log("Reset flow timeout - cleared reset data");
              } else if (userData?.tempToken && !userData?.isVerified) {
                // Only clear for verification flow that's incomplete
                get().clearStorage();
                console.log("Verification flow timeout - cleared storage");
              }
              // Normal logged-in users are not affected
            });
          }
          set({ appInactiveTime: null });
        } else if (nextAppState === "background") {
          set({ appInactiveTime: currentTime });
        }
      },

      // Initialize auth state
      initializeAuth: async () => {
        try {
          // Test API connection
          await testAPIConnection();

          // Get stored data
          const [storedToken, storedUserData, tempUserData] = await Promise.all(
            [
              AsyncStorage.getItem("userToken"),
              AsyncStorage.getItem("userData"),
              AsyncStorage.getItem("tempUserData"),
            ]
          );

          // Check for verification flow first
          if (tempUserData) {
            const parsedTempData = JSON.parse(tempUserData);
            if (parsedTempData.tempToken) {
              set({ userData: parsedTempData });
              console.log("Restored verification session");
              return;
            }
          }

          // Handle normal login flow
          if (storedToken && storedUserData) {
            const userData = JSON.parse(storedUserData);

            try {
              // Verify user status with backend
              const response = await axios.post(
                `${API_URL}/api/users/check-verification`,
                {
                  email: userData.email,
                }
              );

              if (response.data.success && response.data.isVerified) {
                setupAxiosDefaults(storedToken);
                set({
                  userToken: storedToken,
                  userData: { ...userData, isVerified: true },
                });
              } else {
                await AsyncStorage.multiRemove(["userToken", "userData"]);
                set({ userData: null, userToken: null });
              }
            } catch (error) {
              console.error("Verification check failed:", error);
              await AsyncStorage.multiRemove(["userToken", "userData"]);
              set({ userData: null, userToken: null });
            }
          }
        } catch (error) {
          console.error("Error loading auth info:", error);
          await AsyncStorage.clear();
          set({ userData: null, userToken: null });
        } finally {
          set({ isLoading: false, isAppReady: true });
        }

        // Setup AppState listener
        AppState.addEventListener("change", get().handleAppStateChange);
      },

      // Register user
      register: async (
        fullName,
        username,
        email,
        password,
        confirmPassword
      ) => {
        set({ isLoading: true, error: null });

        try {
          const response = await axios.post(`${API_URL}/api/users/register`, {
            fullName,
            username,
            email,
            password,
            confirmPassword,
          });

          if (response.data.success) {
            get().clearFormMessage();
            const tempUserData = {
              email: response.data.data.email,
              fullName: response.data.data.fullName,
              tempToken: response.data.data.tempToken,
              isVerified: false,
            };

            // Store temporary data
            await AsyncStorage.setItem(
              "tempUserData",
              JSON.stringify(tempUserData)
            );
            set({ userData: tempUserData });

            showToast({
              type: "success",
              title: "Verify your email",
              description: response.data.message,
            });

            router.push("/(auth)/VerifyEmail");
            return { success: true };
          }

          throw new Error(response.data.message || "Registration failed");
        } catch (error: any) {
          get().clearFormMessage();
          const message =
            error.response?.data?.message ||
            error.message ||
            "Registration failed";
          set({ error: message });
          get().setFormMessage(message, "error");

          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      // Login user
      login: async (usernameOrEmail, password) => {
        set({ isLoading: true, error: null });
        get().clearFormMessage();

        try {
          // Clear existing tokens
          await AsyncStorage.multiRemove(["userToken", "userData"]);

          const response = await axios.post(`${API_URL}/api/users/login`, {
            usernameOrEmail,
            password,
          });

          const { token, ...user } = response.data.data;

          // Handle unverified user
          if (user.isVerified === false) {
            const tempUserData = {
              email: user.email,
              fullName: user.fullName,
              tempToken: token,
              isVerified: false,
            };

            set({ userData: tempUserData });
            await AsyncStorage.setItem(
              "tempUserData",
              JSON.stringify(tempUserData)
            );
            get().setFormMessage(
              "Please verify your email to continue",
              "neutral"
            );
            router.replace("/(auth)/VerifyEmail");
            return { success: true };
          }

          // Handle successful login
          if (response.data.success) {
            await Promise.all([
              AsyncStorage.setItem("userToken", token),
              AsyncStorage.setItem("userData", JSON.stringify(user)),
            ]);
            get().setFormMessage("Login successful!", "success");

            setupAxiosDefaults(token);
            setToken(token); // Update the token manager
            set({ userToken: token, userData: user });

            // After successful login, sync the theme
            const themeStore = useThemeStore.getState();
            await themeStore.syncThemeWithServer();
            InteractionManager.runAfterInteractions(() => {
              router.replace("/(tabs)/Speech");
            });

            return { success: true };
          }

          throw new Error(response.data.message || "Login failed");
        } catch (error: any) {
          const message = error.response?.data?.message || "Login failed";
          set({ error: message });
          get().setFormMessage(message, "error");
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      // Logout user
      logout: async () => {
        set({ isLoading: true });
        const { updateState } = useTranslateStore.getState();
        updateState({
          sourceText: "",
          translatedText: "",
          copiedSource: false,
          copiedTarget: false,
          isSourceSpeaking: false,
          isTargetSpeaking: false,
        });

        try {
          useThemeStore.getState().resetToDefaultTheme();
          // Clear storage
          await Promise.all([
            AsyncStorage.removeItem("userToken"),
            AsyncStorage.removeItem("userData"),
            AsyncStorage.removeItem("tempUserData"),
            AsyncStorage.removeItem("tempToken"),
          ]);

          // Update state
          setupAxiosDefaults(null);
          setToken(null); // Update the token manager
          set({ userToken: null, userData: null });

          showToast({
            type: "success",
            title: "Logged out",
            description: "Logged out successfully!",
          });

          router.replace("/");
        } catch (error) {
          console.error("Error during logout:", error);
          showToast({
            type: "error",
            title: "Error logging out",
            description: "Error during logout",
          });
        } finally {
          set({ isLoading: false });
        }
      },

      // Get user profile
      getUserProfile: async () => {
        try {
          const response = await axios.get(`${API_URL}/profile`);

          if (response.data.success) {
            set({ userData: response.data.data });
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
            get().logout();
          }
        }
        return undefined;
      },

      // Email verification
      verifyEmail: async (verificationCode) => {
        set({ isLoading: true });

        try {
          get().clearFormMessage();
          const { userData } = get();
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

          const response = await axios.post(
            `${API_URL}/api/users/verify-email`,
            {
              email: userData?.email,
              verificationCode,
              tempToken,
            }
          );

          if (response.data.success) {
            get().clearFormMessage();
            const { token, user } = response.data;

            // Clear old data and set new data
            await Promise.all([
              AsyncStorage.removeItem("tempUserData"),
              AsyncStorage.removeItem("tempToken"),
              AsyncStorage.setItem("userToken", token),
              AsyncStorage.setItem("userData", JSON.stringify(user)),
            ]);

            setupAxiosDefaults(token);
            set({ userToken: token, userData: user });

            showToast({
              type: "success",
              title: "Verification Success!",
              description: response.data.message,
            });

            setTimeout(() => {
              router.replace("/(tabs)/Speech");
            }, 1000);

            return { success: true };
          }

          return { success: false, message: response.data.message };
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Verification failed";
          get().setFormMessage(message);
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      // Resend verification email
      resendVerificationEmail: async () => {
        const { userData } = get();

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
            error.response?.data?.message ||
            "Failed to send verification email";
          showToast({
            type: "error",
            title: "Error",
            description: message,
          });
          return { success: false, message };
        }
      },

      // Send password reset code
      sendPasswordResetCode: async (email) => {
        set({ isLoading: true });

        try {
          const response = await axios.post(
            `${API_URL}/api/users/forgot-password`,
            { email }
          );

          if (response.data.success) {
            get().setFormMessage(response.data.message, "success");
            await Promise.all([
              AsyncStorage.setItem("resetEmailAddress", email),
              AsyncStorage.setItem("isResetPasswordFlow", "true"),
            ]);

            return { success: true };
          } else {
            get().setFormMessage(response.data.message, "error");
            return { success: false, message: response.data.message };
          }
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Failed to process your request";
          get().setFormMessage(message, "error");

          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      // Verify password reset code
      verifyPasswordResetCode: async (email, verificationCode) => {
        set({ isLoading: true });

        try {
          const response = await axios.post(
            `${API_URL}/api/users/verify-reset-code`,
            {
              email,
              verificationCode,
            }
          );

          if (response.data.success) {
            await Promise.all([
              AsyncStorage.setItem("resetToken", response.data.resetToken),
              AsyncStorage.setItem("isResetPasswordFlow", "true"),
            ]);
            showToast({
              type: "success",
              title: "Verification Error",
              description: response.data.message,
            });

            setTimeout(() => {
              router.replace("/(auth)/SetNewPassword");
            }, 100);

            return {
              success: true,
              token: response.data.resetToken,
            };
          } else {
            const errorMessage = response.data.message || "Verification failed";
            get().setFormMessage(errorMessage, "error");

            return { success: false, message: errorMessage };
          }
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Verification failed";
          get().setFormMessage(message, "error");
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      // Reset password
      resetPassword: async (token, newPassword) => {
        set({ isLoading: true });

        try {
          const response = await axios.post(
            `${API_URL}/api/users/reset-password`,
            {
              token,
              newPassword,
            }
          );

          const { success, message } = response.data;

          showToast({
            type: success ? "success" : "error",
            title: success
              ? "Password reset successfully!"
              : "Password reset failed!",
            description: message,
          });

          if (success) {
            await get().clearResetData();
            return { success: true };
          }

          return { success: false, message };
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Password reset failed";
          get().setFormMessage(message, "error");

          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      // Clear reset data
      clearResetData: async () => {
        try {
          await Promise.all([
            AsyncStorage.removeItem("resetToken"),
            AsyncStorage.removeItem("resetEmailAddress"),
            AsyncStorage.removeItem("isResetPasswordFlow"),
          ]);

          setTimeout(() => {
            router.replace("/");
          }, 1000);
          console.log("✅ clearResetData run successfully!");
          return { success: true };
        } catch (error) {
          console.error("Error clearing storage:", error);
          return { success: false, message: "Error clearing storage" };
        }
      },

      // Clear all storage
      clearStorage: async () => {
        try {
          await AsyncStorage.clear();
          set({ userToken: null, userData: null });
          setupAxiosDefaults(null);
          console.log("✅ AsyncStorage cleared successfully!");
          return { success: true };
        } catch (error) {
          console.error("❌ Error clearing AsyncStorage:", error);
          return { success: false, message: "Error clearing storage" };
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        userToken: state.userToken,
        userData: state.userData,
      }),
    }
  )
);
// Initialize auth on app start
export const initializeAuth = () => {
  const { initializeAuth } = useAuthStore.getState();
  return initializeAuth();
};
