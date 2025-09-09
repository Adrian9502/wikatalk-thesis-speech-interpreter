import * as Speech from "expo-speech";
import useLanguageStore from "@/store/useLanguageStore";
import { useTranslateStore } from "@/store/useTranslateStore";
import { useScanTranslateStore } from "@/store/useScanTranslateStore";
import { usePronunciationStore } from "@/store/usePronunciationStore";

class GlobalSpeechManager {
  private static instance: GlobalSpeechManager;
  private isGlobalSpeaking = false;

  static getInstance(): GlobalSpeechManager {
    if (!GlobalSpeechManager.instance) {
      GlobalSpeechManager.instance = new GlobalSpeechManager();
    }
    return GlobalSpeechManager.instance;
  }

  async stopAllSpeech(): Promise<void> {
    try {
      console.log("[GlobalSpeechManager] Stopping all speech");

      if (await Speech.isSpeakingAsync()) {
        await Speech.stop();
      }

      this.isGlobalSpeaking = false;

      // Stop speech in all stores
      useLanguageStore.getState().stopSpeech();
      useTranslateStore.getState().stopSpeech();
      useScanTranslateStore.getState().stopSpeech();

      // UPDATED: Also stop pronunciation audio
      await usePronunciationStore.getState().stopAudio();
    } catch (error) {
      console.error("[GlobalSpeechManager] Error stopping speech:", error);
    }
  }

  setGlobalSpeaking(speaking: boolean): void {
    this.isGlobalSpeaking = speaking;
  }

  isCurrentlySpeaking(): boolean {
    return this.isGlobalSpeaking;
  }
}

export const globalSpeechManager = GlobalSpeechManager.getInstance();
