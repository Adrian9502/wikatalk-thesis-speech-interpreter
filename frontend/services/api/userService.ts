import { authApi } from "./baseApi";

export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  profilePicture?: string;
  verified: boolean;
  joinDate: string;
}

export interface ProfileUpdateData {
  username?: string;
  fullName?: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

export const userService = {
  // Get current user profile
  getProfile: async () => {
    const response = await authApi.get<{ user: UserProfile }>(
      "/api/users/profile"
    );
    return response.data.user;
  },

  // Update user profile
  updateProfile: async (data: ProfileUpdateData) => {
    const response = await authApi.put("/api/users/profile", data);
    return response.data;
  },

  // Update profile picture
  updateProfilePicture: async (imageBase64: string) => {
    const response = await authApi.put("/api/users/profile-picture", {
      imageBase64,
    });
    return response.data;
  },

  // Change password
  changePassword: async (data: PasswordChangeData) => {
    const response = await authApi.put("/api/users/change-password", data);
    return response.data;
  },

  // Request account deletion
  requestAccountDeletion: async () => {
    const response = await authApi.post("/api/users/request-deletion");
    return response.data;
  },

  // Verify account deletion code
  verifyDeletionCode: async (verificationCode: string) => {
    const response = await authApi.post("/api/users/verify-deletion", {
      verificationCode,
    });
    return response.data;
  },

  // Delete account
  deleteAccount: async (deletionToken: string) => {
    const response = await authApi.delete("/api/users/delete-account", {
      data: { deletionToken },
    });
    return response.data;
  },
};
