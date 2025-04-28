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
import { GoogleSignin } from "@react-native-google-signin/google-signin";
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
  validateCurrentPassword: (
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
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
  loginWithGoogle: (
    idToken: string,
    user: {
      name: string;
      email: string;
      photo: string | null;
    }
  ) => Promise<AuthResponse>;
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
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<{
    success: boolean;
    message?: string;
  }>;
  clearStorage: () => Promise<{ success: boolean; message?: string }>;
  clearResetData: () => Promise<{ success: boolean; message?: string }>;
  handleAppStateChange: (nextAppState: AppStateStatus) => void;
  updateUserProfile: (updatedUserData: Partial<UserData>) => Promise<{
    success: boolean;
    message?: string;
    data?: UserData;
  }>;
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
        // Check both store state and AsyncStorage
        const token = get().userToken;
        // This won't work as expected since it's synchronous
        // Use state instead of computed getter
        return !!token;
      },
      get isVerified() {
        return get().userData?.isVerified ?? false;
      },
      checkIsLoggedIn: async () => {
        const storeToken = get().userToken;
        if (storeToken) return true;

        // Fall back to AsyncStorage check
        const token = await AsyncStorage.getItem("userToken");
        return !!token;
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
          const [storedToken, storedUserData] = await Promise.all([
            AsyncStorage.getItem("userToken"),
            AsyncStorage.getItem("userData"),
          ]);

          console.log("Stored token exists:", !!storedToken);
          console.log("Stored user data exists:", !!storedUserData);

          // Handle normal login flow
          if (storedToken && storedUserData) {
            const userData = JSON.parse(storedUserData);

            // Set token in axios and token manager immediately
            setupAxiosDefaults(storedToken);
            setToken(storedToken);

            // Set user data in state
            set({
              userToken: storedToken,
              userData: userData,
              isAppReady: true,
            });

            console.log("Auth restored from storage successfully");
            console.log("Auth is ready, user logged in: true"); // Update this log

            // Optionally verify with backend, but don't block UI
            try {
              const response = await axios.post(
                `${API_URL}/api/users/check-verification`,
                { email: userData.email }
              );

              if (!response.data.success || !response.data.isVerified) {
                console.log("User verification failed, logging out");
                await get().logout();
              }
            } catch (error) {
              console.error("Error checking verification:", error);
              // Don't log out automatically on network error
            }
          } else {
            console.log("No stored auth data found");
            set({ userData: null, userToken: null, isAppReady: true });
            console.log("Auth is ready, user logged in: false");
          }
        } catch (error) {
          console.error("Error loading auth info:", error);
          set({ userData: null, userToken: null, isAppReady: true });
        } finally {
          set({ isLoading: false });
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
            setTimeout(() => {
              get().getUserProfile();
            }, 500);
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

      // Login with Google
      loginWithGoogle: async (idToken, user) => {
        set({ isLoading: true, error: null });
        get().clearFormMessage();
        const { name, email, photo } = user;

        try {
          // Call backend API to authenticate with Google
          const response = await axios.post(
            `${API_URL}/api/users/login/google`,
            {
              idToken,
              name,
              email,
              photo,
            }
          );

          if (response.data.success) {
            const { token, ...userData } = response.data.data;
            // Store user data and token

            await Promise.all([
              AsyncStorage.setItem("userToken", token),
              AsyncStorage.setItem(
                "userData",
                JSON.stringify({
                  ...userData,
                  fullName: userData.fullName || name,
                  email: userData.email || email,
                  profilePicture: userData.profilePicture || photo || "",
                  isVerified: true,
                })
              ),
            ]);

            // Set token in axios and token manager
            setupAxiosDefaults(token);
            setToken(token); // Update state
            set({
              userToken: token,
              userData: {
                ...userData,
                fullName: userData.fullName || name,
                email: userData.email || email,
                profilePicture: userData.profilePicture || photo || "",
                isVerified: true,
                authProvider: "google",
              },
              isAppReady: true,
            });

            const themeStore = useThemeStore.getState(); // Wait for theme sync to complete
            await themeStore.syncThemeWithServer(); // Show success toast

            showToast({
              type: "success",
              title: "Signed in with Google Successful!",
              description: `Welcome, ${name}!`,
            });
            // Delay navigation to ensure theme is applied and toast is visible
            setTimeout(() => {
              router.replace("/(tabs)/Speech");
            }, 300);
            return { success: true };
          }
          throw new Error(response.data.message || "Google login failed");
        } catch (error: any) {
          console.log("Google login error:", error);

          // Fall back to direct login if backend fails
          try {
            // Store Google user data directly
            const googleUserData = {
              fullName: name,
              email: email,
              profilePicture: photo || "",
              isVerified: true,
            };

            await Promise.all([
              AsyncStorage.setItem("userData", JSON.stringify(googleUserData)),
              AsyncStorage.setItem("userToken", idToken),
            ]);

            // Set token in axios and token manager
            setupAxiosDefaults(idToken);
            setToken(idToken);

            // Update state
            set({
              userToken: idToken,
              userData: googleUserData,
              isAppReady: true,
            });
            // Add this line to sync theme in the fallback case too
            const themeStore = useThemeStore.getState();
            await themeStore.syncThemeWithServer();

            showToast({
              type: "success",
              title: "Signed in with Google",
              description: `Welcome, ${name}!`,
            });

            // Navigate to main app
            setTimeout(() => {
              router.replace("/(tabs)/Speech");
            }, 300);
            return { success: true };
          } catch (fallbackError) {
            const message =
              error.response?.data?.message ||
              error.message ||
              "Google login failed";
            set({ error: message });
            get().setFormMessage(message, "error");
            return { success: false, message };
          }
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

          // Sign out from Google first
          try {
            await GoogleSignin.signOut();
            console.log("Successfully signed out from Google");
          } catch (googleError) {
            console.error("Error signing out from Google:", googleError);
            // Continue logout process even if Google signout fails
          }

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
          const response = await axios.get(`${API_URL}/api/users/profile`);

          if (response.data.success) {
            // Update local userData with fresh data from server, including new fields
            const updatedUserData = response.data.data;

            // Save to storage
            await AsyncStorage.setItem(
              "userData",
              JSON.stringify(updatedUserData)
            );

            // Update in state
            set({ userData: updatedUserData });

            return updatedUserData;
          }
        } catch (error: any) {
          console.error("Error fetching user profile:", error);
          if (error.response?.status === 401) {
            // Token might be expired, log the user out
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
            setToken(token);
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
              title: "Verification Successful",
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

      // Change password
      changePassword: async (currentPassword: string, newPassword: string) => {
        set({ isLoading: true });

        try {
          const token = get().userToken;
          if (!token) {
            throw new Error("Authentication token not found");
          }

          const response = await axios.put(
            `${API_URL}/api/users/change-password`,
            { currentPassword, newPassword },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.data.success) {
            showToast({
              type: "success",
              title: "Password Updated",
              description: "Your password has been changed successfully",
            });
            return { success: true };
          } else {
            throw new Error(
              response.data.message || "Failed to change password"
            );
          }
        } catch (error: any) {
          console.error("Password change error:", error);
          const message =
            error.response?.data?.message ||
            error.message ||
            "Failed to change password";

          // showToast({
          //   type: "error",
          //   title: "Password Change Failed",
          //   description: message,
          // });

          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      // Validate current password using debounce
      validateCurrentPassword: async (password: string) => {
        try {
          const token = get().userToken;
          if (!token) {
            throw new Error("Authentication token not found");
          }

          const response = await axios.post(
            `${API_URL}/api/users/validate-password`,
            { currentPassword: password },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          return {
            success: response.data.success,
            message: response.data.message,
          };
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Failed to validate password";
          return { success: false, message };
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

      // Update user profile
      updateUserProfile: async (updatedUserData: Partial<UserData>) => {
        try {
          set({ isLoading: true });

          // Special handling for profile picture (separate endpoint)
          if (
            updatedUserData.profilePicture &&
            updatedUserData.profilePicture.startsWith("data:image")
          ) {
            const token = get().userToken;
            if (!token) {
              throw new Error("No authentication token found");
            }

            // Upload the profile picture
            const picResponse = await axios.put(
              `${API_URL}/api/users/profile-picture`,
              { imageBase64: updatedUserData.profilePicture },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (picResponse.data.success) {
              // Update user data with the new picture URL from Cloudinary
              const updatedUser = picResponse.data.data;

              // Save to storage
              await AsyncStorage.setItem(
                "userData",
                JSON.stringify(updatedUser)
              );

              // Update state
              set({ userData: updatedUser });

              // Remove profilePicture from updatedUserData since it's already processed
              delete updatedUserData.profilePicture;

              // If only the profile picture was being updated, return now
              if (Object.keys(updatedUserData).length === 0) {
                return { success: true, data: updatedUser };
              }
            } else {
              throw new Error(
                picResponse.data.message || "Failed to update profile picture"
              );
            }
          }

          // Process other profile fields if they exist
          if (Object.keys(updatedUserData).length > 0) {
            const token = get().userToken;
            if (!token) {
              throw new Error("No authentication token found");
            }

            const response = await axios.put(
              `${API_URL}/api/users/profile`,
              updatedUserData,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (response.data.success) {
              // Update state with server response
              const updatedUser = response.data.data;

              // Update in state
              set({ userData: updatedUser });

              // Save to storage
              await AsyncStorage.setItem(
                "userData",
                JSON.stringify(updatedUser)
              );

              return { success: true, data: updatedUser };
            } else {
              throw new Error(
                response.data.message || "Failed to update profile"
              );
            }
          }

          // If we get here, the profile picture was successfully updated
          return { success: true, data: get().userData };
        } catch (error: any) {
          console.error("Error updating user profile:", error);
          const message =
            error.response?.data?.message ||
            error.message ||
            "Failed to update profile";
          get().setFormMessage(message, "error");
          return { success: false, message };
        } finally {
          set({ isLoading: false });
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
      onRehydrateStorage: (state) => {
        return (restoredState, error) => {
          if (error) {
            console.error("Error rehydrating auth store:", error);
          } else {
            console.log("Auth store rehydrated:", !!restoredState?.userToken);
          }
        };
      },
    }
  )
);
// Initialize auth on app start
export const initializeAuth = () => {
  const { initializeAuth } = useAuthStore.getState();
  return initializeAuth();
};
