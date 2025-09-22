import { createApi } from "@/services/api/baseApi";

export interface TutorialStatus {
  hasSeen: boolean;
  version: number;
  completedAt: string | null;
}

export interface TutorialData {
  home: TutorialStatus;
  speech: TutorialStatus;
  translate: TutorialStatus;
  scan: TutorialStatus;
  games: TutorialStatus;
  pronounce: TutorialStatus;
}

export interface TutorialResponse {
  success: boolean;
  data: TutorialData;
  message?: string;
}

const api = createApi(true); // Use authenticated API

export const tutorialService = {
  async getTutorialStatus(): Promise<TutorialData> {
    try {
      const response = await api.get("/api/tutorial/status");
      return response.data.data;
    } catch (error: any) {
      console.error("Get tutorial status error:", error);
      // Return default status if API fails
      return this.getDefaultTutorialStatus();
    }
  },

  async completeTutorial(
    tutorialName: string,
    version: number = 1
  ): Promise<TutorialData> {
    try {
      const response = await api.post("/api/tutorial/complete", {
        tutorialName,
        version,
      });
      return response.data.data;
    } catch (error: any) {
      console.error("Complete tutorial error:", error);
      throw error;
    }
  },

  async shouldShowTutorial(
    tutorialName: string,
    version: number = 1
  ): Promise<boolean> {
    try {
      const response = await api.get(
        `/api/tutorial/should-show/${tutorialName}?version=${version}`
      );
      return response.data.data.shouldShow;
    } catch (error: any) {
      console.error("Should show tutorial error:", error);
      return true; // Default to showing tutorial if API fails
    }
  },

  async resetTutorials(): Promise<TutorialData> {
    try {
      const response = await api.post("/api/tutorial/reset");
      return response.data.data;
    } catch (error: any) {
      console.error("Reset tutorials error:", error);
      throw error;
    }
  },

  getDefaultTutorialStatus(): TutorialData {
    const defaultStatus: TutorialStatus = {
      hasSeen: false,
      version: 1,
      completedAt: null,
    };

    return {
      home: { ...defaultStatus },
      speech: { ...defaultStatus },
      translate: { ...defaultStatus },
      scan: { ...defaultStatus },
      games: { ...defaultStatus },
      pronounce: { ...defaultStatus },
    };
  },
};
