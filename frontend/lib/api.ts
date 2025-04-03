import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { router } from "expo-router";

const BACKEND_URL: string =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:5000";

export const createAuthenticatedApi = (): AxiosInstance => {
  const { userToken } = useAuthStore.getState();

  const api: AxiosInstance = axios.create({
    baseURL: BACKEND_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: userToken ? `Bearer ${userToken}` : "",
    },
  });

  // Add a request interceptor to update the token if it changes
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      const token = useAuthStore.getState().userToken;
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Token expired or invalid
        const { logout } = useAuthStore.getState();
        logout();
        //  redirect to login page
        router.replace("/");
      }
      return Promise.reject(error);
    }
  );

  return api;
};

export default createAuthenticatedApi;
