import { api, authApi } from "./baseApi";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  fullName: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    _id: string;
    username: string;
    email: string;
    fullName: string;
    profilePicture?: string;
    verified: boolean;
  };
}

export interface PasswordResetRequest {
  email: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
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
  loginWithGoogle: async (token: string) => {
    const response = await api.post<AuthResponse>("/api/users/login/google", {
      token,
    });
    return response.data;
  },

  // Verify email with code
  verifyEmail: async (data: VerifyEmailRequest) => {
    const response = await api.post("/api/users/verify-email", data);
    return response.data;
  },

  // Request password reset
  forgotPassword: async (data: PasswordResetRequest) => {
    const response = await api.post("/api/users/forgot-password", data);
    return response.data;
  },

  // Verify reset code
  verifyResetCode: async (email: string, code: string) => {
    const response = await api.post("/api/users/verify-reset-code", {
      email,
      code,
    });
    return response.data;
  },

  // Reset password
  resetPassword: async (email: string, password: string, code: string) => {
    const response = await api.post("/api/users/reset-password", {
      email,
      password,
      code,
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

  // Validate current password (requires authentication)
  validatePassword: async (password: string) => {
    const response = await authApi.post("/api/users/validate-password", {
      password,
    });
    return response.data;
  },
};
