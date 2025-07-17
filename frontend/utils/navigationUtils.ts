import { router } from "expo-router";
import { InteractionManager } from "react-native";

export const safeNavigate = {
  push: (href: any, delay: number = 150) => {
    try {
      InteractionManager.runAfterInteractions(() => {
        setTimeout(() => {
          router.push(href);
        }, delay);
      });
    } catch (error) {
      console.error("[SafeNavigate] Push error:", error);
      // Fallback to replace
      setTimeout(() => {
        router.replace(href);
      }, delay + 100);
    }
  },

  replace: (href: any, delay: number = 100) => {
    try {
      InteractionManager.runAfterInteractions(() => {
        setTimeout(() => {
          router.replace(href);
        }, delay);
      });
    } catch (error) {
      console.error("[SafeNavigate] Replace error:", error);
      // Final fallback
      setTimeout(() => {
        try {
          router.replace(href);
        } catch (finalError) {
          console.error("[SafeNavigate] Final fallback failed:", finalError);
        }
      }, delay + 200);
    }
  },

  back: (delay: number = 50) => {
    try {
      setTimeout(() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/(tabs)/Games");
        }
      }, delay);
    } catch (error) {
      console.error("[SafeNavigate] Back error:", error);
      setTimeout(() => {
        router.replace("/(tabs)/Games");
      }, delay + 100);
    }
  },
};
