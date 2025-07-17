import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { AppState, AppStateStatus, InteractionManager } from "react-native";
import { router } from "expo-router";
import { showToast } from "@/lib/showToast";
import useThemeStore from "./useThemeStore";
import { getToken, setToken } from "@/lib/authTokenManager";
import { useTranslateStore } from "./useTranslateStore";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import useCoinsStore from "./games/useCoinsStore";
import { authService, testAPIConnection } from "@/services/api";
import { clearAllAccountData, refreshAccountData } from "@/utils/accountUtils";

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
  authProvider?: string;
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
  requestAccountDeletion: () => Promise<{
    success: boolean;
    message?: string;
    isRateLimited?: boolean;
    remainingTime?: number;
  }>;
  verifyDeletionCode: (
    code: string
  ) => Promise<{ success: boolean; deletionToken?: string; message?: string }>;
  deleteAccount: (
    token: string
  ) => Promise<{ success: boolean; message?: string }>;
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

          // Get stored data - add tempUserData
          const [storedToken, storedUserData, tempUserData] = await Promise.all(
            [
              AsyncStorage.getItem("userToken"),
              AsyncStorage.getItem("userData"),
              AsyncStorage.getItem("tempUserData"),
            ]
          );

          console.log("Stored token exists:", !!storedToken);
          console.log("Stored user data exists:", !!storedUserData);
          console.log("Temp user data exists:", !!tempUserData);

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
              // Replace direct axios call with authService
              const response = await authService.checkVerification(
                userData.email
              );

              if (!response.success || !response.isVerified) {
                console.log("User verification failed, logging out");
                await get().logout();
              }
            } catch (error) {
              console.error("Error checking verification:", error);
              // Don't log out automatically on network error
            }
          }
          // Handle registration verification flow
          else if (tempUserData) {
            try {
              const parsedTempData = JSON.parse(tempUserData);
              set({
                userData: parsedTempData,
                userToken: null,
                isAppReady: true,
              });
              console.log("Verification flow detected, loaded temp user data");
            } catch (error) {
              console.error("Error parsing temp user data:", error);
              // Clear the corrupted data
              await AsyncStorage.removeItem("tempUserData");
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
          const userData = {
            fullName,
            username,
            email,
            password,
            confirmPassword,
          };

          const response = await authService.register(userData);

          if (response.success) {
            get().clearFormMessage();
            const tempUserData = {
              email: response.data?.email || email,
              fullName: response.data?.fullName || fullName,
              tempToken: response.data?.tempToken || "",
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
              description:
                response.message ||
                "Verification email sent. Please check your inbox.",
            });

            router.push("/(auth)/VerifyEmail");
            return { success: true };
          }

          throw new Error(response.message || "Registration failed");
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

          const response = await authService.login({
            usernameOrEmail,
            password,
          });

          if (!response.success) {
            throw new Error(response.message || "Login failed");
          }

          const token =
            response.token || (response.data && response.data.token) || "";
          const user = response.user || response.data || {};

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
          await Promise.all([
            AsyncStorage.setItem("userToken", token),
            AsyncStorage.setItem("userData", JSON.stringify(user)),
          ]);
          get().setFormMessage("Login successful!", "success");

          setupAxiosDefaults(token);
          setToken(token); // Update the token manager
          set({ userToken: token, userData: user });

          await refreshAccountData();

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
        } catch (error: any) {
          const message = error.message || "Login failed";
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
          const response = await authService.loginWithGoogle(idToken, {
            name,
            email,
            photo,
          });

          if (response.success) {
            // Use the backend token
            const token = response.data?.token;

            if (!token) {
              throw new Error("No backend token received from server");
            }

            await AsyncStorage.setItem("userToken", token);
            setToken(token);

            const userData = response.data || {
              fullName: name,
              email: email,
              profilePicture: photo || "",
              isVerified: true,
            };

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
            setToken(token);
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
            await refreshAccountData();

            const themeStore = useThemeStore.getState();
            await themeStore.syncThemeWithServer();

            showToast({
              type: "success",
              title: "Signed in with Google Successful!",
              description: `Welcome, ${name}!`,
            });

            setTimeout(() => {
              router.replace("/(tabs)/Speech");
            }, 300);
            return { success: true };
          }
          throw new Error(response.message || "Google login failed");
        } catch (error: any) {
          console.log("Google login error:", error);

          // DON'T FALL BACK TO STORING GOOGLE TOKEN
          // Just show the error and let user try again
          const message =
            error.response?.data?.message ||
            error.message ||
            "Google login failed";
          set({ error: message });
          get().setFormMessage(message, "error");

          showToast({
            type: "error",
            title: "Google Sign-In Failed",
            description: "Please check your internet connection and try again.",
          });

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
          await clearAllAccountData();

          useThemeStore.getState().resetToDefaultTheme();
          // Reset coins store state
          useCoinsStore.getState().resetState();

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
          // Verify token exists before making request
          const token = getToken();
          if (!token) {
            console.error("No token available for getUserProfile");

            // Try to recover token from storage
            const storedToken = await AsyncStorage.getItem("userToken");
            if (storedToken) {
              console.log("Recovered token from storage");
              setToken(storedToken);
            } else {
              return undefined;
            }
          }

          const response = await authService.getUserProfile();

          if (response.success) {
            // Update local userData with fresh data from server
            const updatedUserData = response.data;

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

          const verifyData = {
            email: userData?.email,
            verificationCode,
            tempToken,
          };

          const response = await authService.verifyEmail(verifyData);

          if (response.success) {
            get().clearFormMessage();

            // FIX: Extract token from both possible locations
            const token =
              response.token || (response.data && response.data.token) || "";

            // Debug log to help diagnose token extraction
            console.log(
              "Verification token extracted, length:",
              token?.length || 0
            );

            if (!token) {
              console.error("No token found in verification response!");
              console.log(
                "Response structure:",
                JSON.stringify({
                  hasRootToken: !!response.token,
                  hasDataToken: !!(response.data && response.data.token),
                  responseKeys: Object.keys(response),
                })
              );
            }

            const user = response.data || {
              email: userData?.email || "",
              fullName: userData?.fullName || "",
            };

            // IMPORTANT: First set token in memory before clearing storage
            setToken(token); // Update the token manager first
            setupAxiosDefaults(token); // Then update axios defaults

            // Update zustand state
            set({ userToken: token, userData: user });

            // Finally update storage
            await Promise.all([
              AsyncStorage.setItem("userToken", token),
              AsyncStorage.setItem("userData", JSON.stringify(user)),
              // Only remove temp data after new data is set
              AsyncStorage.removeItem("tempUserData"),
              AsyncStorage.removeItem("tempToken"),
            ]);

            showToast({
              type: "success",
              title: "Verification Success!",
              description: response.message || "Email verified successfully!",
            });

            // Handle navigation here instead of in component
            InteractionManager.runAfterInteractions(() => {
              router.replace("/(tabs)/Speech");
            });

            return { success: true };
          }

          return {
            success: false,
            message: response.message || "Verification failed",
          };
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Verification failed";
          get().setFormMessage(message, "error");
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      // Resend verification email
      resendVerificationEmail: async () => {
        const { userData } = get();

        // Clear any existing form messages first
        get().clearFormMessage();

        if (!userData?.email) {
          get().setFormMessage(
            "Email information is missing. Please register again.",
            "error"
          );
          showToast({
            type: "error",
            title: "Error",
            description: "Email information is missing. Please register again.",
          });
          return { success: false, message: "Missing email information" };
        }

        try {
          // Use authService instead of direct axios call
          const response = await authService.resendVerification(
            userData.email,
            userData?.fullName,
            userData?.tempToken
          );

          if (response.success) {
            // If there's a new token, update it in storage
            if (response.data?.tempToken) {
              // Create a properly typed UserData object
              const updatedUserData: UserData = {
                ...(userData || {}), // Spread existing data first
                fullName: userData?.fullName || "",
                email: userData?.email || "",
                tempToken: response.data.tempToken, // Add the new token
              };

              // Update in state and storage
              set({ userData: updatedUserData });
              await AsyncStorage.setItem(
                "tempUserData",
                JSON.stringify(updatedUserData)
              );

              console.log("Updated tempToken in storage successfully");
            }

            // Set form message for success
            get().setFormMessage(
              "Verification code resent successfully",
              "success"
            );

            showToast({
              type: "success",
              title: "Verification Email Sent!",
              description: response.data.message,
            });
            return { success: true };
          } else {
            // Set form message for error
            get().setFormMessage(
              response.data.message || "Failed to resend verification code",
              "error"
            );

            showToast({
              type: "error",
              title: "Verification Send Error",
              description: response.data.message,
            });
            return { success: false, message: response.data.message };
          }
        } catch (error: any) {
          console.error("Resend verification error:", error);

          // Set form message for error
          get().setFormMessage(
            "Failed to resend verification code. Please try again.",
            "error"
          );

          // Handle token expiration more gracefully
          if (
            error.response?.status === 400 &&
            error.response?.data?.message?.includes("expired")
          ) {
            // Clear tempToken and redirect to registration
            router.replace("/");
            showToast({
              type: "error",
              title: "Session Expired",
              description:
                "Your verification session has expired. Please register again.",
            });
          } else {
            showToast({
              type: "error",
              title: "Error",
              description:
                error.response?.data?.message ||
                "Failed to send verification email",
            });
          }

          return {
            success: false,
            message:
              error.response?.data?.message ||
              "Failed to send verification email",
          };
        }
      },

      // Send password reset code
      sendPasswordResetCode: async (email) => {
        set({ isLoading: true });

        try {
          const response = await authService.forgotPassword({ email });

          if (response.success) {
            get().setFormMessage(response.message, "success");
            await Promise.all([
              AsyncStorage.setItem("resetEmailAddress", email),
              AsyncStorage.setItem("isResetPasswordFlow", "true"),
            ]);

            return { success: true };
          } else {
            get().setFormMessage(response.message, "error");
            return { success: false, message: response.message };
          }
        } catch (error: any) {
          const message = error.message || "Failed to process your request";
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
          const response = await authService.verifyResetCode(
            email,
            verificationCode
          );

          if (response.success) {
            const resetToken =
              response.resetToken || response.data?.resetToken || "";
            await Promise.all([
              AsyncStorage.setItem("resetToken", resetToken),
              AsyncStorage.setItem("isResetPasswordFlow", "true"),
            ]);
            showToast({
              type: "success",
              title: "Verification Successful",
              description: response.message,
            });

            setTimeout(() => {
              router.replace("/(auth)/SetNewPassword");
            }, 100);

            return {
              success: true,
              token: response.resetToken,
            };
          } else {
            const errorMessage = response.message || "Verification failed";
            get().setFormMessage(errorMessage, "error");

            return { success: false, message: errorMessage };
          }
        } catch (error: any) {
          const message = error.message || "Verification failed";
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
          const response = await authService.resetPassword(token, newPassword);

          const { success, message } = response;

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
          const message = error.message || "Password reset failed";
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
          const response = await authService.changePassword(
            currentPassword,
            newPassword
          );

          if (response.success) {
            showToast({
              type: "success",
              title: "Password Updated",
              description: "Your password has been changed successfully",
            });
            return { success: true };
          } else {
            throw new Error(response.message || "Failed to change password");
          }
        } catch (error: any) {
          console.error("Password change error:", error);
          const message = error.message || "Failed to change password";
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      // Validate current password using debounce
      validateCurrentPassword: async (password: string) => {
        try {
          const response = await authService.validatePassword(password);
          return {
            success: response.success,
            message: response.message,
          };
        } catch (error: any) {
          const message = error.message || "Failed to validate password";
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
      clearStorage: async (navigateAfterClear = true) => {
        try {
          await AsyncStorage.clear();
          set({ userToken: null, userData: null, formMessage: null }); // Clear form message too
          setupAxiosDefaults(null);
          console.log("✅ AsyncStorage cleared successfully!");

          if (navigateAfterClear) {
            // Handle navigation here
            InteractionManager.runAfterInteractions(() => {
              router.replace("/");
            });
          }

          return { success: true };
        } catch (error) {
          console.error("❌ Error clearing AsyncStorage:", error);

          if (navigateAfterClear) {
            showToast({
              type: "error",
              title: "Error",
              description: "Error returning to home screen",
            });
          }

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
            try {
              // Use authService.updateProfilePicture instead of direct axios
              const picResponse = await authService.updateProfilePicture(
                updatedUserData.profilePicture
              );

              if (picResponse.success) {
                // Update user data with the new picture URL from Cloudinary
                const updatedUser = picResponse.data;

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
                  picResponse.message || "Failed to update profile picture"
                );
              }
            } catch (error: any) {
              throw error; // Pass the error up to be handled by the outer catch
            }
          }

          // Process other profile fields if they exist
          if (Object.keys(updatedUserData).length > 0) {
            // Use authService.updateUserProfile instead of direct axios
            const response = await authService.updateUserProfile(
              updatedUserData
            );

            if (response.success) {
              // Update state with server response
              const updatedUser = response.data;

              // Update in state
              set({ userData: updatedUser });

              // Save to storage
              await AsyncStorage.setItem(
                "userData",
                JSON.stringify(updatedUser)
              );

              return { success: true, data: updatedUser };
            } else {
              throw new Error(response.message || "Failed to update profile");
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

      // Request account deletion (send verification code)
      requestAccountDeletion: async () => {
        set({ isLoading: true });
        try {
          const response = await authService.requestAccountDeletion();
          if (response.success) {
            return { success: true, message: response.message };
          }
          throw new Error(
            response.message || "Failed to request account deletion"
          );
        } catch (error: any) {
          const message = error.message || "Failed to process request";
          // Pass through rate limiting info from the backend
          return {
            success: false,
            message,
            isRateLimited: error.response?.data?.isRateLimited || false,
            remainingTime: error.response?.data?.remainingTime || 0,
          };
        } finally {
          set({ isLoading: false });
        }
      },

      // Verify account deletion code
      verifyDeletionCode: async (verificationCode: string) => {
        set({ isLoading: true });

        try {
          const response = await authService.verifyDeletionCode(
            verificationCode
          );

          if (response.success) {
            const deletionToken =
              response.deletionToken || response.data?.deletionToken || "";
            await AsyncStorage.setItem("deletionToken", deletionToken);
            return {
              success: true,
              deletionToken,
            };
          }

          throw new Error(response.message || "Verification failed");
        } catch (error: any) {
          const message = error.message || "Verification failed";
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      // Delete account
      deleteAccount: async (deletionToken: string) => {
        set({ isLoading: true });

        try {
          const response = await authService.deleteAccount(deletionToken);

          if (response.success) {
            // Clear local storage and state
            await get().clearStorage();

            showToast({
              type: "success",
              title: "Account Deleted",
              description: "Your account has been permanently deleted",
            });

            // Navigate to auth screen
            setTimeout(() => {
              router.replace("/");
            }, 1000);

            return { success: true };
          }

          throw new Error(response.message || "Failed to delete account");
        } catch (error: any) {
          const message = error.message || "Failed to delete account";
          showToast({
            type: "error",
            title: "Deletion Failed",
            description: message,
          });
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
