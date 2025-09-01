import { createApi } from "@/services/api/baseApi";

const api = createApi(true);

export const feedbackService = {
  async sendFeedback(feedbackData: {
    feedbackType: "bug" | "suggestion";
    title: string;
    message: string;
  }) {
    try {
      const response = await api.post("/api/users/feedback", feedbackData);
      return response.data;
    } catch (error: any) {
      console.error("Feedback service error:", error);
      throw error.response?.data || error;
    }
  },
};
