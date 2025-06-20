import { authApi } from "./baseApi";

export interface ThemeResponse {
  success: boolean;
  theme: string;
}

export const themeService = {
  // Get user's theme preference
  getUserTheme: async () => {
    const response = await authApi.get<ThemeResponse>("/api/users/theme");
    return response.data;
  },

  // Update user's theme preference
  updateUserTheme: async (themeName: string) => {
    const response = await authApi.post<ThemeResponse>("/api/users/theme", {
      themeName,
    });
    return response.data;
  },
};
