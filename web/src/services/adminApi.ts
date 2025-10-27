const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("adminToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Helper function to handle API errors
const handleApiError = (error: unknown): never => {
  if (error instanceof Error) {
    throw error;
  }
  throw new Error("An unknown error occurred");
};

// Dashboard Stats
export const getDashboardStats = async () => {
  try {
    const response = await fetch(`${API_URL}/api/admin/dashboard`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch dashboard stats");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    handleApiError(error);
  }
};

// User Management
export const getAllUsers = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.role) queryParams.append("role", params.role);

    const response = await fetch(
      `${API_URL}/api/admin/users?${queryParams.toString()}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch users");
    }

    return await response.json();
  } catch (error) {
    handleApiError(error);
  }
};

// Get user by ID
export const getUserById = async (userId: string) => {
  try {
    const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch user");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    handleApiError(error);
  }
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
  try {
    const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update user");
    }

    return await response.json();
  } catch (error) {
    handleApiError(error);
  }
};

// Change user role
export const changeUserRole = async (userId: string, role: string) => {
  try {
    const response = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ role }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to change user role");
    }

    return await response.json();
  } catch (error) {
    handleApiError(error);
  }
};

// Delete user
export const deleteUser = async (userId: string) => {
  try {
    const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete user");
    }

    return await response.json();
  } catch (error) {
    handleApiError(error);
  }
};

// Toggle user verification
export const toggleUserVerification = async (userId: string) => {
  try {
    const response = await fetch(
      `${API_URL}/api/admin/users/${userId}/verify`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to toggle verification");
    }

    return await response.json();
  } catch (error) {
    handleApiError(error);
  }
};

// User Statistics
export const getUserStats = async () => {
  try {
    const response = await fetch(`${API_URL}/api/admin/stats/users`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch user stats");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Translation Statistics
export const getTranslationStats = async () => {
  try {
    const response = await fetch(`${API_URL}/api/admin/stats/translations`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch translation stats");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Game Statistics
export const getGameStats = async () => {
  try {
    const response = await fetch(`${API_URL}/api/admin/stats/games`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch game stats");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Feedback List
export const getFeedbackList = async () => {
  try {
    const response = await fetch(`${API_URL}/api/admin/feedback`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch feedback");
    }

    return await response.json();
  } catch (error) {
    handleApiError(error);
  }
};
