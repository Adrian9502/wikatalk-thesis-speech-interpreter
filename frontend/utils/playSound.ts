import { Audio } from "expo-av";
import { useGameSoundStore } from "@/store/useGameSoundStore";

// preload imports
import coinClaimSound from "@/assets/sounds/coin-claim.mp3";
import coinSpendSound from "@/assets/sounds/coin-spend.mp3";
import correctAnswerSound from "@/assets/sounds/correct-answer.mp3";
import wrongAnswerSound from "@/assets/sounds/wrong-answer.mp3";
import levelCompleteSound from "@/assets/sounds/game-level-complete.mp3";

type SoundKeys =
  | "correct"
  | "wrong"
  | "levelComplete"
  | "coinSpend"
  | "coinClaim";

const sounds: Record<SoundKeys, any> = {
  correct: correctAnswerSound,
  wrong: wrongAnswerSound,
  levelComplete: levelCompleteSound,
  coinSpend: coinSpendSound,
  coinClaim: coinClaimSound,
};

// Global sound cache to prevent memory leaks
const soundCache = new Map<string, Audio.Sound>();

export async function playSound(type: SoundKeys) {
  try {
    // Check if game sounds are enabled
    const { isSoundEnabled } = useGameSoundStore.getState();
    if (!isSoundEnabled) {
      console.log(`[Sound] Game sound disabled, skipping ${type}`);
      return;
    }

    console.log(`[Sound] Playing ${type} sound`);

    // Check if sound is already cached
    let sound = soundCache.get(type);

    if (!sound) {
      // Create and cache new sound
      const { sound: newSound } = await Audio.Sound.createAsync(sounds[type]);
      soundCache.set(type, newSound);
      sound = newSound;
    }

    // Reset position and play
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch (error) {
    console.warn(`[Sound] Error playing ${type}:`, error);
  }
}

// Cleanup function for when app closes or needs to free memory
export function clearSoundCache() {
  soundCache.forEach(async (sound, key) => {
    try {
      await sound.unloadAsync();
    } catch (error) {
      console.warn(`[Sound] Error unloading ${key}:`, error);
    }
  });
  soundCache.clear();
}

// Preload all sounds for better performance
export async function preloadSounds() {
  try {
    console.log("[Sound] Preloading game sounds...");

    for (const [key, soundFile] of Object.entries(sounds)) {
      try {
        const { sound } = await Audio.Sound.createAsync(soundFile);
        soundCache.set(key, sound);
      } catch (error) {
        console.warn(`[Sound] Failed to preload ${key}:`, error);
      }
    }

    console.log("[Sound] All sounds preloaded successfully");
  } catch (error) {
    console.warn("[Sound] Error during sound preloading:", error);
  }
}
