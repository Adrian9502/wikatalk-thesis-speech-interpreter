import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface GameSoundState {
  isSoundEnabled: boolean;
  setGameSoundEnabled: (enabled: boolean) => void;
  loadSoundSettings: () => Promise<void>;
}

const GAME_SOUND_STORAGE_KEY = "game_sound_enabled";

export const useGameSoundStore = create<GameSoundState>((set, get) => ({
  isSoundEnabled: true, // Default to enabled

  setGameSoundEnabled: async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem(
        GAME_SOUND_STORAGE_KEY,
        JSON.stringify(enabled)
      );
      set({ isSoundEnabled: enabled });
      console.log(
        `[GameSoundStore] Game sound ${enabled ? "enabled" : "disabled"}`
      );
    } catch (error) {
      console.error("[GameSoundStore] Failed to save sound setting:", error);
    }
  },

  loadSoundSettings: async () => {
    try {
      const storedValue = await AsyncStorage.getItem(GAME_SOUND_STORAGE_KEY);
      if (storedValue !== null) {
        const enabled = JSON.parse(storedValue);
        set({ isSoundEnabled: enabled });
        console.log(`[GameSoundStore] Loaded sound setting: ${enabled}`);
      }
    } catch (error) {
      console.error("[GameSoundStore] Failed to load sound setting:", error);
    }
  },
}));
