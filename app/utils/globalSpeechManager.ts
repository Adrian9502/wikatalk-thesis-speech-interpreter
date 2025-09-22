import * as Speech from "expo-speech";

class GlobalSpeechManager {
  private isSpeaking = false;
  private currentSpeechPromise: Promise<void> | null = null;

  async stopAllSpeech(): Promise<void> {
    try {
      console.log("[GlobalSpeechManager] Stopping all speech");

      // ENHANCED: Check if speech is available and not null
      if (!Speech || typeof Speech.stop !== "function") {
        console.log("[GlobalSpeechManager] Speech module not available");
        this.isSpeaking = false;
        return;
      }

      // ENHANCED: Only stop if actually speaking to avoid null pointer
      if (this.isSpeaking) {
        console.log("[GlobalSpeechManager] Speech is active, stopping...");
        await Speech.stop();
        this.isSpeaking = false;
        console.log("[GlobalSpeechManager] Speech stopped successfully");
      } else {
        console.log("[GlobalSpeechManager] No active speech to stop");
      }

      // Clear any pending promises
      this.currentSpeechPromise = null;
    } catch (error) {
      // ENHANCED: Graceful error handling to prevent crashes
      console.warn(
        "[GlobalSpeechManager] Error stopping speech (non-critical):",
        error
      );
      // Reset state even if stopping failed
      this.isSpeaking = false;
      this.currentSpeechPromise = null;
    }
  }

  async speak(text: string, options?: any): Promise<void> {
    try {
      // Stop any existing speech first
      await this.stopAllSpeech();

      // ENHANCED: Check if speech is available
      if (!Speech || typeof Speech.speak !== "function") {
        console.log(
          "[GlobalSpeechManager] Speech module not available for speaking"
        );
        return;
      }

      this.isSpeaking = true;

      this.currentSpeechPromise = new Promise<void>((resolve, reject) => {
        Speech.speak(text, {
          ...options,
          onDone: () => {
            this.isSpeaking = false;
            this.currentSpeechPromise = null;
            resolve();
          },
          onError: (error: any) => {
            this.isSpeaking = false;
            this.currentSpeechPromise = null;
            console.warn("[GlobalSpeechManager] Speech error:", error);
            resolve(); // Resolve instead of reject to prevent crashes
          },
          onStopped: () => {
            this.isSpeaking = false;
            this.currentSpeechPromise = null;
            resolve();
          },
        });
      });

      await this.currentSpeechPromise;
    } catch (error) {
      console.warn("[GlobalSpeechManager] Error in speak method:", error);
      this.isSpeaking = false;
      this.currentSpeechPromise = null;
    }
  }

  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const globalSpeechManager = new GlobalSpeechManager();
