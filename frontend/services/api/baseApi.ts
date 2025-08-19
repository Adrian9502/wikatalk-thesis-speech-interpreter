import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { getToken } from "@/lib/authTokenManager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "@/store/useAuthStore";
import { router } from "expo-router";

const BACKEND_URL: string =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:5000";

// check if the backend is set
export const testAPIConnection = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${BACKEND_URL}`);
    console.log("API test successful:", response.data);
    return true;
  } catch (error: any) {
    console.error("API test failed:", error.message);
    console.error("Request URL:", error.config?.url);
    console.error("Request method:", error.config?.method);
    return false;
  }
};

export const createApi = (withAuth = true): AxiosInstance => {
  const api: AxiosInstance = axios.create({
    baseURL: BACKEND_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (withAuth) {
    // Add auth interceptors
    api.interceptors.request.use(
      (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        const token = getToken();
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Handle auth errors
    api.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Only handle 401 errors for specific cases
        if (error.response && error.response.status === 401) {
          try {
            // Check if we're in verification flow before redirecting
            const tempData = await AsyncStorage.getItem("tempUserData");
            const userToken = await AsyncStorage.getItem("userToken");

            console.log("Auth error detected - 401 Unauthorized");

            // FIXED: Auto-logout for authenticated users with invalid tokens
            if (
              userToken &&
              !tempData &&
              !error.config.url.includes("/verify-email") &&
              !error.config.url.includes("/translations")
            ) {
              console.log(
                "Valid token but 401 error - user likely deleted from database"
              );

              // FIXED: Use the logout function correctly
              await useAuthStore.getState().logout(false);

              return Promise.reject(error);
            }

            if (!tempData && !userToken) {
              // Only redirect if not in verification flow and no valid token
              console.log("No authentication data, redirecting to login");
              router.replace("/");
            }
          } catch (asyncError) {
            console.error("Error handling auth error:", asyncError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Add general error message extraction for all API instances
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      // Extract the error message from the response if available
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        error.message = error.response.data.message;
      }
      return Promise.reject(error);
    }
  );

  return api;
};

// Create default instances
export const api = createApi(false); // Non-authenticated API
export const authApi = createApi(true); // Authenticated API
