import { api, authApi } from "./baseApi";

export interface LoginCredentials {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    _id: string;
    fullName: string;
    username?: string;
    email: string;
    isVerified: boolean;
    profilePicture?: string;
    joinDate?: string;
    tempToken?: string;
    user?: any;
    resetToken?: string;
    deletionToken?: string;
    [key: string]: any;
  };
  token?: string;
  user?: any;
  resetToken?: string;
  deletionToken?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface VerifyEmailRequest {
  email: string;
  verificationCode: string;
  tempToken: string;
}

export const authService = {
  // Login with email and password
  login: async (credentials: LoginCredentials) => {
    const response = await api.post<AuthResponse>(
      "/api/users/login",
      credentials
    );
    return response.data;
  },

  // Register new user
  register: async (userData: RegisterData) => {
    const response = await api.post<AuthResponse>(
      "/api/users/register",
      userData
    );
    return response.data;
  },

  // Login with Google
  loginWithGoogle: async (
    idToken: string,
    userData: { name: string; email: string; photo: string | null }
  ) => {
    const response = await api.post<AuthResponse>("/api/users/login/google", {
      idToken,
      name: userData.name,
      email: userData.email,
      photo: userData.photo,
    });
    return response.data;
  },

  // Verify email with code
  verifyEmail: async (data: VerifyEmailRequest) => {
    const response = await api.post("/api/users/verify-email", data);
    return response.data;
  },

  // Password reset functionality
  forgotPassword: async (data: { email: string }) => {
    const response = await api.post("/api/users/forgot-password", data);
    return response.data;
  },

  verifyResetCode: async (email: string, verificationCode: string) => {
    const response = await api.post("/api/users/verify-reset-code", {
      email,
      verificationCode,
    });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post("/api/users/reset-password", {
      token,
      newPassword,
    });
    return response.data;
  },

  // Resend verification code
  resendVerification: async (email: string) => {
    const response = await api.post("/api/users/resend-verification-code", {
      email,
    });
    return response.data;
  },

  // Check if user's email is verified
  checkVerification: async (email: string) => {
    const response = await api.post("/api/users/check-verification", { email });
    return response.data;
  },

  // Account management
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await authApi.put("/api/users/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Validate current password (requires authentication)
  validatePassword: async (password: string) => {
    const response = await authApi.post("/api/users/validate-password", {
      currentPassword: password,
    });
    return response.data;
  },

  // Account deletion
  requestAccountDeletion: async () => {
    const response = await authApi.post("/api/users/request-deletion");
    return response.data;
  },

  verifyDeletionCode: async (verificationCode: string) => {
    const response = await authApi.post("/api/users/verify-deletion", {
      verificationCode,
    });
    return response.data;
  },

  deleteAccount: async (deletionToken: string) => {
    const response = await authApi.delete("/api/users/delete-account", {
      data: { deletionToken },
    });
    return response.data;
  },
};
