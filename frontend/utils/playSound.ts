import { Audio } from "expo-av";

// preload imports
import coinClaimSound from "@/assets/sounds/coin-claim.mp3";
import coinSpendSound from "@/assets/sounds/coin-spend.mp3";
import correctAnswerSound from "@/assets/sounds/correct-answer.mp3";
import wrongAnswerSound from "@/assets/sounds/wrong-answer.mp3"; // FIXED: Use correct filename
import levelCompleteSound from "@/assets/sounds/game-level-complete.mp3";

type SoundKeys =
  | "correct"
  | "wrong"
  | "levelComplete"
  | "coinSpend"
  | "coinClaim"; // Added coinClaim

const sounds: Record<SoundKeys, any> = {
  correct: correctAnswerSound,
  wrong: wrongAnswerSound,
  levelComplete: levelCompleteSound,
  coinSpend: coinSpendSound,
  coinClaim: coinClaimSound, // Added coinClaim
};

// Global sound cache to prevent memory leaks
const soundCache = new Map<string, Audio.Sound>();

export async function playSound(type: SoundKeys) {
  try {
    // Check if we already have this sound loaded
    const cachedSound = soundCache.get(type);

    if (cachedSound) {
      // Rewind and play the cached sound
      await cachedSound.setPositionAsync(0);
      await cachedSound.playAsync();
      return;
    }

    // Create new sound
    const { sound } = await Audio.Sound.createAsync(sounds[type]);

    // Cache the sound for reuse
    soundCache.set(type, sound);

    // Play the sound
    await sound.playAsync();

    // Set up cleanup when sound finishes
    sound.setOnPlaybackStatusUpdate((status) => {
      if (!status.isLoaded) return;
      if (status.didJustFinish) {
        // Don't unload immediately - keep for reuse
        console.log(`[Sound] Finished playing: ${type}`);
      }
    });
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
