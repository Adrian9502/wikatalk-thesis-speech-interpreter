import axios, { type AxiosInstance } from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Create axios instance with default config
const createAdminApi = (): AxiosInstance => {
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor to add auth token
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("adminToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for error handling
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle 401 - Unauthorized
      if (error.response?.status === 401) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        window.location.href = "/admin/login";
      }

      // Extract error message
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred";

      return Promise.reject(new Error(errorMessage));
    }
  );

  return api;
};

const adminApi = createAdminApi();

// Dashboard Stats
export const getDashboardStats = async () => {
  const response = await adminApi.get("/api/admin/dashboard");
  return response.data.data;
};

// User Management
export const getAllUsers = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}) => {
  const response = await adminApi.get("/api/admin/users", { params });
  return response.data;
};

// Get user by ID
export const getUserById = async (userId: string) => {
  const response = await adminApi.get(`/api/admin/users/${userId}`);
  return response.data.data;
};

// Update user
export const updateUser = async (
  userId: string,
  userData: {
    fullName?: string;
    username?: string;
    email?: string;
    isVerified?: boolean;
  }
) => {
  const response = await adminApi.put(`/api/admin/users/${userId}`, userData);
  return response.data;
};

// Change user role
export const changeUserRole = async (userId: string, role: string) => {
  const response = await adminApi.put(`/api/admin/users/${userId}/role`, {
    role,
  });
  return response.data;
};

// Delete user
export const deleteUser = async (userId: string) => {
  const response = await adminApi.delete(`/api/admin/users/${userId}`);
  return response.data;
};

// Toggle user verification
export const toggleUserVerification = async (userId: string) => {
  const response = await adminApi.put(`/api/admin/users/${userId}/verify`);
  return response.data;
};

// User Statistics
export const getUserStats = async () => {
  const response = await adminApi.get("/api/admin/stats/users");
  return response.data.data;
};

// Translation Statistics
export const getTranslationStats = async () => {
  const response = await adminApi.get("/api/admin/stats/translations");
  return response.data.data;
};

// Game Statistics
export const getGameStats = async () => {
  const response = await adminApi.get("/api/admin/stats/games");
  return response.data.data;
};

// Feedback List
export const getFeedbackList = async () => {
  const response = await adminApi.get("/api/admin/feedback");
  return response.data;
};
