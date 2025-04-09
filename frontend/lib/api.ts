import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { getToken } from "@/lib/authTokenManager";
import { router } from "expo-router";

const BACKEND_URL: string =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:5000";

export const createAuthenticatedApi = (): AxiosInstance => {
  const api: AxiosInstance = axios.create({
    baseURL: BACKEND_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: getToken() ? `Bearer ${getToken()}` : "",
    },
  });

  // Add a request interceptor to update the token if it changes
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

  // Modify the response interceptor to handle 401s more gracefully
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      // Only redirect on 401 errors for non-history endpoints
      // This prevents logout when simply checking for empty history
      if (
        error.response &&
        error.response.status === 401 &&
        !error.config.url.includes("/translations")
      ) {
        // Only redirect for critical auth failures, not for history
        router.replace("/");
      }
      return Promise.reject(error);
    }
  );

  return api;
};

export default createAuthenticatedApi;
