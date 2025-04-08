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

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // We'll use a simple event emitter approach
        if (window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent("authError"));
        }
        router.replace("/");
      }
      return Promise.reject(error);
    }
  );

  return api;
};

export default createAuthenticatedApi;
