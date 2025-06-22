import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { getToken } from "@/lib/authTokenManager";
import { router } from "expo-router";

const BACKEND_URL: string =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:5000";

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
      (error) => {
        if (
          error.response &&
          error.response.status === 401 &&
          // Exclude history endpoints from redirecting to login
          !error.config.url.includes("/translations")
        ) {
          // Only redirect for critical auth failures, not for history
          router.replace("/");
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
      if (error.response && error.response.data && error.response.data.message) {
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
